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
const  websocketHandler  = require('../utils/websocketHandler');
const UserDevice = require('../models/commons/userDeviceModel');
// Get Country List
 exports.getCountryList = catchAsync(async (req, res, next) => {    
    const countryList = await Country.find({}).all();  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: {
        Country:newCountry
      }
    }); 
  });

  exports.getTaskStatusList = catchAsync(async (req, res, next) => {    
    const statusList = await TaskStatus.find({}).where('company').equals(req.cookies.companyId);  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  
  exports.getTaskStatusById = catchAsync(async (req, res, next) => {       
    const taskStatus = await TaskStatus.find({}).where('_id').equals(req.params.id);   
    if (!taskStatus) {
      return next(new AppError('No Task Status found', 403));
    }  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: taskStatus
    });  
   });
  

  exports.getTaskPriorityList = catchAsync(async (req, res, next) => {    
    const priorityList = await TaskPriority.find({}).where('company').equals(req.cookies.companyId);  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  exports.getTaskPriorityById = catchAsync(async (req, res, next) => {       
    const taskPriority = await TaskPriority.find({}).where('_id').equals(req.params.id);   
    if (!taskPriority) {
      return next(new AppError('No Task Status found', 403));
    }  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: taskPriority
    });  
   })
  exports.getRoleByName = catchAsync(async (req, res, next) => {    
    const role = await Role.find({}).where('roleName').equals(req.body.roleName);  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        role: role
      }
    });  
  });
  // Save Permission List
  exports.getPermissionList = catchAsync(async (req, res, next) => {    
    const permissionList = await Permission.find({}).all();  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: permission
    });  
   });
  
  // Get RolePermission List
  exports.getRolePermsList = catchAsync(async (req, res, next) => {    
    const rolePermsList = await RolePerms.find({}).all();  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: {
        RolePerms:newRolePerms
      }
    }); 
  });

  exports.getRolePermsByRole = catchAsync(async (req, res, next) => {    
    const rolePerms = await RolePerms.find({}).where('role').equals(req.body.role);  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        rolePerms: rolePerms
      }
    });  
  });

  //Country region
  exports.getCountries = catchAsync(async (req, res, next) => {    
    const countries = await Country.find({});  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:countries 
    });  
  });

  exports.saveCountry = catchAsync(async (req, res, next) => {        
    const newCountry = await Country.create({      
      Name:req.body.Name,
      Code:req.body.Code      
    });
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
    newEmailTemplate.isDelete=true;
    const result = await EmailTemplate.create(newEmailTemplate);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data:result 
    });  
  });
  
  exports.changeEmailTemplatesStatus = catchAsync(async (req, res, next) => {        
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
    const emailTemplate = await EmailTemplate.find({ _id: req.params.id, isDelete: true });    
    if (!emailTemplate) {   
    // Logic to delete an email template
    EmailTemplate.findByIdAndRemove(id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });   
    } 
    
    else
    {
      res.status(200).json({
        status: 'Not Authorized',
        data:"System Defined template, User can't delete" 
      });       
    }
  });

  exports.getEmailTemplateById = catchAsync(async (req, res, next) => {        
    
    try {     
      const emailTemplate = await EmailTemplate.find({}).where('_id').equals(req.params.id); 
      if (!emailTemplate) {
        return res.status(404).json({ error: 'Email template not found' });
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
      res.status(200).json(emailTemplates);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  exports.saveUserUiState = catchAsync(async (req, res, next) => {
    const { key, value } = req.body;
    const  user= req.cookies.userId;    
    try {
      let state = await UserState.findOneAndUpdate(
        { user, key },
        { value },
        { upsert: true, new: true }
      );
  
      res.status(200).json(state);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }  
  });
  exports.getUserUiState = catchAsync(async (req, res, next) => {    
    const key = req.params.key;        
    try {
      let state = await UserState.where({ user: req.cookies.userId, key }).findOne();
        if(!state){
          next(new AppError("No user state found with that key", 404));
        }
      res.status(200).json(state);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }  
  });

  
  //End Country region
  


  exports.createIncomeTaxSection = catchAsync(async (req, res, next) => {
     // Extract companyId from req.cookies
      const companyId = req.cookies.companyId;
      // Check if companyId exists in cookies
      if (!companyId) {
        return next(new AppError('Company ID not found in cookies', 400));
      }
      req.body.company=companyId;
      const incomeTaxSection = await IncomeTaxSection.create(req.body);
      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.getIncomeTaxSectionsByCompany = catchAsync(async (req, res, next) => {
      const incomeTaxSections = await IncomeTaxSection.find({ company: req.cookies.companyId });
      if (!incomeTaxSections.length) {
          return next(new AppError('IncomeTaxSections not found for the given company', 404));
      }
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSections
      });
  });
  
  exports.updateIncomeTaxSection = catchAsync(async (req, res, next) => {
      const incomeTaxSection = await IncomeTaxSection.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
      });
      if (!incomeTaxSection) {
          return next(new AppError('IncomeTaxSection not found', 404));
      }
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.getIncomeTaxSectionById = catchAsync(async (req, res, next) => {
      const incomeTaxSection = await IncomeTaxSection.findById(req.params.id);
      if (!incomeTaxSection) {
          return next(new AppError('IncomeTaxSection not found', 404));
      }
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: incomeTaxSection
      });
  });
  
  exports.deleteIncomeTaxSection = catchAsync(async (req, res, next) => {
      const incomeTaxSection = await IncomeTaxSection.findByIdAndDelete(req.params.id);
      if (!incomeTaxSection) {
          return next(new AppError('IncomeTaxSection not found', 404));
      }
      res.status(204).json({
          status: constants.APIResponseStatus.Success,
          data: null
      });
  });
  
  
exports.createIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  req.body.company = companyId;
  const incomeTaxComponant = await IncomeTaxComponant.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.getIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findById(req.params.id);
  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.updateIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponant
  });
});

exports.deleteIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndDelete(req.params.id);
;
  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getIncomeTaxComponantsByCompany = catchAsync(async (req, res, next) => {
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

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: incomeTaxComponants,
    total: totalCount
  });
});

exports.getGoogleApiKey = catchAsync(
  async (req, res, next) => {
  try {
    res.status(200).json({
      status:constants.APIResponseStatus.Success,
      data: process.env.GOOGLE_API_KEY,
    });
  } catch (error) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.setSelectedUserForLogging = catchAsync(
  async (req, res, next) => {
  try {    
    globalStore.selectedUserForLogging = req.body.userId;       
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: globalStore.selectedUserForLogging,
      });    
  } catch (error) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.getSelectedUserForLogging = catchAsync(
  async (req, res, next) => {
  try {
    
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: globalStore.selectedUserForLogging,
    }); 
  } catch (error) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: "",
    });
  }
});

exports.testLog = catchAsync(
  async (req, res, next) => {
  try {    
    websocketHandler.sendLog(req, 'User performed an action');
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {},
    }); 
  } catch (error) {
    return res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      data: error.message,
    });
  }
});

exports.updateOnlineStatus = catchAsync(async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Starting updateOnlineStatus for request:`, {
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies
    });

    const { userId, machineId, isOnline } = req.body;
    const companyId = req.cookies.companyId;

    console.log(`[${new Date().toISOString()}] Extracted values - userId: ${userId}, machineId: ${machineId}, isOnline: ${isOnline}, companyId: ${companyId}`);

    if (!userId || !machineId || typeof isOnline !== 'boolean') {
      console.log(`[${new Date().toISOString()}] Validation failed: Missing or invalid required fields`);
      throw new Error('userId, machineId, and isOnline are required');
    }

    if (!companyId) {
      console.log(`[${new Date().toISOString()}] Validation failed: companyId missing in cookies`);
      throw new Error('companyId is required in cookies');
    }

    console.log(`[${new Date().toISOString()}] Querying database for userId: ${userId}, machineId: ${machineId}`);
    const userDevice = await UserDevice.findOneAndUpdate(
      { userId, machineId },
      { 
        isOnline,
        $setOnInsert: { company: companyId }
      },
      { upsert: true, new: true }
    );

    console.log(`[${new Date().toISOString()}] Database operation completed. Result:`, {
      userId: userDevice.userId,
      machineId: userDevice.machineId,
      isOnline: userDevice.isOnline,
      company: userDevice.company?.toString(),
      wasInserted: !userDevice.__v
    });

    // Send WebSocket message only to the affected user
    const messageContent = JSON.stringify({ userId, isOnline });
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

    const errorResponse = {
      status: constants.APIResponseStatus.Failure,
      data: error.message
    };
    console.log(`[${new Date().toISOString()}] Sending failure response:`, errorResponse);

    return res.status(200).json(errorResponse);
  }
});

exports.getOnlineUsersByCompany = catchAsync(async (req, res, next) => {
  try {
      const companyId = req.cookies.companyId;

      if (!companyId) {
          throw new Error('companyId is required in cookies');
      }

      const onlineUsers = await UserDevice.find({
          company: companyId,
          isOnline: true
      }).select('userId machineId isOnline company');

      websocketHandler.sendLog(req, `Retrieved online users for company ${companyId}`);

      return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: { onlineUsers }
      });
  } catch (error) {
      return res.status(200).json({
          status: constants.APIResponseStatus.Failure,
          data: error.message
      });
  }
});


