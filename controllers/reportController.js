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
exports.getActivity = catchAsync(async (req, res, next) => {
//let date = `${req.body.date}.000+00:00`;
//console.log("getTimeLogs, date:" + date);
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
console.log(tomorrow);
console.log(end);
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

exports.getProductivityByMember = catchAsync(async (req, res, next) => {
  //let date = `${req.body.date}.000+00:00`;
  //console.log("getTimeLogs, date:" + date);
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
   
   
    //let date = `${req.body.date}.000+00:00`;
    //console.log("getTimeLogs, date:" + date);   
    var appwebsiteDetails=[];
    var appwebsiteproductivity=[];
    let filter;
    if(req.body.users.length>0)
    {
      filter = { 'userReference': { $in: req.body.users } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
    }
    else{
        filter={
           'userReference': { $in: teamIdsArray } ,'date':{$gte: req.body.fromdate,$lte: req.body.todate}};
     }
    console.log(teamIdsArray);
    console.log(filter);
 var appwebsiteusers = await AppWebsite.find(filter).distinct('userReference') 
 if(appwebsiteusers.length>0)
 {  console.log(appwebsiteusers);
            for(var u = 0; u < appwebsiteusers.length; u++) 
            {    
             var appWebsiteSummary={};
             var filterdate={
                'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};
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
      const appWebsitename = await AppWebsite.find(filterdate).where('userReference').equals(appwebsiteusers[u]._id).distinct('appWebsite');                               
      if(appWebsitename.length>0) 
        {
          for(var c = 0; c < appWebsitename.length; c++) 
              { 
                filterforcount = {'appWebsite':appWebsitename[c],'userReference':appwebsiteusers[u]._id,'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};  
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
     appWebsiteSummary.dateOfJoining=appWebsites[0].userReference.createdOn;
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
  //let date = `${req.body.date}.000+00:00`;
  //console.log("getTimeLogs, date:" + date);
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
     appWebsiteusers = await AppWebsite.find(filter).distinct('userReference') 

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
                    const newLogInUSer = {};                       
                    const allLogs = [];
                    let filterAll = { 'user': { $in: users[i] } , 'date' : {$gte: req.body.fromdate,$lte: req.body.todate}};    
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
                            const dateFrom = new Date(req.body.fromdate).getDate();
                            const dateTo = new Date(req.body.todate).getDate();
                            let days = dateTo - dateFrom;
                            for(var day = 0;day <= days; day++)
                            {  
                              var tomorrow = new Date(new Date(req.body.fromdate).setDate(new Date(req.body.fromdate).getDate() + day));
                              //tomorrow.toISOString().slice(0, 10)
                            //  let filterManual = { 'fromdate' : {$lte: tomorrow},'todate' : {$gte: tomorrow},'user':user._id};        
                             // const manualTimeRequests = await manualTimeRequest.find(filterManual);
                             // for(let time=0;time < manualTimeRequests.length;time++){ 
                             // manual = manual + 48;
                             // }
                              newLogInUSer.manual = manual;
                              newLogInUSer.total = newLogInUSer.manual+newLogInUSer.time;                          
                            }        
                     }
                    attandanceDetails.push(newLogInUSer);
        }
     res.status(200).json({
      status: 'success',
      data: attandanceDetails
    });  
  });