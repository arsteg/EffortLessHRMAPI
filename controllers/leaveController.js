const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/LeaveGeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplate = require('../models/Leave/LeaveTemplateModel');
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const AppError = require('../utils/appError');
const TemplateCubbingRestriction = require('../models/Leave/TemplateCubbingRestrictionModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const mongoose = require("mongoose");

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

exports.getLeaveCategoryByTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.templateId);
  if (!leaveTemplateCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategory
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

exports.deleteLeaveCategory = catchAsync(async (req, res, next) => {
const leaveCategory = await LeaveCategory.findById(req.params.id);   
if (!leaveCategory) {
  return next(new AppError('Leave Category not found', 404));
}
//add validation for use categroy
if(leaveCategory.isSystemGenerated){
  return next(new AppError('Leave Category Sytem Generated, you can not delete found', 404));
}
else
{
await LeaveCategory.findByIdAndDelete(req.params.id);
 res.status(204).json({
   status: 'success',
   data: null,
 });
}
});

exports.deleteLeaveTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateExists = await LeaveTemplate.findById(req.params.id);   
if (!leaveTemplateExists) {
  return next(new AppError('EmployeeLeaveAssignment not found', 404));
}
const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(leaveTemplateExists.user).where('status').in(['Approved', 'Rejected','Cancelled']); // Filter by status
console.log(employeeLeaveAssignment);
if (employeeLeaveAssignment.length>0) {
  return next(new AppError('Leave Need to close first before delete assignment', 404));
}
await LeaveTemplate.findByIdAndDelete(req.params.id);
 res.status(204).json({
   status: 'success',
   data: null,
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
    restrictedClubbedCategory: category.restrictedclubbedLeaveCategory
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
        leaveTemplate.applicableCategories = leaveTemplateCategories;
        const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
        leaveTemplate.clubbingRestrictions = leaveClubbingRestrictions;
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
      const { leaveCategories,cubbingRestrictionCategories, ...leaveTemplateData } = req.body;

      // Check if policyLabel is provided
      if (!leaveTemplateData.label) {
        return next(new AppError('Label is required', 400));
      }
    
      // Check if policyLabel already exists
      const existingTemplate = await LeaveTemplate.findOne({ 'label': expenseTemplateData.Label ,_id: { $ne: req.params.id }});
    
      if (existingTemplate) {
        return res.status(400).json({
          status: 'failure',
          message: 'Leave Template Label already exists',
        });
      }
      if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
        return next(new AppError('Leave Category Not Exists in Request', 400));
      }
        // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  for (const category of leaveCategories) {
    const result = await LeaveCategory.findById(category.leaveCategory);
    console.log(result);
     if (!result) {
      return res.status(400).json({
        status: 'failure',
        message: 'Invalid Category',
      });
    }
  }

  
        const leaveTemplate = await LeaveTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leaveTemplate) {
            res.status(404).json({
                status: 'failure',
                message: 'LeaveTemplate not found'
            });
            return;
        }
        leaveTemplate.leaveCategories = await updateOrCreateLeaveTemplateCategories(req.params.id, req.body.leaveCategories);
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

async function updateOrCreateLeaveTemplateCategories(leaveTemplateId, updatedCategories) {
  const existingCategories = await LeaveTemplateCategory.find({ leaveTemplate: leaveTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.leaveCategory.equals(category.leaveCategory)
    );
    if (!existingCategory) {
     // Create new category
      const newCategory = new LeaveTemplateCategory({
        leaveTemplate: leaveTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.leaveCategory === existing.leaveCategory.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return LeaveTemplateCategory.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await LeaveTemplateCategory.find({ leaveTemplate: leaveTemplateId });
  return finalCategories;

}

exports.getAllLeaveTemplates = async (req, res, next) => {
    try {
        const leaveTemplates = await LeaveTemplate.find({}).where('company').equals(req.cookies.companyId);
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
              leaveTemplates[i].clubbingRestrictions = leaveClubbingRestrictions;
            }
            else{
              leaveTemplates[i].clubbingRestrictions = null;
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
  
  const { leaveTemplate, leaveCategories } = req.body;
  // Validate incoming data
  if (!leaveTemplate || !leaveCategories || !Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError('Invalid request data', 400));
  }
  for (const category of leaveCategories) {    
      const result = await LeaveCategory.findById(category.leaveCategory);
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Category',
        });      
    }
  }
  // Iterate through expenseCategories to create or update records
  const leaveTemplateCategories =  await createLeaveTemplateCategories(mongoose.Types.ObjectId(leaveTemplate), leaveCategories);
    res.status(201).json({
      status: 'success',
      data: leaveTemplateCategories     
    });

});

async function createLeaveTemplateCategories(leaveTemplateId, leaveCategories) {
  try {
    const updatedCategories = await Promise.all(
      leaveCategories.map(async (category) => {
        const existingCategory = await LeaveTemplateCategory.findOne({
          leaveCategory: category.leaveCategory,
          leaveTemplate: leaveTemplateId,
        });

        if (existingCategory) {
          return LeaveTemplateCategory.findByIdAndUpdate(
            existingCategory._id,
            { $set: { ...category } },
            { new: true }
          );
        } else {
          const newCategory = new LeaveTemplateCategory({
            leaveTemplate: leaveTemplateId,
            ...category,
          });
          return newCategory.save();
        }
      })
    );

    return updatedCategories;
  } catch (err) {
    throw new AppError('Internal server error', 500);
  }
}

// Get a LeaveTemplateCategory by ID
exports.getLeaveTemplateCategoryByTemplate = catchAsync(async (req, res, next) => {
    const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.leaveTemplateId);;
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
    const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategories
    });
});
