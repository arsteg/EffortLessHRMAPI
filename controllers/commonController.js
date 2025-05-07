const Country = require('../models/countryModel');
const Role = require('../models/permissions/roleModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Permission = require('../models/permissions/permissionModel');
const RolePerms = require('../models/rolePermsModel');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const TaskStatus = require('../models/commons/taskStatusModel');
const TaskPriority = require('../models/commons/taskPriorityModel');
const UserState = require('../models/Settings/userUIState');
const AppError = require('../utils/appError');
const IncomeTaxSection = require('../models/commons/IncomeTaxSectionModel');  
const IncomeTaxComponant = require("../models/commons/IncomeTaxComponant");
const constants = require('../constants');
const globalStore = require('../utils/globalStore');
const websocketHandler  = require('../utils/websocketHandler');
const UserDevice = require('../models/commons/userDeviceModel');
const { log } = require('winston');
const { format } = require('date-fns');

exports.getTerminationStatusList = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTerminationStatusList', constants.LOG_TYPES.INFO);
  
  try {
    const terminationStatusList = constants.Termination_status;    
    websocketHandler.sendLog(req,`Retrieved ${terminationStatusList.length} termination statuses`, constants.LOG_TYPES.INFO);
    res.status(200).json({status: constants.APIResponseStatus.Success,data: {statusList: terminationStatusList}});
    } 
    catch (error) {
    websocketHandler.sendLog(req,`Error fetching termination statuses: ${error.message}`,constants.LOG_TYPES.ERROR);
    res.status(500).json({ error: req.t('common.serverError') });
    }
  });


  exports.getResignationStatusList = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getResignationStatusList', constants.LOG_TYPES.INFO);
  
    try {
      const resignationStatusList = constants.Resignation_Status;
  
      websocketHandler.sendLog(req,`Retrieved ${resignationStatusList.length} resignation statuses`,constants.LOG_TYPES.INFO);
  
      res.status(200).json({status: constants.APIResponseStatus.Success,
        data: {
          statusList: resignationStatusList
        }
      });
    } catch (error) {
      websocketHandler.sendLog(req,`Error fetching resignation statuses: ${error.message}`,constants.LOG_TYPES.ERROR);  
      res.status(500).json({ error: req.t('common.serverError') });
    }
  });
  exports.getTerminationAppealStatusList = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getTerminationAppealStatusList', constants.LOG_TYPES.INFO);
  
    try {
      const appealStatusList = constants.Termination_Appealed_status;
      websocketHandler.sendLog(req, `Retrieved ${Object.keys(appealStatusList).length} appeal statuses`, constants.LOG_TYPES.INFO);
      
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: { appealStatusList }
      });
    } catch (error) {
      websocketHandler.sendLog(req, `Error fetching appeal statuses: ${error.message}`, constants.LOG_TYPES.ERROR);
      
      res.status(500).json({ error: req.t('common.serverError') });
    }
  });
  
// Get Country List
 exports.getCountryList = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getCountryList', constants.LOG_TYPES.INFO); 
    const countryList = await Country.find({}).all();  
    websocketHandler.sendLog(req, `Retrieved ${countryList.length} countries`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        countryList: countryList
      }
    });  
  });

 // Save Country
  exports.saveCoutry = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting saveCoutry', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving country with name: ${req.body.countryName}`, constants.LOG_TYPES.TRACE);
    const newCountry = await Country.create({      
        countryName:req.body.countryName,
        Code:req.body.countryName
    });  
    websocketHandler.sendLog(req, `Country saved: ${newCountry._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        Country:newCountry
      }
    }); 
  });

  exports.getTaskStatusList = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getTaskStatusList', constants.LOG_TYPES.INFO);
    const statusList = await TaskStatus.find({}).where('company').equals(req.cookies.companyId);  
    websocketHandler.sendLog(req, `Retrieved ${statusList.length} task statuses for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        statusList: statusList
      }
    });  
  });
  exports.updateTaskStatus = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting updateTaskStatus', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating task status with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const id = req.params.id;
    const updatedTaskStatus = req.body;
    updatedTaskStatus.updatedOn= new Date();
    updatedTaskStatus.updatedBy= req.cookies.userId;
    // Logic to update an existing email template
     TaskStatus.findByIdAndUpdate(id, updatedTaskStatus, { new: true })
      .then((updatedTaskStatus) => {
        websocketHandler.sendLog(req, `Task status updated: ${updatedTaskStatus._id}`, constants.LOG_TYPES.INFO);
        res.status(200).json(updatedTaskStatus);
      })
      .catch((error) => {
        websocketHandler.sendLog(req, `Error updating task status: ${error.message}`, constants.LOG_TYPES.ERROR);
        res.status(500).json({ error: req.t('common.serverError') });
      }); 
    });
  
  exports.saveTaskStatus = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting saveTaskStatus', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving task status: ${req.body.status} for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
    const newtaskStatus = await TaskStatus.create({      
        status:req.body.status,
        company:req.cookies.companyId
    });  
    websocketHandler.sendLog(req, `Task status saved: ${newtaskStatus._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        TaskStatus:newtaskStatus
      }
    }); 
  });
  exports.deleteTaskStatus = catchAsync(async (req, res, next) => {  
    websocketHandler.sendLog(req, 'Starting deleteTaskStatus', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Deleting task status with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const document = await TaskStatus.findByIdAndDelete(req.params.id);
    if (!document) {
      websocketHandler.sendLog(req, `Task status not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.notFound'), 404));
    }
    websocketHandler.sendLog(req, `Task status deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  
  exports.getTaskStatusById = catchAsync(async (req, res, next) => {       
    websocketHandler.sendLog(req, 'Starting getTaskStatusById', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching task status with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const taskStatus = await TaskStatus.find({}).where('_id').equals(req.params.id);   
    if (!taskStatus) {
      websocketHandler.sendLog(req, `Task status not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.taskStatusNotFound'), 403));
    }  
    websocketHandler.sendLog(req, `Task status retrieved: ${taskStatus[0]?._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: taskStatus
    });  
   });
  

  exports.getTaskPriorityList = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getTaskPriorityList', constants.LOG_TYPES.INFO);
    const priorityList = await TaskPriority.find({}).where('company').equals(req.cookies.companyId);  
    websocketHandler.sendLog(req, `Retrieved ${priorityList.length} task priorities for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        priorityList: priorityList
      }
    });  
  });
  exports.saveTaskPriority = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting saveTaskPriority', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving task priority: ${req.body.priority} for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
    const newTaskPriority = await TaskPriority.create({      
        priority:req.body.priority,
        company:req.cookies.companyId
    });  
    websocketHandler.sendLog(req, `Task priority saved: ${newTaskPriority._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        TaskPriority:newTaskPriority
      }
    }); 
  });
  exports.updateTaskPriority = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting updateTaskPriority', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating task priority with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const id = req.params.id;
    const updatedTaskPriority = req.body;
    updatedTaskPriority.updatedOn= new Date();
    updatedTaskPriority.updatedBy= req.cookies.userId;
    // Logic to update an existing email template
    TaskPriority.findByIdAndUpdate(id, updatedTaskPriority, { new: true })
      .then((updatedTaskPriority) => {
        websocketHandler.sendLog(req, `Task priority updated: ${updatedTaskPriority._id}`, constants.LOG_TYPES.INFO);
        res.status(200).json(updatedTaskPriority);
      })
      .catch((error) => {
        websocketHandler.sendLog(req, `Error updating task priority: ${error.message}`, constants.LOG_TYPES.ERROR);
        res.status(500).json({ error: req.t('common.serverError') });
      }); 
    });
  
  exports.deleteTaskPriority = catchAsync(async (req, res, next) => {  
    websocketHandler.sendLog(req, 'Starting deleteTaskPriority', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Deleting task priority with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const document = await TaskPriority.findByIdAndDelete(req.params.id);
    if (!document) {
      websocketHandler.sendLog(req, `Task priority not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.notFound'), 404));
    }
    websocketHandler.sendLog(req, `Task priority deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  exports.getTaskPriorityById = catchAsync(async (req, res, next) => {       
    websocketHandler.sendLog(req, 'Starting getTaskPriorityById', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching task priority with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const taskPriority = await TaskPriority.find({}).where('_id').equals(req.params.id);   
    if (!taskPriority) {
      websocketHandler.sendLog(req, `Task priority not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.taskPriorityNotFound'), 403));
    }  
    websocketHandler.sendLog(req, `Task priority retrieved: ${taskPriority[0]?._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: taskPriority
    });  
   })
  exports.getRoleByName = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getRoleByName', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching role with name: ${req.body.roleName}`, constants.LOG_TYPES.TRACE);
    const role = await Role.find({}).where('roleName').equals(req.body.roleName);  
    websocketHandler.sendLog(req, `Retrieved ${role.length} roles`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        role: role
      }
    });  
  });
  // Save Permission List
  exports.getPermissionList = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getPermissionList', constants.LOG_TYPES.INFO);
    const permissionList = await Permission.find({}).all();  
    websocketHandler.sendLog(req, `Retrieved ${permissionList.length} permissions`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        permissionList: permissionList
      }
    });  
  });

  // Save Permission
  exports.savePermission = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting savePermission', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving permission: ${req.body.permissionName}`, constants.LOG_TYPES.TRACE);
    const { permissionName, permissionDetails, resource, action, uiElement, parentPermission } = req.body;

    const permission = new Permission({
      permissionName,
      permissionDetails,
      resource,
      action,
      uiElement,
      parentPermission: parentPermission === '' ? null : parentPermission,
    });
    await permission.save();

    websocketHandler.sendLog(req, `Permission saved: ${permission._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        Permission:permission
      }
    }); 
  });
  exports.deletePermission = catchAsync(async (req, res, next) => {  
    websocketHandler.sendLog(req, 'Starting deletePermission', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Deleting permission with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const document = await Permission.findByIdAndDelete(req.params.id);
    if (!document) {
      websocketHandler.sendLog(req, `Permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.notFound'), 404));
    }
    websocketHandler.sendLog(req, `Permission deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  

  exports.updatePermission = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting updatePermission', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating permission: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
    const { permissionName, permissionDetails, resource, action, uiElement, parentPermission } = req.body;
  
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      websocketHandler.sendLog(req, `Permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({
        status: constants.APIResponseStatus.Fail,
        message: 'Permission not found',
      });
    }
  
    permission.permissionName = permissionName ?? permission.permissionName;
    permission.permissionDetails = permissionDetails ?? permission.permissionDetails;
    permission.resource = resource ?? permission.resource;
    permission.action = action ?? permission.action;
    permission.uiElement = uiElement ?? permission.uiElement;
    permission.parentPermission = parentPermission === '' ? null : parentPermission; //parentPermission ?? permission.parentPermission;
  
    await permission.save();
  
    websocketHandler.sendLog(req, `Permission updated: ${permission._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        Permission: permission
      }
    });
  });
  
  exports.getPermission = catchAsync(async (req, res, next) => {       
    websocketHandler.sendLog(req, 'Starting getPermission', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching permission with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const permission = await Permission.find({}).where('_id').equals(req.params.id);   
    if (!permission) {
      websocketHandler.sendLog(req, `Permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.permissionNotFound'), 403));
    }  
    websocketHandler.sendLog(req, `Permission retrieved: ${permission[0]?._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: permission
    });  
   });
  
  // Get RolePermission List
  exports.getRolePermsList = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getRolePermsList', constants.LOG_TYPES.INFO);
    const rolePermsList = await RolePerms.find({}).all();  
    websocketHandler.sendLog(req, `Retrieved ${rolePermsList.length} role permissions`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        rolePermsList: rolePermsList
      }
    });  
  });

  // Save New RolePermission
  exports.saveRolePermission = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting saveRolePermission', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving role permission for role: ${req.body.role}`, constants.LOG_TYPES.TRACE);
    
    const newRolePerms = await RolePerms.create({      
      perms:req.body.perms,
      permission:req.body.permission,
      role:req.body.role
    });  
    websocketHandler.sendLog(req, `Role permission saved: ${newRolePerms._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        RolePerms:newRolePerms
      }
    }); 
  });

  exports.getRolePermsByRole = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getRolePermsByRole', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching role permissions for role: ${req.body.role}`, constants.LOG_TYPES.TRACE);
    const rolePerms = await RolePerms.find({}).where('role').equals(req.body.role);  
    websocketHandler.sendLog(req, `Retrieved ${rolePerms.length} role permissions`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        rolePerms: rolePerms
      }
    });  
  });

  //Country region
  exports.getCountries = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getCountries', constants.LOG_TYPES.INFO);
    const countries = await Country.find({});  
    websocketHandler.sendLog(req, `Retrieved ${countries.length} countries`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:countries 
    });  
  });

  exports.saveCountry = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting saveCountry', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving country: ${req.body.Name}`, constants.LOG_TYPES.TRACE);
    const newCountry = await Country.create({      
      Name:req.body.Name,
      Code:req.body.Code      
    });
    websocketHandler.sendLog(req, `Country saved: ${newCountry._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:newCountry 
    });  
  });

  exports.addEmailTemplate = catchAsync(async (req, res, next) => {           
    websocketHandler.sendLog(req, 'Starting addEmailTemplate', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Adding email template for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
    
    const newEmailTemplate = req.body;
    newEmailTemplate.createdOn = new Date();
    newEmailTemplate.updatedOn = new Date();
    newEmailTemplate.createdBy = req.cookies.userId;
    newEmailTemplate.updatedBy = req.cookies.userId;
    newEmailTemplate.company = req.cookies.companyId;
    newEmailTemplate.isDelete=true;
    const result = await EmailTemplate.create(newEmailTemplate);
    websocketHandler.sendLog(req, `Email template saved: ${result._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:result 
    });  
  });
  
  exports.changeEmailTemplatesStatus = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting changeEmailTemplatesStatus', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Changing status of email template with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const id = req.params.id;
    const updatedTemplate = req.body;
    updatedTemplate.updatedOn= new Date();
    updatedTemplate.updatedBy= req.cookies.userId;
    // Logic to update an existing email template
     EmailTemplate.findByIdAndUpdate(id, updatedTemplate, { new: true })
      .then((updatedTemplate) => {
        websocketHandler.sendLog(req, `Email template status updated: ${updatedTemplate._id}`, constants.LOG_TYPES.INFO);
        res.status(200).json(updatedTemplate);
      })
      .catch((error) => {
        websocketHandler.sendLog(req, `Error updating email template status: ${error.message}`, constants.LOG_TYPES.ERROR);
        res.status(500).json({ error: req.t('common.serverError') });
      }); 
  });

  exports.updateEmailTemplate = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting updateEmailTemplate', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating email template with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const id = req.params.id;
  const updatedTemplate = req.body;
  updatedTemplate.updatedOn= new Date();
  updatedTemplate.updatedBy= req.cookies.userId;
  // Logic to update an existing email template
   EmailTemplate.findByIdAndUpdate(id, updatedTemplate, { new: true })
    .then((updatedTemplate) => {
      websocketHandler.sendLog(req, `Email template updated: ${updatedTemplate._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json(updatedTemplate);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error updating email template: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(500).json({ error: req.t('common.serverError') });
    }); 
  });

  exports.deleteEmailTemplate = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting deleteEmailTemplate', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Deleting email template with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    const id = req.params.id;
    const emailTemplate = await EmailTemplate.find({ _id: req.params.id, isDelete: true });    
    if (!emailTemplate) {   
    // Logic to delete an email template
    EmailTemplate.findByIdAndRemove(id)
      .then(() => {
        websocketHandler.sendLog(req, `Email template deleted: ${id}`, constants.LOG_TYPES.INFO);
        res.sendStatus(204);
      })
      .catch((error) => {
        websocketHandler.sendLog(req, `Error deleting email template: ${error.message}`, constants.LOG_TYPES.ERROR);
        res.status(500).json({ error: req.t('common.serverError') });
      });   
    } 
    
    else
    {
      websocketHandler.sendLog(req, `Cannot delete system-defined template: ${id}`, constants.LOG_TYPES.ERROR);
      res.status(200).json({
        status: 'Not Authorized',
        data: req.t('common.systemTemplateDeleteNotAllowed') 
      });       
    }
  });

  exports.getEmailTemplateById = catchAsync(async (req, res, next) => {        
    websocketHandler.sendLog(req, 'Starting getEmailTemplateById', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching email template with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
    
    try {     
      const emailTemplate = await EmailTemplate.find({}).where('_id').equals(req.params.id); 
      if (!emailTemplate) {
        websocketHandler.sendLog(req, `Email template not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
        return res.status(404).json({ error: req.t('common.emailTemplateNotFound') });
      }   
      websocketHandler.sendLog(req, `Email template retrieved: ${emailTemplate[0]?._id}`, constants.LOG_TYPES.INFO);
        res.status(200).json(emailTemplate);
    } catch (error) {
      websocketHandler.sendLog(req, `Error fetching email template: ${error.message}`, constants.LOG_TYPES.ERROR);
     res.status(500).json({ error: req.t('common.serverError') });
    }
    
  });

  exports.getAllEmailTemplates = catchAsync(async (req, res, next) => {           
    websocketHandler.sendLog(req, 'Starting getAllEmailTemplates', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching email templates for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
    try {
      const { companyId } = req.cookies.companyId;    
      const emailTemplates = await EmailTemplate.find({}).where('company').equals(req.cookies.companyId);  
      websocketHandler.sendLog(req, `Retrieved ${emailTemplates.length} email templates`, constants.LOG_TYPES.INFO);
      res.status(200).json(emailTemplates);
    } catch (error) {
      websocketHandler.sendLog(req, `Error fetching email templates: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(500).json({ error: req.t('common.serverError') });
    }
  });

  exports.saveUserUiState = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting saveUserUiState', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Saving UI state for user: ${req.cookies.userId}, key: ${req.body.key}`, constants.LOG_TYPES.TRACE);
    const { key, value } = req.body;
    const  user= req.cookies.userId;    
    try {
      let state = await UserState.findOneAndUpdate(
        { user, key },
        { value },
        { upsert: true, new: true }
      );
      websocketHandler.sendLog(req, `UI state saved for user: ${user}`, constants.LOG_TYPES.INFO);
  
      res.status(200).json(state);
    } catch (error) {
      websocketHandler.sendLog(req, `Error saving UI state: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(500).json({ error: req.t('common.serverError') });
    }  
  });
  exports.getUserUiState = catchAsync(async (req, res, next) => {    
    websocketHandler.sendLog(req, 'Starting getUserUiState', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching UI state for user: ${req.cookies.userId}, key: ${req.params.key}`, constants.LOG_TYPES.TRACE);
    const key = req.params.key;        
    try {
      let state = await UserState.where({ user: req.cookies.userId, key }).findOne();
        if(!state){
          websocketHandler.sendLog(req, `UI state not found for key: ${key}`, constants.LOG_TYPES.ERROR);
          next(new AppError(req.t('common.userStateNotFound'), 404));
        }
      websocketHandler.sendLog(req, `UI state retrieved for user: ${req.cookies.userId}`, constants.LOG_TYPES.INFO);
      res.status(200).json(state);
    } catch (error) {
      websocketHandler.sendLog(req, `Error fetching UI state: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(500).json({ error: req.t('common.serverError') });
    }  
  });

  
  //End Country region
  


  exports.createIncomeTaxSection = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting createIncomeTaxSection', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Creating income tax section for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
     // Extract companyId from req.cookies
      const companyId = req.cookies.companyId;
      // Check if companyId exists in cookies
      if (!companyId) {
        websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
        return next(new AppError(req.t('common.companyIdMissing'), 400));
      }
      req.body.company=companyId;
      const incomeTaxSection = await IncomeTaxSection.create(req.body);
      websocketHandler.sendLog(req, `Income tax section created: ${incomeTaxSection._id}`, constants.LOG_TYPES.INFO);
      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.getIncomeTaxSectionsByCompany = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getIncomeTaxSectionsByCompany', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching income tax sections for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
      const incomeTaxSections = await IncomeTaxSection.find({ company: req.cookies.companyId });
      if (!incomeTaxSections.length) {
        websocketHandler.sendLog(req, `No income tax sections found for company: ${req.cookies.companyId}`, constants.LOG_TYPES.ERROR);
          return next(new AppError(req.t('common.incomeTaxSectionsNotFound'), 404));
      }
      websocketHandler.sendLog(req, `Retrieved ${incomeTaxSections.length} income tax sections`, constants.LOG_TYPES.INFO);
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSections
      });
  });
  
  exports.updateIncomeTaxSection = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting updateIncomeTaxSection', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Updating income tax section with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
      const incomeTaxSection = await IncomeTaxSection.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
      });
      if (!incomeTaxSection) {
        websocketHandler.sendLog(req, `Income tax section not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
          return next(new AppError(req.t('common.incomeTaxSectionNotFound'), 404));
      }
      websocketHandler.sendLog(req, `Income tax section updated: ${incomeTaxSection._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.getIncomeTaxSectionById = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getIncomeTaxSectionById', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Fetching income tax section with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
      const incomeTaxSection = await IncomeTaxSection.findById(req.params.id);
      if (!incomeTaxSection) {
        websocketHandler.sendLog(req, `Income tax section not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
          return next(new AppError(req.t('common.incomeTaxSectionNotFound'), 404));
      }
      websocketHandler.sendLog(req, `Income tax section retrieved: ${incomeTaxSection._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.deleteIncomeTaxSection = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting deleteIncomeTaxSection', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Deleting income tax section with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
      const incomeTaxSection = await IncomeTaxSection.findByIdAndDelete(req.params.id);
      if (!incomeTaxSection) {
        websocketHandler.sendLog(req, `Income tax section not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
          return next(new AppError(req.t('common.incomeTaxSectionNotFound'), 404));
      }
      websocketHandler.sendLog(req, `Income tax section deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
      res.status(204).json({
          status: constants.APIResponseStatus.Success,
          data: null
      });
  });
  
  
exports.createIncomeTaxComponant = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createIncomeTaxComponant', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Creating income tax component for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const companyId = req.cookies.companyId;
  req.body.company = companyId;
  const incomeTaxComponant = await IncomeTaxComponant.create(req.body);
  websocketHandler.sendLog(req, `Income tax component created: ${incomeTaxComponant._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.getIncomeTaxComponant = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getIncomeTaxComponant', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching income tax component with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const incomeTaxComponant = await IncomeTaxComponant.findById(req.params.id);
  if (!incomeTaxComponant) {
    websocketHandler.sendLog(req, `Income tax component not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.incomeTaxComponantNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Income tax component retrieved: ${incomeTaxComponant._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.updateIncomeTaxComponant = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateIncomeTaxComponant', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating income tax component with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!incomeTaxComponant) {
    websocketHandler.sendLog(req, `Income tax component not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.incomeTaxComponantNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Income tax component updated: ${incomeTaxComponant._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.deleteIncomeTaxComponant = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteIncomeTaxComponant', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting income tax component with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndDelete(req.params.id);
;
  if (!incomeTaxComponant) {
    websocketHandler.sendLog(req, `Income tax component not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.incomeTaxComponantNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Income tax component deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getIncomeTaxComponantsByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getIncomeTaxComponantsByCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching income tax components for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 0;
  const totalCount = await IncomeTaxComponant.countDocuments({ company:  req.cookies.companyId });  
  let incomeTaxComponants;
  if (limit > 0) {
    incomeTaxComponants = await IncomeTaxComponant.find({ company: req.cookies.companyId })
      .skip(skip)
      .limit(limit);
  } else {
    incomeTaxComponants = await IncomeTaxComponant.find({ company: req.cookies.companyId });
  }
  websocketHandler.sendLog(req, `Retrieved ${incomeTaxComponants.length} income tax components, total: ${totalCount}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponants,
    total: totalCount
  });
});

exports.getGoogleApiKey = catchAsync(
  async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getGoogleApiKey', constants.LOG_TYPES.INFO);
  try {
    websocketHandler.sendLog(req, 'Google API key retrieved successfully', constants.LOG_TYPES.INFO);
    res.status(200).json({
      status:constants.APIResponseStatus.Success,
      data: process.env.GOOGLE_API_KEY,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error retrieving Google API key: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.setSelectedUserForLogging = catchAsync(
  async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting setSelectedUserForLogging', constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, `Setting selected user for logging: ${req.body.userId}`, constants.LOG_TYPES.TRACE);
  try {    
    globalStore.selectedUserForLogging = req.body.userId;       
    websocketHandler.sendLog(req, `Selected user for logging set: ${req.body.userId}`, constants.LOG_TYPES.INFO);
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: globalStore.selectedUserForLogging,
      });    
  } catch (error) {
    websocketHandler.sendLog(req, `Error setting selected user: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.setLogLevels = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting setLogLevels', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Setting log levels: ${JSON.stringify(req.body.logLevels)}`, constants.LOG_TYPES.TRACE);
  try {
    if (!Array.isArray(req.body.logLevels)) {
      websocketHandler.sendLog(req, 'Invalid logLevels: not an array', constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('common.invalidLogLevels'),
      });
    }

    globalStore.logLevels = req.body.logLevels; // Update log levels
    websocketHandler.sendLog(req, `Log levels set successfully`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: globalStore.logLevels,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error setting log levels: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.serverError'),
    });
  }
});

exports.getLogLevels = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLogLevels', constants.LOG_TYPES.INFO);
  try {
    websocketHandler.sendLog(req, `Retrieved log levels: ${JSON.stringify(globalStore.logLevels || [])}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: globalStore.logLevels || [],
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error retrieving log levels: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.serverError'),
    });
  }
});


exports.getSelectedUserForLogging = catchAsync(
  async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getSelectedUserForLogging', constants.LOG_TYPES.INFO);
  try {
    websocketHandler.sendLog(req, `Retrieved selected user for logging: ${globalStore.selectedUserForLogging || 'none'}`, constants.LOG_TYPES.INFO);
    
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: globalStore.selectedUserForLogging,
    }); 
  } catch (error) {
    websocketHandler.sendLog(req, `Error retrieving selected user: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.testLog = catchAsync(
  async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting testLog', constants.LOG_TYPES.INFO);
  try {    
    websocketHandler.sendLog(req, 'User performed an action: INFO',logType = constants.LOG_TYPES.INFO);
    websocketHandler.sendLog(req, 'User performed an action: TRACE',logType = constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, 'User performed an action: DEBUG',logType = constants.LOG_TYPES.DEBUG);
    websocketHandler.sendLog(req, 'User performed an action: WARN',logType = constants.LOG_TYPES.WARN);
    websocketHandler.sendLog(req, 'User performed an action: ERROR',logType = constants.LOG_TYPES.ERROR);
    websocketHandler.sendLog(req, 'User performed an action: FATAL',logType = constants.LOG_TYPES.FATAL);
    websocketHandler.sendLog(req, 'Test log completed successfully', constants.LOG_TYPES.INFO);
    
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: req.t('common.testLogSuccess'),
    }); 
  } catch (error) {
    websocketHandler.sendLog(req, `Error in test log: ${error.message}`, constants.LOG_TYPES.ERROR);
    return res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: req.t('common.serverError'),
    });
  }
});

exports.updateOnlineStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateOnlineStatus', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating online status for user: ${req.body.userId}, machine: ${req.body.machineId}`, constants.LOG_TYPES.TRACE);
  try {
    console.log(`[${new Date().toISOString()}] Starting updateOnlineStatus for request:`, {
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies
    });

    const { userId, machineId, isOnline, project, task } = req.body;
    const companyId = req.cookies.companyId;

    console.log(`[${new Date().toISOString()}] Extracted values - userId: ${userId}, machineId: ${machineId}, isOnline: ${isOnline}, project: ${project}, task: ${task}, companyId: ${companyId}`);

    if (!userId || !machineId || typeof isOnline !== 'boolean') {
      console.log(`[${new Date().toISOString()}] Validation failed: Missing or invalid required fields`);
      websocketHandler.sendLog(req, 'Validation failed: missing or invalid fields', constants.LOG_TYPES.ERROR);
      throw new Error(req.t('common.requiredFieldsMissing'));
    }

    if (!companyId) {
      console.log(`[${new Date().toISOString()}] Validation failed: companyId missing in cookies`);
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      throw new Error(req.t('common.companyIdMissing'));
    }

    console.log(`[${new Date().toISOString()}] Querying database for userId: ${userId}, machineId: ${machineId}`);
    const updateData = {
      isOnline,
      $setOnInsert: { company: companyId }
    };

    // Include project and task if provided in the request
    if (project) updateData.project = project;
    if (task) updateData.task = task;

    const userDevice = await UserDevice.findOneAndUpdate(
      { userId, machineId },
      updateData,
      { upsert: true, new: true }
    );

    console.log(`[${new Date().toISOString()}] Database operation completed. Result:`, {
      userId: userDevice.userId,
      machineId: userDevice.machineId,
      isOnline: userDevice.isOnline,
      project: userDevice.project?.toString(),
      task: userDevice.task?.toString(),
      company: userDevice.company?.toString(),
      wasInserted: !userDevice.__v
    });
    websocketHandler.sendLog(req, `Online status updated for user: ${userId}, machine: ${machineId}`, constants.LOG_TYPES.INFO);

    // Send WebSocket message only to the affected user
    const messageContent = JSON.stringify({ userId, isOnline, project, task });
    websocketHandler.sendAlert(
      [userId], // Only send to this user
      messageContent
    );
    console.log(`[${new Date().toISOString()}] WebSocket message sent to user ${userId}`);

    const response = {
      status: constants.APIResponseStatus.Success,
      data: { userDevice }
    };
    console.log(`[${new Date().toISOString()}] Sending success response:`, response);

    return res.status(200).json(response);
  } catch (error) {
    console.log(`[${new Date().toISOString()}] Error occurred in updateOnlineStatus:`, {
      message: error.message,
      stack: error.stack
    });
    websocketHandler.sendLog(req, `Error updating online status: ${error.message}`, constants.LOG_TYPES.ERROR);

    const errorResponse = {
      status: constants.APIResponseStatus.Failure,
      data: error.message
    };
    console.log(`[${new Date().toISOString()}] Sending failure response:`, errorResponse);

    return res.status(200).json(errorResponse);
  }
});

exports.getOnlineUsersByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getOnlineUsersByCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching online users for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  try {
      const companyId = req.cookies.companyId;

      if (!companyId) {
        websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
          throw new Error(req.t('common.companyIdMissing'));
      }

      const onlineUsers = await UserDevice.find({
          company: companyId,
          isOnline: true
      }).select('userId machineId isOnline company');

      websocketHandler.sendLog(req, `Retrieved ${onlineUsers.length} online users for company ${companyId}`, constants.LOG_TYPES.INFO);

      return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: { onlineUsers }
      });
  } catch (error) {
    websocketHandler.sendLog(req, `Error retrieving online users: ${error.message}`, constants.LOG_TYPES.ERROR);
      return res.status(200).json({
          status: constants.APIResponseStatus.Failure,
          data: error.message
      });
  }
});

exports.getPayrollStatusList = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getPayrollStatusList', constants.LOG_TYPES.INFO);

  try {
    const payrollStatusList = constants.Payroll_FNF;
console.log('status list: ', payrollStatusList);
    websocketHandler.sendLog(req,`Retrieved ${payrollStatusList.length} payroll statuses`,constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:  payrollStatusList
      
    });
  } catch (error) {
    websocketHandler.sendLog(req,`Error fetching payroll statuses: ${error.message}`,constants.LOG_TYPES.ERROR);  
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: error.message
    });
  }
});

exports.getFNFUserStatusList = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getFNFUserStatusList', constants.LOG_TYPES.INFO);

  try {
    const fnfUserStatusList = constants.Payroll_User_FNF;

    websocketHandler.sendLog(req, `Retrieved ${fnfUserStatusList.length} FNFUser statuses`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        statusList: fnfUserStatusList
      }
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching fnfUser statuses: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
});

