const User = require('../models/permissions/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const userSubordinate = require('../models/userSubordinateModel');
const ProjectUsers = require('../models/projectUserModel');
const TaskUsers = require('../models/taskUserModel');
const Projects = require('../models/projectModel');
const timeLog = require('../models/timeLog');
const BrowserHistory= require('../models/appsWebsites/browserHistory');
const Productivity = require('./../models/productivityModel');
const AppWebsite = require('./../models/commons/appWebsiteModel');
const ManualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
exports.getAllUsers=catchAsync(async (req, res, next) => {
    // To allow for nested GET revicews on tour (hack)
    let filter = { status: 'Active', company : req.cookies.companyId };
    // Thanks to merging params in routers      
    // Generate query based on request params
    const features = new APIFeatures(User.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // Run created query
    // .explain() to return more information
    // const document = await features.query.explain();
    const document = await features.query;  
    res.status(201).json({
      status: 'success',
      results: document.length,
      data: {
        data: document
      }
    });
  });

exports.deleteUser = catchAsync(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, { status: 'Deleted' });
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: document
    });
  });

exports.updateUser =  catchAsync(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // If not found - add new
      runValidators: true // Validate data
    });
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.getUser = catchAsync(async (req, res, next) => {       
  const users = await User.findById(req.body.id).where('status').equals('Active')
  res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  });  
});

exports.getUsersByCompany = catchAsync(async (req, res, next) => {    
  const users = await User.find({
    'status': { $ne: 'Deleted' },
    'company': req.params.companyId
  });
   res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  });  
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Loop through every property in an object
  Object.keys(obj).forEach(el => {
    // If property is inside allowed fields array
    // add copy current property to new object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'You cannot update password using this route. Please use /updateMyPassword'
      )
    );

  // 2) Filter out unwanted body properties
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Reutrn updated object instead of old one
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { status: 'Deleted' });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
});

exports.getMe = (req, res, next) => {  
  req.params.id = req.user.id;
  req.query.status = 'Active'; 
  next();
};

exports.getUsers = catchAsync(async (req, res, next) => {
  var users = await User.find({'_id': {$in: req.body.userId }, 'status': { $ne: 'Deleted' }});  
  res.status(200).json({
    status: 'success',
    data: users
  });
});

exports.getUserManagers = catchAsync(async (req, res, next) => {    
  let managers =[]; 
  let list = await userSubordinate.distinct('userId').find({'subordinateUserId': {$in: req.params.id}});  
  for(let i=0;i<list.length;i++){
      let manager =  await User.findOne({'_id': {$in: list[i].userId}, 'status': { $ne: 'Deleted' }});  
      if(manager){
        managers.push({id:manager.id, name:`${manager?.firstName} ${manager?.lastName}`});
    }
  }
  res.status(200).json({
    status: 'success',
    data: managers
  });
});

exports.getUserProjects = catchAsync(async (req, res, next) => {
  let projects =[];
  let projectUsers = await ProjectUsers.find({}).where('user').equals(req.params.id);  
  for(let i =0; i<projectUsers.length;i++ ){  
    let user =  await User.findOne({'_id': {$in: projectUsers[i].user}, 'status': { $ne: 'Deleted' }});  
    if(user){    
       projects.push(projectUsers[i].project);
    }
  }
  res.status(200).json({
    status: 'success',
    data: projects
  });
});


