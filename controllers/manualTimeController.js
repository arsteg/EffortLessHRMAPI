const manualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const TimeLog = require('../models/timeLog');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const { v1: uuidv1} = require('uuid');
const { Stream } = require('nodemailer/lib/xoauth2');
const  FileAPI = require('file-api');
const sendEmail = require('../utils/email');
const User = require('../models/permissions/userModel');
const Project = require('../models/projectModel');
const Company = require('../models/companyModel');
const Task = require('../models/taskModel');
var moment = require('moment'); 

exports.addManualTimeRequest = catchAsync(async (req, res, next) => {  
  const user = await User.findById(req.body.user);
  if (!user) {
    return next(new AppError(`There is no user with email ${user}}.`, 404));
  }  
  if(!req.body.date){
    return next(new AppError(`Date is required.`, 404));
  }

  if(!req.body.fromDate){
    return next(new AppError(`From Date is required.`, 404));
  }
  if(!req.body.toDate){
    return next(new AppError(`To Date is required.`, 404));
  }  
  const manager = await User.findById(req.body.manager);
    
  if (!manager) {
    return next(new AppError(`There is no manager with id ${user}}.`, 404));
  }

  const task = await Task.findById(req.body.task);
  if (!task) {
    return next(new AppError(`There is no task with id ${task}}.`, 404));
  }

  const project = await Project.findById(req.body.project);
  if (!project) {
    return next(new AppError(`Project is required.`, 404));
  }
  
  var mtRequest =  await manualTimeRequest.create(
    {
      user: req.body.user,
      date:req.body.date,
      company: req.cookies.companyId,
      project:req.body.project,
      manager:req.body.manager,
      task:req.body.task,
      fromDate:req.body.fromDate,
      toDate:req.body.toDate,
      status:"pending",
      reason:req.body.reason,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now()),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
    }
  );

  const requestApprovalLink = `${process.env.WEBSITE_DOMAIN}/ManualTimeRequestApproval`;    
  const managerName = `${manager.firstName} ${manager.lastName}`;
  const userName = `${user.firstName} ${user.lastName}`;
  const emailSubject=`Manual Time Request By ${userName}`;
  const emailMessage=`Hi ${managerName}, \n ${userName} has requested you to approve a manual time request.\n Please click the following link to approve or reject this request.\n ${requestApprovalLink} \nThank you `;

  if(mtRequest){
    await sendEmail({
      email: manager.email,
      subject: emailSubject,
      message: emailMessage
    });
  }
  res.status(200).json({
      status: 'success',
      data: mtRequest
    });  
  });

exports.updateManualTimeRequest = catchAsync(async (req, res, next) => {  
    const user = await User.findById(req.body.user);
    if (!user) {
      return next(new AppError(`There is no user with email ${user}}.`, 404));
    }  
    if(!req.body.date){
      return next(new AppError(`Date is required.`, 404));
    }  
    const manager = await User.findById(req.body.manager);
    if (!manager) {
      return next(new AppError(`There is no manager with id ${user}}.`, 404));
    }
  
    const project = await Project.findById(req.body.project);
    if (!project) {
      return next(new AppError(`Project is required.`, 404));
    }
    
    const updatemanualTimeRequest = await manualTimeRequest.findByIdAndUpdate(req.body.id, req.body, {
      new: false,
      runValidators: true
  });
  console.log(updatemanualTimeRequest);
  if(!updatemanualTimeRequest)
  {
    if(updatemanualTimeRequest.status==='approved')
    {
      let startTime = moment(req.body.fromDate).toDate();
      const endTime = moment(req.body.toDate).toDate();  
      let recordCount=0;  
      let result=[];
      while( startTime<endTime){   
        var newLog = {
          user: updateUserPreference.user,
          task: updateUserPreference.task,
          project:updateUserPreference.project,
          date : req.body.fromdate,
          startTime: startTime,
          endTime:moment(startTime).add(10, 'm').toDate(),     
          keysPressed:0,
          clicks:0,
          scrolls:0,
          filePath:"",     
          ismanualTime:true
        }
        let logItem = await TimeLog.create(newLog);
        result.push(logItem);
        recordCount++;  
        startTime = moment(startTime).add(10, 'm').toDate();      
      }
    }    
  } 
  
    res.status(200).json({
        status: 'success',
        data: updateUserPreference
      });  
    });
exports.getManualTimeRequestsByUser = catchAsync(async (req, res, next) => {      
      const manualTimeRequests = await manualTimeRequest.find({}).where('user').equals(req.params.id);
      for(let i=0;i<manualTimeRequests.length;i++){ 
        manualTimeRequests[i].project = await Project.findById(manualTimeRequests[i].project); 
        manualTimeRequests[i].manager = await User.findById(manualTimeRequests[i].manager);
        manualTimeRequests[i].task = await Task.findById(manualTimeRequests[i].task); 
      }
      res.status(200).json({
          status: 'success',
          data: manualTimeRequests
        });  
      }); 

      exports.deleteManualTimeRequest = catchAsync(async (req, res, next) => {        
        const result = await manualTimeRequest.findByIdAndDelete(req.params.id);
        res.status(201).json({
            status: 'success',
            body: result
        });          
        });
  
  exports.getManualTimeRequestsForApprovalByUser = catchAsync(async (req, res, next) => {      
    const manualTimeRequests = await manualTimeRequest.find({}).where('manager').equals(req.params.id).populate('user');
    for(let i=0;i<manualTimeRequests.length;i++){ 
      manualTimeRequests[i].project = await Project.findById(manualTimeRequests[i].project);            
    }
    res.status(200).json({
        status: 'success',
        data: manualTimeRequests
      });  
    });
    
    exports.getManualTimeApprovedRequests = catchAsync(async (req, res, next) => {      
      const approvedRequests = await manualTimeRequest.find({"user":req.params.userId,"project":req.params.projectId,"manager":req.params.managerId,"status":"approved"});      
      res.status(200).json({
          status: 'success',
          data: approvedRequests
        });  
      });