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
const  websocketHandler  = require('../utils/websocketHandler');

exports.addLog = catchAsync(async (req, res, next) => { 
 const currentUserActive = await CurrentUserDevice.findOne({}).where('userId').equals(req.cookies.userId).where('companyId').equals(req.cookies.companyId);  
 if (currentUserActive) {
      if(req.body.machineId!=currentUserActive.machineId)
         {
            if(req.body.makeThisDeviceActive==true)
            {
              currentUserActive.machineId = req.body.machineId;
              await currentUserActive.save();
            }
            else
            {
                        res.status(200).json({
                        status: constants.APIResponseStatus.Success,
                        data: {
                          MakeThisDeviceActive: false,
                          message: "User is logged in on another device, Do you want to make it active?"
                        }
                      }); 
            }
          }
  }
  else
  { 
          const newCurrentUserDevice = await CurrentUserDevice.create({
            machineId: req.body.machineId,
            company:req.cookies.companyId,
            status:"Active",
            createdOn: new Date(),
            userId: req.cookies.userId      
          });               
    }
    if (!req.body.document) {
      req.body.document = []; // Initialize as an empty array if not already initialized
    }
     req.body.document.push({
      filePath: req.body.filePath,
      file: req.body.fileString, // Assuming this is coming from the attachment
     });
  var url = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.Timelog, req.body.document[0]);
   
  const newTimeLog = await TimeLog.create({
    user: req.body.user,
    task:req.body.task,
    project:req.body.project,
    date :req.body.date,
    startTime: req.body.startTime,
    endTime:req.body.endTime,
    filePath:req.body.filePath,
    keysPressed:req.body.keysPressed,
    allKeysPressed:req.body.allKeysPressed,
    clicks:req.body.clicks,
    scrolls:req.body.scrolls,
    url:url,
    isManualTime:false
  });  
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: {
      timeLog: newTimeLog
    }
  });  

});

exports.getTimeLogs = catchAsync(async (req, res, next) => {
var tomorrow = new Date(new Date(req.body.date).setDate(new Date(req.body.date).getDate() + 1));
  
    const timeLogs = await TimeLog.find({
      "user": req.body.user,
      "date": { "$gte": req.body.date, "$lte": tomorrow }
    });
    
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: timeLogs
  });  
});

exports.getLogInUser = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];

  console.log('1. Initial Request Data:', {
    userId: req.cookies.userId,
    body: req.body,
    cookies: req.cookies
  });

  const ids = await userSubordinate.find({})
    .distinct('subordinateUserId')
    .where('userId')
    .equals(req.cookies.userId);

  console.log('2. Subordinate IDs from DB:', {
    subordinateIds: ids,
    count: ids.length
  });

  if (ids.length > 0) {
    teamIdsArray = ids;
  }
  teamIdsArray.push(req.cookies.userId);
  console.log('3. Team IDs Array (after adding current user):', {
    teamIdsArray,
    totalCount: teamIdsArray.length
  });

  const timeLogsAll = [];
  const realtime = [];
  const logs = {};
  var timeLogs;

  const today = moment().endOf('day');
  const date = today.toDate().toISOString().slice(0, 10);
  var tomorrow = new Date(new Date(date).setDate(new Date(date).getDate() - 7));
  var end = new Date(new Date(date).setDate(new Date(date).getDate() + 1));

  console.log('4. Date Range for Query:', {
    today: today.format(),
    date,
    tomorrow: tomorrow.toISOString(),
    end: end.toISOString()
  });

  console.log('5. Query Conditions:', {
    users: req.body.users,
    projects: req.body.projects,
    tasks: req.body.tasks
  });

  // Parse req.body.users as an array if it’s a comma-separated string
  const requestedUsers = req.body.users && req.body.users !== '' 
    ? (Array.isArray(req.body.users) ? req.body.users : req.body.users.split(',')).filter(u => u && u !== '')
    : teamIdsArray;

  // Parse req.body.projects and req.body.tasks, filtering out empty/invalid values
  const mongoose = require('mongoose');
  const isValidObjectId = (id) => id && id !== '' && mongoose.Types.ObjectId.isValid(id);

  const requestedProjects = req.body.projects && req.body.projects !== '' 
    ? (Array.isArray(req.body.projects) ? req.body.projects : req.body.projects.split(',')).filter(isValidObjectId)
    : null;

  const requestedTasks = req.body.tasks && req.body.tasks !== '' 
    ? (Array.isArray(req.body.tasks) ? req.body.tasks : req.body.tasks.split(',')).filter(isValidObjectId)
    : null;

  console.log('5a. Parsed Filters:', {
    requestedUsers,
    requestedProjects,
    requestedTasks
  });

  const userFilter = requestedUsers.length > 0 
    ? teamIdsArray.filter(id => requestedUsers.includes(id)) 
    : teamIdsArray;

  const query = { 'user': { $in: userFilter }, 'date': { '$gte': tomorrow, '$lte': end } };
  if (requestedProjects && requestedProjects.length > 0) query.project = { $in: requestedProjects };
  if (requestedTasks && requestedTasks.length > 0) query.task = { $in: requestedTasks };

  console.log('6. Query Object:', query);

  timeLogs = await TimeLog.find(query).distinct('user');
  console.log('7. TimeLogs:', timeLogs);

  console.log('8. Distinct Users from TimeLogs:', {
    timeLogs,
    count: timeLogs.length
  });

  for (var i = 0; i < timeLogs.length; i++) {
    const timeLog = await TimeLog.findOne({
      'user': timeLogs[i],
      'date': { '$gte': tomorrow, '$lte': end }
    });
    
    console.log('9. Individual TimeLog Entry:', {
      index: i,
      user: timeLogs[i],
      found: !!timeLog,
      timeLog: timeLog ? {
        user: timeLog.user,
        project: timeLog.project,
        task: timeLog.task,
        date: timeLog.date
      } : null
    });

    if (timeLog) {
      const newLogInUSer = {
        user: timeLog.user,
        project: timeLog.project?.projectName || 'N/A',
        task: timeLog.task?.taskName || 'N/A'
      };
      timeLogsAll.push(newLogInUSer);
    }
  }

  console.log('10. Processed TimeLogsAll:', {
    timeLogsAll,
    count: timeLogsAll.length
  });

  logs.onlineUsers = timeLogsAll;
  logs.totalMember = teamIdsArray.length;
  logs.activeMember = timeLogsAll.length;
  logs.totalNonProductiveMember = 0;
  realtime.push(logs);

  console.log('11. Final Response Data:', {
    logs,
    realtime,
    totalMember: logs.totalMember,
    activeMember: logs.activeMember
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: realtime
  });
});

exports.getCurrentWeekTotalTime = catchAsync(async (req, res, next) => {      
  const timeLogs = await TimeLog.find({}).where('user').equals(req.body.user).find({
    "date" : {"$gte": req.body.startDate,"$lte": req.body.endDate}});
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    length:timeLogs.length,
    data: timeLogs
  });  
});

exports.getLog = catchAsync(async (req, res, next) => {  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      timeLog: "he"
    }
  });
});

// exports.getLogsWithImages = catchAsync(async (req, res, next) => {
//   var tomorrow = new Date(new Date(req.body.date).setDate(new Date(req.body.date).getDate()+1));
//   const timeLogs = await TimeLog.find({
//     "user": req.body.user,
//     "date": { "$gte": req.body.date, "$lte": tomorrow }
//   });
  
//   res.status(200).json({
//     status: constants.APIResponseStatus.Success,
//     data: timeLogs
//   });
// });
exports.getLogsWithImages = catchAsync(async (req, res, next) => {
  const givenDate = new Date(req.body.date);

  // Get the start and end of the given date
  const startDate = new Date(givenDate);
  startDate.setHours(0, 0, 0, 0); // Start of the day

  const endDate = new Date(givenDate);
  endDate.setHours(23, 59, 59, 999); // End of the day

  // Get the start of the next day
  const tomorrow = new Date(givenDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeLogs = await TimeLog.find({
    "user": req.body.user,
    "$and": [
      { "date": { "$gte": startDate } }, // Logs greater than or equal to start of the given date
      { "date": { "$lt": tomorrow } }    // Logs less than the start of the next day
    ]
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: timeLogs
  });
});


exports.deleteLogTillDate = catchAsync(async (req, res, next) => {
  const timeLogsExists = await TimeLog.find({ date: { $lt: new Date(req.body.tillDate) } }); 
  if(timeLogsExists)
  {  
    for(var i = 0; i <timeLogsExists.length; i++) {
    if(timeLogsExists[i].url)
    {
      await StorageController.deleteBlobFromContainer(req.cookies.companyId, timeLogsExists[i].url);     
    }   
    const document = await TimeLog.findByIdAndDelete(timeLogsExists[i]._id);
    if (!document) {
      console.log('No document found with that ID');
    }    
  }
}
res.status(204).json({
  status:constants.APIResponseStatus.Success,
  data: null
});
});
exports.deleteLog = catchAsync(async (req, res, next) => {
  for(var i = 0; i < req.body.logs.length; i++) {
  const timeLogsExists = await TimeLog.findById(req.body.logs[i].logId);    
  if(timeLogsExists)
  {
    if(timeLogsExists.url)
    {
      await StorageController.deleteBlobFromContainer(req.cookies.companyId, timeLogsExists.url); 
    }
    const document = await TimeLog.findByIdAndDelete(req.body.logs[i].logId);
    if (!document) {
      console.log('No document found with that ID');
    }    
  }
  else{
    console.log('No document found with that ID');
  }
}
res.status(204).json({
  status: constants.APIResponseStatus.Success,
  data: null
});
});
exports.addManualTime = catchAsync(async (req, res, next) => {    
  let startTime = moment(req.body.startTime).toDate();
  const endTime = moment(req.body.endTime).toDate();  
  let recordCount=0;  
  let result=[];
  while( startTime<endTime){   
    var newLog = {
      user: req.body.user,
      task:req.body.task,
      project:req.body.projectId,
      date :req.body.date,
      startTime: startTime,
      endTime:moment(startTime).add(10, 'm').toDate(),     
      keysPressed:0,
      clicks:0,
      scrolls:0,
      filePath:"",     
      isManualTime:true
    }
    let logItem = await TimeLog.create(newLog);
    result.push(logItem);
    recordCount++;  
    startTime = moment(startTime).add(10, 'm').toDate();      
  }  
   res.status(200).json({
     status: constants.APIResponseStatus.Success,
     data: {
       timeLog: result
     }
   });
 });

 exports.getTimesheet = catchAsync(async (req, res, next) => {    

  const userId = req.body.userId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
    
  // Create a pipeline to aggregate time logs by project and date
  const pipeline = [
    // Match time logs for the given user and date range
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    // Group time logs by project and date, and calculate the total time spent for each day
    {
      $group: {
        _id: { project: '$project', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
      }
    },
    // Group time logs by project, and pivot the data to create a column for each date
    {
      $group: {
        _id: '$_id.project',
        timeSpent: { $push: { date: '$_id.date', timeSpent: '$timeSpent' } }
      }
    },
    // Sort projects by name
    {
      $sort: { _id: 1 }
    }
  ];

  try {
    // Execute the pipeline using the TimeLog collection
    const results = await TimeLog.aggregate(pipeline);

    // Create an array of dates within the date range
    const dates = getDatesInRange(startDate, endDate);

    // Create a matrix of time spent by project and date
    const matrix = results.map(result => {
      const row = [result._id];
      dates.forEach(date => {
        const timeSpent = result.timeSpent.find(t => t.date === date);
        row.push(timeSpent ? timeSpent.timeSpent : 0);
      });
      return row;
    });

    // Create an array of column names with the project name and the dates
    const columns = ['Project', ...dates];

    // Send the response with the matrix and column names   

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:{ matrix, columns } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }   
 });

 exports.getTimesheetByUserIds = catchAsync(async (req, res, next) => {
  const userIds = req.body.userIds.split(','); // Get user IDs from query parameter
  var startDate = new Date(req.body.startDate); // Get start date from query parameter
  var endDate = new Date(req.body.endDate); // Get end date from query parameter

  const startDateISO = startDate.toISOString().split('T')[0];
  const endDateISO = endDate.toISOString().split('T')[0];                
 
  console.log(`userIds: ${userIds} startDate: ${startDateISO} endDate:${endDateISO}`);
  
// Create a pipeline to aggregate time logs by project and date
const pipeline = [
  // Match time logs for the given users and date range
  {
    $match: {
      user: { $in: userIds.map(id => mongoose.Types.ObjectId(id)) },
      date: { $gte: new Date(startDateISO), $lte: new Date(endDateISO) }
    }
  },
  // Group time logs by user, project and date, and calculate the total time spent for each day
  {
    $group: {
      _id: { user: '$user', project: '$project', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
      timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
    }
  },
  // Group time logs by user and project, and pivot the data to create a column for each date
  {
    $group: {
      _id: { user: '$_id.user', project: '$_id.project' },
      timeSpent: { $push: { date: '$_id.date', timeSpent: '$timeSpent' } }
    }
  },
  // Sort projects by name
  {
    $sort: { '_id.user': 1, '_id.project': 1 }
  }
];

try {
  // Execute the pipeline using the TimeLog collection
  const results = await TimeLog.aggregate(pipeline);

  // Create an array of dates within the date range
  const dates = getDatesInRange(startDateISO, endDateISO);

  // Create a matrix of time spent by project and date for each user
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

  // Create an array of column names with the project name and the dates
  const columns = ['User','Project', ...dates];

  // Send the response with the matrix and column names
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { matrix, columns }
  });


} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}    
    
 });
  
 exports.userCheckIn = catchAsync(async (req, res, next) => {    
  try {
    console.log("=== User Check-In API Called ===");

    const { userId, latitude, longitude, checkInTime, project, task } = req.body;
    console.log("Received Payload:", { userId, latitude, longitude, checkInTime, project, task });

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }
    if (!checkInTime) {
      return res.status(400).json({ message: "Check-in time is required" });
    }
    if (!project || !task) {
      return res.status(400).json({ message: "Project and Task are required" });
    }

    // Create new check-in record
    const checkIn = new TimeLogCheckInOut({
      user: userId,
      checkInTime,
      latitude,
      longitude,
      project,
      task,
      date: new Date(checkInTime).toISOString().split('T')[0] 
    });
    
    await checkIn.save();
    console.log("Check-In Saved Successfully!");

    res.status(200).json({ message: "Checked in successfully", data: checkIn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.userCheckOut = catchAsync(async (req, res, next) => {    
  try {
    console.log("=== User Check-Out API Called ===");

    const { userId, latitude, longitude, checkOutTime, project, task } = req.body;
    console.log("Received Payload:", { userId, latitude, longitude, checkOutTime, project, task });

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }
    if (!checkOutTime) {
      return res.status(400).json({ message: "Check-out time is required" });
    }
    if (!project || !task) {
      return res.status(400).json({ message: "Project and Task are required" });
    }

    const checkIn = await TimeLogCheckInOut.findOne({ user: userId, checkOutTime: null }).sort({ checkInTime: -1 });

    if (!checkIn) {
      return res.status(400).json({ message: "No open check-in record found" });
    }
    
    const checkInTime = moment(checkIn.checkInTime);
    const checkOutMoment = moment(checkOutTime);
    const durationMinutes = checkOutMoment.diff(checkInTime, 'minutes');

    checkIn.checkOutTime = checkOutTime;
    await checkIn.save();

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
        await TimeLog.insertMany(logsToInsert);
        console.log("Time logs inserted successfully!");
    }

    res.status(200).json({ message: "Checked out successfully and time logs updated." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get an array of dates within a date range
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}