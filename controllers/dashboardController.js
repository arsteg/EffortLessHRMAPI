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
  console.log("Received Query Parameters:", req.query);

  const { userId, date: rawDate } = req.query;

  if (!userId || !rawDate) {
    return res.status(400).json({ status: "fail", message: "User ID and Date are required." });
  }

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) {
    return res.status(400).json({ status: "fail", message: "Invalid date format." });
  }

  const startOfDate = new Date(parsedDate);
  startOfDate.setHours(0, 0, 0, 0);
  const endOfDate = new Date(parsedDate);
  endOfDate.setHours(23, 59, 59, 999);

  const startOfPreviousDay = new Date(startOfDate);
  startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);
  const endOfPreviousDay = new Date(endOfDate);
  endOfPreviousDay.setDate(endOfPreviousDay.getDate() - 1);

  console.log("Start of Date:", startOfDate, "| End of Date:", endOfDate);
  console.log("Start of Previous Day:", startOfPreviousDay, "| End of Previous Day:", endOfPreviousDay);

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

    console.log("Today Logs:", todayLogs);
    console.log("Previous Day Logs:", previousDayLogs);

    const result = {
      today: todayLogs.length > 0 ? todayLogs[0].totalTime : 0,
      previousDay: previousDayLogs.length > 0 ? previousDayLogs[0].totalTime : 0,
    };

    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    console.error("Error fetching time logs:", error);
    next(error);
  }
});

exports.getWeeklySummary = catchAsync(async (req, res, next) => {
  console.log("Received Query Parameters:", req.query);

  const { userId, date: rawDate } = req.query;

  if (!userId || !rawDate) {
    return res.status(400).json({ status: "fail", message: "User ID and Date are required." });
  }

  const parsedDate = parseDate(rawDate);
  if (!parsedDate) {
    return res.status(400).json({ status: "fail", message: "Invalid date format." });
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

  console.log("Current Week:", currentWeekStartDate, "to", currentWeekEndDate);
  console.log("Previous Week:", previousWeekStartDate, "to", previousWeekEndDate);

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

    console.log("Current Week Total Hours:", currentWeekTotalHours);
    console.log("Previous Week Total Hours:", previousWeekTotalHours);

    const result = {
      currentWeek: currentWeekTotalHours,
      previousWeek: previousWeekTotalHours,
    };

    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    next(error);
  }
});



exports.getMonthlySummary = catchAsync(async (req, res, next) => {
  const { userId, date } = req.query;
  const startOfMonth = moment(date).startOf("month");
  const endOfMonth = moment(date).endOf("month");
  const startOfPreviousMonth = moment(date)
    .subtract(1, "month")
    .startOf("month");
  const endOfPreviousMonth = moment(date).subtract(1, "month").endOf("month");

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

  const currentMonth = currentMonthLogs[0]
    ? currentMonthLogs[0].total / (1000 * 60)
    : 0;
  const previousMonth = previousMonthLogs[0]
    ? previousMonthLogs[0].total / (1000 * 60)
    : 0;

  res.status(200).json({
    status: "success",
    data: {
      currentMonth,
      previousMonth,
    },
  });
});

exports.getTaskwiseHours = catchAsync(async (req, res, next) => {
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

  res.status(200).json({
    status: "success",
    data: timeLogs,
  });
});

exports.getTaskwiseStatus = catchAsync(async (req, res, next) => {
  const userId = req.query.userId;
  // Find all time logs of the user
  const timeLogs = await TimeLog.find({ user: userId }).populate("task");

  // Group time logs by project and task
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

  // Find all tasks of the user
  const tasks = await Task.find({ createdBy: userId });

  // Map tasks to include project information
  const tasksByProject = tasks.reduce((acc, curr) => {
    const projectId = curr.project?._id;
    if (!acc[projectId]) {
      acc[projectId] = { estimatedTime: 0, tasks: {} };
    }
    acc[projectId].estimatedTime += curr.estimate || 0;
    acc[projectId].tasks[curr._id] = {
      taskName: curr.taskName,
      timeTaken:
        timeLogsByProjectAndTask[projectId]?.[curr._id]?.timeTaken || 0,
    };
    return acc;
  }, {});

  res.status(200).json({
    status: "success",
    data: tasksByProject,
  });
});

exports.getApplicationTimeSummary = catchAsync(async (req, res, next) => {
  const targetDate = new Date(req.query.date);
  const startDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate() + 1
  );
  const userId = req.query.userId;

  // Find all appWebsite entries for the given user and date
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

  // const appWebsites = await appWebsiteModel.find({
  //   userReference: req.query.userId,
  //   date: req.query.date
  // });

  // Get the keys (appWebsite values) from appWebsite entries
  const appWebsiteKeys = appWebsites.map((app) => app.appWebsite);

  // Find the corresponding productivity entries for the appWebsiteKeys
  let productivityEntries = await Productivity.find({
    key: { $in: appWebsiteKeys },
    status: "approved",
  });

  // Calculate the total time spent on productive, non-productive, and neutral applications
  let productiveTime = 0;
  let nonProductiveTime = 0;
  let neutralTime = 0;

  appWebsites.forEach((app) => {
    const productivityEntry = productivityEntries.find(
      (entry) => entry.key === app.appWebsite
    );
    if (productivityEntry) {
      productiveTime += app.TimeSpent;
    } else {
      nonProductiveTime += app.TimeSpent;
    }
  });
  res.status(200).json({
    status: "success",
    data: [
      { name: "Productive", value: productiveTime / (1000 * 60) },
      { name: "Non-Productive", value: nonProductiveTime / (1000 * 60) },
      { name: "Neutral", value: neutralTime / (1000 * 60) },
    ],
  });
});

exports.getTaskStatusCounts = catchAsync(async (req, res, next) => {
  const userTasks = await TaskUsers.find({
    user: mongoose.Types.ObjectId(req.query.userId),
  }).populate("task");
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
  res.status(200).json({
    status: "success",
    data: [
      { name: "To Do", value: todo },
      { name: "In Progress", value: inProgress },
      { name: "Done", value: done },
      { name: "Closed", value: closed },
    ],
  });
});

exports.getDayWorkStatusByUser = catchAsync(async (req, res, next) => {
  const targetDate = new Date(req.query.date);
  const startDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate() + 1
  );
  const userId = req.query.userId;

  // Find all appWebsite entries for the given user and date
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
  let results = [];
  timeLogs.forEach((log) => {
    results.push({
      id: log._id,
      task: { id: log.task.id, taskName: log.task.taskName },
      project: { id: log.project?.id, projectName: log.project?.projectName },
    });
  });

  const result = groupByProjectAndCountTasks(results);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

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
