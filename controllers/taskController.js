const Task = require('../models/taskModel');
const TaskUser = require('../models/taskUserModel');
const User = require('../models/permissions/userModel');
const TaskAttachments = require('../models/taskAttachmentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tag = require('../models/Task/tagModel');
const TaskTag = require('../models/Task/taskTagModel');
const Comment = require('../models/Task/taskCommentModel');
const CommonController = require('../controllers/commonController');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const userSubordinate = require('../models/userSubordinateModel');
const sendEmail = require('../utils/email');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Console } = require('winston/lib/winston/transports');
const timeLog = require('../models/timeLog');
const ManualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const Project = require('../models/projectModel');
const constants = require('../constants');
const StorageController = require('./storageController');
const websocketHandler = require('../utils/websocketHandler');
const { SendUINotification } = require('../utils/uiNotificationSender');
const TaskCounter = require('../models/taskCounterModel');
// Ensure TaskCounter's unique {company, project} index is built as early as
// possible. Without this, a burst of concurrent task-creation requests
// against a brand-new project (whose counter index may not have finished
// building yet) could momentarily allow duplicate counter documents, which
// would defeat the atomicity TM-012 relies on. This is a one-time, fire-and-
// forget call — safe to await or ignore its result.
TaskCounter.init().catch(() => {});

function formatDateToDDMMYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}

// --- Authorization helpers (TM-002 / TM-004) -------------------------------
// Tenant scoping and destructive-action authorization must be derived from
// the authenticated session (req.user, set by authController.protect), never
// from client-controlled input. These helpers centralize that logic so every
// task/attachment/comment/tag handler enforces it the same way.

function isAdminRole(user) {
  const roleName = (user && user.role && (user.role.name || user.role.Name)) || '';
  const normalized = String(roleName).toLowerCase();
  return normalized === 'admin' || normalized === 'super admin';
}

/** Loads a task and verifies it belongs to the caller's company. Returns
 * null (not an error) when the task doesn't exist or belongs to another
 * company, so callers can respond with an identical 404 either way and not
 * reveal whether a task id exists in a different tenant. */
async function findOwnTask(req, taskId, populate) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) return null;
  let query = Task.findById(taskId);
  if (populate) query = query.populate(populate);
  const task = await query;
  if (!task || !task.company || task.company.toString() !== req.user.company.id.toString()) {
    return null;
  }
  return task;
}

/** True if the user created the task, is assigned to it, or holds an Admin
 * role in the task's company. Used to gate update/delete/reassign actions. */
async function canManageTask(user, task) {
  if (!user || !task) return false;
  if (isAdminRole(user)) return true;
  // taskModel's pre-find hook populates createdBy with a User document, so
  // it may be either a populated doc or a raw ObjectId depending on the
  // query path that loaded `task` — handle both.
  const createdById = task.createdBy && (task.createdBy._id || task.createdBy);
  if (createdById && createdById.toString() === user.id.toString()) return true;
  const assignment = await TaskUser.findOne({ task: task._id, user: user._id });
  return !!assignment;
}

/** Replaces each attachment's stored (token-free, non-public) blob address
 * with a freshly minted short-lived SAS read URL, right before the response
 * is sent to an already-authorized caller (TM-005). */
function withFreshAttachmentUrls(list) {
  return (list || []).map((attachment) => {
    const plain = attachment.toObject ? attachment.toObject() : { ...attachment };
    plain.url = StorageController.getTaskAttachmentReadUrl(plain.url);
    return plain;
  });
}

/** Atomically allocates the next per-project task number (TM-012). Seeds the
 * counter from the existing task count the first time a project is seen, so
 * projects created before this counter existed don't collide with tasks
 * numbered under the old countDocuments()+1 scheme. */
async function getNextTaskNumber(companyId, projectId) {
  let counter = await TaskCounter.findOneAndUpdate(
    { company: companyId, project: projectId },
    { $inc: { seq: 1 } },
    { new: true }
  );
  if (counter) return counter.seq;

  // No counter yet for this project — seed it from the existing task count.
  const existingCount = await Task.countDocuments({ company: companyId, project: projectId });
  try {
    counter = await TaskCounter.create({ company: companyId, project: projectId, seq: existingCount + 1 });
    return counter.seq;
  } catch (err) {
    // Lost the race to another concurrent request seeding the same
    // counter — it now exists, so fall back to a normal atomic increment.
    if (err.code === 11000) {
      counter = await TaskCounter.findOneAndUpdate(
        { company: companyId, project: projectId },
        { $inc: { seq: 1 } },
        { new: true }
      );
      return counter.seq;
    }
    throw err;
  }
}

/** TM-019: applies optional status/priority filters (array or single value)
 * to a Mongo query object in place. Previously, status/priority "filters"
 * in the web UI only hid/showed rows already present on the current page
 * client-side — they were never sent to the server, so pagination and
 * total counts were wrong for a filtered view. */
function applyStatusPriorityFilters(query, { status, priority }) {
  const asArray = (value) => (value == null ? null : Array.isArray(value) ? value : [value]);
  const statuses = asArray(status);
  const priorities = asArray(priority);
  if (statuses && statuses.length > 0) query.status = { $in: statuses };
  if (priorities && priorities.length > 0) query.priority = { $in: priorities };
}

// Fields a client is allowed to set via PUT /task/update/:id (TM-003). Never
// includes company/createdBy/taskNumber/isDeleted — those are server-managed.
const UPDATABLE_TASK_FIELDS = [
  'taskName', 'title', 'description', 'priority', 'status', 'project',
  'parentTask', 'startDate', 'endDate', 'startTime', 'comment', 'estimate',
  'timeTaken', 'dueDate',
];

// TM-011: assignment model is "one primary owner + optional watchers".
const TASKUSER_ROLE = { OWNER: 'owner', WATCHER: 'watcher' };
// Treat a missing role as 'owner': rows created before the `role` field
// existed were the task's single assignee, i.e. its de-facto owner.
const isOwnerRow = (taskUser) => !taskUser.role || taskUser.role === TASKUSER_ROLE.OWNER;
// A TaskUser row's user may be a populated doc (pre-find hook) or a raw id.
const taskUserUserId = (taskUser) => {
  const user = taskUser && taskUser.user;
  if (!user) return null;
  return (user._id || user.id || user).toString();
};

/** TM-011: adds each given user as a watcher on the task, skipping anyone who
 * is already the owner or already a watcher. Fires a best-effort in-app
 * notification per newly added watcher. Returns the created rows. */
async function assignTaskWatchers(task, watcherIds, req) {
  const created = [];
  for (const rawId of (watcherIds || [])) {
    const watcherId = rawId && (rawId._id || rawId.id || rawId).toString();
    if (!watcherId) continue;
    const already = await TaskUser.findOne({ task: task._id, user: watcherId });
    if (already) continue; // owner or existing watcher — don't duplicate
    const row = await TaskUser.create({
      task: task._id,
      user: watcherId,
      role: TASKUSER_ROLE.WATCHER,
      company: req.user.company.id,
      status: 'Active',
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });
    created.push(row);
    SendUINotification(
      `Added as watcher: ${task.taskName}`,
      task.description || `You were added as a watcher on task ${task.taskName}.`,
      constants.Event_Notification_Type_Status.task_assignment,
      watcherId,
      req.user.company.id,
      req,
      `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${task._id}`
    );
  }
  return created;
}

exports.deleteTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting task deletion process', constants.LOG_TYPES.TRACE);

  const taskForAuth = await findOwnTask(req, req.params.id);
  if (!taskForAuth) {
    websocketHandler.sendLog(req, `Task ${req.params.id} not found in caller's company`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('task.taskNotFound'), 404));
  }
  if (!(await canManageTask(req.user, taskForAuth))) {
    websocketHandler.sendLog(req, `User ${req.user.id} is not authorized to delete task ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError('You do not have permission to delete this task', 403));
  }

  const timeLogExists = await timeLog.find({}).where('task').equals(req.params.id);
  const manualTimeRequest = await ManualTimeRequest.find({}).where('task').equals(req.params.id);

  websocketHandler.sendLog(req, `Found ${timeLogExists.length} time logs and ${manualTimeRequest.length} manual time requests`, constants.LOG_TYPES.DEBUG);

  if (timeLogExists.length > 0 || manualTimeRequest.length > 0) {
    websocketHandler.sendLog(req, 'Task deletion prevented due to existing time logs', constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.timeLogExists')
      ,
    });
  }

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.DELETE_TASK)
    .where('company').equals(req.user.company.id);

  websocketHandler.sendLog(req, `Email template found: ${!!emailTemplate}`, constants.LOG_TYPES.DEBUG);

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);
  const task = await Task.findById(req.params.id).populate('project', 'projectName');
  let isUINotificationSentToReporter = false;

  if (newTaskUserList && newTaskUserList.length > 0) {
    websocketHandler.sendLog(req, `Found ${newTaskUserList.length} task users for task ${req.params.id}`, constants.LOG_TYPES.INFO);

    for (let j = 0; j < newTaskUserList.length; j++) {
      const user = await User.findOne({ _id: newTaskUserList[j].user });
      websocketHandler.sendLog(req, `Processing user ${user?._id} for task deletion notification`, constants.LOG_TYPES.TRACE);

      if (user) {
        if (emailTemplate) {
          const contentNewUser = emailTemplate.contentData;
          const emailTemplateNewUser = contentNewUser
            .replaceAll("{firstName}", user?.firstName || 'N/A')
            .replaceAll("{taskName}", task?.taskName || 'Untitled Task')
            .replaceAll("{date}", formatDateToDDMMYY(new Date()))
            .replaceAll("{company}", req.user.company.companyName || 'N/A')
            .replaceAll("{projectName}", task.project?.projectName || 'N/A')
            .replaceAll("{lastName}", user?.lastName || 'N/A');

          const document = await TaskUser.findByIdAndDelete(newTaskUserList[j]._id);
          if (!document) {
            websocketHandler.sendLog(req, `TaskUser ${newTaskUserList[j]._id} not found for deletion`, constants.LOG_TYPES.ERROR);
            return next(new AppError(req.t('task.documentNotFound')
              , 404));
          } else {
            try {
              await sendEmail({
                email: user.email,
                subject: emailTemplate.subject,
                message: emailTemplateNewUser
              });
              websocketHandler.sendLog(req, `Deletion email sent to ${user.email}`, constants.LOG_TYPES.INFO);
            } catch (error) {
              websocketHandler.sendLog(req, `Failed to send email to ${user.email}: ${error.message}`, constants.LOG_TYPES.ERROR);
            }
          }
        }

        //Add Event Notification for delete task
        SendUINotification(`Task deleted: ${task.taskName}`, task.description || `Task ${task.taskName} has been deleted.`,
          constants.Event_Notification_Type_Status.task_delete, user?._id?.toString(), req.user.company.id, req);

        if (user._id.toString() === task?.createdBy?._id?.toString()) {
          isUINotificationSentToReporter = true;
        }
      }
    }
    if (!isUINotificationSentToReporter) {
      //Add Event Notification for delete task to reporter
      SendUINotification(`Task deleted: ${task.taskName}`, task.description || `Task ${task.taskName} has been deleted.`,
        constants.Event_Notification_Type_Status.task_delete, task?.createdBy?._id?.toString(), req.user.company.id, req);
    }
  }

  const document = await Task.findById(req.params.id);
  if (document) {
    await document.remove();
    websocketHandler.sendLog(req, `Task ${req.params.id} successfully deleted`, constants.LOG_TYPES.INFO);
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting task update for task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const taskForAuth = await findOwnTask(req, req.params.id);
  if (!taskForAuth) {
    websocketHandler.sendLog(req, `Task ${req.params.id} not found in caller's company`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('task.taskNotFound'), 404));
  }
  if (!(await canManageTask(req.user, taskForAuth))) {
    websocketHandler.sendLog(req, `User ${req.user.id} is not authorized to update task ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError('You do not have permission to update this task', 403));
  }

  // The project reference should only be (re-)validated when the caller is
  // actually trying to change it. A partial update (e.g. status-only or
  // priority-only, as sent by the web sub-task quick actions and the mobile
  // status-cycle control) must not be rejected just because `project` was
  // omitted from the payload (TM-007).
  if (Object.prototype.hasOwnProperty.call(req.body, 'project')) {
    const existingProject = await Project.findOne({ _id: req.body.project, company: req.user.company.id });
    if (!existingProject) {
      websocketHandler.sendLog(req, `Invalid project ${req.body.project} for task update`, constants.LOG_TYPES.WARN);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('task.invalidProject')
        ,
      });
    }
  }

  // Only a known, explicit set of fields may be written via this endpoint —
  // never company/createdBy/taskNumber/isDeleted from the raw request body
  // (TM-003, mass-assignment).
  const updates = {};
  UPDATABLE_TASK_FIELDS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  });

  websocketHandler.sendLog(req, `Applying updates: ${JSON.stringify(updates)}`, constants.LOG_TYPES.DEBUG);

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company.id },
    { $set: updates },
    { new: false, runValidators: true }
  );

  if (!task) {
    websocketHandler.sendLog(req, `Task ${req.params.id} not found for update`, constants.LOG_TYPES.ERROR);
    return res.status(404).send({
      error: req.t('task.taskNotFound')
    });
  }

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.Update_Task_Notification)
    .where('company').equals(req.user.company.id);

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);
  const updatedTask = await Task.findById(req.params.id).populate('project', 'projectName');

  if (updatedTask && newTaskUserList.length > 0) {
    const user = await User.findOne({ _id: newTaskUserList[0].user });
    const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${updatedTask._id}`;
    if (emailTemplate) {
      const emailTemplateNewUser = emailTemplate.contentData
        .replaceAll("{firstName}", user?.firstName || 'N/A')
        .replaceAll("{taskName}", updatedTask?.taskName || 'Untitled Task')
        .replaceAll("{date}", formatDateToDDMMYY(new Date()))
        .replaceAll("{company}", req.user.company.companyName || 'N/A')
        .replaceAll("{projectName}", updatedTask.project?.projectName || 'N/A')
        .replaceAll("{description}", updatedTask?.description ? (updatedTask.description.length > 500 ? updatedTask.description.substring(0, 500) + '...' : updatedTask.description) : 'No description provided')
        .replaceAll("{priority}", updatedTask?.priority || 'N/A')
        .replaceAll("{taskURL}", taskURL)
        .replaceAll("{lastName}", user?.lastName || 'N/A');

      try {
        await sendEmail({
          email: user.email,
          subject: emailTemplate.Name,
          message: emailTemplateNewUser
        });
        websocketHandler.sendLog(req, `Update notification sent to ${user.email}`, constants.LOG_TYPES.INFO);
      } catch (error) {
        websocketHandler.sendLog(req, `Failed to send update notification: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }

    // Add Event Notification for the assigned user
    SendUINotification(`Task update: ${updatedTask.taskName}`, updatedTask.description || `Task ${updatedTask.taskName} has been updated.`,
      constants.Event_Notification_Type_Status.task_assignment, user?._id?.toString(), req.user.company.id, req, taskURL);

    if (user?._id?.toString() !== updatedTask?.createdBy?.toString()) {
      // Add Event Notification for the reporter user
      SendUINotification(`Task update: ${updatedTask.taskName}`, updatedTask.description || `Task ${updatedTask.taskName} has been updated.`,
        constants.Event_Notification_Type_Status.task_assignment, updatedTask?.createdBy?._id?.toString(), req.user.company.id, req, taskURL);
    }
  }

  const getTask = await Task.findById(req.params.id);
  websocketHandler.sendLog(req, `Task ${req.params.id} successfully updated`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: {
      data: getTask
    }
  });
});


exports.getTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const task = await findOwnTask(req, req.params.id);
  if (!task) {
    websocketHandler.sendLog(req, `Task ${req.params.id} not found in caller's company`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('task.taskNotFound'), 404));
  }
  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id).populate('task');
  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.params.id);

  websocketHandler.sendLog(req, `Retrieved task with ${newTaskUserList.length} users and ${newTaskAttachmentList.length} attachments`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      task: task,
      newTaskUserList: newTaskUserList,
      newTaskAttachmentList: withFreshAttachmentUrls(newTaskAttachmentList)
    }
  });
});

exports.getTaskUsers = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching task users for task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);
  websocketHandler.sendLog(req, `Found ${newTaskUserList.length} task users`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      taskUserList: newTaskUserList
    }
  });
});

exports.getTaskAttachments = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attachments for task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.params.id);
  websocketHandler.sendLog(req, `Found ${newTaskAttachmentList.length} attachments`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      newTaskAttachmentList: withFreshAttachmentUrls(newTaskAttachmentList)
    }
  });
});

exports.getTaskListByTeam = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskListByTeam execution', constants.LOG_TYPES.TRACE);

  // Fetch subordinate user IDs and include current user
  websocketHandler.sendLog(req, `Fetching subordinate users for user ${req.user.id}`, constants.LOG_TYPES.TRACE);
  const subordinateIds = await userSubordinate
    .find({ userId: req.user.id })
    .distinct('subordinateUserId');

  const teamIdsArray = [...subordinateIds, req.user.id];
  websocketHandler.sendLog(req, `Processing ${teamIdsArray.length} team members`, constants.LOG_TYPES.DEBUG);

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const search = req.body.search;
  websocketHandler.sendLog(req, `Pagination parameters - skip: ${skip}, limit: ${limit}`, constants.LOG_TYPES.DEBUG);

  // Build search conditions for both assigned and created task paths
  let matchingProjectIds = [];
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const matchingProjects = await Project.find({
      company: req.user.company.id,
      projectName: searchRegex
    }).select('_id');
    if (matchingProjects.length > 0) {
      matchingProjectIds = matchingProjects.map(p => p._id);
    }
  }

  // Search match stage for assigned tasks (nested taskDetails)
  const searchMatchStageAssigned = [];
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const orConditions = [
      { 'taskDetails.taskName': searchRegex },
      { 'taskDetails.title': searchRegex }
    ];
    const digitMatch = search.match(/(\d+)/);
    if (digitMatch) {
      orConditions.push({ 'taskDetails.taskNumber': Number(digitMatch[1]) });
    }
    if (matchingProjectIds.length > 0) {
      orConditions.push({ 'taskDetails.project': { $in: matchingProjectIds } });
    }
    searchMatchStageAssigned.push({ $match: { $or: orConditions } });
  }

  // PATH A: Assigned tasks pipeline for team members
  const assignedTasksPipeline = [
    { $match: { user: { $in: objectIdArray }, task: { $exists: true } } },
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    { $unwind: '$taskDetails' },
    ...searchMatchStageAssigned,
    { $project: { taskId: '$taskDetails._id', taskDetails: 1 } }
  ];

  const aggregationPipeline = [
    ...assignedTasksPipeline,
    {
      $lookup: {
        from: 'taskusers',
        let: { taskId: '$taskDetails._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$task', '$$taskId'] } } },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy'
            }
          },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              task: 1,
              createdBy: {
                _id: '$createdBy._id',
                firstName: '$createdBy.firstName',
                lastName: '$createdBy.lastName'
              },
              user: {
                _id: '$user._id',
                firstName: '$user.firstName',
                lastName: '$createdBy.lastName'
              }
            }
          }
        ],
        as: 'TaskUsers'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'taskDetails.createdBy',
        foreignField: '_id',
        as: 'taskCreatedBy'
      }
    },
    { $unwind: { path: '$taskCreatedBy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'comments',
        localField: 'taskDetails._id',
        foreignField: 'task',
        as: 'taskComments'
      }
    },
    {
      $project: {
        _id: 0,
        task: {
          _id: '$taskDetails._id',
          id: '$taskDetails._id',
          taskName: '$taskDetails.taskName',
          startDate: '$taskDetails.startDate',
          endDate: '$taskDetails.endDate',
          description: '$taskDetails.description',
          comment: '$taskDetails.comment',
          priority: '$taskDetails.priority',
          status: '$taskDetails.status',
          taskNumber: '$taskDetails.taskNumber',
          dueDate: '$taskDetails.dueDate',
          parentTask: '$taskDetails.parentTask',
          TaskUsers: '$TaskUsers',
          commentsCount: { $size: '$taskComments' },
          createdBy: {
            _id: '$taskCreatedBy._id',
            firstName: '$taskCreatedBy.firstName',
            lastName: '$taskCreatedBy.lastName'
          }
        }
      }
    },
    {
      $facet: {
        taskList: [{ $skip: skip }, { $limit: limit }],
        taskCount: [{ $count: 'count' }]
      }
    }
  ];

  websocketHandler.sendLog(req, 'Executing task aggregation query', constants.LOG_TYPES.TRACE);
  const [result] = await TaskUser.aggregate(aggregationPipeline).exec();

  if (!result || !result.taskList || !result.taskCount) {
    websocketHandler.sendLog(req, 'Failed to execute aggregation query', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.failedToFetchTaskList'), 500));
  }

  const taskList = result.taskList.map(item => item.task);
  const taskCount = result.taskCount[0]?.count || 0;

  websocketHandler.sendLog(req, `Returning ${taskList.length} tasks with total count ${taskCount}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskList, taskCount }
  });
});

exports.getTaskListByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskListByUser execution', constants.LOG_TYPES.TRACE);

  const userId = new ObjectId(req.body.userId);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const search = req.body.search;

  websocketHandler.sendLog(req, `Processing task list for user ${req.body.userId}, skip: ${skip}, limit: ${limit}`, constants.LOG_TYPES.DEBUG);

  // Build search conditions for both assigned and created task paths
  let matchingProjectIds = [];
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const matchingProjects = await Project.find({
      projectName: searchRegex
    }).select('_id');
    if (matchingProjects.length > 0) {
      matchingProjectIds = matchingProjects.map(p => p._id);
    }
  }

  // Search match stage for assigned tasks (nested taskDetails)
  const searchMatchStageAssigned = [];
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const orConditions = [
      { 'taskDetails.taskName': searchRegex },
      { 'taskDetails.title': searchRegex }
    ];
    const digitMatch = search.match(/(\d+)/);
    if (digitMatch) {
      orConditions.push({ 'taskDetails.taskNumber': Number(digitMatch[1]) });
    }
    if (matchingProjectIds.length > 0) {
      orConditions.push({ 'taskDetails.project': { $in: matchingProjectIds } });
    }
    searchMatchStageAssigned.push({ $match: { $or: orConditions } });
  }

  // TM-019: status/priority filters, applied server-side so pagination and
  // the total count stay correct for a filtered view (previously these
  // "filters" only hid/showed rows already present on the current,
  // unfiltered page, client-side, in the web UI).
  const statusPriorityMatch = {};
  applyStatusPriorityFilters(statusPriorityMatch, { status: req.body.status, priority: req.body.priority });
  const statusPriorityMatchStage = Object.keys(statusPriorityMatch).length > 0
    ? [{
        $match: Object.fromEntries(
          Object.entries(statusPriorityMatch).map(([key, value]) => [`taskDetails.${key}`, value])
        )
      }]
    : [];

  // PATH A: Assigned tasks pipeline
  const assignedTasksPipeline = [
    { $match: { user: userId, task: { $exists: true } } },
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    { $unwind: '$taskDetails' },
    ...searchMatchStageAssigned,
    ...statusPriorityMatchStage,
    { $project: { taskId: '$taskDetails._id', taskDetails: 1 } }
  ];

  const aggregationPipeline = [
    ...assignedTasksPipeline,
    // Continue with lookups for TaskUsers, creator, and comments
    {
      $lookup: {
        from: 'taskusers',
        let: { taskId: '$taskDetails._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$task', '$$taskId'] } } },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy'
            }
          },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              task: 1,
              createdBy: {
                _id: '$createdBy._id',
                firstName: '$createdBy.firstName',
                lastName: '$createdBy.lastName'
              },
              user: {
                _id: '$user._id',
                firstName: '$user.firstName',
                lastName: '$user.lastName'
              }
            }
          }
        ],
        as: 'TaskUsers'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'taskDetails.createdBy',
        foreignField: '_id',
        as: 'taskCreatedBy'
      }
    },
    { $unwind: { path: '$taskCreatedBy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'comments',
        localField: 'taskDetails._id',
        foreignField: 'task',
        as: 'taskComments'
      }
    },
    {
      $project: {
        _id: 0,
        task: {
          _id: '$taskDetails._id',
          id: '$taskDetails._id',
          taskName: '$taskDetails.taskName',
          startDate: '$taskDetails.startDate',
          endDate: '$taskDetails.endDate',
          comment: '$taskDetails.comment',
          priority: '$taskDetails.priority',
          status: '$taskDetails.status',
          taskNumber: '$taskDetails.taskNumber',
          dueDate: '$taskDetails.dueDate',
          parentTask: '$taskDetails.parentTask',
          TaskUsers: '$TaskUsers',
          commentsCount: { $size: '$taskComments' },
          createdBy: {
            _id: '$taskCreatedBy._id',
            firstName: '$taskCreatedBy.firstName',
            lastName: '$taskCreatedBy.lastName'
          }
        }
      }
    },
    {
      $facet: {
        taskList: [{ $skip: skip }, { $limit: limit }],
        taskCount: [{ $count: 'count' }]
      }
    }
  ];

  websocketHandler.sendLog(req, 'Executing task aggregation query', constants.LOG_TYPES.TRACE);
  const [result] = await TaskUser.aggregate(aggregationPipeline).exec();

  if (!result || !result.taskList || !result.taskCount) {
    websocketHandler.sendLog(req, 'Failed to execute aggregation query', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.failedToFetchTaskList'), 500));
  }

  const taskList = result.taskList.map(item => item.task);
  const taskCount = result.taskCount[0]?.count || 0;

  websocketHandler.sendLog(req, `Returning ${taskList.length} tasks with total count ${taskCount}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskList, taskCount }
  });
});



exports.getTaskUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTaskUser for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying TaskUser with ID ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const newTaskUser = await TaskUser.find({}).where('_id').equals(req.params.id);

  if (!newTaskUser || newTaskUser.length === 0) {
    websocketHandler.sendLog(req, `No TaskUser found for ID ${req.params.id}`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found ${newTaskUser.length} TaskUser records`, constants.LOG_TYPES.INFO);
  }

  websocketHandler.sendLog(req, 'TaskUser retrieval completed', constants.LOG_TYPES.TRACE);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskUser: newTaskUser }
  });
});

exports.updateTaskUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateTaskUser for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Validating user ${req.body.user} and task ${req.body.task}`, constants.LOG_TYPES.TRACE);
  const existingUser = await User.findById(req.body.user);
  const existingTask = await Task.findById(req.body.task);

  if (!existingUser || !existingTask) {
    websocketHandler.sendLog(req, `Invalid user ${req.body.user} or task ${req.body.task}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, 'User and task validated successfully', constants.LOG_TYPES.DEBUG);

  const taskUsersexists = await TaskUser.find({})
    .where('_id').equals(req.params.id)
    .where('user').equals(req.body.user);
  websocketHandler.sendLog(req, `Checking for existing TaskUser, found ${taskUsersexists.length}`, constants.LOG_TYPES.DEBUG);

  if (taskUsersexists.length > 0) {
    websocketHandler.sendLog(req, `TaskUser already exists for ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('task.taskUserAlreadyExists'), 403));
  }

  websocketHandler.sendLog(req, `Updating TaskUser ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const document = await TaskUser.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!document) {
    websocketHandler.sendLog(req, `TaskUser ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.documentNotFound')

      , 404));
  }

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals("Test")
    .where('company').equals(req.user.company.id);
  websocketHandler.sendLog(req, `Email template found: ${!!emailTemplate}`, constants.LOG_TYPES.DEBUG);

  if (emailTemplate) {
    const user = await User.findOne({ _id: document.user });
    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.Name,
        message: emailTemplate.contentData
      });
      websocketHandler.sendLog(req, `Email sent to ${user.email} for TaskUser update`, constants.LOG_TYPES.INFO);
    } catch (error) {
      websocketHandler.sendLog(req, `Failed to send email: ${error.message}`, constants.LOG_TYPES.ERROR);
    }
  }

  websocketHandler.sendLog(req, `TaskUser ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: { data: document }
  });
});

exports.getTaskAttachment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTaskAttachment for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying TaskAttachment with ID ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const newTaskAttachment = await TaskAttachments.find({}).where('_id').equals(req.params.id);

  if (!newTaskAttachment || newTaskAttachment.length === 0) {
    websocketHandler.sendLog(req, `No TaskAttachment found for ID ${req.params.id}`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found ${newTaskAttachment.length} TaskAttachment records`, constants.LOG_TYPES.INFO);
  }

  websocketHandler.sendLog(req, 'TaskAttachment retrieval completed', constants.LOG_TYPES.TRACE);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { newTaskAttachment: withFreshAttachmentUrls(newTaskAttachment) }
  });
});

exports.updateTaskAttachments = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateTaskAttachments for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating TaskAttachment ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const document = await TaskAttachments.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!document) {
    websocketHandler.sendLog(req, `TaskAttachment ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.documentNotFound'), 404));
  }

  websocketHandler.sendLog(req, `TaskAttachment ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: { data: document }
  });
});

exports.addTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addTask execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Checking for existing task ${req.body.taskName}`, constants.LOG_TYPES.TRACE);
  const existingTask = await Task.findOne({
    company: req.user.company.id,
    taskName: req.body.taskName,
  });

  if (existingTask) {
    websocketHandler.sendLog(req, `Task ${req.body.taskName} already exists`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('task.taskAlreadyExists'),
    });
  }

  if (req.body.user) {
    const existingUser = await User.findById(req.body.user);
    if (!existingUser) {
      websocketHandler.sendLog(req, `Invalid user ${req.body.user} for task creation`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        data: null,
        message: req.t('task.invalidUserOrTask'),
      });
    }
  }

  const existingProject = await Project.findById(req.body.project);
  if (!existingProject) {
    websocketHandler.sendLog(req, `Invalid project ${req.body.project} for task creation`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, 'User and project validated', constants.LOG_TYPES.DEBUG);

  // TM-012: atomic counter instead of countDocuments()+1, which races under
  // concurrent task creation for the same project.
  const taskNumber = await getNextTaskNumber(req.user.company.id, req.body.project);
  websocketHandler.sendLog(req, `Generated task number: ${taskNumber}`, constants.LOG_TYPES.DEBUG);

  const newTask = await Task.create({
    taskName: req.body.taskName,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    startTime: req.body.startTime,
    description: req.body.description,
    comment: req.body.comment,
    isSubTask: false,
    priority: req.body.priority,
    company: req.user.company.id,
    project: req.body.project,
    status: req.body.status,
    title: req.body.title,
    parentTask: req.body.parentTask,
    estimate: req.body.estimate,
    timeTaken: req.body.timeTaken,
    isDeleted: req.body.isDeleted,
    dueDate: req.body.dueDate, // TM-014: field existed on the schema but was never actually written by addTask
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.user.id,
    updatedBy: req.user.id,
    taskNumber
  });
  websocketHandler.sendLog(req, `Created new task ${newTask._id}`, constants.LOG_TYPES.INFO);

  if (req.body.user != null) {
    const newTaskUserItem = await TaskUser.create({
      task: newTask._id,
      user: req.body.user,
      role: TASKUSER_ROLE.OWNER, // TM-011: the create-time assignee is the primary owner
      company: req.user.company.id,
      status: "Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    websocketHandler.sendLog(req, `Assigned user ${req.body.user} to task ${newTask._id}`, constants.LOG_TYPES.INFO);

    if (newTaskUserItem) {
      const newUser = await User.findOne({ _id: newTaskUserItem.user });
      const templateNewUser = await EmailTemplate.findOne({})
        .where('Name').equals(constants.Email_template_constant.Task_Assigned)
        .where('company').equals(req.user.company.id);
      if (templateNewUser) {
        const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${newTask._id}`;
        const emailTemplateNewUser = templateNewUser.contentData
          .replaceAll("{firstName}", newUser?.firstName || 'N/A')
          .replaceAll("{taskURL}", taskURL)
          .replaceAll("{startDate}", newTask?.startDate || 'N/A')
          .replaceAll("{endDate}", newTask?.endDate || 'N/A')
          .replaceAll("{company}", req.user.company.companyName || 'N/A')
          .replaceAll("{description}", newTask?.description ? (newTask.description.length > 500 ? newTask.description.substring(0, 500) + '...' : newTask.description) : 'No description provided')
          .replaceAll("{priority}", newTask?.priority || 'N/A')
          .replaceAll("{taskName}", newTask?.taskName || 'Untitled Task')
          .replaceAll("{lastName}", newUser?.lastName || 'N/A');
        try {
          await sendEmail({
            email: newUser.email,
            subject: templateNewUser.subject,
            message: emailTemplateNewUser
          });
          websocketHandler.sendLog(req, `Task assignment email sent to ${newUser.email}`, constants.LOG_TYPES.INFO);
        } catch (error) {
          websocketHandler.sendLog(req, `Failed to send email: ${error.message}`, constants.LOG_TYPES.ERROR);
        }
      }
    }
  }

  if (req.body.taskAttachments != null) {
    for (let i = 0; i < req.body.taskAttachments.length; i++) {
      if (!req.body.taskAttachments[i].attachmentType || !req.body.taskAttachments[i].attachmentName ||
        !req.body.taskAttachments[i].attachmentSize || !req.body.taskAttachments[i].extention ||
        !req.body.taskAttachments[i].file) {
        websocketHandler.sendLog(req, `Invalid attachment properties at index ${i}`, constants.LOG_TYPES.ERROR);
        return res.status(400).json({
          error: req.t('task.invalidAttachmentProperties')

        });
      }
      req.body.taskAttachments[i].filePath = req.body.taskAttachments[i].attachmentName;
      const url = await StorageController.createPrivateContainerInContainer(req.user.company.id, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
      const newTaskAttachments = await TaskAttachments.create({
        task: newTask._id,
        attachmentType: req.body.taskAttachments[i].attachmentType,
        attachmentName: req.body.taskAttachments[i].attachmentName,
        attachmentSize: req.body.taskAttachments[i].attachmentSize,
        extention: req.body.taskAttachments[i].extention,
        filePath: req.body.taskAttachments[i].filePath,
        status: "Active",
        createdOn: new Date(),
        updatedOn: new Date(),
        createdBy: req.user.id,
        updatedBy: req.user.id,
        company: req.user.company.id,
        url
      });
      websocketHandler.sendLog(req, `Added attachment ${newTaskAttachments._id} to task ${newTask._id}`, constants.LOG_TYPES.INFO);
    }
  }

  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(newTask._id);
  const newTaskUserList = await TaskUser.find({}).where('task').equals(newTask._id);
  websocketHandler.sendLog(req, `Task created with ${newTaskUserList.length} users and ${newTaskAttachmentList.length} attachments`, constants.LOG_TYPES.INFO);

  // Add Event Notification for the assigned user
  SendUINotification(`Task Assigned: ${newTask.taskName}`, newTask.description || `Task ${newTask.taskName} has been assigned to you.`,
    constants.Event_Notification_Type_Status.task_assignment, req.body.user, req.user.company.id, req, `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${newTask._id}`);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      newTask,
      newTaskUserList,
      newTaskAttachmentList: withFreshAttachmentUrls(newTaskAttachmentList)
    }
  });
});

exports.addTaskUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addTaskUser execution', constants.LOG_TYPES.TRACE);

  const existingUser = await User.findById(req.body.user);
  const existingTask = await Task.findById(req.body.task);
  if (!existingUser || !existingTask) {
    websocketHandler.sendLog(req, `Invalid user ${req.body.user} or task ${req.body.task}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, 'User and task validated', constants.LOG_TYPES.DEBUG);

  let emailOldUser = null;
  const taskUsersExists = await TaskUser.find({}).where('task').equals(req.body.task).populate('task');
  const task = await Task.findById(req.body.task).populate('project', 'projectName');
  const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${task._id}`;
  let newTaskUserItem = null;

  if (taskUsersExists.length > 0) {
    emailOldUser = taskUsersExists[0].user;
    if (emailOldUser.id === req.body.user) {
      websocketHandler.sendLog(req, `User ${req.body.user} already assigned to task ${req.body.task}`, constants.LOG_TYPES.WARN);
      return res.status(200).json({
        status: constants.APIResponseStatus.Failure,
        data: {
          Error: req.t('task.sameUserAlreadyAssigned')

        }
      });
    }
    newTaskUserItem = await TaskUser.findByIdAndUpdate(taskUsersExists[0].id, req.body, {
      new: true,
      runValidators: true
    });
    websocketHandler.sendLog(req, `Updated existing TaskUser ${taskUsersExists[0].id}`, constants.LOG_TYPES.INFO);
  } else {
    newTaskUserItem = await TaskUser.create({
      task: req.body.task,
      user: req.body.user,
      company: req.user.company.id,
      status: "Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    websocketHandler.sendLog(req, `Created new TaskUser ${newTaskUserItem._id}`, constants.LOG_TYPES.INFO);
  }

  if (emailOldUser != null) {
    const oldUser = await User.findOne({ _id: emailOldUser });
    const templateOldUser = await EmailTemplate.findOne({})
      .where('Name').equals(constants.Email_template_constant.Task_Unassigned)
      .where('company').equals(req.user.company.id);
    if (templateOldUser) {
      const emailTemplateOldUser = templateOldUser.contentData
        .replaceAll("{firstName}", oldUser?.firstName || 'N/A')
        .replaceAll("{startDate}", task?.startDate || 'N/A')
        .replaceAll("{endDate}", task?.endDate || 'N/A')
        .replaceAll("{taskName}", task?.taskName || 'Untitled Task')
        .replaceAll("{date}", formatDateToDDMMYY(new Date()))
        .replaceAll("{company}", req.user.company.companyName || 'N/A')
        .replaceAll("{projectName}", task.project?.projectName || 'N/A')
        .replaceAll("{taskURL}", taskURL)
        .replaceAll("{lastName}", oldUser?.lastName || 'N/A');
      try {
        await sendEmail({
          email: oldUser.email,
          subject: templateOldUser.subject,
          message: emailTemplateOldUser
        });
        websocketHandler.sendLog(req, `Unassignment email sent to ${oldUser.email}`, constants.LOG_TYPES.INFO);
      } catch (error) {
        websocketHandler.sendLog(req, `Failed to send unassignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }
    //Add Event Notification for the assigned user
    SendUINotification(`Task Unassignment: ${task.taskName}`, task.description || `Task ${task.taskName}, has been Unassigned to you.`,
      constants.Event_Notification_Type_Status.task_assignment, emailOldUser?._id?.toString(), req.user.company.id, req, taskURL);
  }

  if (newTaskUserItem != null) {
    const newUser = await User.findOne({ _id: newTaskUserItem.user });
    const templateNewUser = await EmailTemplate.findOne({})
      .where('Name').equals(constants.Email_template_constant.Task_Assigned)
      .where('company').equals(req.user.company.id);
    if (templateNewUser) {
      const emailTemplateNewUser = templateNewUser.contentData
        .replaceAll("{firstName}", newUser?.firstName || 'N/A')
        .replaceAll("{startDate}", task?.startDate || 'N/A')
        .replaceAll("{endDate}", task?.endDate || 'N/A')
        .replaceAll("{taskName}", task?.taskName || 'Untitled Task')
        .replaceAll("{company}", req.user.company.companyName || 'N/A')
        .replaceAll("{description}", task?.description ? (task.description.length > 500 ? task.description.substring(0, 500) + '...' : task.description) : 'No description provided')
        .replaceAll("{priority}", task?.priority || 'N/A')
        .replaceAll("{taskURL}", taskURL)
        .replaceAll("{lastName}", newUser?.lastName || 'N/A');
      try {
        await sendEmail({
          email: newUser.email,
          subject: templateNewUser.subject,
          message: emailTemplateNewUser
        });
        websocketHandler.sendLog(req, `Assignment email sent to ${newUser.email}`, constants.LOG_TYPES.INFO);
      } catch (error) {
        websocketHandler.sendLog(req, `Failed to send assignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }
    //Add Event Notification for the assigned user
    SendUINotification(`Task assignment: ${task.taskName}`, task.description || `Task ${task.taskName}, has been assigned to you.`,
      constants.Event_Notification_Type_Status.task_assignment, newUser?._id?.toString(), req.user.company.id, req, taskURL);

  }

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.body.task);
  websocketHandler.sendLog(req, `Returning ${newTaskUserList.length} task users`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { TaskUserList: newTaskUserList }
  });
});

exports.deleteTaskUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteTaskUser for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.Task_Unassigned)
    .where('company').equals(req.user.company.id);
  const taskUser = await TaskUser.findOne({ _id: req.params.id });
  const task = await Task.findOne({ _id: taskUser.task });
  const user = await User.findOne({ _id: taskUser.user });
  websocketHandler.sendLog(req, `Retrieved task ${task._id} and user ${user._id} for TaskUser ${req.params.id}`, constants.LOG_TYPES.DEBUG);

  const document = await TaskUser.findByIdAndDelete(req.params.id);
  if (!document) {
    websocketHandler.sendLog(req, `TaskUser ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.documentNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Deleted TaskUser ${req.params.id}`, constants.LOG_TYPES.INFO);

  if (emailTemplate) {
    const emailTemplateNewUser = emailTemplate.contentData
      .replaceAll("{firstName}", user?.firstName || 'N/A')
      .replaceAll("{startDate}", task?.startDate || 'N/A')
      .replaceAll("{endDate}", task?.endDate || 'N/A')
      .replaceAll("{taskName}", task?.taskName || 'Untitled Task')
      .replaceAll("{lastName}", user?.lastName || 'N/A');
    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        message: emailTemplateNewUser
      });
      websocketHandler.sendLog(req, `Unassignment email sent to ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (error) {
      websocketHandler.sendLog(req, `Failed to send unassignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
    }
  }

  //Add Event Notification for the deleted user
  SendUINotification(`Task Unassigned: ${task.taskName}`, task.description || `Task ${task.taskName} has been unassigned to you.`,
    constants.Event_Notification_Type_Status.task_assignment, user?._id?.toString(), req.user.company.id, req, `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${task._id}`);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.addTaskAttachment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addTaskAttachment execution', constants.LOG_TYPES.TRACE);

  const existingTask = await Task.findById(req.body.taskId);
  if (!existingTask) {
    websocketHandler.sendLog(req, `Invalid task ${req.body.taskId}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, `Validated task ${req.body.taskId}`, constants.LOG_TYPES.DEBUG);

  if (!Array.isArray(req.body.taskAttachments) || req.body.taskAttachments.length === 0) {
    websocketHandler.sendLog(req, 'No taskAttachments provided', constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidAttachmentProperties'),
    });
  }

  for (let i = 0; i < req.body.taskAttachments.length; i++) {
    if (!req.body.taskAttachments[i].attachmentType || !req.body.taskAttachments[i].attachmentName ||
      !req.body.taskAttachments[i].attachmentSize || !req.body.taskAttachments[i].extention ||
      !req.body.taskAttachments[i].file) {
      websocketHandler.sendLog(req, `Invalid attachment properties at index ${i}`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        error: req.t('task.invalidAttachmentProperties')

      });
    }
    req.body.taskAttachments[i].filePath = req.body.taskAttachments[i].attachmentName;
    const url = await StorageController.createPrivateContainerInContainer(req.user.company.id, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
    const newTaskAttachment = await TaskAttachments.create({
      task: req.body.taskId,
      attachmentType: req.body.taskAttachments[i].attachmentType,
      attachmentName: req.body.taskAttachments[i].attachmentName,
      attachmentSize: req.body.taskAttachments[i].attachmentSize,
      extention: req.body.taskAttachments[i].extention,
      filePath: req.body.taskAttachments[i].filePath,
      status: "Active",
      comment: req.body.comment,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.user.id,
      updatedBy: req.user.id,
      company: req.user.company.id,
      url
    });
    websocketHandler.sendLog(req, `Added attachment ${newTaskAttachment._id} to task ${req.body.taskId}`, constants.LOG_TYPES.INFO);
  }

  let newTaskAttachmentList;
  if (req.body.comment != "") {
    newTaskAttachmentList = await TaskAttachments.find({}).where('comment').equals(req.body.comment);
    websocketHandler.sendLog(req, `Fetched ${newTaskAttachmentList.length} attachments by comment`, constants.LOG_TYPES.INFO);
  } else {
    newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.body.taskId);
    websocketHandler.sendLog(req, `Fetched ${newTaskAttachmentList.length} attachments by task ID`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskAttachmentList: withFreshAttachmentUrls(newTaskAttachmentList) }
  });
});

exports.deleteTaskAttachment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteTaskAttachment for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const document = await TaskAttachments.findByIdAndDelete(req.params.id);
  if (!document) {
    websocketHandler.sendLog(req, `TaskAttachment ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.documentNotFound')

      , 404));
  }
  websocketHandler.sendLog(req, `Deleted TaskAttachment ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Get Country List
exports.getTaskList = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskList execution', constants.LOG_TYPES.TRACE);

  const skip = req.body.skip || 0;
  const limit = req.body.next || 10;
  const search = req.body.search;
  websocketHandler.sendLog(req, `Fetching tasks for company ${req.user.company.id} with skip ${skip} and limit ${limit}`, constants.LOG_TYPES.DEBUG);

  const query = { company: req.user.company.id };
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const orConditions = [
      { taskName: searchRegex },
      { title: searchRegex }
    ];
    // Extract digits from search to match taskNumber (handles "155", "E-155", "E - 155", etc.)
    const digitMatch = search.match(/(\d+)/);
    if (digitMatch) {
      orConditions.push({ taskNumber: Number(digitMatch[1]) });
    }
    // Match project name
    const matchingProjects = await Project.find({
      company: req.user.company.id,
      projectName: searchRegex
    }).select('_id');
    if (matchingProjects.length > 0) {
      orConditions.push({ project: { $in: matchingProjects.map(p => p._id) } });
    }
    query.$or = orConditions;
  }
  applyStatusPriorityFilters(query, { status: req.body.status, priority: req.body.priority });

  const taskList = await Task.find(query)
    .select('taskName startDate endDate dueDate description comment priority status taskNumber parentTask')
    .skip(skip)
    .limit(limit);
  const taskCount = await Task.countDocuments(query);
  websocketHandler.sendLog(req, `Fetched ${taskList.length} tasks, total count: ${taskCount}`, constants.LOG_TYPES.INFO);

  if (taskList) {
    const Comment = require('../models/Task/taskCommentModel');
    for (let i = 0; i < taskList.length; i++) {
      const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id).select('user');
      taskList[i].TaskUsers = taskUser || null;

      // Get comments count for the task
      const commentsCount = await Comment.countDocuments({ task: taskList[i]._id });
      taskList[i]._doc.commentsCount = commentsCount;

      websocketHandler.sendLog(req, `Added ${taskUser?.length || 0} users and ${commentsCount} comments to task ${taskList[i]._id}`, constants.LOG_TYPES.DEBUG);
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskList, taskCount }
  });
});


exports.getTaskListByProject = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTaskListByProject for project ${req.params.projectId}`, constants.LOG_TYPES.TRACE);

  const skip = req.body.skip || 0;
  const limit = req.body.next || 10;
  const search = req.body.search;

  const projectQuery = { company: req.user.company.id, project: req.params.projectId };
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const orConditions = [
      { taskName: searchRegex },
      { title: searchRegex }
    ];
    const digitMatch = search.match(/(\d+)/);
    if (digitMatch) {
      orConditions.push({ taskNumber: Number(digitMatch[1]) });
    }
    projectQuery.$or = orConditions;
  }

  const tasksForProject = await Task.find(projectQuery)
    .skip(skip)
    .limit(limit);
  websocketHandler.sendLog(req, `Fetched ${tasksForProject.length} tasks for project ${req.params.projectId}`, constants.LOG_TYPES.DEBUG);

  // NOTE (TM-010): TaskUser has no `userId` field — the assignee reference is
  // `user`. The previous `.where('userId')` always matched zero documents,
  // so this endpoint always returned an empty list regardless of input.
  const userTaskIds = (await TaskUser.find({})
    .where('user').equals(req.body.userId))
    .map(taskUser => taskUser.task.toString());
  websocketHandler.sendLog(req, `Found ${userTaskIds.length} task IDs for user ${req.body.userId}`, constants.LOG_TYPES.DEBUG);

  const taskList = tasksForProject.filter(task => userTaskIds.includes(task._id.toString()));
  const taskCount = userTaskIds.length;

  if (taskList) {
    for (let i = 0; i < taskList.length; i++) {
      const taskUser = await TaskUser.find({})
        .where('task').equals(taskList[i]._id)
        .where('user').equals(req.body.userId);
      taskList[i].TaskUsers = taskUser && taskUser.length ? taskUser : null;

      // Get comments count for the task
      const Comment = require('../models/Task/taskCommentModel');
      const commentsCount = await Comment.countDocuments({ task: taskList[i]._id });
      taskList[i]._doc.commentsCount = commentsCount;

      websocketHandler.sendLog(req, `Added ${taskUser?.length || 0} users and ${commentsCount} comments to task ${taskList[i]._id}`, constants.LOG_TYPES.DEBUG);
    }
  }

  websocketHandler.sendLog(req, `Returning ${taskList.length} tasks with total count ${taskCount}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskList, taskCount }
  });
});

exports.getTaskListByParentTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTaskListByParentTask for parent task ${req.params.taskId}`, constants.LOG_TYPES.TRACE);

  const taskList = await Task.find({}).where('parentTask').equals(req.params.taskId);
  websocketHandler.sendLog(req, `Fetched ${taskList.length} tasks for parent task ${req.params.taskId}`, constants.LOG_TYPES.INFO);

  if (taskList) {
    for (let i = 0; i < taskList.length; i++) {
      const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id);
      taskList[i].TaskUsers = taskUser || null;
      websocketHandler.sendLog(req, `Added ${taskUser?.length || 0} users to task ${taskList[i]._id}`, constants.LOG_TYPES.DEBUG);
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { taskList }
  });
});
exports.getUserTaskListByProject = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserTaskListByProject execution (Optimized)', constants.LOG_TYPES.TRACE);

  const { skip, next: limit, projectId, userId, search } = req.body;
  websocketHandler.sendLog(req, `Parameters: userId=${userId}, projectId=${projectId}, skip=${skip}, limit=${limit}`, constants.LOG_TYPES.DEBUG);

  // Determine if pagination should be applied
  const applyPagination = skip !== '' && limit !== '' && skip !== undefined && limit !== undefined;
  const adjustedSkip = applyPagination ? parseInt(skip) || 0 : 0;
  // Maximum limit is 100 as per your original logic
  const adjustedLimit = applyPagination ? Math.min(parseInt(limit) || 10, 100) : Number.MAX_SAFE_INTEGER;

  websocketHandler.sendLog(req, `Pagination: ${applyPagination}, Adjusted skip: ${adjustedSkip}, Adjusted limit: ${adjustedLimit}`, constants.LOG_TYPES.DEBUG);

  // --- PHASE 1: FIND TASK IDs AND COUNT (LIGHTWEIGHT) ---
  // Build search match stages for reuse in both paths
  const searchMatchStage = search ? (() => {
    const orConditions = [
      { 'taskDetails.taskName': new RegExp(search, 'i') },
      { 'taskDetails.title': new RegExp(search, 'i') }
    ];
    const digitMatch = search.match(/(\d+)/);
    if (digitMatch) {
      orConditions.push({ 'taskDetails.taskNumber': Number(digitMatch[1]) });
    }
    return [{ $match: { $or: orConditions } }];
  })() : [];

  // PATH A: Assigned tasks (existing logic)
  const assignedTasksPipeline = [
    // 1. Filter TaskUser documents by the user ID
    { $match: { user: new mongoose.Types.ObjectId(userId) } },

    // 2. Look up the task details and filter by project ID
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    // 3. Only keep results where a task was found and belongs to the specified project
    { $unwind: '$taskDetails' },
    { $match: { 'taskDetails.project': new mongoose.Types.ObjectId(projectId) } },

    // 3b. Apply search filter if provided
    ...searchMatchStage,

    // 4. Project only the Task ID
    { $project: { _id: 0, taskId: '$taskDetails._id' } }
  ];

  // Main pipeline with union to include creator-based tasks
  const initialPipeline = [
    ...assignedTasksPipeline,

    // PATH B: Created tasks (new logic)
    {
      $unionWith: {
        coll: 'tasks',
        pipeline: [
          {
            $match: {
              createdBy: new mongoose.Types.ObjectId(userId),
              project: new mongoose.Types.ObjectId(projectId),
              isDeleted: { $ne: true }
            }
          },
          // Apply search filter for created tasks
          ...(search ? [
            {
              $match: {
                $or: [
                  { taskName: new RegExp(search, 'i') },
                  { title: new RegExp(search, 'i') },
                  ...((() => {
                    const digitMatch = search.match(/(\d+)/);
                    return digitMatch ? [{ taskNumber: Number(digitMatch[1]) }] : [];
                  })())
                ]
              }
            }
          ] : []),
          { $project: { _id: 0, taskId: '$_id' } }
        ]
      }
    },

    // Deduplicate by taskId (handles users who are both creator AND assignee)
    { $group: { _id: '$taskId' } },
    { $project: { _id: 0, taskId: '$_id' } }
  ];

  websocketHandler.sendLog(req, 'Executing Phase 1: ID and Count aggregation', constants.LOG_TYPES.TRACE);

  const [initialResult] = await TaskUser.aggregate([
    ...initialPipeline,
    {
      $facet: {
        // Task IDs for the current page (Groups all, then we get the array)
        taskIds: applyPagination
          ? [{ $skip: adjustedSkip }, { $limit: adjustedLimit }, { $group: { _id: null, ids: { $push: '$taskId' } } }]
          : [{ $group: { _id: null, ids: { $push: '$taskId' } } }],
        // Total count
        taskCount: [{ $count: 'count' }]
      }
    }
  ], { allowDiskUse: true }).exec(); // **Crucial for large queries**

  // --- Error Handling and ID Extraction ---
  if (!initialResult || !initialResult.taskCount) {
    websocketHandler.sendLog(req, 'Initial query failed to execute or returned an invalid structure.', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.failedToFetchTaskList'), 500));
  }

  const taskCount = initialResult.taskCount[0]?.count || 0;
  const taskIdsToLookup = initialResult.taskIds[0]?.ids || [];

  if (taskIdsToLookup.length === 0) {
    websocketHandler.sendLog(req, `Count: ${taskCount}, but 0 tasks to lookup. Returning empty list.`, constants.LOG_TYPES.INFO);
    return res.status(200).json({ status: constants.APIResponseStatus.Success, taskList: [], taskCount });
  }

  // --- PHASE 2: HYDRATE LIMITED TASKS (HEAVY LOOKUPS) ---
  // We perform the lookups only on the small, paginated subset of Task IDs.
  // NOTE: Starting from Task collection instead of TaskUser to handle creator-only tasks
  const finalLookupPipeline = [
    // 1. Match the Task documents for the *limited* set of task IDs
    { $match: { _id: { $in: taskIdsToLookup } } },

    // 2. Lookup Task Users/Assignees (may be empty for creator-only tasks)
    {
      $lookup: {
        from: 'taskusers',
        let: { taskId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$task', '$$taskId'] } } },
          // Nested lookups for createdBy and user details
          { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
          { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          // Project TaskUser details
          {
            $project: {
              _id: 1, task: 1,
              createdBy: { _id: '$createdBy._id', firstName: '$createdBy.firstName', lastName: '$createdBy.lastName' },
              user: { _id: '$user._id', firstName: '$user.firstName', lastName: '$user.lastName' }
            }
          }
        ],
        as: 'TaskUsers'
      }
    },

    // 3. Lookup Task Created By User details
    { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'taskCreatedBy' } },
    { $unwind: { path: '$taskCreatedBy', preserveNullAndEmptyArrays: true } },

    // 4. Lookup Comments for comment count
    { $lookup: { from: 'comments', localField: '_id', foreignField: 'task', as: 'taskComments' } },

    // 5. Final Projection (Structuring the final output)
    {
      $project: {
        _id: 0,
        task: {
          _id: '$_id',
          id: '$_id',
          taskName: '$taskName',
          startDate: '$startDate',
          endDate: '$endDate',
          description: '$description',
          comment: '$comment',
          priority: '$priority',
          status: '$status',
          taskNumber: '$taskNumber',
          dueDate: '$dueDate',
          parentTask: '$parentTask',
          project: '$project',
          TaskUsers: '$TaskUsers',
          commentsCount: { $size: '$taskComments' },
          createdBy: {
            _id: '$taskCreatedBy._id',
            firstName: '$taskCreatedBy.firstName',
            lastName: '$taskCreatedBy.lastName'
          }
        }
      }
    }
  ];

  websocketHandler.sendLog(req, `Executing Phase 2: Final lookup query for ${taskIdsToLookup.length} tasks`, constants.LOG_TYPES.TRACE);
  // Execute the final query on the limited set - now using Task collection instead of TaskUser
  const finalResult = await Task.aggregate(finalLookupPipeline, { allowDiskUse: true }).exec();

  const taskList = finalResult.map(item => item.task);

  websocketHandler.sendLog(req, `Returning ${taskList.length} tasks with total count ${taskCount}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    taskList,
    taskCount
  });
});

//this method will be removed later
exports.getUserTaskListByProject1 = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserTaskListByProject execution', constants.LOG_TYPES.TRACE);
  try {
    const { skip = 0, next: limit = 10, projectId, userId } = req.body;
    const adjustedLimit = Math.min(Number(limit), 100);

    websocketHandler.sendLog(req, `Parameters: userId=${userId}, projectId=${projectId}, skip=${skip}, limit=${adjustedLimit}`, constants.LOG_TYPES.DEBUG);

    // Fetch TaskUser records in one go, populating necessary fields
    const taskUsers = await TaskUser.find({
      user: userId
    })
      .populate({
        path: 'task',
        match: { project: projectId }, // Directly filter tasks by project
        populate: { path: 'TaskUsers' } // Pre-populate TaskUsers for each task
      })
      .skip(Number(skip))
      .limit(adjustedLimit);

    // Filter out null `task` values (caused by `match` filter above)
    const validTaskUsers = taskUsers.filter(taskUser => taskUser.task);

    websocketHandler.sendLog(req, `Fetched ${validTaskUsers.length} TaskUser records`, constants.LOG_TYPES.INFO);

    const taskCount = await TaskUser.countDocuments({
      user: userId,
      task: { $in: validTaskUsers.map(tu => tu.task._id) }
    });

    websocketHandler.sendLog(req, `Total task count: ${taskCount}`, constants.LOG_TYPES.DEBUG);

    // Extract and format tasks
    const taskList = validTaskUsers.map(taskUser => taskUser.task);

    websocketHandler.sendLog(req, `Returning ${taskList.length} tasks`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      taskList,
      taskCount
    });

  } catch (error) {
    websocketHandler.sendLog(req, `Error in getUserTaskListByProject: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

//Tag management
exports.addTag = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addTag execution', constants.LOG_TYPES.TRACE);

  const tagExists = await Tag.find({
    "title": { $regex: new RegExp("^" + req.body.title.toLowerCase(), "i") }
  }).where('company').equals(req.user.company.id);
  websocketHandler.sendLog(req, `Checked for existing tag, found ${tagExists.length}`, constants.LOG_TYPES.DEBUG);

  if (tagExists.length > 0) {
    websocketHandler.sendLog(req, `Tag ${req.body.title} already exists`, constants.LOG_TYPES.WARN);
    res.status(403).send({
      error: (req.t('task.tagAlreadyExists'), 403)

    });
  } else {
    const newTag = await Tag.create({
      title: req.body.title,
      company: req.user.company.id,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    websocketHandler.sendLog(req, `Created new tag ${newTag._id}`, constants.LOG_TYPES.INFO);

    let message = req.body.title;
    try {
      // notification.SendNotification(req, res, next, message);
      websocketHandler.sendLog(req, `Notification sent for tag ${newTag._id}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Failed to send notification: ${err.message}`, constants.LOG_TYPES.ERROR);
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: newTag
    });
  }
});

exports.updateTag = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateTag for ID ${req.body.id}`, constants.LOG_TYPES.TRACE);

  // TM-015: the existence check used req.body.id while the actual update
  // used req.body._id (almost always undefined) and attempted to $set the
  // immutable _id field — the rename never actually persisted. Use a single
  // id field throughout, and update+return in one atomic, company-scoped
  // operation.
  const updatedTag = await Tag.findOneAndUpdate(
    { _id: req.body.id, company: req.user.company.id },
    { $set: { title: req.body.title, updatedOn: new Date(), updatedBy: req.user.id } },
    { new: true, runValidators: true }
  );

  if (!updatedTag) {
    websocketHandler.sendLog(req, `Tag ${req.body.id} does not exist`, constants.LOG_TYPES.ERROR);
    return res.status(404).send({
      error: req.t('task.documentNotFound')
    });
  }

  websocketHandler.sendLog(req, `Updated tag ${req.body.id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedTag
  });
});

exports.deleteTagById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting deleteTagById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const taskTag = await TaskTag.find({}).where('tag').equals(req.params.id);
  websocketHandler.sendLog(req, `Found ${taskTag.length} task tags using tag ${req.params.id}`, constants.LOG_TYPES.DEBUG);

  if (taskTag.length > 0) {
    websocketHandler.sendLog(req, `Cannot delete tag ${req.params.id} due to existing task associations`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.tagInUse'),
    });
  }

  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      websocketHandler.sendLog(req, `Tag ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Deleted tag ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(tag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error deleting tag ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};

exports.getTagById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting getTagById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      websocketHandler.sendLog(req, `Tag ${req.params.id} not found`, constants.LOG_TYPES.WARN);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Retrieved tag ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(tag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching tag ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};

exports.getTagsByTaskId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTagsByTaskId for task ${req.params.taskId}`, constants.LOG_TYPES.TRACE);

  const taskId = req.params.taskId;
  if (taskId.length <= 1) {
    websocketHandler.sendLog(req, 'Fetching all tags due to short taskId', constants.LOG_TYPES.DEBUG);
    const allTags = await Tag.find({ company: req.user.company.id }).sort({ title: 1 });
    websocketHandler.sendLog(req, `Retrieved ${allTags.length} tags`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: allTags
    });
  } else {
    const taskTags = await TaskTag.find({ task: req.params.taskId });
    const tagIds = taskTags.map((taskTag) => taskTag.tag);
    websocketHandler.sendLog(req, `Found ${taskTags.length} task tags, ${tagIds.length} tag IDs`, constants.LOG_TYPES.DEBUG);

    const tags = await Tag.find({ _id: { $in: tagIds } }).sort({ title: 1 });
    websocketHandler.sendLog(req, `Retrieved ${tags.length} tags for task ${req.params.taskId}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: tags
    });
  }
});

exports.getTags = async (req, res) => {
  websocketHandler.sendLog(req, `Starting getTags for company ${req.user.company.id}`, constants.LOG_TYPES.TRACE);

  try {
    const tags = await Tag.find({ company: req.user.company.id });
    websocketHandler.sendLog(req, `Retrieved ${tags.length} tags`, constants.LOG_TYPES.INFO);
    res.send(tags);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching tags: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};
//end tag management



//Start Task Tags
exports.createTaskTag = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting createTaskTag execution', constants.LOG_TYPES.TRACE);

  const existingTask = await Task.findById(req.body.task);
  const existingTag = await Tag.findById(req.body.tag);
  if (!existingTask || !existingTag) {
    websocketHandler.sendLog(req, `Invalid task ${req.body.task} or tag ${req.body.tag}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidTaskOrTag')

      ,
    });
  }
  websocketHandler.sendLog(req, 'Task and tag validated', constants.LOG_TYPES.DEBUG);

  try {
    const taskTag = new TaskTag(req.body);
    await taskTag.save();
    websocketHandler.sendLog(req, `Created TaskTag ${taskTag._id}`, constants.LOG_TYPES.INFO);
    res.status(201).send(taskTag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error creating TaskTag: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(400).send({ error: err.message });
  }
};

exports.getAllTaskTags = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting getAllTaskTags execution', constants.LOG_TYPES.TRACE);

  try {
    // Scoped to the caller's company via its tags — TaskTag itself has no
    // `company` field, and this previously returned every company's
    // task/tag associations with no tenant scoping at all.
    const companyTagIds = await Tag.find({ company: req.user.company.id }).distinct('_id');
    const taskTags = await TaskTag.find({ tag: { $in: companyTagIds } });
    websocketHandler.sendLog(req, `Retrieved ${taskTags.length} TaskTags`, constants.LOG_TYPES.INFO);
    res.send(taskTags);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching TaskTags: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({ error: 'Server error' });
  }
};

// NOTE (TM-016): getCommentsByTaskId used to live here. It was mounted on
// `GET /Comment/` — a route with no `:id` param — so `req.params.id` was
// always undefined and the handler could never correctly filter by task.
// Its (now-fixed) thread-nesting logic was moved into getAllComments below,
// which is the endpoint the web client actually calls.

exports.getTaskTagById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting getTaskTagById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const taskTag = await TaskTag.findById(req.params.id).populate('task').populate('tag');
    if (!taskTag) {
      websocketHandler.sendLog(req, `TaskTag ${req.params.id} not found`, constants.LOG_TYPES.WARN);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Retrieved TaskTag ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(taskTag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching TaskTag ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};

exports.updateTaskTagById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting updateTaskTagById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const existingTask = await Task.findById(req.body.task);
  const existingTag = await Tag.findById(req.body.tag);
  if (!existingTask || !existingTag) {
    websocketHandler.sendLog(req, `Invalid task ${req.body.task} or tag ${req.body.tag}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidTaskOrTag'),
    });
  }
  websocketHandler.sendLog(req, 'Task and tag validated', constants.LOG_TYPES.DEBUG);

  try {
    const taskTag = await TaskTag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('task').populate('tag');
    if (!taskTag) {
      websocketHandler.sendLog(req, `TaskTag ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Updated TaskTag ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(taskTag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error updating TaskTag ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(400).send({ error: err.message });
  }
};

exports.deleteTaskTagById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting deleteTaskTagById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const taskTag = await TaskTag.findByIdAndDelete(req.params.id).populate('task').populate('tag');
    if (!taskTag) {
      websocketHandler.sendLog(req, `TaskTag ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Deleted TaskTag ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(taskTag);
  } catch (err) {
    websocketHandler.sendLog(req, `Error deleting TaskTag ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};

//END Task Tags


//Start Comment

exports.createComment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createComment execution', constants.LOG_TYPES.TRACE);

  const existingTask = await Task.findById(req.body.task);
  if (!existingTask) {
    websocketHandler.sendLog(req, `Invalid task ${req.body.task}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidUserOrTask')

      ,
    });
  }
  websocketHandler.sendLog(req, `Validated task ${req.body.task}`, constants.LOG_TYPES.DEBUG);

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.Comment_Added_Notification)
    .where('company').equals(req.user.company.id);
  websocketHandler.sendLog(req, `Email template found: ${!!emailTemplate}`, constants.LOG_TYPES.DEBUG);

  const { content, author, task, commentedAt, parent, status, commentType } = req.body;
  const comment = new Comment({ content, author, task, commentedAt, parent, status, commentType });
  const newComment = await comment.save();
  websocketHandler.sendLog(req, `Created comment ${newComment._id}`, constants.LOG_TYPES.INFO);

  if (req.body.taskAttachments != null) {
    for (let i = 0; i < req.body.taskAttachments.length; i++) {
      if (!req.body.taskAttachments[i].attachmentType || !req.body.taskAttachments[i].attachmentName ||
        !req.body.taskAttachments[i].attachmentSize || !req.body.taskAttachments[i].extention ||
        !req.body.taskAttachments[i].file) {
        websocketHandler.sendLog(req, `Invalid attachment properties at index ${i}`, constants.LOG_TYPES.ERROR);
        return res.status(400).json({
          error: req.t('task.invalidAttachmentProperties')

        });
      }
      req.body.taskAttachments[i].filePath = req.body.taskAttachments[i].attachmentName;
      const url = await StorageController.createPrivateContainerInContainer(req.user.company.id, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
      const newTaskUserItem = await TaskAttachments.create({
        task: newComment.task,
        attachmentType: req.body.taskAttachments[i].attachmentType,
        attachmentName: req.body.taskAttachments[i].attachmentName,
        attachmentSize: req.body.taskAttachments[i].attachmentSize,
        extention: req.body.taskAttachments[i].extention,
        comment: newComment._id,
        filePath: req.body.taskAttachments[i].filePath,
        status: "Active",
        createdOn: new Date(),
        updatedOn: new Date(),
        createdBy: req.user.id,
        updatedBy: req.user.id,
        company: req.user.company.id,
        url
      });
      websocketHandler.sendLog(req, `Added attachment ${newTaskUserItem._id} to comment ${newComment._id}`, constants.LOG_TYPES.INFO);
    }
  }

  const newTaskUserList = await TaskUser.find({}).where('task').equals(newComment.task);
  const currentTask = await Task.findById(newComment.task);
  const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${currentTask._id}`;
  const notifiedUserIds = new Set();

  if (newTaskUserList) {
    for (let j = 0; j < newTaskUserList.length; j++) {
      const user = await User.findOne({ _id: newTaskUserList[j].user });
      if (user) {
        if (emailTemplate) {
          const emailTemplateNewUser = emailTemplate.contentData
            .replaceAll("{firstName}", user.firstName)
            .replaceAll("{taskName}", currentTask.taskName)
            .replaceAll("{taskName1}", currentTask.taskName)
            .replaceAll("{date}", formatDateToDDMMYY(new Date()))
            .replaceAll("{company}", req.user.company.companyName)
            .replaceAll("{content}", newComment.content)
            .replaceAll("{author}", user.firstName + " " + user.lastName)
            .replaceAll("{taskURL}", taskURL)
            .replaceAll("{lastName}", user.lastName);
          try {
            await sendEmail({
              email: user.email,
              subject: emailTemplate.Name,
              message: emailTemplateNewUser
            });
            websocketHandler.sendLog(req, `Comment notification sent to ${user.email}`, constants.LOG_TYPES.INFO);
          } catch (error) {
            websocketHandler.sendLog(req, `Failed to send comment notification: ${error.message}`, constants.LOG_TYPES.ERROR);
          }
        }
        // TM-017: comments previously only ever sent email (and only if an
        // email template happened to be configured) — no in-app
        // notification at all, unlike every other task action.
        SendUINotification(`New comment: ${currentTask.taskName}`, newComment.content,
          constants.Event_Notification_Type_Status.task_assignment, user._id.toString(), req.user.company.id, req, taskURL);
        notifiedUserIds.add(user._id.toString());
      }
    }
  }
  // Also notify the task's creator/reporter if they aren't already an
  // assignee who was just notified above. taskModel's pre-find hook
  // populates createdBy with a User document, so it may be either a
  // populated doc or a raw ObjectId depending on the query path.
  const creatorId = currentTask?.createdBy && (currentTask.createdBy._id || currentTask.createdBy).toString();
  if (creatorId && !notifiedUserIds.has(creatorId)) {
    SendUINotification(`New comment: ${currentTask.taskName}`, newComment.content,
      constants.Event_Notification_Type_Status.task_assignment, creatorId, req.user.company.id, req, taskURL);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: newComment
  });
});

exports.getCommentById = async (req, res) => {
  websocketHandler.sendLog(req, `Starting getCommentById for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      websocketHandler.sendLog(req, `Comment ${req.params.id} not found`, constants.LOG_TYPES.WARN);
      return res.status(404).send();
    }
    websocketHandler.sendLog(req, `Retrieved comment ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.send(comment);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching comment ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({
      error: req.t('task.serverError')

    });
  }
};

exports.updateComment = async (req, res) => {
  websocketHandler.sendLog(req, `Starting updateComment for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const existingTask = await Task.findById(req.body.task);
  if (!existingTask) {
    websocketHandler.sendLog(req, `Invalid task ${req.body.task}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, `Validated task ${req.body.task}`, constants.LOG_TYPES.DEBUG);

  const document = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!document) {
    websocketHandler.sendLog(req, `Comment ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('task.documentNotFound')

      , 404));
  }
  websocketHandler.sendLog(req, `Updated comment ${req.params.id}`, constants.LOG_TYPES.INFO);

  // TM-017: in-app notification for comment edits, matching the pattern
  // used for every other task action (create/update/delete/assign).
  const taskUsersForUpdate = await TaskUser.find({}).where('task').equals(document.task);
  const taskURLForUpdate = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${document.task}`;
  taskUsersForUpdate.forEach((taskUser) => {
    // TaskUser's pre-find hook populates `user`, so it may be a populated
    // doc or a raw ObjectId depending on the query path.
    const assigneeId = taskUser.user && (taskUser.user._id || taskUser.user).toString();
    SendUINotification(`Comment updated: ${existingTask.taskName}`, document.content,
      constants.Event_Notification_Type_Status.task_assignment, assigneeId, req.user.company.id, req, taskURLForUpdate);
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: { data: document }
  });
};


exports.deleteComment = async (req, res) => {
  websocketHandler.sendLog(req, `Starting deleteComment for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.Delete_Comment_Notification)
    .where('company').equals(req.user.company.id);
  const comment = await Comment.findById(req.params.id);
  websocketHandler.sendLog(req, `Retrieved comment ${req.params.id} and email template: ${!!emailTemplate}`, constants.LOG_TYPES.DEBUG);

  try {
    const newTaskUserList = await TaskUser.find({}).where('task').equals(comment.task);
    const currentTask = await Task.findById(comment.task);
    if (newTaskUserList) {
      for (let j = 0; j < newTaskUserList.length; j++) {
        const user = await User.findOne({ _id: newTaskUserList[j].user._id });
        if (user) {
          const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${currentTask._id}`;
          if (emailTemplate) {
            const emailTemplateNewUser = emailTemplate.contentData
              .replaceAll("{firstName}", user.firstName)
              .replaceAll("{taskName}", currentTask.taskName)
              .replaceAll("{date}", formatDateToDDMMYY(new Date()))
              .replaceAll("{company}", req.user.company.companyName)
              .replaceAll("{content}", comment.content)
              .replaceAll("{author}", user.firstName + " " + user.lastName)
              .replaceAll("{taskURL}", taskURL)
              .replaceAll("{lastName}", user.lastName);
            try {
              await sendEmail({
                email: user.email,
                subject: emailTemplate.Name,
                message: emailTemplateNewUser
              });
              websocketHandler.sendLog(req, `Comment deletion notification sent to ${user.email}`, constants.LOG_TYPES.INFO);
            } catch (error) {
              websocketHandler.sendLog(req, `Failed to send deletion notification: ${error.message}`, constants.LOG_TYPES.ERROR);
            }
          }
          // TM-017: in-app notification, matching other task actions.
          SendUINotification(`Comment deleted: ${currentTask.taskName}`, comment.content,
            constants.Event_Notification_Type_Status.task_assignment, user._id.toString(), req.user.company.id, req, taskURL);
        }
      }
    }

    const result = await Comment.findByIdAndDelete(req.params.id);
    if (result) {
      websocketHandler.sendLog(req, `Deleted comment ${req.params.id}`, constants.LOG_TYPES.INFO);
      res.status(200).json({ message: 'Comment deleted successfully' });
    } else {
      websocketHandler.sendLog(req, `Comment ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
      res.status(404).json({
        message: req.t('task.documentNotFound')

      });
    }
  } catch (err) {
    websocketHandler.sendLog(req, `Error deleting comment ${req.params.id}: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllComments = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getAllComments for task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const comments = await Comment.find({ task: req.params.id }).sort('commentedAt');
  websocketHandler.sendLog(req, `Retrieved ${comments.length} comments for task ${req.params.id}`, constants.LOG_TYPES.INFO);

  // TM-016: nest replies under their parent comment. This previously lived
  // in a dead function (getCommentsByTaskId) mounted on a route with no
  // :id param, so it could never actually run; the endpoint clients really
  // use returned a flat list even though Comment.parent exists specifically
  // to support threading. Built with a map rather than acc.find() so a
  // reply that happens to sort before its parent (e.g. clock skew between
  // commentedAt values) still nests correctly instead of crashing.
  const nodesById = new Map();
  comments.forEach((comment) => {
    nodesById.set(comment._id.toString(), { ...comment.toObject(), replies: [] });
  });
  const nestedComments = [];
  comments.forEach((comment) => {
    const node = nodesById.get(comment._id.toString());
    const parentId = comment.parent && (comment.parent._id || comment.parent).toString();
    if (parentId && nodesById.has(parentId)) {
      nodesById.get(parentId).replies.push(node);
    } else {
      nestedComments.push(node);
    }
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: nestedComments
  });
});

//END Task Tags
