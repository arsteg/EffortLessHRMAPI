const Country = require('../models/countryModel');
const Role = require('../models/permissions/roleModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Permission = require('../models/permissions/permissionModel');
const RolePerms = require('../models/rolePermsModel');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const TaskStatus = require('../models/commons/taskStatusModel');
const TaskPriority = require('../models/commons/taskPriorityModel');
const htmlToText = require('html-to-text').htmlToText;
 // Get Country List
 exports.getCountryList = catchAsync(async (req, res, next) => {    
    const countryList = await Country.find({}).all();  
    res.status(200).json({
      status: 'success',
      data: {
        countryList: countryList
      }
    });  
  });

 // Save Country
  exports.saveCoutry = catchAsync(async (req, res, next) => {
    const newCountry = await Country.create({      
        countryName:req.body.countryName,
        Code:req.body.countryName
    });  
    res.status(200).json({
      status: 'success',
      data: {
        Country:newCountry
      }
    }); 
  });

  exports.getTaskStatusList = catchAsync(async (req, res, next) => {    
    const statusList = await TaskStatus.find({}).where('company').equals(req.cookies.companyId);  
    res.status(200).json({
      status: 'success',
      data: {
        statusList: statusList
      }
    });  
  });
  exports.updateTaskStatus = catchAsync(async (req, res, next) => {        
    const id = req.params.id;
    const updatedTaskStatus = req.body;
    updatedTaskStatus.updatedOn= new Date();
    updatedTaskStatus.updatedBy= req.cookies.userId;
    // Logic to update an existing email template
     TaskStatus.findByIdAndUpdate(id, updatedTaskStatus, { new: true })
      .then((updatedTaskStatus) => {
        res.status(200).json(updatedTaskStatus);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      }); 
    });
  
  exports.saveTaskStatus = catchAsync(async (req, res, next) => {
    const newtaskStatus = await TaskStatus.create({      
        status:req.body.status,
        company:req.cookies.companyId
    });  
    res.status(200).json({
      status: 'success',
      data: {
        TaskStatus:newtaskStatus
      }
    }); 
  });
  exports.deleteTaskStatus = catchAsync(async (req, res, next) => {  
    const document = await TaskStatus.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.getTaskStatusById = catchAsync(async (req, res, next) => {       
    const taskStatus = await TaskStatus.find({}).where('_id').equals(req.params.id);   
    if (!taskStatus) {
      return next(new AppError('No Task Status found', 403));
    }  
    res.status(200).json({
      status: 'success',
      data: taskStatus
    });  
   });
  

  exports.getTaskPriorityList = catchAsync(async (req, res, next) => {    
    const priorityList = await TaskPriority.find({}).where('company').equals(req.cookies.companyId);  
    res.status(200).json({
      status: 'success',
      data: {
        priorityList: priorityList
      }
    });  
  });
  exports.saveTaskPriority = catchAsync(async (req, res, next) => {
    const newTaskPriority = await TaskPriority.create({      
        priority:req.body.priority,
        company:req.cookies.companyId
    });  
    res.status(200).json({
      status: 'success',
      data: {
        TaskPriority:newTaskPriority
      }
    }); 
  });
  exports.updateTaskPriority = catchAsync(async (req, res, next) => {        
    const id = req.params.id;
    const updatedTaskPriority = req.body;
    updatedTaskPriority.updatedOn= new Date();
    updatedTaskPriority.updatedBy= req.cookies.userId;
    // Logic to update an existing email template
    TaskPriority.findByIdAndUpdate(id, updatedTaskPriority, { new: true })
      .then((updatedTaskPriority) => {
        res.status(200).json(updatedTaskPriority);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      }); 
    });
  
  exports.deleteTaskPriority = catchAsync(async (req, res, next) => {  
    const document = await TaskPriority.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  exports.getTaskPriorityById = catchAsync(async (req, res, next) => {       
    const taskPriority = await TaskPriority.find({}).where('_id').equals(req.params.id);   
    if (!taskPriority) {
      return next(new AppError('No Task Status found', 403));
    }  
    res.status(200).json({
      status: 'success',
      data: taskPriority
    });  
   })
  exports.getRoleByName = catchAsync(async (req, res, next) => {    
    const role = await Role.find({}).where('roleName').equals(req.body.roleName);  
    res.status(200).json({
      status: 'success',
      data: {
        role: role
      }
    });  
  });
  // Save Permission List
  exports.getPermissionList = catchAsync(async (req, res, next) => {    
    const permissionList = await Permission.find({}).all();  
    res.status(200).json({
      status: 'success',
      data: {
        permissionList: permissionList
      }
    });  
  });

  // Save Permission
  exports.savePermission = catchAsync(async (req, res, next) => {
    const newPermission = await Permission.create({      
      permissionName:req.body.permissionName,
      permissionDetails:req.body.permissionDetails

    });  
    res.status(200).json({
      status: 'success',
      data: {
        Permission:newPermission
      }
    }); 
  });
  exports.deletePermission = catchAsync(async (req, res, next) => {  
    const document = await Permission.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.updatePermission = factory.updateOne(Permission);
  
  exports.getPermission = catchAsync(async (req, res, next) => {       
    const permission = await Permission.find({}).where('_id').equals(req.params.id);   
    if (!permission) {
      return next(new AppError('No permission found', 403));
    }  
    res.status(200).json({
      status: 'success',
      data: permission
    });  
   });
  
  // Get RolePermission List
  exports.getRolePermsList = catchAsync(async (req, res, next) => {    
    const rolePermsList = await RolePerms.find({}).all();  
    res.status(200).json({
      status: 'success',
      data: {
        rolePermsList: rolePermsList
      }
    });  
  });

  // Save New RolePermission
  exports.saveRolePermission = catchAsync(async (req, res, next) => {
    
    const newRolePerms = await RolePerms.create({      
      perms:req.body.perms,
      permission:req.body.permission,
      role:req.body.role
    });  
    res.status(200).json({
      status: 'success',
      data: {
        RolePerms:newRolePerms
      }
    }); 
  });

  exports.getRolePermsByRole = catchAsync(async (req, res, next) => {    
    const rolePerms = await RolePerms.find({}).where('role').equals(req.body.role);  
    res.status(200).json({
      status: 'success',
      data: {
        rolePerms: rolePerms
      }
    });  
  });

  //Country region
  exports.getCountries = catchAsync(async (req, res, next) => {    
    const countries = await Country.find({});  
    res.status(200).json({
      status: 'success',
      data:countries 
    });  
  });

  exports.saveCountry = catchAsync(async (req, res, next) => {        
    const newCountry = await Country.create({      
      Name:req.body.Name,
      Code:req.body.Code      
    });
    res.status(200).json({
      status: 'success',
      data:newCountry 
    });  
  });

  exports.addEmailTemplate = catchAsync(async (req, res, next) => {           
    
    const newEmailTemplate = req.body;
    newEmailTemplate.createdOn = new Date();
    newEmailTemplate.updatedOn = new Date();
    newEmailTemplate.createdBy = req.cookies.userId;
    newEmailTemplate.updatedBy = req.cookies.userId;
    newEmailTemplate.company = req.cookies.companyId;
    const result = await EmailTemplate.create(newEmailTemplate);
    res.status(200).json({
      status: 'success',
      data:result 
    });  
  });

  exports.updateEmailTemplate = catchAsync(async (req, res, next) => {        
  const id = req.params.id;
  const updatedTemplate = req.body;
  updatedTemplate.updatedOn= new Date();
  updatedTemplate.updatedBy= req.cookies.userId;
  // Logic to update an existing email template
   EmailTemplate.findByIdAndUpdate(id, updatedTemplate, { new: true })
    .then((updatedTemplate) => {
      res.status(200).json(updatedTemplate);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    }); 
  });

  exports.deleteEmailTemplate = catchAsync(async (req, res, next) => {        
    const id = req.params.id;
    // Logic to delete an email template
    EmailTemplate.findByIdAndRemove(id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });    
  });

  exports.getEmailTemplateById = catchAsync(async (req, res, next) => {        
    
    try {     
      const emailTemplate = await EmailTemplate.find({}).where('_id').equals(req.params.id); 
      if (!emailTemplate) {
        return res.status(404).json({ error: 'Email template not found' });
      }   
      else{
        const plainTextContent = emailTemplate[0].contentData;  
        emailTemplate[0].contentData = htmlToText(plainTextContent, {
          wordwrap: 130 // Set the desired word wrap length
        });
      }
       res.status(200).json(emailTemplate);
    } catch (error) {
     res.status(500).json({ error: 'Server error' });
    }
    
  });

  exports.getAllEmailTemplates = catchAsync(async (req, res, next) => {           
    try {
      const { companyId } = req.cookies.companyId;    
      const emailTemplates = await EmailTemplate.find({}).where('company').equals(req.cookies.companyId);  
      for(var i = 0; i < emailTemplates.length; i++) {
        const plainTextContent = emailTemplates[i].contentData;        
        emailTemplates[i].contentData = htmlToText(plainTextContent, {
          wordwrap: 130 // Set the desired word wrap length
        });
      }
      res.status(200).json(emailTemplates);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  //End Country region
  

