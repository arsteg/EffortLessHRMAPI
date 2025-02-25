const Skill = require('../models/recruitment/skillModel');
const Role = require('../models/recruitment/roleModel');
const Industry = require('../models/recruitment/industryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const constants = require('../constants');


//#region Skill region

exports.getSkill=catchAsync(async (req, res, next) => {
    const skills = await Skill.find({}).all();  
    res.status(200).json({
      status: constants.apiresponsestatus.success,
      data: skills
    });    
  });
  
  exports.getAllSkills=catchAsync(async (req, res, next) => {
    const skills = await Skill.findById(req.params.id);   
    res.status(200).json({
      status: constants.apiresponsestatus.success,
      data: skills
    });    
  });
  

  exports.createSkill = async(req, res) => {
    try{    
      console.log('create skill called');
      const newSkill = await Skill.create(req.body);

    res.status(201).json({
      status:constants.apiresponsestatus.success,
      data: newSkill
    })
    }
    catch(err){
    res.status(400).json({
      status:constants.APIResponseStatus.Failure,
      message:err
    })
    }    
  };
  
  exports.deleteSkill = catchAsync(async (req, res, next) => {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return next(new AppError('No skill found with that ID', 404));
    }
    res.status(204).json({
      status: constants.apiresponsestatus.success,
      data: null
    });
  });
 
  exports.updateSkill =  catchAsync(async (req, res, next) => {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // If not found - add new
      runValidators: true // Validate data
    });
    if (!skill) {
      return next(new AppError('No skill found with that ID', 404));
    }
    res.status(201).json({
      status: constants.apiresponsestatus.success,
      data: skill
    });
  });

  exports.updateSkill = catchAsync(async (req, res, next) => {
      
    // 2) Filter out unwanted body properties
    const filteredBody = filterObj(req.body, 'Name');
  
    // 3) Update user document
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true, // Reutrn updated object instead of old one
      runValidators: true
    });

    res.status(200).json({
      status: constants.apiresponsestatus.success,
      data: updatedSkill
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

  //#endregion 

  //#region Skill Role

exports.getRole=catchAsync(async (req, res, next) => {
  const roles = await Role.findById(req.params.id);
  res.status(200).json({
    status: constants.apiresponsestatus.success,
    data: roles
  });    
});

exports.getAllRoles=catchAsync(async (req, res, next) => {
  const roles = await Role.find();   
  res.status(200).json({
    status: constants.apiresponsestatus.success,
    data: roles
  });    
});

exports.createRole = async(req, res) => {
  try{        
    console.log(req.body);
    const newRole = await Role.create(req.body);
  res.status(201).json({
    status:constants.apiresponsestatus.success,
    data: newRole
  })
  }
  catch(err){
    console.log(err);
  res.status(400).json({
    status:constants.APIResponseStatus.Failure,
    message:err
  })
  }    
};

exports.deleteRole = catchAsync(async (req, res, next) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) {
    return next(new AppError('No Role found with that ID', 404));
  }
  res.status(204).json({
    status: constants.apiresponsestatus.success,
    data: null
  });
});

exports.updateRole =  catchAsync(async (req, res, next) => {
  console.log("updateRole is called");
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!role) {
    return next(new AppError('No Role found with that ID', 404));
  }
  res.status(201).json({
    status: constants.apiresponsestatus.success,
    data: role
  });
});

//#endregion 

//#region Skill Industry

exports.getIndustry=catchAsync(async (req, res, next) => {
  const industries = await Industry.find({}).all();
  res.status(200).json({
    status: constants.apiresponsestatus.success,
    data: industries
  });    
});

exports.getAllIndustries=catchAsync(async (req, res, next) => {
  const industries = await Industry.findById(req.params.id);   
  res.status(200).json({
    status: constants.apiresponsestatus.success,
    data: industries
  });    
});


exports.createIndustry = async(req, res) => {
  try{        
    const newIndustry = await Industry.create(req.body);
  res.status(201).json({
    status:constants.apiresponsestatus.success,
    data: newIndustry
  })
  }
  catch(err){
  res.status(400).json({
    status:constants.APIResponseStatus.Failure,
    message:err
  })
  }    
};

exports.deleteIndustry = catchAsync(async (req, res, next) => {
  const industry = await Industry.findByIdAndDelete(req.params.id);
  if (!industry) {
    return next(new AppError('No Industry found with that ID', 404));
  }
  res.status(204).json({
    status: constants.apiresponsestatus.success,
    data: null
  });
});

exports.updateIndustry =  catchAsync(async (req, res, next) => {
  const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!industry) {
    return next(new AppError('No Industry found with that ID', 404));
  }
  res.status(201).json({
    status: constants.apiresponsestatus.success,
    data: industry
  });
});

exports.updateIndustry = catchAsync(async (req, res, next) => {
    
  // 2) Filter out unwanted body properties
  const filteredBody = filterObj(req.body, 'Name');

  // 3) Update user document
  const updatedIndustry = await Industry.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true, // Reutrn updated object instead of old one
    runValidators: true
  });

  res.status(200).json({
    status: constants.apiresponsestatus.success,
    data: updatedIndustry
  });
});

//#endregion 