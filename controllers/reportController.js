const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const ProjectUser = require('../models/projectUserModel');
const Productivity = require('./../models/productivityModel');
const AppError = require('../utils/appError');
const TimeLog = require('../models/timeLog');
const AppWebsite = require('./../models/commons/appWebsiteModel');
const Leave = require('../models/leaveModel');
const User = require('../models/permissions/userModel');
const userSubordinate = require('../models/userSubordinateModel');
const manualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const mongoose = require('mongoose');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

exports.getActivityold = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getActivityold process', constants.LOG_TYPES.INFO);
  const timeLogsAll = [];
  var timeLogs;
  let filter;
  var teamIdsArray = [];
  var teamIds;
  
  websocketHandler.sendLog(req, 'Fetching subordinate user IDs', constants.LOG_TYPES.TRACE);
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);
  
  if(ids.length > 0) { 
      for(var i = 0; i < ids.length; i++) {    
          teamIdsArray.push(ids[i]);        
      }
  }
  if(teamIds==null) {
      teamIdsArray.push(req.cookies.userId);
      websocketHandler.sendLog(req, `Added current user ${req.cookies.userId} to teamIdsArray`, constants.LOG_TYPES.DEBUG);
  } 
  
  // Filter construction
  if(req.body.users!='' && req.body.projects!='') {
      filter = { 'user': { $in: req.body.users }, 'project': { $in: req.body.projects }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} };
  } else if(req.body.projects!='') {
      filter = { 'project': { $in: req.body.projects }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} }; 
  } else if(req.body.users!='') {
      filter = { 'user': { $in: req.body.users }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} };
  } else {
      filter={'user': { $in: teamIdsArray }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  }
  websocketHandler.sendLog(req, `Constructed filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.TRACE);
  
  timeLogs = await TimeLog.find(filter).distinct('user');    
  websocketHandler.sendLog(req, `Found ${timeLogs.length} unique users in time logs`, constants.LOG_TYPES.DEBUG);
  
  for(var i = 0; i < timeLogs.length; i++) {   
      websocketHandler.sendLog(req, `Processing logs for user: ${timeLogs[i]}`, constants.LOG_TYPES.TRACE);
      const newLogInUSer = {};
      const newLogAll = [];
      let filterProject ={};  
      if(req.body.projects!='') {
          filterProject = {'user': timeLogs[i], 'project': { $in: req.body.projects }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} }; 
      } else {
          filterProject = {'user': timeLogs[i], 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
      }
      
      const timeLog = await TimeLog.find(filterProject).distinct('project');
      websocketHandler.sendLog(req, `Found ${timeLog.length} projects for user ${timeLogs[i]}`, constants.LOG_TYPES.DEBUG);
      
      for(var j = 0; j < timeLog.length; j++) {   
          const dateFrom = new Date(req.body.fromdate).getDate();
          const dateTo = new Date(req.body.todate).getDate();
          let days = dateTo - dateFrom;
          
          for(var day = 0; day <= days; day++) {    
              const newLog = {};              
              var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
              var end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));
              let filterAll = {'user': timeLogs[i], 'project':timeLog[j], 'date' : {'$gte': tomorrow,'$lt': end}};                  
              const timeLogAll = await TimeLog.find(filterAll);                 
              if(timeLogAll.length>0) {                   
                  newLogInUSer.firstName = timeLogAll[0].user.firstName;  
                  newLogInUSer.lastName = timeLogAll[0].user.lastName; 
                  if(timeLogAll[0].project) {
                      newLog.project = timeLogAll[0].project.projectName;
                  }                   
                  newLog.time = timeLogAll.length*10;   
                  if(timeLogAll[0].task) {
                      newLog.task = timeLogAll[0].task.taskName;
                  }
                  newLog.date = timeLogAll[0].date;
                  newLogAll.push(newLog);
                  websocketHandler.sendLog(req, `Added log entry for user ${timeLogs[i]} on ${newLog.date}`, constants.LOG_TYPES.TRACE);
              }
          }
      }   
      newLogInUSer.logs = newLogAll;
      timeLogsAll.push(newLogInUSer);
  }
  
  websocketHandler.sendLog(req, 'Completed getActivityold process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: timeLogsAll
  });  
});

exports.getActivity = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getActivity process', constants.LOG_TYPES.INFO);
  var users = req.body.users;
  var teamIds;
  
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);
  
  if(ids.length > 0) { 
      for(var i = 0; i < ids.length; i++) {    
          if(users==="") {
              users=ids[i]; 
          } else {
              users=users +","+ ids[i];        
          }
      }
  }
  if(teamIds==null) {
      if(users==="") {
          users=req.cookies.userId; 
      } else {
          users=users +","+ req.cookies.userId;        
      }
      websocketHandler.sendLog(req, `Final user list: ${users}`, constants.LOG_TYPES.DEBUG);
  } 
  
  const userIds = req.body.users.split(',');
  const projectIds = req.body.projects.split(',');
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  websocketHandler.sendLog(req, `Processing date range: ${startDate} to ${endDate}`, constants.LOG_TYPES.TRACE);
  
  const pipeline = [
      {
          $match: {
              user: { $in: userIds.map(id => mongoose.Types.ObjectId(id)) },
              project: { $in: projectIds.map(id => mongoose.Types.ObjectId(id)) },
              date: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
      },
      {
          $group: {
              _id: { user: '$user', project: '$project', task: '$task', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
              timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
          }
      },
      {
          $group: {
              _id: { user: '$_id.user', project: '$_id.project',task: '$_id.task',},
              timeSpent: { $push: { date: '$_id.date', timeSpent: '$timeSpent' } }
          }
      },
      {
          $sort: { '_id.user': 1, '_id.project': 1 }
      }
  ];
  
  try {
      const results = await TimeLog.aggregate(pipeline);
      websocketHandler.sendLog(req, `Aggregation returned ${results.length} results`, constants.LOG_TYPES.DEBUG);
      
      const dates = getDatesInRange(startDate, endDate);
      const matrix = {};
      userIds.forEach(userId => {
          matrix[userId] = results
              .filter(result => result._id.user.toString() === userId)
              .map(result => {
                  const row = [result._id.project,result._id.task];
                  dates.forEach(date => {
                      const timeSpent = result.timeSpent.find(t => t.date === date);
                      row.push(timeSpent ? timeSpent.timeSpent : 0);
                  });
                  return row;
              });
      });
      
      const columns = ['User','Project','task', ...dates];
      websocketHandler.sendLog(req, 'Completed getActivity process', constants.LOG_TYPES.INFO);
      
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: { matrix, columns }
      });
  } catch (error) {
      websocketHandler.sendLog(req, `Error in getActivity: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(500).json({ error: req.t('report.internalServerError') });
  }    
});

exports.getProductivityByMember = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getProductivityByMember process', constants.LOG_TYPES.INFO);
  var appWebsiteSummary={};
  var appwebsiteDetails=[];
  let filter = {'userReference': req.body.user, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  
  const appWebsites = await AppWebsite.find({}).where('userReference').equals(req.body.user);  
  websocketHandler.sendLog(req, `Found ${appWebsites.length} app/website entries for user ${req.body.user}`, constants.LOG_TYPES.DEBUG);
  
  let mouseClicks=0, keyboardStrokes=0, scrollingNumber=0, totalTimeSpent=0, timeSpentProductive=0, timeSpentNonProductive=0, inactive=0;
  
  if(appWebsites.length>0) { 
      for(var i = 0; i < appWebsites.length; i++) {                
          mouseClicks+=appWebsites[i].mouseClicks;
          keyboardStrokes+=appWebsites[i].keyboardStrokes;
          scrollingNumber+=appWebsites[i].scrollingNumber; 
          inactive+=appWebsites[i].inactive;                  
      }
      totalTimeSpent = appWebsites.length*10;  
      appWebsiteSummary.mouseClicks=mouseClicks;
      appWebsiteSummary.keyboardStrokes=keyboardStrokes;
      appWebsiteSummary.scrollingNumber=scrollingNumber;                 
      appWebsiteSummary.timeSpent=totalTimeSpent; 
      appWebsiteSummary.inactive=inactive;
      
      const appWebsitename = await AppWebsite.find(filter).distinct('appWebsite');                               
      websocketHandler.sendLog(req, `Found ${appWebsitename.length} unique app/websites`, constants.LOG_TYPES.DEBUG);
      
      if(appWebsitename.length>0) {
          for(var c = 0; c < appWebsitename.length; c++) { 
              websocketHandler.sendLog(req, `Processing app/website: ${appWebsitename[c]}`, constants.LOG_TYPES.TRACE);
              filterforcount = {'appWebsite':appWebsitename[c], 'userReference': req.body.user, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
              let timeSpent=0, appWebsite={};
              filterforproductivity = {'name':appWebsitename[c]};  
              const appIsProductive = await Productivity.find(filterforproductivity);  
              appWebsite.isProductive = appIsProductive[0].isProductive;
              
              const appWebsitecount = await AppWebsite.find(filterforcount);  
              if(appWebsitecount.length>0) {
                  for(var j = 0; j < appWebsitecount.length; j++) { 
                      timeSpent+=appWebsitecount[j].TimeSpent;
                  }
              }
              
              if(appWebsite.isProductive) {
                  timeSpentProductive+=timeSpent;
              } else {
                  timeSpentNonProductive+=timeSpent;
              }
              appWebsite.timeSpent=timeSpent;
              appWebsite.name=appWebsitename[c];             
              appwebsiteDetails.push(appWebsite);
              websocketHandler.sendLog(req, `Processed ${appWebsitename[c]}: ${timeSpent} minutes`, constants.LOG_TYPES.TRACE);
          }
      }
      
      appWebsiteSummary.appwebsiteDetails=appwebsiteDetails;
      appWebsiteSummary.TimeSpentProductive=timeSpentProductive;
      appWebsiteSummary.TimeSpentNonProductive=timeSpentNonProductive;
  }
  
  websocketHandler.sendLog(req, 'Completed getProductivityByMember process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: appWebsiteSummary
  });  
});

exports.getProductivity = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getProductivity process', constants.LOG_TYPES.INFO);
  var teamIdsArray=[];
  var toDate = req.body.todate;
  if(req.body.fromdate===req.body.todate) {
      toDate = new Date(new Date(req.body.todate).setDate(new Date(req.body.todate).getDate() + 1));                      
  }
  
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);
  
  if(ids.length > 0) {
      for(var i = 0; i < ids.length; i++) {    
          teamIdsArray.push(ids[i]);        
      }
  }
  teamIdsArray.push(req.cookies.userId);
  
  var appwebsiteDetails=[];
  var appwebsiteproductivity=[];
  let filter;
  if(req.body.users.length>0) {
      filter = { 'userReference': { $in: req.body.users }, 'date' : {$gte: req.body.fromdate,$lte: toDate}};
  } else {
      filter = {'userReference': { $in: teamIdsArray }, 'date':{$gte: req.body.fromdate,$lte: toDate}};
  }
  
  var appwebsiteusers = await AppWebsite.find(filter).distinct('userReference');
  websocketHandler.sendLog(req, `Found ${appwebsiteusers.length} unique users`, constants.LOG_TYPES.DEBUG);
  
  if(appwebsiteusers.length>0) { 
      for(var u = 0; u < appwebsiteusers.length; u++) {    
          websocketHandler.sendLog(req, `Processing productivity for user: ${appwebsiteusers[u]._id}`, constants.LOG_TYPES.TRACE);
          var appWebsiteSummary={};
          var filterdate={'date' : {$gte: req.body.fromdate,$lte: toDate}};
          const appWebsites = await AppWebsite.find(filterdate).where('userReference').equals(appwebsiteusers[u]._id);  
          let mouseClicks=0, keyboardStrokes=0, scrollingNumber=0, totalTimeSpent=0, timeSpentProductive=0, timeSpentNonProductive=0, inactive=0;
          
          if(appWebsites.length>0) { 
              for(var i = 0; i < appWebsites.length; i++) {                
                  mouseClicks+=appWebsites[i].mouseClicks;
                  keyboardStrokes+=appWebsites[i].keyboardStrokes;
                  scrollingNumber+=appWebsites[i].scrollingNumber;  
                  inactive+=appWebsites[i].inactive;                 
                  totalTimeSpent+=appWebsites[i].TimeSpent;
              }
              
              appWebsiteSummary.firstName = appWebsites[0].userReference.firstName;  
              appWebsiteSummary.lastName = appWebsites[0].userReference.lastName;
              appWebsiteSummary.mouseClicks = mouseClicks;
              appWebsiteSummary.keyboardStrokes = keyboardStrokes;
              appWebsiteSummary.scrollingNumber = scrollingNumber;                 
              appWebsiteSummary.TimeSpent = totalTimeSpent - inactive; 
              appWebsiteSummary.inactive = inactive; 
              appWebsiteSummary.date = appWebsites[0].date;
              
              const appWebsitename = await AppWebsite.find(filterdate).where('userReference').equals(appwebsiteusers[u]._id).distinct('appWebsite');                               
              if(appWebsitename.length>0) {
                  for(var c = 0; c < appWebsitename.length; c++) { 
                      filterforcount = {'appWebsite':appWebsitename[c], 'userReference':appwebsiteusers[u]._id, 'date' : {$gte: req.body.fromdate,$lte: toDate}};  
                      let TimeSpent=0;
                      var appWebsite={};
                      filterforproductivity = {'name':appWebsitename[c]};  
                      const appIsProductive = await Productivity.find(filterforproductivity);  
                      if(appIsProductive.length>0) { 
                          appWebsite.isProductive = (appIsProductive[0].status==='approved');
                      } else {
                          appWebsite.isProductive = false;
                      }
                      
                      const appWebsitecount = await AppWebsite.find(filterforcount);  
                      if(appWebsitecount?.length>0) {
                          for(var j = 0; j < appWebsitecount.length; j++) { 
                              TimeSpent+=appWebsitecount[j].TimeSpent;
                          }
                      }
                      
                      if(appWebsite.isProductive) {
                          timeSpentProductive+=TimeSpent;
                      } else {
                          timeSpentNonProductive+=TimeSpent;
                      }
                      appWebsite.TimeSpent=TimeSpent;
                      appWebsite.name=appWebsitename[c];             
                      appwebsiteDetails.push(appWebsite);
                  }
              }
              
              appWebsiteSummary.appwebsiteDetails=appwebsiteDetails;
              appWebsiteSummary.total = totalTimeSpent;
              appWebsiteSummary.timeSpentProductive=timeSpentProductive;
              appWebsiteSummary.timeSpentNonProductive=timeSpentNonProductive;     
              appwebsiteproductivity.push(appWebsiteSummary);
          }
      }
  }
  
  websocketHandler.sendLog(req, 'Completed getProductivity process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: appwebsiteproductivity
  });  
});

exports.getAppWebsite = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAppWebsite process', constants.LOG_TYPES.INFO);
  const appWebsiteAll = [];
  const fromDate = new Date(req.body.fromdate);
  const toDate = new Date(req.body.todate);
  let filter;
  
  if (req.body.users.length > 0 && req.body.projects.length > 0) {
      filter = { 
          'userReference': { $in: req.body.users },
          'projectReference': { $in: req.body.projects },
          'date': { $gte: fromDate, $lte: toDate }
      };
  } else if (req.body.projects.length > 0) {
      filter = { 
          'projectReference': { $in: req.body.projects },
          'date': { $gte: fromDate, $lte: toDate }
      };
  } else if (req.body.users.length > 0) {
      filter = { 
          'userReference': { $in: req.body.users },
          'date': { $gte: fromDate, $lte: toDate }
      };
  } else {
      filter = {'date': { $gte: fromDate, $lte: toDate }};
  }
  websocketHandler.sendLog(req, `Using filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.TRACE);
  
  var appWebsiteusers = await AppWebsite.find(filter).distinct('userReference');
  websocketHandler.sendLog(req, `Found ${appWebsiteusers.length} unique users`, constants.LOG_TYPES.DEBUG);
  
  for(var i = 0; i < appWebsiteusers.length; i++) {          
      let filterProject;
      if(req.body.users.length>0) {
          filterProject = {'userReference': req.body.users, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
      } else {
          filterProject = {'userReference': appWebsiteusers[i], 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
      }   
      
      const appWebsiteprojects = await AppWebsite.find(filter).distinct('projectReference');      
      if(appWebsiteprojects.length>0) {
          websocketHandler.sendLog(req, `Found ${appWebsiteprojects.length} projects for user ${appWebsiteusers[i]}`, constants.LOG_TYPES.DEBUG);
          for(var k = 0; k < appWebsiteprojects.length; k++) {  
              filternames = {'userReference': appWebsiteusers[i]._id, 'projectReference':appWebsiteprojects[k]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
              const appWebsitename = await AppWebsite.find(filternames).distinct('appWebsite'); 
              
              if(appWebsitename.length>0) {
                  for(var c = 0; c < appWebsitename.length; c++) { 
                      websocketHandler.sendLog(req, `Processing app/website ${appWebsitename[c]} for user ${appWebsiteusers[i]._id}`, constants.LOG_TYPES.TRACE);
                      filterforcount = {'appWebsite':appWebsitename[c], 'userReference': appWebsiteusers[i]._id, 'projectReference':appWebsiteprojects[k]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                      let mouseClicks=0, keyboardStrokes=0, scrollingNumber=0, timeSpent=0, inActive=0;
                      const appWebsitecount = await AppWebsite.find(filterforcount);  
                      if(appWebsitecount.length>0) {
                          for(var j = 0; j < appWebsitecount.length; j++) { 
                              mouseClicks+=appWebsitecount[j].mouseClicks;
                              keyboardStrokes+=appWebsitecount[j].keyboardStrokes;
                              scrollingNumber+=appWebsitecount[j].scrollingNumber;
                              timeSpent+=appWebsitecount[j].TimeSpent;
                              inActive+=appWebsitecount[j].inactive;
                          }
                      }
                      const newLogInUSer = {};
                      newLogInUSer.name = appWebsitename[c]; 
                      newLogInUSer.firstName = appWebsitecount[0].userReference.firstName;  
                      newLogInUSer.lastName = appWebsitecount[0].userReference.lastName;    
                      newLogInUSer.project = appWebsitecount[0].projectReference.projectName;   
                      newLogInUSer.mouseClicks=mouseClicks;
                      newLogInUSer.keyboardStrokes=keyboardStrokes;
                      newLogInUSer.scrollingNumber=scrollingNumber;
                      newLogInUSer.timeSpent=timeSpent;
                      newLogInUSer.inactive=inActive;
                      newLogInUSer.isProductive=appWebsitecount[0].isProductive;
                      appWebsiteAll.push(newLogInUSer);
                  }
              }
          }
      }
  }
  
  websocketHandler.sendLog(req, 'Completed getAppWebsite process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: appWebsiteAll
  });  
});

exports.getleaves = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getleaves process', constants.LOG_TYPES.INFO);
  var leavesDetails=[];
  let filter;
  
  if(req.body.users.length > 0) {
      filter = { 'user': { $in: req.body.users }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  } else {
      filter = {'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  }    
  websocketHandler.sendLog(req, `Using filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.TRACE);
  
  var leaveusers = await Leave.find(filter).distinct('user');
  websocketHandler.sendLog(req, `Found ${leaveusers.length} unique users with leaves`, constants.LOG_TYPES.DEBUG);
  
  if(leaveusers) {
      for(var u = 0; u < leaveusers.length; u++) { 
          websocketHandler.sendLog(req, `Processing leaves for user: ${leaveusers[u]._id}`, constants.LOG_TYPES.TRACE);
          var filterleavetypes = {'user': leaveusers[u]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
          const leavetypes = await Leave.find(filterleavetypes).distinct('LeaveType');                             
          if(leavetypes.length>0) {
              for(var c = 0; c < leavetypes.length; c++) { 
                  var filterleavetypes = {'LeaveType':leavetypes[c], 'user': leaveusers[u]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                  const leaves = await Leave.find(filterleavetypes);
                  if(leaves.length>0) {
                      const newleavessummary = {};
                      newleavessummary.name = leavetypes[c]; 
                      newleavessummary.firstName = leaves[0].user.firstName;  
                      newleavessummary.lastName = leaves[0].user.lastName;  
                      newleavessummary.count = leaves.length;                                 
                      leavesDetails.push(newleavessummary);
                      websocketHandler.sendLog(req, `Added ${leaves.length} ${leavetypes[c]} leaves for user ${leaveusers[u]._id}`, constants.LOG_TYPES.TRACE);
                  }                           
              }
          }
      }
  }
  
  websocketHandler.sendLog(req, 'Completed getleaves process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: leavesDetails
  });  
});

exports.gettimesheet = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting gettimesheet process', constants.LOG_TYPES.INFO);
  var attandanceDetails=[];
  let filter;
  var teamIdsArray = [];
  var teamIds;
  
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);
  
  if(ids.length > 0) { 
      for(var i = 0; i < ids.length; i++) {    
          teamIdsArray.push(ids[i]);        
      }
  }
  if(teamIds==null) {
      teamIdsArray.push(req.cookies.userId);
  } 
  
  if(req.body.users.length>0) {
      filter = { 'user': { $in: req.body.users }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  } else {
      filter={'user': { $in: teamIdsArray }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
  }
  
  const users = await TimeLog.find(filter).distinct('user');
  websocketHandler.sendLog(req, `Found ${users.length} unique users`, constants.LOG_TYPES.DEBUG);
  
  for(var i = 0; i < users.length; i++) {          
      let filterProject;
      if(req.body.projects.length>0) {
          filterProject = {'project': req.body.projects, 'user': users[i], 'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
      } else {
          filterProject = {'user': users[i], 'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
      }   
      
      const projects = await TimeLog.find(filterProject).distinct('project');      
      if(projects.length>0) {
          websocketHandler.sendLog(req, `Found ${projects.length} projects for user ${users[i]}`, constants.LOG_TYPES.DEBUG);
          for(var k = 0; k < projects.length; k++) {  
              const newLogInUSer = {};                       
              const allLogs = [];             
              const dateFrom = new Date(req.body.fromdate).getDate();
              const dateTo = new Date(req.body.todate).getDate();
              let days = dateTo - dateFrom;             
              for(var day = 0; day <= days; day++) {                 
                  var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
                  var end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));                      
                  let filterAll = {'user': users[i], 'project':projects[k], 'date' : {'$gte': tomorrow,'$lte': end}};                  
                  const timeLogAll = await TimeLog.find(filterAll);                
                  if(timeLogAll.length>0) {                  
                      const newLogDaily = {};             
                      newLogDaily.time = timeLogAll.length*10;      
                      newLogDaily.date = timeLogAll[0].date;                         
                      newLogInUSer.firstName = timeLogAll[0].user.firstName;  
                      newLogInUSer.lastName = timeLogAll[0].user.lastName;
                      if(timeLogAll[0].project) {
                          newLogInUSer.project = timeLogAll[0].project.projectName;
                      }
                      allLogs.push(newLogDaily);
                  }
              }
              newLogInUSer.logs = allLogs;
              attandanceDetails.push(newLogInUSer);
          }
      }
  }
  
  websocketHandler.sendLog(req, 'Completed gettimesheet process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: attandanceDetails
  });  
});

exports.gettimeline = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting gettimeline process', constants.LOG_TYPES.INFO);
  var attandanceDetails = [];
  let filter;
  var teamIdsArray = [];
  var teamIds;

  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);

  if (ids.length > 0) {
      for (var i = 0; i < ids.length; i++) {
          teamIdsArray.push(ids[i]);
      }
  }

  if (teamIds == null) {
      teamIdsArray.push(req.cookies.userId);
  }
  
  if (req.body.users && req.body.users.length > 0) {
      filter = { 'user': { $in: req.body.users }, 'date': { $gte: req.body.fromdate, $lte: req.body.todate } };
  } else {
      filter = { 'user': { $in: teamIdsArray }, 'date': { $gte: req.body.fromdate, $lte: req.body.todate } };
  }
  websocketHandler.sendLog(req, `Using filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.TRACE);

  const users = await TimeLog.find(filter).distinct('user');
  websocketHandler.sendLog(req, `Found ${users.length} unique users`, constants.LOG_TYPES.DEBUG);

  for (var i = 0; i < users.length; i++) {
      let filterProject;
      if (req.body.projects && req.body.projects.length > 0) {
          filterProject = { 'project': req.body.projects, 'user': users[i], 'date': { '$gte': req.body.fromdate, '$lte': req.body.todate } };
      } else {
          filterProject = { 'user': users[i], 'date': { '$gte': req.body.fromdate, '$lte': req.body.todate } };
      }

      const projects = await TimeLog.find(filterProject).distinct('project');
      if (projects.length > 0) {
          websocketHandler.sendLog(req, `Found ${projects.length} projects for user ${users[i]}`, constants.LOG_TYPES.DEBUG);
          for (var k = 0; k < projects.length; k++) {
              const newLogInUSer = {};
              const allLogs = [];
              const dateFrom = new Date(req.body.fromdate).getDate();
              const dateTo = new Date(req.body.todate).getDate();
              let days = dateTo - dateFrom;

              const firstTimeLog = await TimeLog.find(filterProject).sort();
              if (firstTimeLog.length > 0) {
                  newLogInUSer.StatTime = firstTimeLog[0].startTime;
              }

              for (var day = 0; day <= days; day++) {
                  var tomorrow = new Date(req.body.fromdate);
                  tomorrow.setDate(tomorrow.getDate() + day);
                  var end = new Date(req.body.fromdate);

                  if (req.body.fromdate === new Date()) {
                      end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));
                  }

                  const tomorrowISO = tomorrow.toISOString().split('T')[0];
                  const endISO = end.toISOString().split('T')[0];
                  let filterAll = { 'user': users[i], 'project': projects[k], 'date': { '$gte': tomorrowISO, '$lte': endISO } };

                  const timeLogAll = await TimeLog.find(filterAll);
                  if (timeLogAll.length > 0) {
                      websocketHandler.sendLog(req, `Found ${timeLogAll.length} logs for user ${users[i]} on ${tomorrowISO}`, constants.LOG_TYPES.TRACE);
                      for (var k1 = 0; k1 < timeLogAll.length; k1++) {
                          allLogs.push(timeLogAll[k1]);
                      }
                  }
              }

              newLogInUSer.logs = allLogs;
              attandanceDetails.push(newLogInUSer);
          }
      }
  }

  websocketHandler.sendLog(req, 'Completed gettimeline process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: attandanceDetails
  });
});

exports.getattandance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getattandance process', constants.LOG_TYPES.INFO);
  var attandanceDetails=[];
  let filter;
  var teamIdsArray = [];
  var teamIds;
  
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  websocketHandler.sendLog(req, `Found ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);
  
  if(ids.length > 0) { 
      for(var i = 0; i < ids.length; i++) {    
          teamIdsArray.push(ids[i]);        
      }
  }
  if(teamIds==null) {
      teamIdsArray.push(req.cookies.userId);
  } 
  
  var toDate = new Date(new Date(req.body.todate).setDate(new Date(req.body.todate).getDate() + 1));
  if(req.body.users.length>0) {
      filter = { 'user': { $in: req.body.users }, 'date' : {$gt: req.body.fromdate,$lt: toDate}};
  } else {
      filter={'user': { $in: teamIdsArray }, 'date' : {$gte: req.body.fromdate,$lt: toDate}};
  }     
  
  const users = await TimeLog.find(filter).distinct('user');
  websocketHandler.sendLog(req, `Found ${users.length} unique users`, constants.LOG_TYPES.DEBUG);
  
  for(var i = 0; i < users.length; i++) {          
      const newLogInUSer = {};                       
      const allLogs = [];
      let filterAll = { 'user': { $in: users[i] }, 'date' : {$gte: req.body.fromdate,$lte: toDate}};    
      const timeLogAll = await TimeLog.find(filterAll);  
      var count = timeLogAll.length-1;  
      if(timeLogAll.length>0) {                         
          newLogInUSer.time = timeLogAll.length * 10;      
          var start = new Date(timeLogAll[0].startTime);
          var end = new Date(timeLogAll[count].startTime);
          var manual = timeLogAll.filter(item => item.isManualTime === true).length*10;                            
          newLogInUSer.starttime = start.getHours()+ ":" + start.getMinutes() + ":" + start.getSeconds();
          newLogInUSer.endtime = end.getHours()+ ":" + end.getMinutes() + ":" + end.getSeconds();
          newLogInUSer.activity = "";                           
          newLogInUSer.firstName = timeLogAll[0].user.firstName;  
          newLogInUSer.lastName = timeLogAll[0].user.lastName;
          newLogInUSer.date= timeLogAll[0].date;                           
          newLogInUSer.manual = manual;
          newLogInUSer.total = newLogInUSer.manual + newLogInUSer.time;
          const totalTrackedTime = (newLogInUSer.manual + newLogInUSer.time)/60;
          const dailyHours = 8;
          const startDate = new Date(req.body.fromdate);
          const endDate = new Date(req.body.todate);                            
          const numberOfDays = calculateWeekdays(startDate, endDate, 1);
          const percentage = calculatePercentage(totalTrackedTime, dailyHours, numberOfDays);
          newLogInUSer.percetage=percentage.toFixed(2);
          websocketHandler.sendLog(req, `Processed attendance for user ${users[i]}: ${newLogInUSer.total} minutes`, constants.LOG_TYPES.TRACE);
      }
      attandanceDetails.push(newLogInUSer);
  }
  
  websocketHandler.sendLog(req, 'Completed getattandance process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: attandanceDetails
  });  
});

  function calculatePercentage(totalTrackedTime, dailyHours, numberOfDays) {
    const percentage = (totalTrackedTime / (dailyHours * numberOfDays)) * 100;
    return percentage;
  }
  function calculateWeekdays(startDate, endDate, dailyHours) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    let totalWeekdays = 0;
  
    while (start <= end) {
      const dayOfWeek = start.getDay(); // 0 (Sunday) to 6 (Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalWeekdays++;
      }
      start.setTime(start.getTime() + oneDay); // Move to the next day
    }
  
    return totalWeekdays * dailyHours;
  }
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