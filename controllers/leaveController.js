const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/GeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplate = require('../models/Leave/LeaveTemplateModel');
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const AppError = require('../utils/appError');
const TemplateCubbingRestriction = require('../models/Leave/TemplateCubbingRestrictionModel');

exports.createGeneralSetting = catchAsync(async (req, res, next) => {
  // Retrieve companyId from cookies
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }

  // Create the general setting with the companyId
  const generalSettingData = { ...req.body, company }; // Assuming req.body contains the general setting data
  const generalSetting = await GeneralSetting.create(generalSettingData);

  res.status(201).json({
    status: 'success',
    data: generalSetting
  });
});

exports.getGeneralSettingByCompany = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findOne({
    company: req.cookies.companyId
  });   
 ;
  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});

exports.getGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findById(req.params.id);
  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});

exports.updateGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});
exports.createLeaveCategory = catchAsync(async (req, res, next) => {
  // Retrieve companyId from cookies
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }

  // Create the general setting with the companyId
  const leaveCategoryData = { ...req.body, company }; // Assuming req.body contains the general setting data
  const leaveCategory = await LeaveCategory.create(leaveCategoryData);
  res.status(201).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.getLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findById(req.params.id);
  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.updateLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.getAllLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.find({}).where('company').equals(req.cookies.companyId);
  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});

async function createLeaveTemplateCategories(leaveTemplateId, leaveCategories) {
  try {
    const createdCategories = await Promise.all(
      leaveCategories.map(async (leaveCategory) => {
        const newCategory = new LeaveTemplateCategory({
          leaveTemplate: leaveTemplateId,
          leaveCategory: leaveCategory.leaveCategory,
        });
        return newCategory.save();
      })
    );

    return createdCategories;
  } catch (error) {
    throw new AppError('Error creating LeaveTemplateCategory', 500);
  }
}

exports.createLeaveTemplate = catchAsync(async (req, res, next) => {
  const {
    leaveCategories,
    cubbingRestrictionCategories,
    ...leaveTemplateData
  } = req.body;

  // Check if label is provided
  if (!leaveTemplateData.label) {
    return next(new AppError('Label is required', 400));
  }
 // Extract companyId from req.cookies
 const companyId = req.cookies.companyId;
 // Check if companyId exists in cookies
 if (!companyId) {
   return next(new AppError('Company ID not found in cookies', 400));
 }
  // Check if label already exists
  const existingTemplate = await LeaveTemplate.findOne({ 'label': leaveTemplateData.label });

  if (existingTemplate) {
    return res.status(400).json({
      status: 'failure',
      message: 'Label already exists',
    });
  }

  // Check if leaveCategories is provided and valid
  if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError('Leave Categories are required', 400));
  }

 

  // Add company to the request body
  leaveTemplateData.company = companyId;

  // Create LeaveTemplate instance
  const leaveTemplate = await LeaveTemplate.create(leaveTemplateData);

  // Create LeaveTemplateCategory instances
  const createdCategories = await createLeaveTemplateCategories(leaveTemplate._id, leaveCategories);
  var createdClubbingRestrictions=null;
 // Check if cubbingRestrictionCategories is provided and valid
 if (Array.isArray(cubbingRestrictionCategories)) {  
  // Create TemplateCubbingRestriction instances
  createdClubbingRestrictions = await TemplateCubbingRestriction.insertMany(cubbingRestrictionCategories.map(category => ({
    leaveTemplate: leaveTemplate._id,
    category: category.leaveCategory,
    clubbedCategory: category.clubbedLeaveCategory
   })));
 }
 leaveTemplate.applicableCategories=createdCategories;
 leaveTemplate.clubbingRestrictions=createdClubbingRestrictions;

  // Send success response
  res.status(201).json({
    status: 'success',
    data: leaveTemplate
  });
});



exports.getLeaveTemplate = async (req, res, next) => {
    try {
        const leaveTemplate = await LeaveTemplate.findById(req.params.id);
        if (!leaveTemplate) {
            res.status(404).json({
                status: 'failure',
                message: 'LeaveTemplate not found'
            });
            return;
        }
        const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
        leaveTemplate.applicableCategories=leaveTemplateCategories;
        const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
        leaveTemplate.clubbingRestrictions=leaveClubbingRestrictions;
        res.status(200).json({
            status: 'success',
            data: leaveTemplate
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.updateLeaveTemplate = async (req, res, next) => {
    try {
        const leaveTemplate = await LeaveTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leaveTemplate) {
            res.status(404).json({
                status: 'failure',
                message: 'LeaveTemplate not found'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: leaveTemplate
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.getAllLeaveTemplates = async (req, res, next) => {
    try {
        const leaveTemplates = await LeaveTemplate.find({}).where('company').equals(req.cookies.companyId);;
        if(leaveTemplates)
  {
   for(var i = 0; i < leaveTemplates.length; i++) {   
    const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);
    if(leaveTemplateCategories) 
    {
      leaveTemplates[i].applicableCategories=leaveTemplateCategories;
    }
    else{
      leaveTemplates[i].applicableCategories=null;
    }
    const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);
   
    if(leaveClubbingRestrictions) 
      {
        leaveTemplates[i].clubbingRestrictions=leaveClubbingRestrictions;
      }
      else{
        leaveTemplates[i].clubbingRestrictions=null;
      }
   }
  }
        res.status(200).json({
            status: 'success',
            data: leaveTemplates
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

// Create a new LeaveTemplateCategory
exports.createLeaveTemplateCategory = catchAsync(async (req, res, next) => {
    const leaveTemplateCategory = await LeaveTemplateCategory.create(req.body);
    res.status(201).json({
        status: 'success',
        data: leaveTemplateCategory
    });
});

// Get a LeaveTemplateCategory by ID
exports.getLeaveTemplateCategory = catchAsync(async (req, res, next) => {
    const leaveTemplateCategory = await LeaveTemplateCategory.findById(req.params.id);
    if (!leaveTemplateCategory) {
        return next(new AppError('LeaveTemplateCategory not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategory
    });
});

// Update a LeaveTemplateCategory by ID
exports.updateLeaveTemplateCategory = catchAsync(async (req, res, next) => {
    const leaveTemplateCategory = await LeaveTemplateCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!leaveTemplateCategory) {
        return next(new AppError('LeaveTemplateCategory not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategory
    });
});

// Get all LeaveTemplateCategories
exports.getAllLeaveTemplateCategories = catchAsync(async (req, res, next) => {
    const leaveTemplateCategories = await LeaveTemplateCategory.find();
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategories
    });
});

