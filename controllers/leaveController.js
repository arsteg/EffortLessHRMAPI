const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/LeaveGeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplate = require('../models/Leave/LeaveTemplateModel');
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const TemplateCubbingRestriction = require('../models/Leave/TemplateCubbingRestrictionModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const LeaveGrant = require('../models/Leave/LeaveGrantModel');
const LeaveApplication = require('../models/Leave/LeaveApplicationModel');
const LeaveApplicationHalfDay = require('../models/Leave/LeaveApplicationHalfDayModel');
const ShortLeave = require("../models/Leave/ShortLeaveModel");
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const { ObjectId } = require('mongodb');
const { v1: uuidv1 } = require('uuid');
// Import ExpenseCategory model
const { BlobServiceClient } = require('@azure/storage-blob');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const TemplateApplicableCategoryEmployee = require("../models/Leave/TemplateApplicableCategoryEmployeeModel");
const userSubordinate = require('../models/userSubordinateModel');
const scheduleController = require('../controllers/ScheduleController');
const { Constants } = require('azure-storage');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const constants = require('../constants');
const User = require('../models/permissions/userModel');
const Company = require('../models/companyModel');
const sendEmail = require('../utils/email');
// AZURE STORAGE CONNECTION DETAILS
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);

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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await LeaveCategory.countDocuments({ company: req.cookies.companyId });
  const leaveCategory = await LeaveCategory.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveCategory,
    total: totalCount
  });
});
exports.getAllLeaveCategoryByUser = catchAsync(async (req, res, next) => { 
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(req.params.userId);  
  const leaveTemplateCategory = await LeaveTemplateCategory.find({ leaveTemplate: employeeLeaveAssignment.leaveTemplate });
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategory
  });
});

exports.getAllLeaveCategoryByUserV1 = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(req.params.userId);
  if (!employeeLeaveAssignment) {
    res.status(200).json({
      status: 'failure'
    });
  }
  const leaveTemplateCategory = await LeaveTemplateCategory.find({ leaveTemplate: employeeLeaveAssignment.leaveTemplate }).populate('leaveCategory');
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategory
  });
});

exports.deleteLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findById(req.params.id);
  if (!leaveCategory) {
    return next(new AppError('Leave Category not found', 404));
  }
  //add validation for use categroy
  if (leaveCategory.isSystemGenerated) {
    return next(new AppError('Leave Category Sytem Generated, you can not delete found', 404));
  }
  else {

    const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveCategory').equals(req.params.id);
    if (leaveTemplateCategory !== null && leaveTemplateCategory.length > 0) {
      return next(new AppError('Leave Category Added against Leave tempalte, you can not delete found', 404));
    }
    else {
      await LeaveCategory.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  }
});

exports.deleteLeaveTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateExists = await LeaveTemplate.findById(req.params.id);
  if (!leaveTemplateExists) {
    return next(new AppError('EmployeeLeaveAssignment not found', 404));
  }
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(leaveTemplateExists.user).where('status').in(['Approved', 'Rejected', 'Cancelled']); // Filter by status
  if (employeeLeaveAssignment.length > 0) {
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
  var createdClubbingRestrictions = null;
  // Check if cubbingRestrictionCategories is provided and valid
  if (Array.isArray(cubbingRestrictionCategories)) {
    // Create TemplateCubbingRestriction instances
    createdClubbingRestrictions = await TemplateCubbingRestriction.insertMany(cubbingRestrictionCategories.map(category => ({
      leaveTemplate: leaveTemplate._id,
      category: category.leaveCategory,
      restrictedClubbedCategory: category.restrictedclubbedLeaveCategory
    })));
  }
  leaveTemplate.applicableCategories = createdCategories;
  leaveTemplate.clubbingRestrictions = createdClubbingRestrictions;

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


    for (var m = 0; m < leaveTemplateCategories.length; m++) {

      const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[m]._id);
      if (templateApplicableCategoryEmployee) {       
        leaveTemplateCategories[m].templateApplicableCategoryEmployee = templateApplicableCategoryEmployee;
      }
      else {
        leaveTemplateCategories[m].templateApplicableCategoryEmployee = null;
      }
    }
    leaveTemplate.applicableCategories = leaveTemplateCategories;

    const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
    leaveTemplate.cubbingRestrictionCategories = leaveClubbingRestrictions;
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
    const { leaveCategories, cubbingRestrictionCategories, ...leaveTemplateData } = req.body;

    // Check if policyLabel is provided
    if (!leaveTemplateData.label) {
      return next(new AppError('Label is required', 400));
    }

    // Check if policyLabel already exists
    const existingTemplate = await LeaveTemplate.findOne({ 'label': leaveTemplateData.Label, _id: { $ne: req.params.id } });

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

    for (const category of leaveCategories) {
      const result = await LeaveCategory.findById(category.leaveCategory);   
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

    await TemplateCubbingRestriction.deleteMany({
      leaveCategory: leaveTemplate._id,
    });
    if (Array.isArray(cubbingRestrictionCategories)) {
      // Create TemplateCubbingRestriction instances
      leaveTemplate.cubbingRestrictionCategories = await TemplateCubbingRestriction.insertMany(cubbingRestrictionCategories.map(category => ({
        leaveTemplate: leaveTemplate._id,
        category: category.leaveCategory,
        restrictedClubbedCategory: category.restrictedclubbedLeaveCategory
      })));
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
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LeaveTemplate.countDocuments({ company: req.cookies.companyId });
    const leaveTemplates = await LeaveTemplate.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
      .limit(parseInt(limit));
    if (leaveTemplates) {
      for (var i = 0; i < leaveTemplates.length; i++) {
        const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);
        if (leaveTemplateCategories) {
          for (var m = 0; m < leaveTemplateCategories.length; m++) {

            const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[m]._id);
            if (templateApplicableCategoryEmployee) {          
              leaveTemplateCategories[m].templateApplicableCategoryEmployee = templateApplicableCategoryEmployee;
            }
            else {
              leaveTemplateCategories[m].templateApplicableCategoryEmployee = null;
            }
          }
          leaveTemplates[i].applicableCategories = leaveTemplateCategories;
        }
        else {
          leaveTemplates[i].applicableCategories = null;
        }
        const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);

        if (leaveClubbingRestrictions) {
          leaveTemplates[i].cubbingRestrictionCategories = leaveClubbingRestrictions;
        }
        else {
          leaveTemplates[i].cubbingRestrictionCategories = null;
        }
      }
    }
    res.status(200).json({
      status: 'success',
      data: leaveTemplates,
      total: totalCount
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
  // Iterate through LeaveCategories to create or update records
  const leaveTemplateCategories = await createLeaveTemplateCategories(mongoose.Types.ObjectId(leaveTemplate), leaveCategories);
  for (var i = 0; i < leaveTemplateCategories.length; i++) {
    const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
    if (templateApplicableCategoryEmployee) {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = templateApplicableCategoryEmployee;
    }
    else {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = null;
    }
  }
  res.status(201).json({
    status: 'success',
    data: leaveTemplateCategories
  });

});

async function createLeaveTemplateCategories(leaveTemplateId, leaveCategories) {
  try {
    const updatedCategories = await Promise.all(
      leaveCategories.map(async (category) => {
        const {
          users = [],
          ...grantData
        } = category;
        const existingCategory = await LeaveTemplateCategory.findOne({
          leaveCategory: category.leaveCategory,
          leaveTemplate: leaveTemplateId,
        });
        let categoryResult;
        if (existingCategory) {
          grantData.isReadyForApply = true;
          categoryResult = await LeaveTemplateCategory.findByIdAndUpdate(
            existingCategory._id,
            { $set: { ...grantData } },
            { new: true }
          );
        } else {
          const newCategory = new LeaveTemplateCategory({
            leaveTemplate: leaveTemplateId,
            ...grantData,
          });
          categoryResult = await newCategory.save();
        }

        if (users.length >= 0) {
          const userOperations = users.map(async (user) => {
            const filter = {
              leaveTemplateCategory: existingCategory ? existingCategory._id : categoryResult._id,
              user: user.user
            };
            const update = {
              leaveTemplateCategory: existingCategory ? existingCategory._id : categoryResult._id,
              user: user.user
            };
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            return TemplateApplicableCategoryEmployee.findOneAndUpdate(filter, update, options);
          });
          await Promise.all(userOperations);
        }

        return categoryResult;
      })
    );

    return updatedCategories;
  } catch (err) {
    console.log(err);
    throw new AppError('Internal server error', 500);
  }
}

// Get a LeaveTemplateCategory by ID
exports.getLeaveTemplateCategoryByTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.leaveTemplateId);;
  if (!leaveTemplateCategories) {
    return next(new AppError('LeaveTemplateCategory not found', 404));
  }
  for (var i = 0; i < leaveTemplateCategories.length; i++) {
    const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
    if (templateApplicableCategoryEmployee) {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = templateApplicableCategoryEmployee;
    }
    else {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = null;
    }
  }
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategories
  });
});

// Get all LeaveTemplateCategories
exports.getAllLeaveTemplateCategories = catchAsync(async (req, res, next) => {
  const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('company').equals(req.cookies.companyId);
  for (var i = 0; i < leaveTemplateCategories.length; i++) {
    const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
    if (templateApplicableCategoryEmployee) {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = templateApplicableCategoryEmployee;
    }
    else {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee = null;
    }
  }
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategories
  });
});

exports.createEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
  const { user, leaveTemplate, primaryApprover, secondaryApprover } = req.body;

  // Validate required fields
  if (!user || !Array.isArray(user) || user.length === 0) {
    return next(new AppError('User field must be a non-empty array', 400));
  }
  if (!leaveTemplate) {
    return next(new AppError('LeaveTemplate is required', 400));
  }

  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  const results = [];
  for (const userId of user) {
    const assignment = {
      user: userId,
      leaveTemplate,
      company: companyId,
      primaryApprover: primaryApprover || null,
      secondaryApprover: secondaryApprover || null,
    };

    const leaveTemplateRecord = await LeaveTemplate.findById(leaveTemplate);
    if (leaveTemplateRecord && leaveTemplateRecord.approvalType === 'template-wise') {
      assignment.primaryApprover = leaveTemplateRecord.primaryApprover;
      assignment.secondaryApprover = leaveTemplateRecord.secondaryApprover || null;
    }

    const existingAssignments = await EmployeeLeaveAssignment.find({
      user: userId,
      company: companyId,
    });

    let employeeLeaveAssignment;
    if (existingAssignments.length === 0) {
      employeeLeaveAssignment = await EmployeeLeaveAssignment.create(assignment);
    } else {
      employeeLeaveAssignment = await EmployeeLeaveAssignment.findByIdAndUpdate(
        existingAssignments[0]._id,
        assignment,
        { new: true, runValidators: true }
      );
    }

    results.push(employeeLeaveAssignment);
  }

  res.status(201).json({
    status: 'success',
    data: results,
  });
});



exports.getEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);
  if (!employeeLeaveAssignment) {
    return next(new AppError('EmployeeLeaveAssignment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeLeaveAssignment,
  });
});
exports.getEmployeeLeaveAssignmentByUser = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(req.params.userId);

  res.status(200).json({
    status: 'success',
    data: employeeLeaveAssignment,
  });
});

exports.getApplicableLeaveSettingByUser = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({ user: req.params.userId });
  var leaveTemplate = [];
  if (employeeLeaveAssignment) {

    leaveTemplate = await LeaveTemplate.findById(employeeLeaveAssignment.leaveTemplate);
    const LeaveTemplateApplicableCategories = await LeaveTemplateApplicableCategories.find({}).where('LeaveTemplate').equals(employeeLeaveAssignment.LeaveTemplate);
    LeaveTemplate.applicableCategories = LeaveTemplateApplicableCategories;
  }
  res.status(200).json({
    status: 'success',
    data: LeaveTemplate,
  });
});

exports.deleteEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {

  //validation
  const userLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);
  if (!userLeaveAssignment) {
    return next(new AppError('EmployeeLeaveAssignment not found', 404));
  }

  await EmployeeLeaveAssignment.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllEmployeeLeaveAssignments = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await EmployeeLeaveAssignment.countDocuments({ company: req.cookies.companyId });
  const employeeLeaveAssignments = await EmployeeLeaveAssignment.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: employeeLeaveAssignments,
    total: totalCount
  });
});

exports.createEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const {
    users,
    ...grantData
  } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return next(new AppError('users are required', 400));
  }
  var leavsGrants = [];
  for (var i = 0; i < users.length; i++) {
    const leavegrantExits = await LeaveGrant.findOne({
      employee: users[i].user,
      date: grantData.date
    });
   
    if (leavegrantExits !== null) {
      return next(new AppError('Leave alredy Granted for Same user on same date', 404));
    }
    // Add company to the request body
    grantData.company = companyId;
    grantData.employee = users[i].user;
    grantData.usedOn = grantData.date;
    grantData.appliedOn = new Date();
    // Create LeaveTemplate instance
    const leaveGrant = await LeaveGrant.create(grantData);
    leavsGrants.push(leaveGrant);
  }
  // Send success response
  res.status(201).json({
    status: 'success',
    data: leavsGrants
  });
});

exports.getEmployeeLeaveGrantByUser = catchAsync(async (req, res, next) => {
  const leaveGrants = await LeaveGrant.find({}).where('employee').equals(req.params.userId);
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
  });
});

exports.getEmployeeLeaveGrantByTeam = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      teamIdsArray.push(ids[i]);
    }
  }
  if (teamIds == null) {
    teamIdsArray.push(req.cookies.userId);
  }

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await LeaveGrant.countDocuments({ employee: { $in: objectIdArray }, status: req.body.status });
  const leaveGrants = await LeaveGrant.find({ employee: { $in: objectIdArray }, status: req.body.status }).skip(parseInt(skip)).limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
    total: totalCount
  });
});

exports.updateEmployeeLeaveGrant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, status, level1Reason, level2Reason, date, comment } = req.body;

    // Check if the leave grant exists
    const leaveGrant = await LeaveGrant.findById(id);
    if (!leaveGrant) {
      return next(new AppError('Employee Leave Grant not found', 404));
    }

    // Check if the user is valid
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return next(new AppError('Invalid user', 400));
    }

    // Check if a LeaveGrant with the same date for the same user already exists
    const existingLeaveGrant = await LeaveGrant.findOne({ user, date });
    if (existingLeaveGrant && existingLeaveGrant._id.toString() !== id) {
      return next(new AppError('Leave Grant for the same user and date already exists', 400));
    }

    // Update the leave grant fields
    leaveGrant.employee = user;
    leaveGrant.status = status;
    leaveGrant.level1Reason = level1Reason;
    leaveGrant.level2Reason = level2Reason;
    leaveGrant.date = date;
    leaveGrant.comment = comment;

    // Save the updated leave grant
    await leaveGrant.save();

    res.status(200).json({
      status: 'success',
      data: leaveGrant
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteEmployeeLeaveGrant = catchAsync(async (req, res, next) => {

  await LeaveGrant.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  // Extract companyId from req.cookies
  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const query = { company: company };
  if (req.body.status) {
    query.status = req.body.status;
  }
  // Get the total count of documents matching the query
  const totalCount = await LeaveGrant.countDocuments(query);

  // Get the regularization requests matching the query with pagination
  const leaveGrants = await LeaveGrant.find(query).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
    total: totalCount
  });
});

exports.getEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  const leaveGrants = await LeaveGrant.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
  });
});

exports.createEmployeeLeaveApplication = async (req, res, next) => {
  try {
     // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
    const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption, status, haldDays, leaveApplicationAttachments } = req.body;
    const cycle = await scheduleController.createFiscalCycle();
    const assignmentExists = await scheduleController.doesLeaveAssignmentExist(employee, cycle, leaveCategory);

    if (!assignmentExists) {     
      res.status(201).json({
        status: 'fail',
        data: null,
        message: "Leave assignment does not exist. Cannot apply for leave."
      });
    }
    // Get the current leave assigned record
    const leaveAssigned = await LeaveAssigned.findOne({ employee: employee, cycle: cycle, category: leaveCategory });

    const leaveDays = calculateLeaveDays(startDate, endDate);
    // Check if there are enough leaves available
    if (leaveAssigned.leaveRemaining < leaveDays) {      
      res.status(201).json({
        status: 'fail',
        data: null,
        message: "Not enough leave balance to apply for this leave."
      });
    }


    var documentLink;
    if (leaveApplicationAttachments != null) {
      for (var i = 0; i < leaveApplicationAttachments.length; i++) {
        if (!leaveApplicationAttachments[i].attachmentType || !leaveApplicationAttachments[i].attachmentName || !leaveApplicationAttachments[i].attachmentSize || !leaveApplicationAttachments[i].extention || !leaveApplicationAttachments[i].file
          || leaveApplicationAttachments[i].attachmentType === null || leaveApplicationAttachments[i].attachmentName === null || leaveApplicationAttachments[i].attachmentSize === null || leaveApplicationAttachments[i].extention === null || leaveApplicationAttachments[i].file === null) {
          return res.status(400).json({ error: 'All attachment properties must be provided' });
        }
        const blobName = leaveApplicationAttachments[i].attachmentName + "_" + uuidv1() + leaveApplicationAttachments[i].extention;
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        console.log("\nUploading to Azure storage as blob:\n\t",);
        // Upload data to the blob
        var FileString = leaveApplicationAttachments[i].file;
        const buffer = new Buffer.from(FileString, 'base64');
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
        documentLink = process.env.CONTAINER_URL_BASE_URL + process.env.CONTAINER_NAME + "/" + blobName;
        console.log(
          "Blob was uploaded successfully. requestId: ",
          uploadBlobResponse.requestId
        );

      }
    }
    const newLeaveApplication = await LeaveApplication.create({
      employee,
      leaveCategory,
      level1Reason,
      level2Reason,
      startDate,
      endDate,
      comment,
      isHalfDayOption,
      status,
      company: req.cookies.companyId, // Assuming companyId is stored in cookies
      documentLink
    });
    var createdHalfDays = null;
    // Check if haldDays is provided and valid
    if (Array.isArray(haldDays)) {
      // Create haldDays instances
      createdHalfDays = await LeaveApplicationHalfDay.insertMany(haldDays.map(haldDay => ({
        leaveApplication: newLeaveApplication._id,
        date: haldDay.date,
        dayHalf: haldDay.dayHalf
      })));
    }
    newLeaveApplication.halfDays = createdHalfDays;

    try {

      // Deduct the applied leave days from the leave remaining
      leaveAssigned.leaveRemaining -= leaveDays;
      leaveAssigned.leaveTaken += leaveDays; // Update the leave taken count

      // Save the updated leave assigned record
      await leaveAssigned.save();

      console.log("Leave applied successfully. Remaining leave:", leaveAssigned.leaveRemaining);
      //fetch manager for respective user
      //trigger email to manager that emploee applied levae and waiting for approval

      const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(employee);      
      if(managerTeamsIds)
      {
        console.log(managerTeamsIds);
        for(var j = 0; j < managerTeamsIds.length; j++)
          {       
            const user = await User.findById(req.body.employee);
         const manager = await User.findById(managerTeamsIds[j]._id);
         const companyDetails=await Company.findById(req.cookies.companyId);
         sendEmailToUsers(user,manager,constants.Email_template_constant.Leave_Application_Approval_Request,newLeaveApplication,companyDetails);        
        }
      }

    } catch (error) {
      console.error("Error applying for leave:", error);
    }

    res.status(201).json({
      status: 'success',
      data: newLeaveApplication
    });
  } catch (error) {
    next(error);
  }
};
const sendEmailToUsers = async (user,manager,email_template_constant,leaveApplication,company) => {

       
      const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(email_template_constant).where('company').equals(company._id); 
   
      if(emailTemplate)
      {
        if(email_template_constant==constants.Email_template_constant.Leave_Application_Approval_Request)
        console.log("hii");
       const template = emailTemplate.contentData;
       console.log("hii1");
       const totalDays=leaveApplication.endDate-leaveApplication.startDate;
       const message = template
       .replace("{firstName}", manager.firstName)       
       .replace("{employeeName}", user.firstName + " "+user.lastName)
       .replace("{employeeName}", user.firstName + " "+user.lastName)
      
       .replace("{leaveType}", leaveApplication.leaveCategory)       
       .replace("{startDate}", leaveApplication.startDate)       
       .replace("{endDate}", leaveApplication.endDate)       
       .replace("{totalDays}", totalDays)       
       .replace("{reason}", leaveApplication.comment)       
     
       .replace("{company}",  company.companyName)
       .replace("{company}", company.companyName)
       .replace("{lastName}", manager.lastName); 
      
       console.log(message);
       if(attendanceUser.email=="hrmeffortless@gmail.com")
       {
          try {
           await sendEmail({
             email: attendanceUser.email,
             subject: emailTemplate.subject,
             message
           });
          
         } catch (err) {   
          console.error(`Error sending email to user ${user}:`, err); 
       }
      }
  }
};
const calculateLeaveDays = (startDate, endDate) => {
  // Ensure input is a string and convert to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if the dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format. Please provide valid dates.");
  }

  // Ensure start is before end
  if (end < start) {
    throw new Error("End date must be after start date.");
  }

  // Calculate the difference in time
  const differenceInTime = end.getTime() - start.getTime();

  // Convert time difference from milliseconds to days
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  return differenceInDays + 1; // +1 to include both start and end dates
};
exports.updateEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
   // const { haldDays, ...leaveApplicationData } = req.body;
    const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption, status, haldDays, leaveApplicationAttachments } = req.body;
 
    const updatedLeaveApplication = await LeaveApplication.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    await LeaveApplicationHalfDay.deleteMany({
      leaveCategory: updatedLeaveApplication._id,
    });
    var createdHalfDays = null;
    // Check if haldDays is provided and valid
    if (Array.isArray(haldDays)) {
      // Create haldDays instances
      createdHalfDays = await LeaveApplicationHalfDay.insertMany(haldDays.map(haldDay => ({
        leaveApplication: updatedLeaveApplication._id,
        date: haldDay.date,
        dayHalf: haldDay.dayHalf
      })));
    }
    updatedLeaveApplication.halfDays = createdHalfDays;
    if (!updatedLeaveApplication) {
      return next(new AppError('Employee Leave Application not found', 404));
    }
    else {
      try {
        // Check if the status is 'Cancelled' or 'Rejected'
        if (req.body.status === constants.Leave_Application_Constant.Cancelled || req.body.status === constants.Leave_Application_Constant.Rejected) {
          const leaveDays = calculateLeaveDays(startDate, endDate);
          const cycle = await scheduleController.createFiscalCycle();
          const leaveAssigned = await LeaveAssigned.findOne({ employee: req.body.employee, cycle: cycle, category: req.body.leaveCategory });

          // Deduct the applied leave days from the leave remaining
          leaveAssigned.leaveRemaining += leaveDays;
          leaveAssigned.leaveTaken -= leaveDays; // Update the leave taken count

          // Save the updated leave assigned record
          await leaveAssigned.save();
          sendEmailToUsers(req.body.employee,constants.Email_template_constant.CancelReject_Request_Leave_Application,updatedLeaveApplication,req.cookies.companyId);          
        }
        if (req.body.status === constants.Leave_Application_Constant.Approved) {
          sendEmailToUsers(req.body.employee,constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved,updatedLeaveApplication,req.cookies.companyId);  
         
      }
      }
      catch (error) {
        console.error("Error updating leave balance:", error);
        return res.status(500).send("Internal Server Error.");
      }
    }

    res.status(200).json({
      status: 'success',
      data: updatedLeaveApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeLeaveApplicationByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LeaveApplication.countDocuments({ employee: userId });

    const leaveApplications = await LeaveApplication.find({ employee: userId }).skip(parseInt(skip))
      .limit(parseInt(limit));

    // If no leave applications are found, return an empty array
    if (leaveApplications.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: [],
        total: 0,
      });
    }

    // if (leaveApplications.length === 0) {
    //   return next(new AppError('Employee Leave Applications not found', 404));
    // }
    for (var i = 0; i < leaveApplications.length; i++) {
      const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
      if (halfDays) {
        leaveApplications[i].halfDays = halfDays;
      }
      else {
        leaveApplications[i].halfDays = null;
      }
    }
    res.status(200).json({
      status: 'success',
      data: leaveApplications,
      total: totalCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeLeaveApplicationByTeam = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      teamIdsArray.push(ids[i]);
    }
  }
  if (teamIds == null) {
    teamIdsArray.push(req.cookies.userId);
  }

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id)); 
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await LeaveApplication.countDocuments({ employee: { $in: objectIdArray } });

  const leaveApplications = await LeaveApplication.find({
    employee: { $in: objectIdArray }
  }).skip(parseInt(skip))
    .limit(parseInt(limit));

  for (var i = 0; i < leaveApplications.length; i++) {
    const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
    if (halfDays) {
      leaveApplications[i].halfDays = halfDays;
    }
    else {
      leaveApplications[i].halfDays = null;
    }
  }

  res.status(200).json({
    status: 'success',
    data: leaveApplications,
    total: totalCount
  });
});

exports.deleteEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leaveApplication = await LeaveApplication.findById(id);
    if (leaveApplication) {
    
        const deletedLeaveApplication = await LeaveApplication.findByIdAndDelete(id);   
        const leaveDays = calculateLeaveDays(leaveApplication.startDate, leaveApplication.endDate);
      
        const cycle = await scheduleController.createFiscalCycle();
        console.log(leaveApplication.employee);
        console.log(cycle);
        console.log(leaveApplication.leaveCategory);
        const leaveAssigned = await LeaveAssigned.findOne({ employee: leaveApplication.employee, cycle: cycle, category: leaveApplication.leaveCategory });
        console.log(leaveAssigned);
        // Deduct the applied leave days from the leave remaining
        leaveAssigned.leaveRemaining += leaveDays;
        leaveAssigned.leaveTaken -= leaveDays; // Update the leave taken count

        // Save the updated leave assigned record
        await leaveAssigned.save();
      }
    

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const status = req.body.status;

    let query = { company: req.cookies.companyId };
    if (status !== null && status !== undefined) {
      query.status = status;
    }

    //const totalCount = await LeaveApplication.countDocuments({ company: req.cookies.companyId});  
    const totalCount = await LeaveApplication.countDocuments(query);

    const leaveApplications = await LeaveApplication.find(query).skip(parseInt(skip))
      .limit(parseInt(limit));
    for (var i = 0; i < leaveApplications.length; i++) {
      const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
      if (halfDays) {
        leaveApplications[i].halfDays = halfDays;
      }
      else {
        leaveApplications[i].halfDays = null;
      }
    }
    res.status(200).json({
      status: 'success',
      data: leaveApplications,
      total: totalCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leaveApplication = await LeaveApplication.findById(id);
    const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplication._id);
    if (halfDays) {
      leaveApplication.halfDays = halfDays;
    }
    else {
      leaveApplication.halfDays = null;
    }

    if (!leaveApplication) {
      return next(new AppError('Leave Application not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: leaveApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.addShortLeave = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
    req.body.company = company; // Set company in the request body
    const shortLeave = await ShortLeave.create(req.body);
    res.status(201).json({
      status: 'success',
      data: shortLeave
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getShortLeave = async (req, res, next) => {
  try {
    const shortLeave = await ShortLeave.findById(req.params.id);
    if (!shortLeave) {
      res.status(404).json({
        status: 'failure',
        message: 'ShortLeave not found'
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: shortLeave
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.updateShortLeave = async (req, res, next) => {
  try {
    const shortLeave = await ShortLeave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shortLeave) {
      res.status(404).json({
        status: 'failure',
        message: 'ShortLeave not found'
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: shortLeave
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.deleteShortLeave = async (req, res, next) => {
  try {
    const shortLeave = await ShortLeave.findByIdAndDelete(req.params.id);
    if (!shortLeave) {
      res.status(404).json({
        status: 'failure',
        message: 'ShortLeave not found'
      });
    } else {
      res.status(204).json({
        status: 'success',
        data: null
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getShortLeaveByUser = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await ShortLeave.countDocuments({ employee: req.params.userId, status: req.body.status });

    const shortLeaves = await ShortLeave.find({ employee: req.params.userId, status: req.body.status }).skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: 'success',
      data: shortLeaves,
      total: totalCount
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};


exports.getShortLeaveByTeam = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      teamIdsArray.push(ids[i]);
    }
  }
  if (teamIds == null) {
    teamIdsArray.push(req.cookies.userId);
  }

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id)); 
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const totalCount = await ShortLeave.countDocuments({ employee: { $in: objectIdArray }, status: req.body.status });

  const shortLeaves = await ShortLeave.find({
    employee: { $in: objectIdArray }, status: req.body.status
  }).skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: shortLeaves,
    total: totalCount
  });
});

exports.getAllShortLeave = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;

    const totalCount = await ShortLeave.countDocuments({ company: req.cookies.companyId, status: req.body.status });

    const shortLeaves = await ShortLeave.find({ company: req.cookies.companyId, status: req.body.status }).skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: 'success',
      data: shortLeaves,
      total: totalCount
    });

  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getLeaveBalance = async (req, res, next) => {
  try {
    const leaveAssigned = await LeaveAssigned.find({ company: req.cookies.companyId }).where('employee').equals(req.body.user).where('cycle').equals(req.body.cycle).where('category').equals(req.body.category);
    res.status(200).json({
      status: 'success',
      data: leaveAssigned
    });

  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getLeaveBalanceByTeam = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      teamIdsArray.push(ids[i]);
    }
  }
  if (teamIds == null) {
    teamIdsArray.push(req.cookies.userId);
  }

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await LeaveAssigned.countDocuments({ employee: { $in: objectIdArray } });

  const leaveBalances = await LeaveAssigned.find({
    employee: { $in: objectIdArray }
  }).skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: leaveBalances,
    total: totalCount
  });
});
exports.getLeaveBalanceByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const cycle = await scheduleController.createFiscalCycle();

  const totalCount = await LeaveAssigned.countDocuments({ company: req.cookies.companyId, cycle: cycle });

  const leaveBalances = await LeaveAssigned.find({
    company: req.cookies.companyId, cycle: cycle
  }).skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: leaveBalances,
    total: totalCount
  });
});