const manualTimeRequest = require("../models/manualTime/manualTimeRequestModel");
const TimeLog = require("../models/timeLog");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError.js");
const { v1: uuidv1 } = require("uuid");
const { Stream } = require("nodemailer/lib/xoauth2");
const sendEmail = require("../utils/email");
const User = require("../models/permissions/userModel");
const Project = require("../models/projectModel");
const Company = require("../models/companyModel");
const Task = require("../models/taskModel");
var moment = require("moment");
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');
const eventNotificationController = require('./eventNotificationController.js');
const eventNotificationType = require('../models/eventNotification/eventNotificationType.js');

exports.addManualTimeRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addManualTimeRequest process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Creating manual time request with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const user = await User.findById(req.body.user);
  if (!user) {
      websocketHandler.sendLog(req, `User not found with ID: ${req.body.user}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.userNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found user: ${user._id}`, constants.LOG_TYPES.DEBUG);

  if (!req.body.date) {
      websocketHandler.sendLog(req, 'Date is missing in request', constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.dateRequired'), 404));
  }
  if (!req.body.fromDate) {
      websocketHandler.sendLog(req, 'FromDate is missing in request', constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.fromDateRequired'), 404));
  }
  if (!req.body.toDate) {
      websocketHandler.sendLog(req, 'ToDate is missing in request', constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.toDateRequired'), 404));
  }

  const manager = await User.findById(req.body.manager);
  if (!manager) {
      websocketHandler.sendLog(req, `Manager not found with ID: ${req.body.manager}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.managerNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found manager: ${manager._id}`, constants.LOG_TYPES.DEBUG);

  const task = await Task.findById(req.body.task);
  if (!task) {
      websocketHandler.sendLog(req, `Task not found with ID: ${req.body.task}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.taskNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found task: ${task._id}`, constants.LOG_TYPES.DEBUG);

  const project = await Project.findById(req.body.project);
  if (!project) {
      websocketHandler.sendLog(req, `Project not found with ID: ${req.body.project}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.projectRequired'), 404));
  }
  websocketHandler.sendLog(req, `Found project: ${project._id}`, constants.LOG_TYPES.DEBUG);

  const fromDate = new Date(req.body.fromDate);
  const toDate = new Date(req.body.toDate);

  if (fromDate >= toDate) {
      websocketHandler.sendLog(req, `Invalid date range: fromDate ${fromDate} >= toDate ${toDate}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.invalidDateRange'), 400));
  }

  const overlappingRequest = await manualTimeRequest.findOne({
      user: req.body.user,
      $or: [
          { fromDate: { $lt: toDate }, toDate: { $gt: fromDate } },
          { fromDate: { $gte: fromDate, $lt: toDate } },
          { toDate: { $gt: fromDate, $lte: toDate } }
      ]
  });
  if (overlappingRequest) {
      websocketHandler.sendLog(req, `Found overlapping request with ID: ${overlappingRequest._id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.timeEntryOverlap'), 400));
  }

  var mtRequest = await manualTimeRequest.create({
      user: req.body.user,
      date: req.body.date,
      company: req.cookies.companyId,
      project: req.body.project,
      manager: req.body.manager,
      task: req.body.task,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      status: "pending",
      reason: req.body.reason,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now()),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
  });
  websocketHandler.sendLog(req, `Created manual time request with ID: ${mtRequest._id}`, constants.LOG_TYPES.INFO);

  const requestApprovalLink = `${process.env.WEBSITE_DOMAIN}/ManualTimeRequestApproval`;
  const managerName = `${manager.firstName} ${manager.lastName}`;
  const userName = `${user.firstName} ${user.lastName}`;
  const emailSubject = `Manual Time Request By ${userName}`;
  const emailMessage = `Hi ${managerName}, \n ${userName} has requested you to approve a manual time request.\n Please click the following link to approve or reject this request.\n ${requestApprovalLink} \nThank you `;

  if (mtRequest) {
      await sendEmail({
          email: manager.email,
          subject: emailSubject,
          message: emailMessage,
      });
      websocketHandler.sendLog(req, `Sent approval email to manager: ${manager.email}`, constants.LOG_TYPES.DEBUG);
  }

    // Fetch the notification type once
    const notificationType = await eventNotificationType.findOne({ name: 'manual_time', company: req.cookies.companyId  });
    if (!notificationType) { 
        websocketHandler.sendLog(req, 'Notification type "manual_time" not found', constants.LOG_TYPES.WARN); 
    }

    if (req.body.user) {
        try {
        const notificationBody = {
            name: req.t('manualTime.addManualTimenotificationTitle'),
            description: req.t('manualTime.addManualTimenotificationMessage', { userName: userName }),
            eventNotificationType: notificationType?._id?.toString() || null,
            date: new Date(), 
            navigationUrl: `${requestApprovalLink}`,
            isRecurring: false, 
            recurringFrequency: null, 
            leadTime: 0, 
            status: 'unread' 
        };

        // Simulate the req object for addNotificationForUser
        const notificationReq = {
            ...req,
            body: notificationBody,
            cookies: {
            ...req.cookies,
            userId: manager?._id?.toString() // Set the userId to the assigned user
            }
        };

        //Fire and forget
        (async () => {
            try {
            await eventNotificationController.addNotificationForUser(notificationReq, {}, () => {});
            } catch (err) {
            console.error('Error calling addNotificationForUser:', err.message);
            }
        })();
        } catch (error) {
        websocketHandler.sendLog(req, `Failed to create event notification for task`, constants.LOG_TYPES.ERROR);
        // Don't fail the task creation if notification fails
        }
    }


  websocketHandler.sendLog(req, 'Completed addManualTimeRequest process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: mtRequest,
  });
});

exports.updateManualTimeRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateManualTimeRequest process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating manual time request with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const user = await User.findById(req.body.user);
  if (!user) {
      websocketHandler.sendLog(req, `User not found with ID: ${req.body.user}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.userNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found user: ${user._id}`, constants.LOG_TYPES.DEBUG);

  if (!req.body.date) {
      websocketHandler.sendLog(req, 'Date is missing in request', constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.dateRequired'), 404));
  }

  const manager = await User.findById(req.body.manager);
  if (!manager) {
      websocketHandler.sendLog(req, `Manager not found with ID: ${req.body.manager}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.managerNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found manager: ${manager._id}`, constants.LOG_TYPES.DEBUG);

  const project = await Project.findById(req.body.project);
  if (!project) {
      websocketHandler.sendLog(req, `Project not found with ID: ${req.body.project}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.projectRequired'), 404));
  }
  websocketHandler.sendLog(req, `Found project: ${project._id}`, constants.LOG_TYPES.DEBUG);

  req.body.id = req.body.requestId;
  const updatemanualTimeRequest = await manualTimeRequest.findByIdAndUpdate(
      req.body.id,
      req.body,
      {
          new: false,
          runValidators: true,
      }
  );
  
  if (updatemanualTimeRequest) {
      websocketHandler.sendLog(req, `Updated manual time request ID: ${req.body.id}`, constants.LOG_TYPES.INFO);
      if (req.body.status === "approved") {
          let startTime = moment(req.body.fromDate).toDate();
          const endTime = moment(req.body.toDate).toDate();
          let recordCount = 0;
          while (startTime < endTime) {
              var newLog = {
                  user: updatemanualTimeRequest.user,
                  task: updatemanualTimeRequest.task,
                  project: updatemanualTimeRequest.project,
                  date: req.body.fromDate,
                  startTime: startTime,
                  endTime: moment(startTime).add(10, "m").toDate(),
                  keysPressed: 0,
                  clicks: 0,
                  scrolls: 0,
                  filePath: "",
                  isManualTime: true,
              };
              let logItem = await TimeLog.create(newLog);
              recordCount++;
              startTime = moment(startTime).add(10, "m").toDate();
          }
          websocketHandler.sendLog(req, `Created ${recordCount} time log entries for approved request`, constants.LOG_TYPES.DEBUG);


          // Fetch the notification type once
        const notificationType = await eventNotificationType.findOne({ name: 'manual_time', company: req.cookies.companyId });
        if (!notificationType) { 
            websocketHandler.sendLog(req, 'Notification type "manual_time" not found', constants.LOG_TYPES.WARN); 
        }

        if (user) {
            try {
            const notificationBody = {
                name: req.t('manualTime.updateManualTimenotificationTitle'),
                description: req.t('manualTime.updateManualTimenotificationMessage'),
                eventNotificationType: notificationType?._id?.toString() || null,
                date: new Date(), 
                navigationUrl: ``,
                isRecurring: false, 
                recurringFrequency: null, 
                leadTime: 0, 
                status: 'unread' 
            };

            // Simulate the req object for addNotificationForUser
            const notificationReq = {
                ...req,
                body: notificationBody,
                cookies: {
                ...req.cookies,
                userId: user?._id?.toString() // Set the userId to the assigned user
                }
            };

            //Fire and forget
            (async () => {
                try {
                await eventNotificationController.addNotificationForUser(notificationReq, {}, () => {});
                } catch (err) {
                console.error('Error calling addNotificationForUser:', err.message);
                }
            })();
            } catch (error) {
            websocketHandler.sendLog(req, `Failed to create event notification for task`, constants.LOG_TYPES.ERROR);
            // Don't fail the task creation if notification fails
            }
        }

      }
  } else {
      websocketHandler.sendLog(req, `No manual time request found with ID: ${req.body.id}`, constants.LOG_TYPES.WARN);
  }

  websocketHandler.sendLog(req, 'Completed updateManualTimeRequest process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: updatemanualTimeRequest,
      log: result, // Note: 'result' is not defined in the original code; this might be a bug
  });
});

exports.getManualTimeRequestsByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getManualTimeRequestsByUser process', constants.LOG_TYPES.INFO);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { user: req.params.id };
  websocketHandler.sendLog(req, `Fetching requests for user ${req.params.id} with skip: ${skip}, limit: ${limit}`, constants.LOG_TYPES.TRACE);

  const totalCount = await manualTimeRequest.countDocuments(query);
  websocketHandler.sendLog(req, `Total manual time requests found: ${totalCount}`, constants.LOG_TYPES.DEBUG);

  const manualTimeRequests = await manualTimeRequest
      .find({})
      .where("user")
      .equals(req.params.id)
      .skip(skip)
      .limit(limit);
  websocketHandler.sendLog(req, `Fetched ${manualTimeRequests.length} manual time requests`, constants.LOG_TYPES.DEBUG);

  for (let i = 0; i < manualTimeRequests.length; i++) {
      websocketHandler.sendLog(req, `Processing request ${i + 1} of ${manualTimeRequests.length}`, constants.LOG_TYPES.TRACE);
      
      manualTimeRequests[i].project = await Project.findById(manualTimeRequests[i].project);
      websocketHandler.sendLog(req, `Loaded project ${manualTimeRequests[i].project?._id} for request ${manualTimeRequests[i]._id}`, constants.LOG_TYPES.TRACE);

      manualTimeRequests[i].manager = await User.findById(manualTimeRequests[i].manager);
      websocketHandler.sendLog(req, `Loaded manager ${manualTimeRequests[i].manager?._id} for request ${manualTimeRequests[i]._id}`, constants.LOG_TYPES.TRACE);

      manualTimeRequests[i].task = await Task.findById(manualTimeRequests[i].task);
      websocketHandler.sendLog(req, `Loaded task ${manualTimeRequests[i].task?._id} for request ${manualTimeRequests[i]._id}`, constants.LOG_TYPES.TRACE);
  }

  websocketHandler.sendLog(req, 'Completed getManualTimeRequestsByUser process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: manualTimeRequests,
      total: totalCount,
  });
});

exports.deleteManualTimeRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteManualTimeRequest process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete manual time request with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const result = await manualTimeRequest.findByIdAndDelete(req.params.id);
  if (!result) {
      websocketHandler.sendLog(req, `No manual time request found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('manualTime.manualTimeRequestNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted manual time request ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      body: result,
  });
});

exports.getManualTimeRequestsForApprovalByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getManualTimeRequestsForApprovalByUser process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching approval requests for manager ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const manualTimeRequests = await manualTimeRequest
      .find({})
      .where("manager")
      .equals(req.params.id)
      .populate("user");
  websocketHandler.sendLog(req, `Found ${manualTimeRequests.length} requests for approval`, constants.LOG_TYPES.DEBUG);

  for (let i = 0; i < manualTimeRequests.length; i++) {
      manualTimeRequests[i].project = await Project.findById(manualTimeRequests[i].project);
      websocketHandler.sendLog(req, `Loaded project ${manualTimeRequests[i].project?._id} for request ${manualTimeRequests[i]._id}`, constants.LOG_TYPES.TRACE);
  }

  websocketHandler.sendLog(req, 'Completed getManualTimeRequestsForApprovalByUser process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: manualTimeRequests,
  });
});

exports.getManualTimeApprovedRequests = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getManualTimeApprovedRequests process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching approved requests for user ${req.params.userId}, project ${req.params.projectId}, manager ${req.params.managerId}`, constants.LOG_TYPES.TRACE);

  const approvedRequests = await manualTimeRequest.find({
      user: req.params.userId,
      project: req.params.projectId,
      manager: req.params.managerId,
      status: "approved",
  });
  websocketHandler.sendLog(req, `Found ${approvedRequests.length} approved requests`, constants.LOG_TYPES.DEBUG);

  websocketHandler.sendLog(req, 'Completed getManualTimeApprovedRequests process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: approvedRequests,
  });
});
