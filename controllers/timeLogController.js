const TimeLog = require('../models/timeLog');
const TimeLogCheckInOut = require('../models/timeLogCheckInOut');
const CurrentUserDevice = require('../models/currentUserDeviceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const { Stream } = require('nodemailer/lib/xoauth2');
var moment = require('moment');
const constants = require('../constants');
const StorageController = require('./storageController.js');
const userSubordinate = require('../models/userSubordinateModel');
const mongoose = require('mongoose');
const websocketHandler = require('../utils/websocketHandler');
const UserDevice = require('../models/commons/userDeviceModel.js');
const User = require('../models/permissions/userModel');
// const eventNotificationController = require('./eventNotificationController.js');
// const eventNotificationType = require('../models/eventNotification/eventNotificationType.js');
const { SendUINotification } = require('../utils/uiNotificationSender');
const UserPreference = require('../models/userPreferences/userPreferenceModel.js');

exports.addLog = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addLog operation', constants.LOG_TYPES.TRACE);

  const userId = req.cookies.userId || req.user?._id;
  const companyId = req.cookies.companyId || req.user?.company?.id || req.user?.company;

  websocketHandler.sendLog(req, `Checking active device for user ${userId}`, constants.LOG_TYPES.DEBUG);
  const currentUserActive = await CurrentUserDevice.findOne({})
    .where('userId').equals(userId)
    .where('companyId').equals(companyId);

  if (currentUserActive) {
    websocketHandler.sendLog(req, `Found active device: ${currentUserActive.machineId}`, constants.LOG_TYPES.DEBUG);
    if (req.body.machineId !== currentUserActive.machineId) {
      if (req.body.makeThisDeviceActive === true) {
        websocketHandler.sendLog(req, `Updating device to ${req.body.machineId}`, constants.LOG_TYPES.INFO);
        currentUserActive.machineId = req.body.machineId;
        await currentUserActive.save();
        websocketHandler.sendLog(req, 'Device updated successfully', constants.LOG_TYPES.INFO);
      } else {
        websocketHandler.sendLog(req, 'Device mismatch detected, prompting user', constants.LOG_TYPES.WARN);
        return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: {
            MakeThisDeviceActive: false,
            message: req.t('timeLog.deviceMismatch')
          }
        });
      }
    }
  } else {
    websocketHandler.sendLog(req, 'No active device found, creating new', constants.LOG_TYPES.DEBUG);
    const newCurrentUserDevice = await CurrentUserDevice.create({
      machineId: req.body.machineId,
      company: companyId,
      status: "Active",
      createdOn: new Date(),
      userId: userId
    });
    websocketHandler.sendLog(req, `Created new device with ID ${newCurrentUserDevice._id}`, constants.LOG_TYPES.INFO);
  }

  if (!req.body.document) {
    websocketHandler.sendLog(req, 'No document provided, initializing empty array', constants.LOG_TYPES.DEBUG);
    req.body.document = [];
  }

  websocketHandler.sendLog(req, 'Adding document to request body', constants.LOG_TYPES.DEBUG);
  req.body.document.push({
    filePath: req.body.filePath,
    file: req.body.fileString,
  });

  websocketHandler.sendLog(req, 'Uploading document to storage', constants.LOG_TYPES.TRACE);
  const url = await StorageController.createContainerInContainer(companyId, constants.SubContainers.Timelog, req.body.document[0]);
  websocketHandler.sendLog(req, `Document uploaded with URL: ${url}`, constants.LOG_TYPES.INFO);

  websocketHandler.sendLog(req, 'Creating new time log', constants.LOG_TYPES.TRACE);

  //Need to add check for weekly and monthly time limit
  const MINUTES_PER_LOG = 10;
  // Step 1: Calculate week range (Monday to Sunday)
  const today = new Date();
  const day = today.getUTCDay(); // Sunday = 0
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + mondayOffset));
  const endOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + (7 - day)));

  // Step 2: Calculate month range (1st to last date)
  const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));

  // Step 3: Get total logs in current week & month
  const [weekLogs, monthLogs] = await Promise.all([
    TimeLog.find({ user: userId, date: { $gte: startOfWeek, $lte: endOfWeek } }),
    TimeLog.find({ user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } })
  ]);

  // Convert to total hours
  const totalWeekHours = (weekLogs.length * MINUTES_PER_LOG);
  const totalMonthHours = (monthLogs.length * MINUTES_PER_LOG);

  // Step 4: Get user limits (in hours)
  const preferences = await UserPreference.find({ userId: userId }).populate('preferenceOptionId');
  const weeklyLimitPref = preferences?.find(p => p.preferenceOptionId.preferenceKey === 'Tracker.WeeklyHoursLimit_explicit');
  const monthlyLimitPref = preferences?.find(p => p.preferenceOptionId.preferenceKey === 'Tracker.MonthlyHoursLimit_explicit');
  const weeklyLimit = weeklyLimitPref ? parseFloat(weeklyLimitPref.preferenceOptionId.preferenceValue) * 60 : 0;
  const monthlyLimit = monthlyLimitPref ? parseFloat(monthlyLimitPref.preferenceOptionId.preferenceValue) * 60 : 0;

  // Perform weekly check only if weeklyLimit is a positive number
  if (weeklyLimit && weeklyLimit > 0 && totalWeekHours >= weeklyLimit) {
    websocketHandler.sendLog(req, 'Weekly time limit exceeded', constants.LOG_TYPES.WARN);
    return res.status(406).json({
      status: constants.APIResponseStatus.Info,
      message: req.t('timeLog.weeklyLimitExceeded'),
      statusCode: 406
    });
  }

  // Perform monthly check only if monthlyLimit is a positive number
  if (monthlyLimit && monthlyLimit > 0 && totalMonthHours >= monthlyLimit) {
    websocketHandler.sendLog(req, 'Monthly time limit exceeded', constants.LOG_TYPES.WARN);
    return res.status(406).json({
      status: constants.APIResponseStatus.Info,
      message: req.t('timeLog.monthlyLimitExceeded'),
      data: {},
      statusCode: 406
    });
  }
  const newTimeLog = await TimeLog.create({
    user: req.body.user,
    task: req.body.task,
    project: req.body.project,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    filePath: req.body.filePath,
    keysPressed: req.body.keysPressed,
    allKeysPressed: req.body.allKeysPressed,
    clicks: req.body.clicks,
    scrolls: req.body.scrolls,
    url: url,
    isManualTime: false
  });
  websocketHandler.sendLog(req, `Time log created with ID ${newTimeLog._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { timeLog: newTimeLog }
  });
});

exports.getTimeLogs = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTimeLogs operation', constants.LOG_TYPES.TRACE);

  const tomorrow = new Date(new Date(req.body.date).setDate(new Date(req.body.date).getDate() + 1));
  websocketHandler.sendLog(req, `Fetching logs for user ${req.body.user} from ${req.body.date} to ${tomorrow}`, constants.LOG_TYPES.DEBUG);

  const timeLogs = await TimeLog.find({
    "user": req.body.user,
    "date": { "$gte": req.body.date, "$lte": tomorrow }
  });
  websocketHandler.sendLog(req, `Found ${timeLogs.length} time logs`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: timeLogs
  });
});

exports.getLogInUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLogInUser operation', constants.LOG_TYPES.TRACE);

  const teamIdsArray = [];
  const userId = req.cookies.userId || req.user?._id;
  const companyId = req.cookies.companyId || req.user?.company?.id || req.user?.company;
  websocketHandler.sendLog(req, `Fetching subordinates for user ${userId}`, constants.LOG_TYPES.DEBUG);

  const ids = await userSubordinate.find({})
    .distinct('subordinateUserId')
    .where('userId')
    .equals(userId);


  if (ids.length > 0) {
    teamIdsArray.push(...ids);
    websocketHandler.sendLog(req, `Found ${ids.length} subordinates`, constants.LOG_TYPES.DEBUG);
  }
  teamIdsArray.push(userId);

  websocketHandler.sendLog(req, `Team IDs: ${teamIdsArray}`, constants.LOG_TYPES.DEBUG);

  const timeLogsAll = [];
  const realtime = [];
  const logs = {};

  const requestedUsers = req.body.users && req.body.users !== ''
    ? (Array.isArray(req.body.users) ? req.body.users : req.body.users.split(',')).filter(u => u && u !== '')
    : teamIdsArray;
  websocketHandler.sendLog(req, `Requested users: ${requestedUsers}`, constants.LOG_TYPES.DEBUG);

  const isValidObjectId = (id) => id && id !== '' && mongoose.Types.ObjectId.isValid(id);
  const requestedProjects = req.body.projects && req.body.projects !== ''
    ? (Array.isArray(req.body.projects) ? req.body.projects : req.body.projects.split(',')).filter(isValidObjectId)
    : null;
  const requestedTasks = req.body.tasks && req.body.tasks !== ''
    ? (Array.isArray(req.body.tasks) ? req.body.tasks : req.body.tasks.split(',')).filter(isValidObjectId)
    : null;

  const userFilter = requestedUsers.length > 0
    ? teamIdsArray.filter(id => requestedUsers.includes(id.toString()))
    : teamIdsArray;

  // Fetch current device status for all team members
  const allDevices = await UserDevice.find({
    userId: { $in: teamIdsArray.map(id => id.toString()) },
    company: companyId
  })
    .populate('project', 'projectName')
    .populate('task', 'taskName');

  const deviceMap = new Map(allDevices.map(d => [d.userId, d]));

  // Fetch all relevant user details at once
  const users = await User.find({ _id: { $in: teamIdsArray } }).select('firstName lastName');
  const userMap = new Map(users.map(user => [user._id.toString(), user]));

  // Format the results for ALL team members
  for (const userId of teamIdsArray) {
    const userIdStr = userId.toString();
    const userData = userMap.get(userIdStr);
    const device = deviceMap.get(userIdStr);

    // Apply filters if provided
    if (requestedProjects && device?.project?._id && !requestedProjects.includes(device.project._id.toString())) continue;
    if (requestedTasks && device?.task?._id && !requestedTasks.includes(device.task._id.toString())) continue;
    if (requestedUsers && !requestedUsers.includes(userIdStr)) continue;

    const newLogInUser = {
      user: {
        _id: userIdStr,
        firstName: userData?.firstName || 'N/A',
        lastName: userData?.lastName || 'N/A',
        id: userIdStr
      },
      project: device?.project?.projectName || 'N/A',
      task: device?.task?.taskName || 'N/A',
      isOnline: device?.isOnline || false
    };

    timeLogsAll.push(newLogInUser);
  }

  logs.onlineUsers = timeLogsAll;
  logs.totalMember = teamIdsArray.length;
  logs.activeMember = timeLogsAll.filter(u => u.isOnline).length;
  logs.totalNonProductiveMember = logs.totalMember - logs.activeMember;
  realtime.push(logs);

  websocketHandler.sendLog(req, 'Completed getLogInUser operation', constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: realtime
  });
});

exports.getLogInUser1 = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLogInUser operation', constants.LOG_TYPES.TRACE);

  const teamIdsArray = [];
  const userId = req.cookies.userId || req.user._id;
  websocketHandler.sendLog(req, `Fetching subordinates for user ${userId}`, constants.LOG_TYPES.DEBUG);

  const ids = await userSubordinate.find({})
    .distinct('subordinateUserId')
    .where('userId')
    .equals(userId);


  if (ids.length > 0) {
    teamIdsArray.push(...ids);
    websocketHandler.sendLog(req, `Found ${ids.length} subordinates`, constants.LOG_TYPES.DEBUG);
  }
  teamIdsArray.push(userId);

  websocketHandler.sendLog(req, `Team IDs: ${teamIdsArray}`, constants.LOG_TYPES.DEBUG);

  const timeLogsAll = [];
  const realtime = [];
  const logs = {};
  const today = moment().endOf('day');
  const date = today.toDate().toISOString().slice(0, 10);
  const tomorrow = new Date(new Date(date).setDate(new Date(date).getDate() - 7));
  const end = new Date(new Date(date).setDate(new Date(date).getDate() + 1));

  const requestedUsers = req.body.users && req.body.users !== ''
    ? (Array.isArray(req.body.users) ? req.body.users : req.body.users.split(',')).filter(u => u && u !== '')
    : teamIdsArray;
  websocketHandler.sendLog(req, `Requested users: ${requestedUsers}`, constants.LOG_TYPES.DEBUG);

  const isValidObjectId = (id) => id && id !== '' && mongoose.Types.ObjectId.isValid(id);
  const requestedProjects = req.body.projects && req.body.projects !== ''
    ? (Array.isArray(req.body.projects) ? req.body.projects : req.body.projects.split(',')).filter(isValidObjectId)
    : null;
  const requestedTasks = req.body.tasks && req.body.tasks !== ''
    ? (Array.isArray(req.body.tasks) ? req.body.tasks : req.body.tasks.split(',')).filter(isValidObjectId)
    : null;

  const userFilter = requestedUsers.length > 0
    ? teamIdsArray.filter(id => requestedUsers.includes(id.toString()))
    : teamIdsArray;

  const query = { 'user': { $in: userFilter.map(id => id.toString()) }, 'date': { '$gte': tomorrow, '$lte': end } };
  if (requestedProjects && requestedProjects.length > 0) query.project = { $in: requestedProjects };
  if (requestedTasks && requestedTasks.length > 0) query.task = { $in: requestedTasks };
  websocketHandler.sendLog(req, `Query: ${JSON.stringify(query)}`, constants.LOG_TYPES.DEBUG);

  const currentDate = new Date();
  const timeLogs = await TimeLog.find({
    ...query,
    date: {
      $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      $lte: new Date(currentDate.setHours(23, 59, 59, 999))
    }
  }).distinct('user');
  websocketHandler.sendLog(req, `Found ${timeLogs.length} unique users with logs`, constants.LOG_TYPES.INFO);

  for (let i = 0; i < timeLogs.length; i++) {
    websocketHandler.sendLog(req, `Processing log for user ${timeLogs[i]}`, constants.LOG_TYPES.TRACE);
    const timeLog = await TimeLog.findOne({
      'user': timeLogs[i],
      'date': { '$gte': tomorrow, '$lte': end }
    });

    if (timeLog) {
      const newLogInUser = {
        user: {
          _id: timeLog.user._id,
          firstName: timeLog.user?.firstName || 'N/A',
          lastName: timeLog.user?.lastName || 'N/A',
          id: timeLog.user?._id || 'N/A'
        },
        project: timeLog.project?.projectName || 'N/A',
        task: timeLog.task?.taskName || 'N/A'
      };
      timeLogsAll.push(newLogInUser);
      websocketHandler.sendLog(req, `Added log for user ${timeLogs[i]}`, constants.LOG_TYPES.DEBUG);
    }
  }

  logs.onlineUsers = timeLogsAll;
  logs.totalMember = teamIdsArray.length;
  logs.activeMember = timeLogsAll.length;
  logs.totalNonProductiveMember = 0;
  realtime.push(logs);

  websocketHandler.sendLog(req, 'Completed getLogInUser operation', constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: realtime
  });
});


exports.getCurrentWeekTotalTime = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getCurrentWeekTotalTime operation', constants.LOG_TYPES.TRACE);

  // Validate inputs
  if (!req.body.user || !req.body.startDate || !req.body.endDate) {
    websocketHandler.sendLog(req, 'Missing required fields: user, startDate, or endDate', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Error,
      message: 'Missing required fields: user, startDate, endDate'
    });
  }

  // Validate user ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    websocketHandler.sendLog(req, `Invalid user ObjectId: ${req.body.user}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Error,
      message: 'Invalid user ID'
    });
  }

  // Parse dates
  let startDate, endDate;
  try {
    startDate = new Date(req.body.startDate);
    endDate = new Date(req.body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Ensure dates are at start/end of day for inclusive range
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } catch (error) {
    websocketHandler.sendLog(req, `Invalid date format: startDate=${req.body.startDate}, endDate=${req.body.endDate}`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Error,
      message: 'Invalid date format for startDate or endDate'
    });
  }

  websocketHandler.sendLog(req, `Fetching logs for user ${req.body.user} from ${startDate.toISOString()} to ${endDate.toISOString()}`, constants.LOG_TYPES.DEBUG);

  const timeLogs = await TimeLog.find({
    user: req.body.user,
    date: { $gte: startDate, $lte: endDate }
  });

  websocketHandler.sendLog(req, `Found ${timeLogs.length} time logs`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    length: timeLogs.length,
    data: timeLogs
  });
});


exports.getLog = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLog operation', constants.LOG_TYPES.TRACE);
  websocketHandler.sendLog(req, 'Returning static response', constants.LOG_TYPES.DEBUG);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { timeLog: "he" }
  });
});

exports.getLogsWithImages = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLogsWithImages operation', constants.LOG_TYPES.TRACE);

  const givenDate = new Date(req.body.date);
  const startDate = new Date(givenDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(givenDate);
  endDate.setHours(23, 59, 59, 999);
  const tomorrow = new Date(givenDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  websocketHandler.sendLog(req, `Fetching logs for user ${req.body.user} on ${req.body.date}`, constants.LOG_TYPES.DEBUG);
  const timeLogs = await TimeLog.find({
    "user": req.body.user,
    "$and": [
      { "date": { "$gte": startDate } },
      { "date": { "$lt": tomorrow } }
    ]
  });

  websocketHandler.sendLog(req, `Found ${timeLogs.length} time logs with images`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: timeLogs
  });
});

exports.deleteLogTillDate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteLogTillDate operation', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Finding logs before ${req.body.tillDate}`, constants.LOG_TYPES.DEBUG);
  const timeLogsExists = await TimeLog.find({ date: { $lt: new Date(req.body.tillDate) } });

  if (timeLogsExists && timeLogsExists.length > 0) {
    websocketHandler.sendLog(req, `Deleting ${timeLogsExists.length} logs`, constants.LOG_TYPES.INFO);
    for (let i = 0; i < timeLogsExists.length; i++) {
      if (timeLogsExists[i].url) {
        websocketHandler.sendLog(req, `Deleting file ${timeLogsExists[i].url}`, constants.LOG_TYPES.DEBUG);
        await StorageController.deleteBlobFromContainer(req.cookies.companyId, timeLogsExists[i].url);
      }
      const document = await TimeLog.findByIdAndDelete(timeLogsExists[i]._id);
      if (!document) {
        websocketHandler.sendLog(req, `No document found with ID ${timeLogsExists[i]._id}`, constants.LOG_TYPES.WARN);
      }
    }
    websocketHandler.sendLog(req, 'All logs deleted successfully', constants.LOG_TYPES.INFO);
  } else {
    websocketHandler.sendLog(req, 'No logs found to delete', constants.LOG_TYPES.DEBUG);
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.deleteLog = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteLog operation', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Processing ${req.body.logs.length} logs for deletion`, constants.LOG_TYPES.DEBUG);


  for (let i = 0; i < req.body.logs.length; i++) {
    const timeLogsExists = await TimeLog.findById(req.body.logs[i].logId);
    if (timeLogsExists) {
      const userId = timeLogsExists.user?._id || timeLogsExists.user;
      const companyId = timeLogsExists.user?.company?._id || timeLogsExists.user?.company || req.cookies.companyId;

      if (timeLogsExists.url) {
        websocketHandler.sendLog(req, `Deleting file ${timeLogsExists.url}`, constants.LOG_TYPES.DEBUG);
        await StorageController.deleteBlobFromContainer(req.cookies.companyId, timeLogsExists.url);
      }
      const document = await TimeLog.findByIdAndDelete(req.body.logs[i].logId);
      if (!document) {
        websocketHandler.sendLog(req, `No document found with ID ${req.body.logs[i].logId}`, constants.LOG_TYPES.WARN);
      } else {
        websocketHandler.sendLog(req, `Deleted log ${req.body.logs[i].logId}`, constants.LOG_TYPES.INFO);

        SendUINotification(req.t('timeLog.timeLogNotificationTitle'), req.t('timeLog.timeLogNotificationMessage'),
          constants.Event_Notification_Type_Status.timelog_delete, userId?.toString(), companyId, req);
      }
    } else {
      websocketHandler.sendLog(req, `No document found with ID ${req.body.logs[i].logId}`, constants.LOG_TYPES.WARN);
    }
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.addManualTime = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addManualTime operation', constants.LOG_TYPES.TRACE);

  let startTime = moment(req.body.startTime).toDate();
  const endTime = moment(req.body.endTime).toDate();
  let recordCount = 0;
  let result = [];

  websocketHandler.sendLog(req, `Creating manual logs from ${startTime} to ${endTime}`, constants.LOG_TYPES.DEBUG);
  while (startTime < endTime) {
    const newLog = {
      user: req.body.user,
      task: req.body.task,
      project: req.body.projectId,
      date: req.body.date,
      startTime: startTime,
      endTime: moment(startTime).add(10, 'm').toDate(),
      keysPressed: 0,
      clicks: 0,
      scrolls: 0,
      filePath: "",
      isManualTime: true
    };
    const logItem = await TimeLog.create(newLog);
    result.push(logItem);
    recordCount++;
    startTime = moment(startTime).add(10, 'm').toDate();
    websocketHandler.sendLog(req, `Created manual log ${logItem._id}`, constants.LOG_TYPES.DEBUG);
  }

  websocketHandler.sendLog(req, `Created ${recordCount} manual time logs`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { timeLog: result }
  });
});

exports.getTimesheet = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTimesheet operation', constants.LOG_TYPES.TRACE);

  const userId = req.body.userId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  websocketHandler.sendLog(req, `Fetching timesheet for user ${userId} from ${startDate} to ${endDate}`, constants.LOG_TYPES.DEBUG);

  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: { project: '$project', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
      }
    },
    {
      $group: {
        _id: '$_id.project',
        timeSpent: { $push: { date: '$_id.date', timeSpent: '$timeSpent' } }
      }
    },
    { $sort: { _id: 1 } }
  ];

  try {
    websocketHandler.sendLog(req, 'Executing aggregation pipeline', constants.LOG_TYPES.TRACE);
    const results = await TimeLog.aggregate(pipeline);
    websocketHandler.sendLog(req, `Aggregation returned ${results.length} results`, constants.LOG_TYPES.DEBUG);

    const dates = getDatesInRange(startDate, endDate);
    const matrix = results.map(result => {
      const row = [result._id];
      dates.forEach(date => {
        const timeSpent = result.timeSpent.find(t => t.date === date);
        row.push(timeSpent ? timeSpent.timeSpent : 0);
      });
      return row;
    });
    const columns = ['Project', ...dates];

    websocketHandler.sendLog(req, 'Timesheet generated successfully', constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: { matrix, columns }
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error in timesheet generation: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      error: req.t('timeLog.serverError')
    });
  }
});

exports.getTimesheetByUserIds = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTimesheetByUserIds operation', constants.LOG_TYPES.TRACE);

  const userIds = req.body.userIds.split(',');
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const startDateISO = startDate.toISOString().split('T')[0];
  const endDateISO = endDate.toISOString().split('T')[0];
  websocketHandler.sendLog(req, `Fetching timesheet for users ${userIds} from ${startDateISO} to ${endDateISO}`, constants.LOG_TYPES.DEBUG);

  const pipeline = [
    {
      $match: {
        user: { $in: userIds.map(id => mongoose.Types.ObjectId(id)) },
        date: { $gte: new Date(startDateISO), $lte: new Date(endDateISO) }
      }
    },
    {
      $group: {
        _id: { user: '$user', project: '$project', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
      }
    },
    {
      $group: {
        _id: { user: '$_id.user', project: '$_id.project' },
        timeSpent: { $push: { date: '$_id.date', timeSpent: '$timeSpent' } }
      }
    },
    { $sort: { '_id.user': 1, '_id.project': 1 } }
  ];

  try {
    websocketHandler.sendLog(req, 'Executing aggregation pipeline', constants.LOG_TYPES.TRACE);
    const results = await TimeLog.aggregate(pipeline);
    websocketHandler.sendLog(req, `Aggregation returned ${results.length} results`, constants.LOG_TYPES.DEBUG);

    const dates = getDatesInRange(startDateISO, endDateISO);
    const matrix = {};
    userIds.forEach(userId => {
      matrix[userId] = results
        .filter(result => result._id.user.toString() === userId)
        .map(result => {
          const row = [result._id.project];
          dates.forEach(date => {
            const timeSpent = result.timeSpent.find(t => t.date === date);
            row.push(timeSpent ? timeSpent.timeSpent : 0);
          });
          return row;
        });
    });
    const columns = ['User', 'Project', ...dates];

    websocketHandler.sendLog(req, 'Timesheet by user IDs generated successfully', constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: { matrix, columns }
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error in timesheet generation: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      error: req.t('timeLog.serverError')
    });
  }
});

exports.userCheckIn = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting userCheckIn operation', constants.LOG_TYPES.TRACE);

  try {
    const { userId, latitude, longitude, checkInTime, project, task } = req.body;
    websocketHandler.sendLog(req, `Processing check-in for user ${userId}`, constants.LOG_TYPES.DEBUG);

    if (!userId) {
      websocketHandler.sendLog(req, 'Missing user ID', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.userIdRequired')

      });
    }
    if (!latitude || !longitude) {
      websocketHandler.sendLog(req, 'Missing coordinates', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.coordinatesRequired')

      });
    }
    if (!checkInTime) {
      websocketHandler.sendLog(req, 'Missing check-in time', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.checkInTimeRequired')

      });
    }
    if (!project || !task) {
      websocketHandler.sendLog(req, 'Missing project or task', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.projectTaskRequired')

      });
    }

    const checkIn = new TimeLogCheckInOut({
      user: userId,
      checkInTime,
      latitude,
      longitude,
      project,
      task,
      date: new Date(checkInTime).toISOString().split('T')[0]
    });

    websocketHandler.sendLog(req, 'Saving check-in record', constants.LOG_TYPES.TRACE);
    await checkIn.save();
    websocketHandler.sendLog(req, `Check-in saved with ID ${checkIn._id}`, constants.LOG_TYPES.INFO);

    res.status(200).json({ message: req.t('CheckedInSuccessfully'), data: checkIn });
  } catch (error) {
    websocketHandler.sendLog(req, `Check-in failed: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: error.message });
  }
});

exports.userCheckOut = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting userCheckOut operation', constants.LOG_TYPES.TRACE);

  try {
    const { userId, latitude, longitude, checkOutTime, project, task } = req.body;
    websocketHandler.sendLog(req, `Processing check-out for user ${userId}`, constants.LOG_TYPES.DEBUG);

    if (!userId) {
      websocketHandler.sendLog(req, 'Missing user ID', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.userIdRequired')

      });
    }
    if (!latitude || !longitude) {
      websocketHandler.sendLog(req, 'Missing coordinates', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.coordinatesRequired')

      });
    }
    if (!checkOutTime) {
      websocketHandler.sendLog(req, 'Missing check-out time', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.checkOutTimeRequired')

      });
    }
    if (!project || !task) {
      websocketHandler.sendLog(req, 'Missing project or task', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.projectTaskRequired')

      });
    }

    websocketHandler.sendLog(req, `Finding open check-in for user ${userId}`, constants.LOG_TYPES.TRACE);
    const checkIn = await TimeLogCheckInOut.findOne({ user: userId, checkOutTime: null }).sort({ checkInTime: -1 });

    if (!checkIn) {
      websocketHandler.sendLog(req, 'No open check-in found', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        message: req.t('timeLog.noOpenCheckIn')

      });
    }

    const checkInTime = moment(checkIn.checkInTime);
    const checkOutMoment = moment(checkOutTime);
    const durationMinutes = checkOutMoment.diff(checkInTime, 'minutes');
    websocketHandler.sendLog(req, `Calculated duration: ${durationMinutes} minutes`, constants.LOG_TYPES.DEBUG);

    checkIn.checkOutTime = checkOutTime;
    await checkIn.save();
    websocketHandler.sendLog(req, `Updated check-in record ${checkIn._id} with check-out time`, constants.LOG_TYPES.INFO);

    const logsToInsert = [];
    for (let i = 0; i < durationMinutes; i += 10) {
      logsToInsert.push({
        user: userId,
        project,
        task,
        startTime: moment(checkInTime).add(i, 'minutes').toDate(),
        endTime: moment(checkInTime).add(i + 10, 'minutes').toDate(),
        date: checkInTime.toISOString().split('T')[0],
        isManualTime: false
      });
    }

    if (logsToInsert.length > 0) {
      websocketHandler.sendLog(req, `Inserting ${logsToInsert.length} time logs`, constants.LOG_TYPES.TRACE);
      await TimeLog.insertMany(logsToInsert);
      websocketHandler.sendLog(req, 'Time logs inserted successfully', constants.LOG_TYPES.INFO);
    }

    res.status(200).json({ message: "Checked out successfully and time logs updated." });
  } catch (error) {
    websocketHandler.sendLog(req, `Check-out failed: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: error.message });
  }
});

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}