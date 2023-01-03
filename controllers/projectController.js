const Project = require('../models/projectModel');
const catchAsync = require('../utils/catchAsync');
const ProjectUser = require('../models/projectUserModel');
const AppError = require('../utils/appError');
exports.deleteProject = catchAsync(async (req, res, next) => {
  const document = await Project.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateProject =  catchAsync(async (req, res, next) => {
  const document = await Project.findByIdAndUpdate(req.params.id, req.body, {
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

exports.getProject  = catchAsync(async (req, res, next) => {    
const project = await Project.findById(req.params.id); 
res.status(200).json({
  status: 'success',
  data: {
    project: project
  }
});  
});
 // Get Country List
 exports.getProjectList = catchAsync(async (req, res, next) => {        
  console.log('getProjectList call');  
  const projectList = await Project.find({}).all();  

  console.log(projectList);  
    
    res.status(200).json({
      status: 'success',
      data: {
        projectList: projectList
      }
    });  
  });
 exports.getProjectListByUser  = catchAsync(async (req, res, next) => {    
  var projectList=[];

    const newProjectUserList = await ProjectUser.find({}).where('user').equals(req.body.userId);  
    if(newProjectUserList)
      {
       for(var i = 0; i < newProjectUserList.length; i++) {
           projectList.push(newProjectUserList[i].project);
         }  
      }
      res.status(200).json({
      status: 'success',
      data: {
        projectList:projectList
      }
    });   
  });
 exports.addProject = catchAsync(async (req, res, next) => {  
    const newProject = await Project.create({
      projectName: req.body.projectName,
      startDate:req.body.startDate,
      endDate :req.body.endDate,
      notes: req.body.notes,
      estimatedTime:req.body.estimatedTime,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now()),
      company:req.cookies.companyId,
      createdBy: req.cookies.user,
      updatedBy: req.cookies.user,
      status:"Active"
    });  
    console.log('project created');
    res.status(200).json({
      status: 'success',
      data: {
        newProject: newProject
      }
    });  
  });
 exports.addProjectUser = catchAsync(async (req, res, next) => { 
    // Upload Capture image on block blob client 
   for(var i = 0; i < req.body.projectUsers.length; i++) {
    console.log("11");
      const projectUsersexists = await ProjectUser.find({}).where('project').equals(req.body.projectId).where('user').equals(req.body.projectUsers[i].user);  
      
      if (projectUsersexists.length>0) {
        return next(new AppError('Project User already exists.', 403));
      }
      else{ 
      const newProjectUsersrItem = await ProjectUser.create({
        project:req.body.projectId,
        user:req.body.projectUsers[i].user,
        company:req.cookies.companyId,
        status:"Active",
        createdOn: new Date(),
        updatedOn: new Date(),
        createdBy: req.cookies.userId,
        updatedBy: req.cookies.userId
      });    
    }  
   
  
  }
  const newProjectUserList = await ProjectUser.find({}).where('project').equals(req.body.projectId);  
  res.status(200).json({
    status: 'success',
    data: {      
      ProjectUserList:newProjectUserList
    }
  });
  });
 exports.updateProjectUser =  catchAsync(async (req, res, next) => {
  const projectUser = await ProjectUser.findById(req.params.id);  
  if (projectUser) {
  const projectUsersexists = await ProjectUser.find({}).where('project').equals(projectUser.project).where('user').equals(req.body.user);  
      if (projectUsersexists.length>0) {
        return next(new AppError('Project User already exists.', 403));
      }
      else{ 
    const document = await ProjectUser.findByIdAndUpdate(req.params.id, req.body, {
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
  }
  }
  });
  exports.deleteProjectUser = catchAsync(async (req, res, next) => {
    console.log("hii");
    const document = await ProjectUser.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  exports.getProjectUsers  = catchAsync(async (req, res, next) => {    
  
    const newProjectUserList = await ProjectUser.find({}).where('project').equals(req.params.id);  
    
    res.status(200).json({
      status: 'success',
      data: {
        projectUserList:newProjectUserList
      }
    });  
  });