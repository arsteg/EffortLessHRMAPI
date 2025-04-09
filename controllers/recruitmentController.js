const Skill = require('../models/recruitment/skillModel');
const Role = require('../models/recruitment/roleModel');
const Industry = require('../models/recruitment/industryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');


//#region Skill region

exports.getSkill = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getSkill process', constants.LOG_TYPES.INFO);
  const skills = await Skill.find({}).all();  
  websocketHandler.sendLog(req, `Retrieved ${skills.length} skills`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getSkill process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: skills
  });    
});

exports.getAllSkills = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllSkills process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching skill with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const skills = await Skill.findById(req.params.id);   
  websocketHandler.sendLog(req, `Skill ${req.params.id} ${skills ? 'found' : 'not found'}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getAllSkills process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: skills
  });    
});

exports.createSkill = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting createSkill process', constants.LOG_TYPES.INFO);
  try {    
      websocketHandler.sendLog(req, `Creating new skill with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
      const newSkill = await Skill.create(req.body);
      websocketHandler.sendLog(req, `Successfully created skill with ID: ${newSkill._id}`, constants.LOG_TYPES.INFO);
      
      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: newSkill
      });
  } catch (err) {
      websocketHandler.sendLog(req, `Error creating skill: ${err.message}`, constants.LOG_TYPES.ERROR);
      res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: err
      });
  }    
};

exports.deleteSkill = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteSkill process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete skill with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const skill = await Skill.findByIdAndDelete(req.params.id);
  
  if (!skill) {
      websocketHandler.sendLog(req, `No skill found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.skillNotFound'), 404)
    );
  }
  
  websocketHandler.sendLog(req, `Successfully deleted skill with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
  });
});

// Note: There are two updateSkill functions in the original code. I'll handle both separately
exports.updateSkill = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateSkill process (version 1)', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating skill ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
  
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  
  if (!skill) {
      websocketHandler.sendLog(req, `No skill found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.skillNotFound'), 404)

    );
  }
  
  websocketHandler.sendLog(req, `Successfully updated skill ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: skill
  });
});

exports.updateSkill = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateSkill process (version 2)', constants.LOG_TYPES.INFO);
  
  const filteredBody = filterObj(req.body, 'Name');
  websocketHandler.sendLog(req, `Filtered update data: ${JSON.stringify(filteredBody)} for skill ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
  });

  if (!updatedSkill) {
      websocketHandler.sendLog(req, `No skill found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('No skill found with that ID', 404));
  }
  
  websocketHandler.sendLog(req, `Successfully updated skill ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: updatedSkill
  });
});

// Skill Role
exports.getRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRole process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching role with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const roles = await Role.findById(req.params.id);
  websocketHandler.sendLog(req, `Role ${req.params.id} ${roles ? 'found' : 'not found'}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getRole process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: roles
  });    
});

exports.getAllRoles = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllRoles process', constants.LOG_TYPES.INFO);
  const roles = await Role.find();   
  websocketHandler.sendLog(req, `Retrieved ${roles.length} roles`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getAllRoles process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: roles
  });    
});

exports.createRole = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting createRole process', constants.LOG_TYPES.INFO);
  try {        
      websocketHandler.sendLog(req, `Creating new role with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
      const newRole = await Role.create(req.body);
      websocketHandler.sendLog(req, `Successfully created role with ID: ${newRole._id}`, constants.LOG_TYPES.INFO);
      
      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: newRole
      });
  } catch (err) {
      websocketHandler.sendLog(req, `Error creating role: ${err.message}`, constants.LOG_TYPES.ERROR);
      res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: err
      });
  }    
};

exports.deleteRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteRole process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete role with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const role = await Role.findByIdAndDelete(req.params.id);
  
  if (!role) {
      websocketHandler.sendLog(req, `No role found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.roleNotFound'), 404)

    );
  }
  
  websocketHandler.sendLog(req, `Successfully deleted role with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateRole process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating role ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
  
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  
  if (!role) {
      websocketHandler.sendLog(req, `No role found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.roleNotFound'), 404)
    );
  }
  
  websocketHandler.sendLog(req, `Successfully updated role ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: role
  });
});

// Skill Industry
exports.getIndustry = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getIndustry process', constants.LOG_TYPES.INFO);
  const industries = await Industry.find({}).all();
  websocketHandler.sendLog(req, `Retrieved ${industries.length} industries`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getIndustry process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: industries
  });    
});

exports.getAllIndustries = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllIndustries process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching industry with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const industries = await Industry.findById(req.params.id);   
  websocketHandler.sendLog(req, `Industry ${req.params.id} ${industries ? 'found' : 'not found'}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getAllIndustries process', constants.LOG_TYPES.INFO);
  
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: industries
  });    
});

exports.createIndustry = async (req, res) => {
  websocketHandler.sendLog(req, 'Starting createIndustry process', constants.LOG_TYPES.INFO);
  try {        
      websocketHandler.sendLog(req, `Creating new industry with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
      const newIndustry = await Industry.create(req.body);
      websocketHandler.sendLog(req, `Successfully created industry with ID: ${newIndustry._id}`, constants.LOG_TYPES.INFO);
      
      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: newIndustry
      });
  } catch (err) {
      websocketHandler.sendLog(req, `Error creating industry: ${err.message}`, constants.LOG_TYPES.ERROR);
      res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: err
      });
  }    
};

exports.deleteIndustry = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteIndustry process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete industry with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const industry = await Industry.findByIdAndDelete(req.params.id);
  
  if (!industry) {
      websocketHandler.sendLog(req, `No industry found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.industryNotFound'), 404)
    );
  }
  
  websocketHandler.sendLog(req, `Successfully deleted industry with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
  });
});

exports.updateIndustry = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateIndustry process (version 1)', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating industry ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
  
  const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  
  if (!industry) {
      websocketHandler.sendLog(req, `No industry found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.industryNotFound'), 404)
    );
  }
  
  websocketHandler.sendLog(req, `Successfully updated industry ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: industry
  });
});

exports.updateIndustry = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateIndustry process (version 2)', constants.LOG_TYPES.INFO);
  
  const filteredBody = filterObj(req.body, 'Name');
  websocketHandler.sendLog(req, `Filtered update data: ${JSON.stringify(filteredBody)} for industry ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const updatedIndustry = await Industry.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
  });

  if (!updatedIndustry) {
      websocketHandler.sendLog(req, `No industry found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('recruitment.industryNotFound'), 404)

    );
  }
  
  websocketHandler.sendLog(req, `Successfully updated industry ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: updatedIndustry
  });
});

//#endregion 


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