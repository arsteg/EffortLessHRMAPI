const TimeLog = require("../models/timeLog");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const moment = require("moment");
const Task = require("../models/taskModel");
const appWebsiteModel = require("../models/commons/appWebsiteModel");
const Productivity = require("../models/productivityModel");
const TaskUsers = require("../models/taskUserModel");
const { ObjectId } = require("mongoose").Types;
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

const parseDate = (dateString) => {
  console.log("Raw Date Input:", dateString);

  if (!dateString) {
    console.error("Error: Date string is empty or undefined.");
    return null;
  }

  // Try direct parsing
  let parsedDate = new Date(dateString);
  if (!isNaN(parsedDate)) {
    return parsedDate;
  }

  // Fix incorrect time format (e.g., 18.36.52 → 18:36:52)
  dateString = dateString.replace(/\./g, ":");
  parsedDate = new Date(dateString);

  if (!isNaN(parsedDate)) {
    return parsedDate;
  }

  console.error("Error: Invalid date format -", dateString);
  return null;
};

exports.getHoursWorked = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getHoursWorked process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Received query parameters: ${JSON.stringify(req.query)}`, constants.LOG_TYPES.TRACE);

  const { userId, date: rawDate } = req.query;

  if (!userId || !rawDate) {
      websocketHandler.sendLog(req, 'Missing userId or date in query parameters', constants.LOG_TYPES.WARN);
      return res.status(400).json({ status: constants.APIResponseStatus.Failure, message: req.t('dashboardController.userIdAndDateRequired') });
  }

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) {
      websocketHandler.sendLog(req, `Invalid date format: ${rawDate}`, constants.LOG_TYPES.WARN);
      return res.status(400).json({ status: constants.APIResponseStatus.Failure, message: req.t('dashboardController.invalidDateFormat') });
  }

  const startOfDate = new Date(parsedDate);
  startOfDate.setHours(0, 0, 0, 0);
  const endOfDate = new Date(parsedDate);
  endOfDate.setHours(23, 59, 59, 999);
  const startOfPreviousDay = new Date(startOfDate);
  startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);
  const endOfPreviousDay = new Date(endOfDate);
  endOfPreviousDay.setDate(endOfPreviousDay.getDate() - 1);

  websocketHandler.sendLog(req, `Date ranges - Today: ${startOfDate} to ${endOfDate}, Previous: ${startOfPreviousDay} to ${endOfPreviousDay}`, constants.LOG_TYPES.TRACE);

  try {
      const todayLogs = await TimeLog.aggregate([
          {
              $match: {
                  user: mongoose.Types.ObjectId(userId),
                  date: { $gte: startOfDate, $lte: endOfDate },
              },
          },
          {
              $group: {
                  _id: "$user",
                  totalTime: { $sum: { $subtract: ["$endTime", "$startTime"] } },
              },
          },
      ]);

      const previousDayLogs = await TimeLog.aggregate([
          {
              $match: {
                  user: mongoose.Types.ObjectId(userId),
                  date: { $gte: startOfPreviousDay, $lte: endOfPreviousDay },
              },
          },
          {
              $group: {
                  _id: "$user",
                  totalTime: { $sum: { $subtract: ["$endTime", "$startTime"] } },
              },
          },
      ]);

      websocketHandler.sendLog(req, `Today logs: ${todayLogs.length} entries, Previous day logs: ${previousDayLogs.length} entries`, constants.LOG_TYPES.DEBUG);

      const result = {
          today: todayLogs.length > 0 ? todayLogs[0].totalTime : 0,
          previousDay: previousDayLogs.length > 0 ? previousDayLogs[0].totalTime : 0,
      };

      websocketHandler.sendLog(req, 'Completed getHoursWorked process', constants.LOG_TYPES.INFO);
      res.status(200).json({ status: constants.APIResponseStatus.Success, data: result });
  } catch (error) {
      websocketHandler.sendLog(req, `Error fetching time logs: ${error.message}`, constants.LOG_TYPES.ERROR);
      next(error);
  }
});

exports.getWeeklySummary = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getWeeklySummary process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Received query parameters: ${JSON.stringify(req.query)}`, constants.LOG_TYPES.TRACE);

  const { userId, date: rawDate } = req.query;

  if (!userId || !rawDate) {
      websocketHandler.sendLog(req, 'Missing userId or date in query parameters', constants.LOG_TYPES.WARN);
      return res.status(400).json({ status: constants.APIResponseStatus.Failure, message: req.t('dashboardController.userIdAndDateRequired') });
  }

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) {
      websocketHandler.sendLog(req, `Invalid date format: ${rawDate}`, constants.LOG_TYPES.WARN);
      return res.status(400).json({ status: constants.APIResponseStatus.Failure, message: req.t('dashboardController.invalidDateFormat') });
  }

  const currentWeekStartDate = new Date(parsedDate);
  currentWeekStartDate.setDate(parsedDate.getDate() - parsedDate.getDay());
  currentWeekStartDate.setHours(0, 0, 0, 0);
  const currentWeekEndDate = new Date(currentWeekStartDate);
  currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6);
  currentWeekEndDate.setHours(23, 59, 59, 999);
  const previousWeekStartDate = new Date(currentWeekStartDate);
  previousWeekStartDate.setDate(previousWeekStartDate.getDate() - 7);
  const previousWeekEndDate = new Date(currentWeekEndDate);
  previousWeekEndDate.setDate(previousWeekEndDate.getDate() - 7);

  websocketHandler.sendLog(req, `Week ranges - Current: ${currentWeekStartDate} to ${currentWeekEndDate}, Previous: ${previousWeekStartDate} to ${previousWeekEndDate}`, constants.LOG_TYPES.TRACE);

  try {
      const currentWeekTimeLogs = await TimeLog.find({
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: currentWeekStartDate, $lte: currentWeekEndDate },
      });

      const currentWeekTotalHours = currentWeekTimeLogs.reduce(
          (total, timeLog) => total + (timeLog.endTime - timeLog.startTime) / (1000 * 60 * 60),
          0
      );

      const previousWeekTimeLogs = await TimeLog.find({
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: previousWeekStartDate, $lte: previousWeekEndDate },
      });

      const previousWeekTotalHours = previousWeekTimeLogs.reduce(
          (total, timeLog) => total + (timeLog.endTime - timeLog.startTime) / (1000 * 60 * 60),
          0
      );

      websocketHandler.sendLog(req, `Current week logs: ${currentWeekTimeLogs.length} entries, Previous week logs: ${previousWeekTimeLogs.length} entries`, constants.LOG_TYPES.DEBUG);

      const result = {
          currentWeek: currentWeekTotalHours,
          previousWeek: previousWeekTotalHours,
      };

      websocketHandler.sendLog(req, 'Completed getWeeklySummary process', constants.LOG_TYPES.INFO);
      res.status(200).json({ status: constants.APIResponseStatus.Success, data: result });
  } catch (error) {
      websocketHandler.sendLog(req, `Error fetching weekly summary: ${error.message}`, constants.LOG_TYPES.ERROR);
      next(error);
  }
});

exports.getMonthlySummary = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getMonthlySummary process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Received query parameters: ${JSON.stringify(req.query)}`, constants.LOG_TYPES.TRACE);

  const { userId, date } = req.query;
  const startOfMonth = moment(date).startOf("month");
  const endOfMonth = moment(date).endOf("month");
  const startOfPreviousMonth = moment(date).subtract(1, "month").startOf("month");
  const endOfPreviousMonth = moment(date).subtract(1, "month").endOf("month");

  websocketHandler.sendLog(req, `Month ranges - Current: ${startOfMonth} to ${endOfMonth}, Previous: ${startOfPreviousMonth} to ${endOfPreviousMonth}`, constants.LOG_TYPES.TRACE);

  const currentMonthLogs = await TimeLog.aggregate([
      {
          $match: {
              user: mongoose.Types.ObjectId(userId),
              date: {
                  $gte: startOfMonth.toDate(),
                  $lte: endOfMonth.toDate(),
              },
          },
      },
      {
          $group: {
              _id: null,
              total: {
                  $sum: {
                      $subtract: ["$endTime", "$startTime"],
                  },
              },
          },
      },
  ]);

  const previousMonthLogs = await TimeLog.aggregate([
      {
          $match: {
              user: mongoose.Types.ObjectId(userId),
              date: {
                  $gte: startOfPreviousMonth.toDate(),
                  $lte: endOfPreviousMonth.toDate(),
              },
          },
      },
      {
          $group: {
              _id: null,
              total: {
                  $sum: {
                      $subtract: ["$endTime", "$startTime"],
                  },
              },
          },
      },
  ]);

  websocketHandler.sendLog(req, `Current month logs: ${currentMonthLogs.length} entries, Previous month logs: ${previousMonthLogs.length} entries`, constants.LOG_TYPES.DEBUG);

  const currentMonth = currentMonthLogs[0] ? currentMonthLogs[0].total / (1000 * 60) : 0;
  const previousMonth = previousMonthLogs[0] ? previousMonthLogs[0].total / (1000 * 60) : 0;

  websocketHandler.sendLog(req, 'Completed getMonthlySummary process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
          currentMonth,
          previousMonth,
      },
  });
});

exports.getTaskwiseHours = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskwiseHours process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching task-wise hours for user: ${req.query.userId}`, constants.LOG_TYPES.TRACE);

  const timeLogs = await TimeLog.aggregate([
      {
          $match: { user: mongoose.Types.ObjectId(req.query.userId) },
      },
      {
          $group: {
              _id: { project: "$project", task: "$task" },
              totalTime: { $sum: { $subtract: ["$endTime", "$startTime"] } },
          },
      },
      {
          $lookup: {
              from: "tasks",
              localField: "_id.task",
              foreignField: "_id",
              as: "task",
          },
      },
      {
          $lookup: {
              from: "projects",
              localField: "_id.project",
              foreignField: "_id",
              as: "project",
          },
      },
      {
          $unwind: "$task",
      },
      {
          $unwind: "$project",
      },
      {
          $group: {
              _id: "$project._id",
              projectName: { $first: "$project.projectName" },
              tasks: {
                  $push: {
                      taskName: "$task.taskName",
                      totalTime: "$totalTime",
                  },
              },
          },
      },
      {
          $project: {
              _id: 0,
              projectName: 1,
              tasks: 1,
          },
      },
  ]);

  websocketHandler.sendLog(req, `Retrieved ${timeLogs.length} project-task time summaries`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getTaskwiseHours process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: timeLogs,
  });
});

exports.getTaskwiseStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskwiseStatus process', constants.LOG_TYPES.INFO);
  const userId = req.query.userId;
  websocketHandler.sendLog(req, `Fetching task-wise status for user: ${userId}`, constants.LOG_TYPES.TRACE);

  const timeLogs = await TimeLog.find({ user: userId }).populate("task");
  websocketHandler.sendLog(req, `Found ${timeLogs.length} time logs`, constants.LOG_TYPES.DEBUG);

  const timeLogsByProjectAndTask = timeLogs.reduce((acc, curr) => {
      const projectId = curr.project?._id;
      const taskId = curr.task?._id;
      if (!acc[projectId]) {
          acc[projectId] = {};
      }
      if (!acc[projectId][taskId]) {
          acc[projectId][taskId] = { timeTaken: 0 };
      }
      acc[projectId][taskId].timeTaken += Math.abs(curr.endTime - curr.startTime);
      return acc;
  }, {});

  const tasks = await Task.find({ createdBy: userId });
  websocketHandler.sendLog(req, `Found ${tasks.length} tasks created by user`, constants.LOG_TYPES.DEBUG);

  const tasksByProject = tasks.reduce((acc, curr) => {
      const projectId = curr.project?._id;
      if (!acc[projectId]) {
          acc[projectId] = { estimatedTime: 0, tasks: {} };
      }
      acc[projectId].estimatedTime += curr.estimate || 0;
      acc[projectId].tasks[curr._id] = {
          taskName: curr.taskName,
          timeTaken: timeLogsByProjectAndTask[projectId]?.[curr._id]?.timeTaken || 0,
      };
      return acc;
  }, {});

  websocketHandler.sendLog(req, 'Completed getTaskwiseStatus process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: tasksByProject,
  });
});

exports.getApplicationTimeSummary = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getApplicationTimeSummary process', constants.LOG_TYPES.INFO);
  const targetDate = new Date(req.query.date);
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
  const userId = req.query.userId;
  websocketHandler.sendLog(req, `Fetching app time summary for user ${userId} on ${startDate} to ${endDate}`, constants.LOG_TYPES.TRACE);

  const appWebsites = await appWebsiteModel.find({
      $and: [
          {
              $expr: {
                  $eq: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      { $dateToString: { format: "%Y-%m-%d", date: targetDate } },
                  ],
              },
          },
          {
              userReference: userId,
          },
      ],
  });
  websocketHandler.sendLog(req, `Found ${appWebsites.length} app/website entries`, constants.LOG_TYPES.DEBUG);

  const appWebsiteKeys = appWebsites.map((app) => app.appWebsite);
  let productivityEntries = await Productivity.find({
      key: { $in: appWebsiteKeys },
      status: "approved",
  });
  websocketHandler.sendLog(req, `Found ${productivityEntries.length} productivity entries`, constants.LOG_TYPES.DEBUG);

  let productiveTime = 0;
  let nonProductiveTime = 0;
  let neutralTime = 0;

  appWebsites.forEach((app) => {
      const productivityEntry = productivityEntries.find((entry) => entry.key === app.appWebsite);
      if (productivityEntry) {
          productiveTime += app.TimeSpent;
      } else {
          nonProductiveTime += app.TimeSpent;
      }
  });

  websocketHandler.sendLog(req, 'Completed getApplicationTimeSummary process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: [
          { name: "Productive", value: productiveTime / (1000 * 60) },
          { name: "Non-Productive", value: nonProductiveTime / (1000 * 60) },
          { name: "Neutral", value: neutralTime / (1000 * 60) },
      ],
  });
});

exports.getTaskStatusCounts = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaskStatusCounts process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching task status counts for user: ${req.query.userId}`, constants.LOG_TYPES.TRACE);

  const userTasks = await TaskUsers.find({
      user: mongoose.Types.ObjectId(req.query.userId),
  }).populate("task");
  websocketHandler.sendLog(req, `Found ${userTasks.length} user tasks`, constants.LOG_TYPES.DEBUG);

  let todo = 0;
  let inProgress = 0;
  let done = 0;
  let closed = 0;
  userTasks.forEach((task) => {
      switch (task?.task?.status?.toUpperCase()) {
          case "TODO":
              todo++;
              break;
          case "IN PROGRESS":
              inProgress++;
              break;
          case "DONE":
              done++;
              break;
          case "CLOSED":
              closed++;
              break;
      }
  });

  websocketHandler.sendLog(req, `Task status counts - ToDo: ${todo}, InProgress: ${inProgress}, Done: ${done}, Closed: ${closed}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getTaskStatusCounts process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: [
          { name: "To Do", value: todo },
          { name: "In Progress", value: inProgress },
          { name: "Done", value: done },
          { name: "Closed", value: closed },
      ],
  });
});

exports.getDayWorkStatusByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getDayWorkStatusByUser process', constants.LOG_TYPES.INFO);
  const targetDate = new Date(req.query.date);
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
  const userId = req.query.userId;
  websocketHandler.sendLog(req, `Fetching day work status for user ${userId} on ${startDate} to ${endDate}`, constants.LOG_TYPES.TRACE);

  const timeLogs = await TimeLog.find({
      $and: [
          {
              $expr: {
                  $eq: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      { $dateToString: { format: "%Y-%m-%d", date: targetDate } },
                  ],
              },
          },
          {
              user: userId,
          },
      ],
  });
  websocketHandler.sendLog(req, `Found ${timeLogs.length} time logs`, constants.LOG_TYPES.DEBUG);

  let results = [];
  timeLogs.forEach((log) => {
      results.push({
          id: log._id,
          task: { id: log.task.id, taskName: log.task.taskName },
          project: { id: log.project?.id, projectName: log.project?.projectName },
      });
  });

  const result = groupByProjectAndCountTasks(results);
  websocketHandler.sendLog(req, `Grouped ${result.length} projects with task counts`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getDayWorkStatusByUser process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: result,
  });
});

function groupByProjectAndCountTasks(timeLogs) {
  websocketHandler.sendLog(null, 'Starting groupByProjectAndCountTasks process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(null, `Processing ${timeLogs.length} time logs`, constants.LOG_TYPES.TRACE);

  const projectTaskCount = timeLogs.reduce((acc, log) => {
      const projectId = log.project.id;
      const taskId = log.task.id;

      if (!acc[projectId]) {
          acc[projectId] = {
              projectName: log.project.projectName,
              tasks: {},
          };
      }

      if (!acc[projectId].tasks[taskId]) {
          acc[projectId].tasks[taskId] = {
              taskName: log.task.taskName,
              count: 0,
          };
      }

      acc[projectId].tasks[taskId].count++;
      return acc;
  }, {});

  const projectsWithTasks = Object.values(projectTaskCount).map((project) => {
      const tasks = Object.values(project.tasks);
      return {
          projectName: project.projectName,
          tasks,
      };
  });

  websocketHandler.sendLog(null, `Completed grouping, returning ${projectsWithTasks.length} projects`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(null, 'Completed groupByProjectAndCountTasks process', constants.LOG_TYPES.INFO);

  return projectsWithTasks;
}

function groupByProjectAndCountTasks(timeLogs) {
  const projectTaskCount = timeLogs.reduce((acc, log) => {
    const projectId = log.project.id;
    const taskId = log.task.id;

    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: log.project.projectName,
        tasks: {},
      };
    }

    if (!acc[projectId].tasks[taskId]) {
      acc[projectId].tasks[taskId] = {
        taskName: log.task.taskName,
        count: 0,
      };
    }

    acc[projectId].tasks[taskId].count++;
    return acc;
  }, {});

  // Convert the object into an array of projects with tasks
  const projectsWithTasks = Object.values(projectTaskCount).map((project) => {
    const tasks = Object.values(project.tasks);
    return {
      projectName: project.projectName,
      tasks,
    };
  });

  return projectsWithTasks;
}
