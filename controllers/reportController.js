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
exports.getActivityold = catchAsync(async (req, res, next) => {
const timeLogsAll = [];
var timeLogs;
let filter;
var teamIdsArray = [];
var teamIds;
const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
if(ids.length > 0)    
    { 
      for(var i = 0; i < ids.length; i++) 
        {    
            teamIdsArray.push(ids[i]);        
        }
  }
if(teamIds==null)    
  {
     teamIdsArray.push(req.cookies.userId);
  } 
if(req.body.users!='' && req.body.projects!='')
  {
    filter = { 'user': { $in: req.body.users },'project': { $in: req.body.projects  }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}  };
  }  
  else if(req.body.projects!='')
  {
    filter = { 'project': { $in: req.body.projects }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} }; 
  }  
  else if(req.body.users!='')
  {
    filter = { 'user': { $in: req.body.users }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}  };
  }
  else{
    filter={'user': { $in: teamIdsArray } ,
        'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
   }
   
   timeLogs = await TimeLog.find(filter).distinct('user');    
   for(var i = 0; i < timeLogs.length; i++)
   {   
                    const newLogInUSer = {};
                    
                    const newLogAll = [];
      let filterProject ={};  
      if(req.body.projects!='')
      {
          filterProject = {'user': timeLogs[i],'project': { $in: req.body.projects }, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate} }; 
      }  
      else
      {
        filterProject = {'user': timeLogs[i], 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
      }
     const timeLog = await TimeLog.find(filterProject).distinct('project');
     for(var j = 0; j < timeLog.length; j++)
     {   
                const dateFrom = new Date(req.body.fromdate).getDate();
                const dateTo = new Date(req.body.todate).getDate();
                let days = dateTo - dateFrom;
                for(var day = 0;day <= days; day++)
                {    const newLog = {};              
                  var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
                  var end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));
                  let filterAll = {'user': timeLogs[i],'project':timeLog[j],'date' : {'$gte': tomorrow,'$lt': end}};                  
                  const timeLogAll = await TimeLog.find(filterAll);                 
                 if(timeLogAll.length>0)    
                  {                   
                    newLogInUSer.firstName = timeLogAll[0].user.firstName;  
                    newLogInUSer.lastName = timeLogAll[0].user.lastName; 
                    if(timeLogAll[0].project)
                    {
                      newLog.project = timeLogAll[0].project.projectName;
                    }                   
                    newLog.time = timeLogAll.length*10;   
                    if(timeLogAll[0].task)
                    {
                      newLog.task = timeLogAll[0].task.taskName;
                    }
                    newLog.date = timeLogAll[0].date;
                    newLogAll.push(newLog);
                  }
                }
             
       }   
       newLogInUSer.logs=newLogAll;
       timeLogsAll.push(newLogInUSer);
   }
 
  res.status(200).json({
    status: 'success',
    data: timeLogsAll
  });  
});

 exports.getActivity = catchAsync(async (req, res, next) => {
  var users = req.body.users;
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  if(ids.length > 0)    
      { 
        for(var i = 0; i < ids.length; i++) 
          {    
            if(users==="")
            {
              users=ids[i]; 
            }
            else
            {
              users=users +","+ ids[i];        
            }
        }
    }
  if(teamIds==null)    
    {
      if(users==="")
            {
              users=ids[i]; 
            }
            else
            {
              users=users +","+ ids[i];        
            }
    } 
  const userIds = req.body.users.split(',');
  const projectIds = req.body.projects.split(',');
  const startDate = new Date(req.body.startDate); // Get start date from the request
  const endDate = new Date(req.body.endDate); // Get end date from the request
  console.log(`userIds: ${users} startDate: ${startDate} endDate:${endDate}`);
  const pipeline = [
    // Match time logs for the given users and date range
    {
      $match: {
        user: { $in: userIds.map(id => mongoose.Types.ObjectId(id)) },
        project: { $in: projectIds.map(id => mongoose.Types.ObjectId(id)) },
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    // Group time logs by user, project and date, and calculate the total time spent for each day
    {
      $group: {
        _id: { user: '$user', project: '$project', task: '$task', date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        timeSpent: { $sum: { $subtract: ['$endTime', '$startTime'] } }
      }
    },
    // Group time logs by user and project, and pivot the data to create a column for each date
    {
      $group: {
        _id: { user: '$_id.user', project: '$_id.project',task: '$_id.task',},
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
    const dates = getDatesInRange(startDate, endDate);
                       
    // Create a matrix of time spent by project and date for each user
    const matrix = {};
    userIds.forEach(userId => {
      matrix[userId] = results
        .filter(result => result._id.user.toString() === userId)
        .map(result => {
          console.log(result);
          const row = [result._id.project,result._id.task];
          dates.forEach(date => {
            const timeSpent = result.timeSpent.find(t => t.date === date);
            row.push(timeSpent ? timeSpent.timeSpent : 0);
          });
          return row;
        });
    });
  
    // Create an array of column names with the project name and the dates
    const columns = ['User','Project','task', ...dates];
  
    // Send the response with the matrix and column names
    
    res.status(200).json({
      status: 'success',
      data: { matrix, columns }
    });
  
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }    
});

exports.getProductivityByMember = catchAsync(async (req, res, next) => {
  var appWebsiteSummary={};
  var appwebsiteDetails=[];
  let filter;
  filter={'userReference': req.body.user,'date' : {$gte: req.body.fromdate,$lte: req.body.todate}
          };
  const appWebsites = await AppWebsite.find({}).where('userReference').equals(req.body.user);  
  let mouseClicks=0,keyboardStrokes=0,scrollingNumber=0,totalTimeSpent=0,timeSpentProductive=0,timeSpentNonProductive=0,inactive=0;
  if(appWebsites.length>0)    
    { 
      for(var i = 0; i < appWebsites.length; i++) 
         {                
            mouseClicks=mouseClicks+appWebsites[i].mouseClicks;
            keyboardStrokes=keyboardStrokes+appWebsites[i].keyboardStrokes;
            scrollingNumber=scrollingNumber+appWebsites[i].scrollingNumber; 
            inactive=inactive+appWebsites[i].inactive;                  
         }
    totalTimeSpent = appWebsites.length*10;  
    appWebsiteSummary.mouseClicks=mouseClicks;
    appWebsiteSummary.keyboardStrokes=keyboardStrokes;
    appWebsiteSummary.scrollingNumber=scrollingNumber;                 
    appWebsiteSummary.timeSpent= totalTimeSpent; 
    appWebsiteSummary.inactive=inactive;
    const appWebsitename = await AppWebsite.find(filter).distinct('appWebsite');                               
    if(appWebsitename.length>0) 
      {
        for(var c = 0; c < appWebsitename.length; c++) 
            { 
              filterforcount = {'appWebsite':appWebsitename[c],'userReference': req.body.user,'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
              let timeSpent=0,appWebsite={};
              filterforproductivity = {'name':appWebsitename[c]};  
              const appIsProductive = await Productivity.find(filterforproductivity);  
              appWebsite.isProductive=appIsProductive[0].isProductive;
              const appWebsitecount = await AppWebsite.find(filterforcount);  
              if(appWebsitecount.length>0) 
                {
                  for(var j = 0; j < appWebsitecount.length; j++) 
                     { 
                        timeSpent=timeSpent+appWebsitecount[j].TimeSpent;
                     }
                }
              if(appWebsite.isProductive==true)
              {
                timeSpentProductive=timeSpentProductive+timeSpent;
              }
              else
              {
                timeSpentNonProductive=timeSpentNonProductive+timeSpent;
              }
              appWebsite.timeSpent=timeSpent;
              appWebsite.name=appWebsitename[c];             
              appwebsiteDetails.push(appWebsite);
           }
     }
         
   appWebsiteSummary.appwebsiteDetails=appwebsiteDetails;
   appWebsiteSummary.TimeSpentProductive=timeSpentProductive;
   appWebsiteSummary.TimeSpentNonProductive=timeSpentNonProductive;
  }
   res.status(200).json({
      status: 'success',
      data: appWebsiteSummary
    });  
});

exports.getProductivity = catchAsync(async (req, res, next) => {
 var teamIdsArray=[];
  var toDate = req.body.todate;
  if(req.body.fromdate===req.body.todate)
  {
    toDate = new Date(new Date(req.body.todate).setDate(new Date( req.body.todate).getDate() + 1));                      
    console.log(toDate);
  }
 var teamIds='';
 const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
 if(ids.length > 0)    
     {
       for(var i = 0; i < ids.length; i++) 
         {    
             teamIdsArray.push(ids[i]);        
         }
   }

   teamIdsArray.push(req.cookies.userId);
    var appwebsiteDetails=[];
    var appwebsiteproductivity=[];
    let filter;
    if(req.body.users.length>0)
    {
      filter = { 'userReference': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: toDate}};
    }
    else{
        filter={
           'userReference': { $in: teamIdsArray } ,'date':{$gte: req.body.fromdate,$lte: toDate}};
     }
 var appwebsiteusers = await AppWebsite.find(filter).distinct('userReference') 
 if(appwebsiteusers.length>0)
 { 
for(var u = 0; u < appwebsiteusers.length; u++) 
{    
    var appWebsiteSummary={};
    var filterdate={'date' : {$gte: req.body.fromdate,$lte: toDate}};
    const appWebsites = await AppWebsite.find(filterdate).where('userReference').equals(appwebsiteusers[u]._id);  
    let mouseClicks=0,keyboardStrokes=0,scrollingNumber=0,totalTimeSpent=0,timeSpentProductive=0,timeSpentNonProductive=0,inactive=0;
    if(appWebsites.length>0)    
      { 
        for(var i = 0; i < appWebsites.length; i++) 
           {                
              mouseClicks=mouseClicks+appWebsites[i].mouseClicks;
              keyboardStrokes=keyboardStrokes+appWebsites[i].keyboardStrokes;
              scrollingNumber=scrollingNumber+appWebsites[i].scrollingNumber;  
              inactive=inactive + appWebsites[i].inactive;                 
           }
      totalTimeSpent = appWebsites.length*10*60;        
      appWebsiteSummary.firstName = appWebsites[0].userReference.firstName;  
      appWebsiteSummary.lastName = appWebsites[0].userReference.lastName;
      appWebsiteSummary.mouseClicks = mouseClicks;
      appWebsiteSummary.keyboardStrokes = keyboardStrokes;
      appWebsiteSummary.scrollingNumber = scrollingNumber;                 
      appWebsiteSummary.TimeSpent = totalTimeSpent; 
      appWebsiteSummary.inactive = inactive; 
      appWebsiteSummary.date=appWebsites[0].date;
       
      const appWebsitename = await AppWebsite.find(filterdate).where('userReference').equals(appwebsiteusers[u]._id).distinct('appWebsite');                               
      if(appWebsitename.length>0) 
        {
          for(var c = 0; c < appWebsitename.length; c++) 
              { 
                filterforcount = {'appWebsite':appWebsitename[c],'userReference':appwebsiteusers[u]._id,'date' : {$gte: req.body.fromdate,$lte: toDate}};  
                let TimeSpent=0;
                var appWebsite={};
                filterforproductivity = {'name':appWebsitename[c]};  
                const appIsProductive = await Productivity.find(filterforproductivity);  
                if(appIsProductive.length>0)
                { 
                    appWebsite.isProductive=appIsProductive[0].isProductive;
                } 
                else
                {
                    appWebsite.isProductive="false";
                }
                const appWebsitecount = await AppWebsite.find(filterforcount);  
                if(appWebsitecount)
                {
                if(appWebsitecount.length>0) 
                  {
                    for(var j = 0; j < appWebsitecount.length; j++) 
                       { 
                          TimeSpent=TimeSpent+appWebsitecount[j].TimeSpent;
                       }
                  }
                }
                if(appWebsite.isProductive==true)
                {
                   timeSpentProductive=timeSpentProductive+TimeSpent;
                }
                else
                {
                  timeSpentNonProductive=timeSpentNonProductive+TimeSpent;
                }
                appWebsite.TimeSpent=TimeSpent;
                appWebsite.name=appWebsitename[c];             
                appwebsiteDetails.push(appWebsite);
             }
           
       }
           
     appWebsiteSummary.appwebsiteDetails=appwebsiteDetails;
     appWebsiteSummary.total = appWebsiteSummary.TimeSpent+appWebsiteSummary.inactive;   
     appWebsiteSummary.timeSpentProductive=timeSpentProductive;
     appWebsiteSummary.timeSpentNonProductive=timeSpentNonProductive;     
     appwebsiteproductivity.push(appWebsiteSummary);
    }
  }
}
     res.status(200).json({
        status: 'success',
        data: appwebsiteproductivity
      });  
});

exports.getAppWebsite = catchAsync(async (req, res, next) => {
  const appWebsiteAll = [];
  let filter;
    
  if(req.body.users.length>0 && req.body.projects.length>0)
    {
      filter = { 'userReference': { $in: req.body.users },'projectReference': { $in: req.body.projects } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
    }
    else if(req.body.projects.length>0)
    {
      filter = { 'projectReference': { $in: req.body.projects } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}}; 
    }  
    else if(req.body.users.length>0)
    {
      filter = { 'userReference': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
    }
    else{
        filter={
          'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
     }
    var appWebsiteusers = await AppWebsite.find(filter).distinct('userReference') 

     for(var i = 0; i < appWebsiteusers.length; i++) 
     {          
        let filterProject;
        if(req.body.users.length>0)
        {
             filterProject = {'userReference': req.body.users, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
        } 
        else
        {
          filterProject = {'userReference': appWebsiteusers[i],'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
      
        }   
       const appWebsiteprojects = await AppWebsite.find(filterProject).distinct('projectReference');      
       if(appWebsiteprojects.length>0) 
           {
                for(var k = 0; k < appWebsiteprojects.length; k++) 
                {  
                 
                  filternames = {'userReference': appWebsiteusers[i]._id,'projectReference':appWebsiteprojects[k]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                  const appWebsitename = await AppWebsite.find(filternames).distinct('appWebsite'); 
                            
                  if(appWebsitename.length>0) 
                      {
                           for(var c = 0; c < appWebsitename.length; c++) 
                           { 
                             filterforcount = {'appWebsite':appWebsitename[c],'userReference': appWebsiteusers[i]._id,'projectReference':appWebsiteprojects[k]._id, 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                             let mouseClicks=0,keyboardStrokes=0,scrollingNumber=0,timeSpent=0,inActive=0;
                             const appWebsitecount = await AppWebsite.find(filterforcount);  
                             if(appWebsitecount.length>0) 
                                 {
                                 
                                      for(var j = 0; j < appWebsitecount.length; j++) 
                                      { 
                                        mouseClicks = mouseClicks+appWebsitecount[j].mouseClicks;
                                        keyboardStrokes = keyboardStrokes+appWebsitecount[j].keyboardStrokes;
                                        scrollingNumber = scrollingNumber+appWebsitecount[j].scrollingNumber;
                                        timeSpent = timeSpent+appWebsitecount[j].TimeSpent;
                                        inActive= inActive+appWebsitecount[j].inactive;

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
    res.status(200).json({
      status: 'success',
      data: appWebsiteAll
    });  
});
exports.getleaves = catchAsync(async (req, res, next) => {

  var leavesDetails=[];
  if(req.body.users.length > 0)
    {
      filter = { 'user': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
    }
    else
    {
        filter = {
          'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
    }    
    var leaveusers = await Leave.find(filter).distinct('user');
    if(leaveusers)
    {
                for(var u = 0; u < leaveusers.length; u++)
                { 
                  var filterleavetypes = {'user': leaveusers[u]._id,'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                  const leavetypes = await Leave.find(filterleavetypes).distinct('LeaveType');                             
                  if(leavetypes.length>0) 
                      {
                           for(var c = 0; c < leavetypes.length; c++) 
                           { 
                            var filterleavetypes = {'LeaveType':leavetypes[c],'user': leaveusers[u]._id,'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
                            const leaves = await Leave.find(filterleavetypes);
                              if(leaves.length>0) 
                              {
                                const newleavessummary = {};
                                newleavessummary.name = leavetypes[c]; 
                                newleavessummary.firstName = leaves[0].user.firstName;  
                                newleavessummary.lastName = leaves[0].user.lastName;  
                                newleavessummary.count = leaves.length;                                 
                                leavesDetails.push(newleavessummary);
                              }                           
                           }
                     }

                }
    }


    res.status(200).json({
      status: 'success',
      data: leavesDetails
    });  
  });
exports.gettimesheet = catchAsync(async (req, res, next) => {
    var attandanceDetails=[];
    let filter;
    var teamIdsArray = [];
    var teamIds;
    const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
    if(ids.length > 0)    
        { 
          for(var i = 0; i < ids.length; i++) 
            {    
                teamIdsArray.push(ids[i]);        
            }
      }
    if(teamIds==null)    
      {
         teamIdsArray.push(req.cookies.userId);
      } 
 
    if(req.body.users.length>0)
      {
        filter = { 'user': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
      }
      else{
          filter={'user': { $in: teamIdsArray } ,
            'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
       }
      const users = await TimeLog.find(filter).distinct('user') 
      for(var i = 0; i < users.length; i++) 
       {          
          let filterProject;
          if(req.body.projects.length>0)
          {
               filterProject = {'project': req.body.projects,'user': users[i], 'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
          } 
          else
          {
            filterProject = {'user': users[i],'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
        
          }   
        const projects = await TimeLog.find(filterProject).distinct('project');      
         if(projects.length>0) 
             {
                  for(var k = 0; k < projects.length; k++) 
                  {  
                   
                    const newLogInUSer = {};                       
                    const allLogs = [];             
                      const dateFrom = new Date(req.body.fromdate).getDate();
                      const dateTo = new Date(req.body.todate).getDate();
                      let days = dateTo - dateFrom;             
                      for(var day = 0;day <= days; day++)
                      {                 
                        var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
                        var end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));                      
                        let filterAll = {'user': users[i],'project':projects[k],'date' : {'$gte': tomorrow,'$lte': end}};                  
                        const timeLogAll = await TimeLog.find(filterAll);                
                        if(timeLogAll.length>0)    
                        {                  
                          const newLogDaily = {};             
                          newLogDaily.time = timeLogAll.length*10;      
                          newLogDaily.date = timeLogAll[0].date;                         
                          newLogInUSer.firstName = timeLogAll[0].user.firstName;  
                          newLogInUSer.lastName = timeLogAll[0].user.lastName;
                          if(timeLogAll[0].project)
                          {
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
    res.status(200).json({
      status: 'success',
      data: attandanceDetails
    });  
  });
exports.gettimeline = catchAsync(async (req, res, next) => {
    var attandanceDetails=[];
    let filter;
    var teamIdsArray = [];
    var teamIds;
    const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
    if(ids.length > 0)    
        { 
          for(var i = 0; i < ids.length; i++) 
            {    
                teamIdsArray.push(ids[i]);        
            }
      }
    if(teamIds==null)    
      {
         teamIdsArray.push(req.cookies.userId);
      } 
 
    if(req.body.users.length>0)
      {
        filter = { 'user': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
      }
    else{
          filter={'user': { $in: teamIdsArray } ,
            'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
       }
    const users = await TimeLog.find(filter).distinct('user') 
    for(var i = 0; i < users.length; i++) 
       {          
          let filterProject;
          if(req.body.projects.length>0)
          {
               filterProject = {'project': req.body.projects,'user': users[i], 'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
          } 
          else
          {
            filterProject = {'user': users[i],'date' : {'$gte': req.body.fromdate,'$lte': req.body.todate}};  
        
          }   
        const projects = await TimeLog.find(filterProject).distinct('project');      
        if(projects.length>0) 
             {

                  for(var k = 0; k < projects.length; k++) 
                  {  
                     
                    const newLogInUSer = {};                       
                    const allLogs = [];             
                      const dateFrom = new Date(req.body.fromdate).getDate();
                      const dateTo = new Date(req.body.todate).getDate();
                      let days = dateTo - dateFrom;     
                      const firstTimeLog = await TimeLog.find(filterProject).sort();      
                      newLogInUSer.StatTime=firstTimeLog[0].startTime;
                      for(var day = 0;day <= days; day++)
                      {                 
                        var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
                        var end = new Date(new Date(tomorrow).setDate(new Date(tomorrow).getDate() + 1));                      
                        let filterAll = {'user': users[i],'project':projects[k],'date' : {'$gte': tomorrow,'$lte': end}};                  
                        const timeLogAll = await TimeLog.find(filterAll);                
                        if(timeLogAll.length>0)    
                        {
                          for(var k1 = 0; k1 < timeLogAll.length; k1++) 
                          {                         
                          allLogs.push(timeLogAll[k1]);
                          }
                        }
                     
                      }
                      
                      newLogInUSer.logs = allLogs;
                      attandanceDetails.push(newLogInUSer);
                  }
          }             
       }
    res.status(200).json({
      status: 'success',
      data: attandanceDetails
    });  
  });
exports.getattandance = catchAsync(async (req, res, next) => {
    var attandanceDetails=[];
    let filter;
    var teamIdsArray = [];
    var teamIds;
    const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
    if(ids.length > 0)    
        { 
          for(var i = 0; i < ids.length; i++) 
            {    
                teamIdsArray.push(ids[i]);        
            }
      }
    if(teamIds==null)    
      {
         teamIdsArray.push(req.cookies.userId);
      } 
     var toDate = new Date(new Date(req.body.todate).setDate(new Date( req.body.todate).getDate() + 1));
     if(req.body.users.length>0)
      {
        filter = { 'user': { $in: req.body.users } , 'date' : {$gt: req.body.fromdate,$lt: toDate}};
      }
      else
      {
          filter={'user': { $in: teamIdsArray } ,
            'date' : {$gte: req.body.fromdate,$lt: toDate}};
      }     
      const users = await TimeLog.find(filter).distinct('user')
      for(var i = 0; i < users.length; i++) 
       {          
                    const newLogInUSer = {};                       
                    const allLogs = [];
                    let filterAll = { 'user': { $in: users[i] } , 'date' : {$gte: req.body.fromdate,$lte: toDate}};    
                    const timeLogAll = await TimeLog.find(filterAll);  
                    var count = timeLogAll.length-1;  
                    if(timeLogAll.length>0)    
                    {                         
                            newLogInUSer.time = timeLogAll.length * 10;      
                            var start = new Date(timeLogAll[0].startTime);
                            var end = new Date(timeLogAll[count].startTime);
                            var manual =  timeLogAll.filter(item => item.isManualTime === true).length*10;                            
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
                            const timeDifference = endDate - startDate;
                            //const numberOfDays = timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                            const numberOfDays = calculateWeekdays(startDate, endDate, 1); // Count total weekdays

                            const percentage = calculatePercentage(totalTrackedTime, dailyHours, numberOfDays);
                            newLogInUSer.percetage=percentage.toFixed(2);
                     }
                    attandanceDetails.push(newLogInUSer);
        }
     res.status(200).json({
      status: 'success',
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