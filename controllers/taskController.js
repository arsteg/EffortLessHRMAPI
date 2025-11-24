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

function formatDateToDDMMYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}
exports.deleteTask = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting task deletion process', constants.LOG_TYPES.TRACE);

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
    .where('company').equals(req.cookies.companyId);

  websocketHandler.sendLog(req, `Email template found: ${!!emailTemplate}`, constants.LOG_TYPES.DEBUG);

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);
  const task = await Task.findById(req.params.id);
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
            .replace("{firstName}", user.firstName)
            .replace("{taskName}", task.taskName)
            .replace("{date}", formatDateToDDMMYY(new Date()))
            .replace("{company}", req.cookies.companyName)
            .replace("{projectName}", task.project.projectName)
            .replace("{lastName}", user.lastName);

          const document = await TaskUser.findByIdAndDelete(newTaskUserList[j]._id);
          if (!document) {
            websocketHandler.sendLog(req, `TaskUser ${newTaskUserList[j]._id} not found for deletion`, constants.LOG_TYPES.ERROR);
            return next(new AppError(req.t('task.documentNotFound')
              , 404));
          } else {
            try {
              await sendEmail({
                email: user.email,
                subject: emailTemplate.Name,
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
          constants.Event_Notification_Type_Status.task_delete, user?._id?.toString(), req.cookies.companyId, req);

        if (user._id.toString() === task?.createdBy?._id?.toString()) {
          isUINotificationSentToReporter = true;
        }
      }
    }
    if (!isUINotificationSentToReporter) {
      //Add Event Notification for delete task to reporter
      SendUINotification(`Task deleted: ${task.taskName}`, task.description || `Task ${task.taskName} has been deleted.`,
        constants.Event_Notification_Type_Status.task_delete, task?.createdBy?._id?.toString(), req.cookies.companyId, req);
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

  const existingProject = await Project.findById(req.body.project);
  if (!existingProject) {
    websocketHandler.sendLog(req, `Invalid project ${req.body.project} for task update`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('task.invalidProject')
      ,
    });
  }

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    updates[key] = req.body[key];
  });

  websocketHandler.sendLog(req, `Applying updates: ${JSON.stringify(updates)}`, constants.LOG_TYPES.DEBUG);

  const task = await Task.findByIdAndUpdate(
    req.params.id,
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
    .where('company').equals(req.cookies.companyId);

  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id);
  const updatedTask = await Task.findById(req.params.id);

  if (updatedTask && newTaskUserList.length > 0) {
    const user = await User.findOne({ _id: newTaskUserList[0].user });
    const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${updatedTask._id}`;
    if (emailTemplate) {
      const emailTemplateNewUser = emailTemplate.contentData
        .replace("{firstName}", user.firstName)
        .replace("{taskName}", updatedTask.taskName)
        .replace("{date}", formatDateToDDMMYY(new Date()))
        .replace("{company}", req.cookies.companyName)
        .replace("{projectName}", updatedTask.project.projectName)
        .replace("{description}", updatedTask.description)
        .replace("{priority}", updatedTask.priority)
        .replace("{taskURL}", taskURL)
        .replace("{lastName}", user.lastName);

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
      constants.Event_Notification_Type_Status.task_assignment, user?._id?.toString(), req.cookies.companyId, req);

    if (user?._id?.toString() !== updatedTask?.createdBy?.toString()) {
      // Add Event Notification for the reporter user
      SendUINotification(`Task update: ${updatedTask.taskName}`, updatedTask.description || `Task ${updatedTask.taskName} has been updated.`,
        constants.Event_Notification_Type_Status.task_assignment, updatedTask?.createdBy?._id?.toString(), req.cookies.companyId, req);
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

  const task = await Task.findById(req.params.id);
  const newTaskUserList = await TaskUser.find({}).where('task').equals(req.params.id).populate('task');
  const newTaskAttachmentList = await TaskAttachments.find({}).where('task').equals(req.params.id);

  websocketHandler.sendLog(req, `Retrieved task with ${newTaskUserList.length} users and ${newTaskAttachmentList.length} attachments`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      task: task,
      newTaskUserList: newTaskUserList,
      newTaskAttachmentList: newTaskAttachmentList
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
      newTaskAttachmentList: newTaskAttachmentList
    }
  });
});

exports.getTaskListByTeam = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskListByTeam execution', constants.LOG_TYPES.TRACE);

  // Fetch subordinate user IDs and include current user
  websocketHandler.sendLog(req, `Fetching subordinate users for user ${req.cookies.userId}`, constants.LOG_TYPES.TRACE);
  const subordinateIds = await userSubordinate
    .find({ userId: req.cookies.userId })
    .distinct('subordinateUserId');

  const teamIdsArray = [...subordinateIds, req.cookies.userId];
  websocketHandler.sendLog(req, `Processing ${teamIdsArray.length} team members`, constants.LOG_TYPES.DEBUG);

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  websocketHandler.sendLog(req, `Pagination parameters - skip: ${skip}, limit: ${limit}`, constants.LOG_TYPES.DEBUG);

  const aggregationPipeline = [
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
          parentTask: '$taskDetails.parentTask',
          TaskUsers: '$TaskUsers',
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

  websocketHandler.sendLog(req, `Processing task list for user ${req.body.userId}, skip: ${skip}, limit: ${limit}`, constants.LOG_TYPES.DEBUG);

  const aggregationPipeline = [
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
          parentTask: '$taskDetails.parentTask',
          TaskUsers: '$TaskUsers',
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
    .where('company').equals(req.cookies.companyId);
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
    data: { newTaskAttachment }
  });
});

exports.updateTaskAttachments = catchAsync(async (req, res, next) => {
  const document = await TaskAttachments.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    return next(new AppError(req.t('task.documentNotFound')
      , 404));
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: {
      data: document
    }
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
    company: req.cookies.companyId,
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

  const existingUser = await User.findById(req.body.user);
  const existingProject = await Project.findById(req.body.project);
  if (!existingUser || !existingProject) {
    websocketHandler.sendLog(req, `Invalid user ${req.body.user} or project ${req.body.project}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('task.invalidUserOrTask'),
    });
  }
  websocketHandler.sendLog(req, 'User and project validated', constants.LOG_TYPES.DEBUG);

  const taskCount = await Task.countDocuments({
    company: req.cookies.companyId,
    project: req.body.project
  });
  const taskNumber = taskCount + 1;
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
    company: req.cookies.companyId,
    project: req.body.project,
    status: req.body.status,
    title: req.body.title,
    parentTask: req.body.parentTask,
    estimate: req.body.estimate,
    timeTaken: req.body.timeTaken,
    isDeleted: req.body.isDeleted,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
    taskNumber
  });
  websocketHandler.sendLog(req, `Created new task ${newTask._id}`, constants.LOG_TYPES.INFO);

  if (req.body.user != null) {
    const newTaskUserItem = await TaskUser.create({
      task: newTask._id,
      user: req.body.user,
      company: req.cookies.companyId,
      status: "Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
    });
    websocketHandler.sendLog(req, `Assigned user ${req.body.user} to task ${newTask._id}`, constants.LOG_TYPES.INFO);

    if (newTaskUserItem) {
      const newUser = await User.findOne({ _id: newTaskUserItem.user });
      const templateNewUser = await EmailTemplate.findOne({})
        .where('Name').equals(constants.Email_template_constant.Task_Assigned)
        .where('company').equals(req.cookies.companyId);
      if (templateNewUser) {
        const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${newTask._id}`;
        const emailTemplateNewUser = templateNewUser.contentData
          .replace("{firstName}", newUser.firstName)
          .replace("{taskURL}", taskURL)
          .replace("{startDate}", newTask.startDate)
          .replace("{endDate}", newTask.endDate)
          .replace("{company}", req.cookies.companyName)
          .replace("{description}", newTask.description)
          .replace("{priority}", newTask.priority)
          .replace("{taskName}", newTask.taskName)
          .replace("{lastName}", newUser.lastName);
        try {
          await sendEmail({
            email: newUser.email,
            subject: templateNewUser.Name,
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
      const url = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
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
        createdBy: req.cookies.userId,
        updatedBy: req.cookies.userId,
        company: req.cookies.companyId,
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
    constants.Event_Notification_Type_Status.task_assignment, req.body.user, req.cookies.companyId, req);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      newTask,
      newTaskUserList,
      newTaskAttachmentList
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
  const task = await Task.findById(req.body.task);
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
      company: req.cookies.companyId,
      status: "Active",
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
    });
    websocketHandler.sendLog(req, `Created new TaskUser ${newTaskUserItem._id}`, constants.LOG_TYPES.INFO);
  }

  if (emailOldUser != null) {
    const oldUser = await User.findOne({ _id: emailOldUser });
    const templateOldUser = await EmailTemplate.findOne({})
      .where('Name').equals(constants.Email_template_constant.Task_Unassigned)
      .where('company').equals(req.cookies.companyId);
    if (templateOldUser) {
      const emailTemplateOldUser = templateOldUser.contentData
        .replace("{firstName}", oldUser.firstName)
        .replace("{startDate}", task.startDate)
        .replace("{endDate}", task.endDate)
        .replace("{taskName}", task.taskName)
        .replace("{date}", formatDateToDDMMYY(new Date()))
        .replace("{company}", req.cookies.companyName)
        .replace("{projectName}", task.project.projectName)
        .replace("{lastName}", oldUser.lastName);
      try {
        await sendEmail({
          email: oldUser.email,
          subject: templateOldUser.Name,
          message: emailTemplateOldUser
        });
        websocketHandler.sendLog(req, `Unassignment email sent to ${oldUser.email}`, constants.LOG_TYPES.INFO);
      } catch (error) {
        websocketHandler.sendLog(req, `Failed to send unassignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }
    //Add Event Notification for the assigned user
    SendUINotification(`Task Unassignment: ${task.taskName}`, task.description || `Task ${task.taskName}, has been Unassigned to you.`,
      constants.Event_Notification_Type_Status.task_assignment, emailOldUser?._id?.toString(), req.cookies.companyId, req);
  }

  if (newTaskUserItem != null) {
    const newUser = await User.findOne({ _id: newTaskUserItem.user });
    const templateNewUser = await EmailTemplate.findOne({})
      .where('Name').equals(constants.Email_template_constant.Task_Assigned)
      .where('company').equals(req.cookies.companyId);
    if (templateNewUser) {
      const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${task._id}`;
      const emailTemplateNewUser = templateNewUser.contentData
        .replace("{firstName}", newUser.firstName)
        .replace("{startDate}", task.startDate)
        .replace("{endDate}", task.endDate)
        .replace("{taskName}", task.taskName)
        .replace("{company}", req.cookies.companyName)
        .replace("{description}", task.description)
        .replace("{priority}", task.priority)
        .replace("{taskURL}", taskURL)
        .replace("{lastName}", newUser.lastName);
      try {
        await sendEmail({
          email: newUser.email,
          subject: templateNewUser.Name,
          message: emailTemplateNewUser
        });
        websocketHandler.sendLog(req, `Assignment email sent to ${newUser.email}`, constants.LOG_TYPES.INFO);
      } catch (error) {
        websocketHandler.sendLog(req, `Failed to send assignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }
    //Add Event Notification for the assigned user
    SendUINotification(`Task assignment: ${task.taskName}`, task.description || `Task ${task.taskName}, has been assigned to you.`,
      constants.Event_Notification_Type_Status.task_assignment, newUser?._id?.toString(), req.cookies.companyId, req);

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
    .where('company').equals(req.cookies.companyId);
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
      .replace("{firstName}", user.firstName)
      .replace("{startDate}", task.startDate)
      .replace("{endDate}", task.endDate)
      .replace("{taskName}", task.taskName)
      .replace("{lastName}", user.lastName);
    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.Name,
        message: emailTemplateNewUser
      });
      websocketHandler.sendLog(req, `Unassignment email sent to ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (error) {
      websocketHandler.sendLog(req, `Failed to send unassignment email: ${error.message}`, constants.LOG_TYPES.ERROR);
    }
  }

  //Add Event Notification for the deleted user
  SendUINotification(`Task Unassigned: ${task.taskName}`, task.description || `Task ${task.taskName} has been unassigned to you.`,
    constants.Event_Notification_Type_Status.task_assignment, user?._id?.toString(), req.cookies.companyId, req);

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
    const url = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
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
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      company: req.cookies.companyId,
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
    data: { taskAttachmentList: newTaskAttachmentList }
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
  websocketHandler.sendLog(req, `Fetching tasks for company ${req.cookies.companyId} with skip ${skip} and limit ${limit}`, constants.LOG_TYPES.DEBUG);

  const taskList = await Task.find({})
    .where('company').equals(req.cookies.companyId)
    .select('taskName startDate endDate description comment priority status taskNumber parentTask')
    .skip(skip)
    .limit(limit);
  const taskCount = await Task.countDocuments({ "company": req.cookies.companyId });
  websocketHandler.sendLog(req, `Fetched ${taskList.length} tasks, total count: ${taskCount}`, constants.LOG_TYPES.INFO);

  if (taskList) {
    for (let i = 0; i < taskList.length; i++) {
      const taskUser = await TaskUser.find({}).where('task').equals(taskList[i]._id).select('user');
      taskList[i].TaskUsers = taskUser || null;
      websocketHandler.sendLog(req, `Added ${taskUser?.length || 0} users to task ${taskList[i]._id}`, constants.LOG_TYPES.DEBUG);
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
  const tasksForProject = await Task.find({})
    .where('company').equals(req.cookies.companyId)
    .where('project').equals(req.params.projectId)
    .skip(skip)
    .limit(limit);
  websocketHandler.sendLog(req, `Fetched ${tasksForProject.length} tasks for project ${req.params.projectId}`, constants.LOG_TYPES.DEBUG);

  const userTaskIds = (await TaskUser.find({})
    .where('userId').equals(req.body.userId))
    .map(taskUser => taskUser.task);
  websocketHandler.sendLog(req, `Found ${userTaskIds.length} task IDs for user ${req.body.userId}`, constants.LOG_TYPES.DEBUG);

  const taskList = tasksForProject.filter(task => userTaskIds.includes(task._id.toString()));
  const taskCount = userTaskIds.length;

  if (taskList) {
    for (let i = 0; i < taskList.length; i++) {
      const taskUser = await TaskUser.find({})
        .where('task').equals(taskList[i]._id)
        .where('userId').equals(req.body.userId);
      taskList[i].TaskUsers = taskUser && taskUser.length ? taskUser : null;
      websocketHandler.sendLog(req, `Added ${taskUser?.length || 0} users to task ${taskList[i]._id}`, constants.LOG_TYPES.DEBUG);
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
//old
// exports.getUserTaskListByProject = catchAsync(async (req, res, next) => {
//   websocketHandler.sendLog(req, 'Starting getUserTaskListByProject execution', constants.LOG_TYPES.TRACE);
//   const { skip, next: limit, projectId, userId } = req.body;
//   websocketHandler.sendLog(req, `Parameters: userId=${userId}, projectId=${projectId}, skip=${skip}, limit=${limit}`, constants.LOG_TYPES.DEBUG);

//   // Determine if pagination should be applied
//   const applyPagination = skip !== '' && limit !== '' && skip !== undefined && limit !== undefined;
//   const adjustedSkip = applyPagination ? parseInt(skip) || 0 : 0;
//   const adjustedLimit = applyPagination ? Math.min(parseInt(limit) || 10, 100) : Number.MAX_SAFE_INTEGER;
//   websocketHandler.sendLog(req, `Pagination: ${applyPagination}, Adjusted skip: ${adjustedSkip}, Adjusted limit: ${adjustedLimit}`, constants.LOG_TYPES.DEBUG);

//   const aggregationPipeline = [
//     { $match: { user: new mongoose.Types.ObjectId(userId) } },
//     {
//       $lookup: {
//         from: 'tasks',
//         let: { taskId: '$task' },
//         pipeline: [
//           { $match: { $expr: { $and: [{ $eq: ['$_id', '$$taskId'] }, { $eq: ['$project', new mongoose.Types.ObjectId(projectId)] }] } } },
//         ],
//         as: 'taskDetails'
//       }
//     },
//     { $unwind: { path: '$taskDetails', preserveNullAndEmptyArrays: true } },
//     { $match: { 'taskDetails': { $ne: null } } },
//     {
//       $lookup: {
//         from: 'taskusers',
//         let: { taskId: '$taskDetails._id' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$task', '$$taskId'] } } },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'createdBy',
//               foreignField: '_id',
//               as: 'createdBy'
//             }
//           },
//           { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
//           {
//             $lookup: {
//               from: 'users',
//               localField: 'user',
//               foreignField: '_id',
//               as: 'user'
//             }
//           },
//           { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
//           {
//             $project: {
//               _id: 1,
//               task: 1,
//               createdBy: {
//                 _id: '$createdBy._id',
//                 firstName: '$createdBy.firstName',
//                 lastName: '$createdBy.lastName'
//               },
//               user: {
//                 _id: '$user._id',
//                 firstName: '$user.firstName',
//                 lastName: '$user.lastName'
//               }
//             }
//           }
//         ],
//         as: 'TaskUsers'
//       }
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'taskDetails.createdBy',
//         foreignField: '_id',
//         as: 'taskCreatedBy'
//       }
//     },
//     { $unwind: { path: '$taskCreatedBy', preserveNullAndEmptyArrays: true } },
//     {
//       $project: {
//         _id: 0,
//         task: {
//           _id: '$taskDetails._id',
//           id: '$taskDetails._id',
//           taskName: '$taskDetails.taskName',
//           startDate: '$taskDetails.startDate',
//           endDate: '$taskDetails.endDate',
//           description: '$taskDetails.description',
//           comment: '$taskDetails.comment',
//           priority: '$taskDetails.priority',
//           status: '$taskDetails.status',
//           taskNumber: '$taskDetails.taskNumber',
//           parentTask: '$taskDetails.parentTask',
//           project: '$taskDetails.project',
//           TaskUsers: '$TaskUsers',
//           createdBy: {
//             _id: '$taskCreatedBy._id',
//             firstName: '$taskCreatedBy.firstName',
//             lastName: '$taskCreatedBy.lastName'
//           }
//         }
//       }
//     },
//     {
//       $facet: {
//         taskList: applyPagination ? [{ $skip: adjustedSkip }, { $limit: adjustedLimit }] : [],
//         taskCount: [{ $count: 'count' }]
//       }
//     }
//   ];

//   websocketHandler.sendLog(req, 'Executing task aggregation query', constants.LOG_TYPES.TRACE);
//   const [result] = await TaskUser.aggregate(aggregationPipeline).exec();
//   if (!result || !result.taskList || !result.taskCount) {
//     websocketHandler.sendLog(req, 'Failed to execute aggregation query', constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('task.failedToFetchTaskList'), 500));
//   }

//   const taskList = result.taskList.map(item => item.task);
//   const taskCount = result.taskCount[0]?.count || 0;


//   websocketHandler.sendLog(req, `Returning ${taskList.length} tasks with total count ${taskCount}`, constants.LOG_TYPES.INFO);

//   res.status(200).json({
//     status: constants.APIResponseStatus.Success,
//     taskList,
//     taskCount
//   });
// });

exports.getUserTaskListByProject = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserTaskListByProject execution (Optimized)', constants.LOG_TYPES.TRACE);
  
  const { skip, next: limit, projectId, userId } = req.body;
  websocketHandler.sendLog(req, `Parameters: userId=${userId}, projectId=${projectId}, skip=${skip}, limit=${limit}`, constants.LOG_TYPES.DEBUG);

  // Determine if pagination should be applied
  const applyPagination = skip !== '' && limit !== '' && skip !== undefined && limit !== undefined;
  const adjustedSkip = applyPagination ? parseInt(skip) || 0 : 0;
  // Maximum limit is 100 as per your original logic
  const adjustedLimit = applyPagination ? Math.min(parseInt(limit) || 10, 100) : Number.MAX_SAFE_INTEGER; 
  
  websocketHandler.sendLog(req, `Pagination: ${applyPagination}, Adjusted skip: ${adjustedSkip}, Adjusted limit: ${adjustedLimit}`, constants.LOG_TYPES.DEBUG);

  // --- PHASE 1: FIND TASK IDs AND COUNT (LIGHTWEIGHT) ---
  const initialPipeline = [
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
    
    // 4. Project only the Task ID
    { $project: { _id: 0, taskId: '$taskDetails._id' } } 
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
  const finalLookupPipeline = [
    // 1. Match only the TaskUser documents for the *limited* set of task IDs
    { $match: { task: { $in: taskIdsToLookup } } },
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    
    // 2. Look up Task Details (must be done again to get full details)
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    { $unwind: '$taskDetails' }, 
    
    // 3. Lookup Task Users/Assignees/Creators (The heavy nested lookups)
    {
      $lookup: {
        from: 'taskusers',
        let: { taskId: '$taskDetails._id' },
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
    
    // 4. Lookup Task Created By User details
    { $lookup: { from: 'users', localField: 'taskDetails.createdBy', foreignField: '_id', as: 'taskCreatedBy' } },
    { $unwind: { path: '$taskCreatedBy', preserveNullAndEmptyArrays: true } },
    
    // 5. Final Projection (Structuring the final output)
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
          parentTask: '$taskDetails.parentTask',
          project: '$taskDetails.project',
          TaskUsers: '$TaskUsers',
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
  // Execute the final query on the limited set
  const finalResult = await TaskUser.aggregate(finalLookupPipeline, { allowDiskUse: true }).exec();

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
  }).where('company').equals(req.cookies.companyId);
  websocketHandler.sendLog(req, `Checked for existing tag, found ${tagExists.length}`, constants.LOG_TYPES.DEBUG);

  if (tagExists.length > 0) {
    websocketHandler.sendLog(req, `Tag ${req.body.title} already exists`, constants.LOG_TYPES.WARN);
    res.status(403).send({
      error: (req.t('task.tagAlreadyExists'), 403)

    });
  } else {
    const newTag = await Tag.create({
      title: req.body.title,
      company: req.cookies.companyId,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
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

  let tagExists = await Tag.find({ "_id": req.body.id }).where('company').equals(req.cookies.companyId);
  websocketHandler.sendLog(req, `Checked for tag existence, found ${tagExists.length}`, constants.LOG_TYPES.DEBUG);

  if (tagExists.length === 0) {
    websocketHandler.sendLog(req, `Tag ${req.body.id} does not exist`, constants.LOG_TYPES.ERROR);
    res.status(403).send({
      error: req.t('task.documentNotFound')

    });
  } else {
    tagExists.title = req.body.title;
    const newTag = await Tag.updateOne({ _id: req.body._id }, { $set: { _id: req.body._id, title: req.body.title } }).exec();
    websocketHandler.sendLog(req, `Updated tag ${req.body.id}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: newTag
    });
  }
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
    const allTags = await Tag.find({ company: req.cookies.companyId }).sort({ title: 1 });
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
  websocketHandler.sendLog(req, `Starting getTags for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  try {
    const tags = await Tag.find({ company: req.cookies.companyId });
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
    const taskTags = await TaskTag.find();
    websocketHandler.sendLog(req, `Retrieved ${taskTags.length} TaskTags`, constants.LOG_TYPES.INFO);
    res.send(taskTags);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching TaskTags: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({ error: 'Server error' });
  }
};

exports.getCommentsByTaskId = async (req, res) => {
  websocketHandler.sendLog(req, `Starting getCommentsByTaskId for task ${req.params.id}`, constants.LOG_TYPES.TRACE);

  Comment.find({ task: req.params.id })
    .sort('commentedAt')
    .populate('author', 'username')
    .populate({
      path: 'parent',
      populate: { path: 'author', select: 'username' }
    })
    .exec((err, comments) => {
      if (err) {
        websocketHandler.sendLog(req, `Error fetching comments: ${err.message}`, constants.LOG_TYPES.ERROR);
        console.log(err);
        return;
      }
      const nestedComments = comments.reduce((acc, comment) => {
        if (!comment.parent) {
          acc.push(comment);
        } else {
          const parent = acc.find(c => c._id.equals(comment.parent._id));
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        }
        return acc;
      }, []);
      websocketHandler.sendLog(req, `Retrieved ${nestedComments.length} top-level comments`, constants.LOG_TYPES.INFO);
      res.send(nestedComments);
    });
};

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
    .where('company').equals(req.cookies.companyId);
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
      const url = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.TaskAttachment, req.body.taskAttachments[i]);
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
        createdBy: req.cookies.userId,
        updatedBy: req.cookies.userId,
        company: req.cookies.companyId,
        url
      });
      websocketHandler.sendLog(req, `Added attachment ${newTaskUserItem._id} to comment ${newComment._id}`, constants.LOG_TYPES.INFO);
    }
  }

  const newTaskUserList = await TaskUser.find({}).where('task').equals(newComment.task);
  const currentTask = await Task.findById(newComment.task);
  if (newTaskUserList) {
    for (let j = 0; j < newTaskUserList.length; j++) {
      const user = await User.findOne({ _id: newTaskUserList[j].user });
      if (user) {
        const taskURL = `${process.env.WEBSITE_DOMAIN}/#/home/edit-task?taskId=${currentTask._id}`;
        if (emailTemplate) {
          const emailTemplateNewUser = emailTemplate.contentData
            .replace("{firstName}", user.firstName)
            .replace("{taskName}", currentTask.taskName)
            .replace("{taskName1}", currentTask.taskName)
            .replace("{date}", formatDateToDDMMYY(new Date()))
            .replace("{company}", req.cookies.companyName)
            .replace("{content}", newComment.content)
            .replace("{author}", user.firstName + " " + user.lastName)
            .replace("taskURL", taskURL)
            .replace("{lastName}", user.lastName);
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
      }
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: newComment
  });
});

exports.getAllTaskTags = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting getAllTaskTags execution', constants.LOG_TYPES.TRACE);

  try {
    const taskTags = await TaskTag.find();
    websocketHandler.sendLog(req, `Retrieved ${taskTags.length} TaskTags`, constants.LOG_TYPES.INFO);
    res.send(taskTags);
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching TaskTags: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).send({ error: 'Server error' });
  }
};

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

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: { data: document }
  });
};


exports.deleteComment = async (req, res) => {
  websocketHandler.sendLog(req, `Starting deleteComment for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name').equals(constants.Email_template_constant.Delete_Comment_Notification)
    .where('company').equals(req.cookies.companyId);
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
              .replace("{firstName}", user.firstName)
              .replace("{taskName}", currentTask.taskName)
              .replace("{date}", formatDateToDDMMYY(new Date()))
              .replace("{company}", req.cookies.companyName)
              .replace("{content}", comment.content)
              .replace("{author}", user.firstName + " " + user.lastName)
              .replace("{taskURL}", taskURL)
              .replace("{lastName}", user.lastName);
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

  let comments = await Comment.find({ task: req.params.id });
  websocketHandler.sendLog(req, `Retrieved ${comments.length} comments for task ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: comments
  });
});

//END Task Tags
