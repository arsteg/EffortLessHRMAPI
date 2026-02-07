const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/LeaveGeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplate = require('../models/Leave/LeaveTemplateModel');
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const TemplateCubbingRestriction = require('../models/Leave/TemplateCubbingRestrictionModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const LeaveGrant = require('../models/Leave/LeaveGrantModel');
const HolidayCalendar = require('../models/Company/holidayCalendar');
const LeaveApplication = require('../models/Leave/LeaveApplicationModel');
const LeaveApplicationHalfDay = require('../models/Leave/LeaveApplicationHalfDayModel');
const ShortLeave = require("../models/Leave/ShortLeaveModel");
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const UserEmployment = require('../models/Employment/UserEmploymentModel');
const HolidayApplicableOffice = require('../models/Company/HolidayApplicableOffice');
const { ObjectId } = require('mongodb');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const TemplateApplicableCategoryEmployee = require("../models/Leave/TemplateApplicableCategoryEmployeeModel");
const userSubordinate = require('../models/userSubordinateModel');
const scheduleController = require('../controllers/ScheduleController');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const constants = require('../constants');
const User = require('../models/permissions/userModel');
const Company = require('../models/companyModel');
const sendEmail = require('../utils/email');
const StorageController = require('./storageController');
const { SendUINotification } = require('../utils/uiNotificationSender');
const websocketHandler = require('../utils/websocketHandler');
const AttendanceTemplate = require('../models/attendance/attendanceTemplate');
const AttendanceTemplateAssignments = require('../models/attendance/attendanceTemplateAssignments');
const { toUTCDate } = require('../utils/utcConverter');

exports.createGeneralSetting = catchAsync(async (req, res, next) => {
  // Retrieve companyId from cookies
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('leave.companyInfoMissing'),
    });
  }

  // Create the general setting with the companyId
  const generalSettingData = { ...req.body, company }; // Assuming req.body contains the general setting data
  const generalSetting = await GeneralSetting.create(generalSettingData);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: generalSetting
  });
});

exports.getGeneralSettingByCompany = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findOne({
    company: req.cookies.companyId
  });
  ;
  if (!generalSetting) {
    return new AppError(req.t('leave.generalSettingNotFound'), 404);
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: generalSetting
  });
});

exports.getGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findById(req.params.id);
  if (!generalSetting) {
    return new AppError(req.t('leave.generalSettingNotFound'), 404)
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: generalSetting
  });
});

exports.updateGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!generalSetting) {
    return new AppError(req.t('leave.generalSettingNotFound'), 404);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: generalSetting
  });
});

exports.createLeaveCategory = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating leave template for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }

  const { label } = req.body;
  const existingLeaveCategory = await LeaveCategory.findOne({
    label: { $regex: new RegExp(`^${label}$`, 'i') }, company: companyId, isDelete: { $ne: true }
  });
  if (existingLeaveCategory) {
    websocketHandler.sendLog(req, `Leave category with label "${label}" already exists for company ${req.cookies.companyName}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('leave.categoryAlreadyExists'), 400));
  }
  req.body.company = companyId;

  if (req.body.leaveType === 'annual-non-accrual-leave') {
    req.body.leaveAccrualPeriod = 'Annually';
  }

  const leaveCategory = await LeaveCategory.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: leaveCategory,
    message: req.t('leave.leaveCategory')
  });
});

exports.getLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findById(req.params.id);
  if (!leaveCategory) {
    return next(new AppError(req.t('leave.leaveCategoryNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveCategory
  });
});

exports.getLeaveCategoryByTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.templateId);
  if (!leaveTemplateCategory) {
    return next(new AppError(req.t('leave.leaveCategoryNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveTemplateCategory
  });
});

exports.updateLeaveCategory = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating leave category with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  const companyId = req.cookies.companyId;

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }

  const label = req.body.label?.trim();

  // 🔍 Check if another leave category with the same label exists (excluding the current one)
  const duplicate = await LeaveCategory.findOne({
    _id: { $ne: req.params.id },
    company: companyId,
    label: { $regex: new RegExp(`^${label}$`, 'i') } // case-insensitive match
  });

  if (duplicate) {
    websocketHandler.sendLog(req, `Duplicate label "${label}" found for another leave category`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('leave.labelExists'), 400));
  }

  if (req.body.leaveType === 'annual-non-accrual-leave') {
    req.body.leaveAccrualPeriod = 'Annually';
  }

  const leaveCategory = await LeaveCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!leaveCategory) {
    websocketHandler.sendLog(req, `Leave category not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('leave.leaveCategoryNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully updated leave category: ${leaveCategory._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('leave.updateLeaveCategorySuccess', { recordId: leaveCategory._id }),
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
    return next(new AppError(req.t('leave.leaveCategoryNotFound'), 404)
    );
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveCategory,
    total: totalCount
  });
});
exports.getAllLeaveCategoryByUser = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(req.params.userId);
  const leaveTemplateCategory = await LeaveTemplateCategory.find({ leaveTemplate: employeeLeaveAssignment.leaveTemplate });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveTemplateCategory
  });
});

exports.getAllLeaveCategoryByUserV1 = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(req.params.userId);
  if (!employeeLeaveAssignment) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
    });
  }
  const leaveTemplateCategory = await LeaveTemplateCategory.find({ leaveTemplate: employeeLeaveAssignment.leaveTemplate }).populate('leaveCategory');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveTemplateCategory
  });
});

exports.deleteLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findById(req.params.id);
  if (!leaveCategory) {
    return next(new AppError(req.t('leave.leaveCategoryNotFound'), 404));
  }
  //add validation for use categroy
  if (leaveCategory.isSystemGenerated) {
    return next(new AppError(req.t('leave.systemGeneratedLeaveCategory'), 404));
  }
  else {

    const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveCategory').equals(req.params.id);
    if (leaveTemplateCategory !== null && leaveTemplateCategory.length > 0) {
      return next(new AppError(req.t('leave.leaveCategoryInTemplate'), 404));
    }
    else {
      await LeaveCategory.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null,
      });
    }
  }
});

exports.deleteLeaveTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateExists = await LeaveTemplate.findById(req.params.id);
  if (!leaveTemplateExists) {
    return next(new AppError(req.t('leave.employeeLeaveAssignmentNotFound'), 404));
  }
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(leaveTemplateExists.user).where('status').in(['Approved', 'Rejected', 'Cancelled']); // Filter by status
  if (employeeLeaveAssignment.length > 0) {
    return next(new AppError(req.t('leave.leaveNeedClosure'), 404));
  }
  await LeaveTemplate.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
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
    throw new AppError(req.t('leave.ErrorCreatingLeaveTemplateCategory'), 500);
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
    return next(new AppError(req.t('leave.labelRequired'), 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('leave.companyIdNotFound'), 400));
  }

  // --- FIX STARTS HERE ---
  // Create a case-insensitive regular expression for the label
  const labelRegex = new RegExp(`^${leaveTemplateData.label}$`, 'i');

  // Check if a template with the same label (case-insensitive) already exists
  const existingTemplate = await LeaveTemplate.findOne({
    company: companyId, // It's good practice to also check by company
    'label': { $regex: labelRegex }
  });

  if (existingTemplate) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('leave.labelExists'),
    });
  }
  // --- FIX ENDS HERE ---

  // Check if leaveCategories is provided and valid
  if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError(req.t('leave.leaveCategoriesRequired'), 400));
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
    status: constants.APIResponseStatus.Success,
    data: leaveTemplate
  });
});

exports.getLeaveTemplate = async (req, res, next) => {
  try {
    const leaveTemplate = await LeaveTemplate.findById(req.params.id);
    if (!leaveTemplate) {
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.leaveTemplateNotFound')
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
      status: constants.APIResponseStatus.Success,
      data: leaveTemplate
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.updateLeaveTemplate = async (req, res, next) => {
  try {
    const { leaveCategories, cubbingRestrictionCategories, ...leaveTemplateData } = req.body;

    // Check if policyLabel is provided
    if (!leaveTemplateData.label) {
      return next(new AppError(req.t('leave.labelRequired'), 400));
    }

    // Check if policyLabel already exists
    const existingTemplate = await LeaveTemplate.findOne({ 'label': leaveTemplateData.Label, _id: { $ne: req.params.id } });

    if (existingTemplate) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.leaveTemplateLabelExists'),
      });
    }
    if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
      return next(new AppError(req.t('leave.leaveCategoryNotInRequest'), 400));
    }
    // Extract companyId from req.cookies

    for (const category of leaveCategories) {
      const result = await LeaveCategory.findById(category.leaveCategory);
      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('leave.invalidCategory'),
        });
      }
    }


    const leaveTemplate = await LeaveTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leaveTemplate) {
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.leaveTemplateNotFound')
      });
      return;
    }
    const updatedCategories = await updateOrCreateLeaveTemplateCategories(req.params.id, req.body.leaveCategories);

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
      status: constants.APIResponseStatus.Success,
      data: { leaveTemplate: leaveTemplate, leaveCategories: updatedCategories },
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.getAllLeaveTemplates = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const companyId = req.cookies.companyId;

    // Get total count
    const totalCount = await LeaveTemplate.countDocuments({ company: companyId });

    // Fetch leave templates
    const leaveTemplates = await LeaveTemplate.find({ company: companyId })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects

    // Process each leave template
    for (let i = 0; i < leaveTemplates.length; i++) {
      // Fetch applicable categories
      const leaveTemplateCategories = await LeaveTemplateCategory.find({
        leaveTemplate: leaveTemplates[i]._id,
      }).lean();

      if (leaveTemplateCategories.length > 0) {
        for (let m = 0; m < leaveTemplateCategories.length; m++) {
          const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({
            leaveTemplateCategory: leaveTemplateCategories[m]._id,
          }).lean();

          leaveTemplateCategories[m].templateApplicableCategoryEmployee =
            templateApplicableCategoryEmployee.length > 0 ? templateApplicableCategoryEmployee : null;
        }
        leaveTemplates[i].applicableCategories = leaveTemplateCategories;
      } else {
        leaveTemplates[i].applicableCategories = null;
      }

      // Fetch leave clubbing restrictions
      const leaveClubbingRestrictions = await LeaveTemplateCategory.find({
        leaveTemplate: leaveTemplates[i]._id,
      }).lean();

      leaveTemplates[i].cubbingRestrictionCategories =
        leaveClubbingRestrictions.length > 0 ? leaveClubbingRestrictions : null;

      // Fetch and set leave template assignment count
      const templateAssignment = await EmployeeLeaveAssignment.find({
        leaveTemplate: leaveTemplates[i]._id,
      }).lean();

      leaveTemplates[i].leaveTemplateAssignmentCount = templateAssignment.length;
    }

    // Send response
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: leaveTemplates,
      total: totalCount,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

// Create a new LeaveTemplateCategory
exports.createLeaveTemplateCategory = catchAsync(async (req, res, next) => {

  const { leaveTemplate, leaveCategories } = req.body;
  // Validate incoming data
  if (!leaveTemplate || !leaveCategories || !Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError(req.t('leave.invalidRequestData'), 400));
  }
  for (const category of leaveCategories) {
    const result = await LeaveCategory.findById(category.leaveCategory);
    if (!result) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.invalidCategory'),
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
    status: constants.APIResponseStatus.Success,
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
    throw new AppError(req.t('leave.internalServerError'), 500);
  }
}

// Get a LeaveTemplateCategory by ID
exports.getLeaveTemplateCategoryByTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.leaveTemplateId);;
  if (!leaveTemplateCategories) {
    return next(new AppError(req.t('leave.leaveTemplateNotFound'), 404));
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
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: leaveTemplateCategories
  });
});

exports.createEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('leave.companyIdNotFound'), 400));
  }
  const assignments = Array.isArray(req.body) ? req.body : [req.body];

  const results = [];
  for (const assignment of assignments) {
    // Add companyId to each assignment
    assignment.company = companyId;
    const existingAssignments = await EmployeeLeaveAssignment.find({
      user: assignment.user,
    });

    // Fetch the leave template to check for approvalType
    const leaveTemplate = await LeaveTemplate.findById(assignment.leaveTemplate);
    if (leaveTemplate && leaveTemplate.approvalType === 'template-wise') {
      assignment.primaryApprover = leaveTemplate.primaryApprover;
      assignment.secondaryApprover = leaveTemplate.secondaryApprover || null;
    }

    // Create or update the assignment
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
    status: constants.APIResponseStatus.Success,
    data: results,
  });
});


exports.getEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);
  if (!employeeLeaveAssignment) {
    return next(new AppError(req.t('leave.employeeLeaveAssignmentNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLeaveAssignment,
  });
});
exports.getEmployeeLeaveAssignmentByUser = catchAsync(async (req, res, next) => {
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(req.params.userId);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: LeaveTemplate,
  });
});

exports.deleteEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {

  //validation
  const userLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);
  if (!userLeaveAssignment) {
    return next(new AppError(req.t('leave.employeeLeaveAssignmentNotFound'), 404));
  }

  await EmployeeLeaveAssignment.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: employeeLeaveAssignments,
    total: totalCount
  });
});

exports.createEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('leave.companyIdNotFound'), 400));
  }
  const {
    users,
    ...grantData
  } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return next(new AppError(req.t('leave.usersRequired'), 400));
  }

  var leavsGrants = [];
  for (var i = 0; i < users.length; i++) {
    const leavegrantExits = await LeaveGrant.findOne({
      employee: users[i].user,
      date: grantData.date
    });

    if (leavegrantExits !== null) {
      return next(new AppError(req.t('leave.leaveAlreadyGranted'), 404));
    }
    // Add company to the request body
    grantData.company = companyId;
    grantData.employee = users[i].user;
    grantData.usedOn = grantData.date;
    grantData.appliedOn = new Date();
    // Create LeaveTemplate instance
    const leaveGrant = await LeaveGrant.create(grantData);
    leavsGrants.push(leaveGrant);

    console.log('users[i].user', users[i].user);

    // Employee receives notification about their own leave grant (user view)
    const leaveGrantUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-leave-grant`;
    SendUINotification(req.t('leave.addLeaveRequestNotificationTitle'), req.t('leave.addLeaveRequestNotificationMessage', { date: new Date(grantData.date).toISOString().split('T')[0] }),
      constants.Event_Notification_Type_Status.leave, users[i].user.toString(), companyId, req, leaveGrantUrl);
  }
  // Send success response
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: leavsGrants
  });
});

exports.getEmployeeLeaveGrantByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const status = req.body.status;

  let query = { employee: userId };
  if (status) {
    query.status = status;
  }

  const totalCount = await LeaveGrant.countDocuments(query);

  const leaveGrants = await LeaveGrant.find(query)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveGrants,
    total: totalCount
  });
});

exports.getEmployeeLeaveGrantByTeam = catchAsync(async (req, res, next) => {
  let teamIdsArray = [];

  // Get subordinate user IDs
  const subordinateIds = await userSubordinate.find({})
    .distinct('subordinateUserId')
    .where('userId')
    .equals(req.cookies.userId);

  if (subordinateIds.length > 0) {
    teamIdsArray = subordinateIds;
  }
  const currentUserObjectId = new ObjectId(req.cookies.userId);
  teamIdsArray = teamIdsArray.filter(id => !id.equals(currentUserObjectId));


  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  // Only proceed if there are actual team members to query for
  if (objectIdArray.length === 0) {
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: [],
      total: 0
    });
  }

  const totalCount = await LeaveGrant.countDocuments({ employee: { $in: objectIdArray }, status: req.body.status });
  const leaveGrants = await LeaveGrant.find({ employee: { $in: objectIdArray }, status: req.body.status })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
      return next(new AppError(req.t('leave.employeeLeaveGrantNotFound'), 404));
    }

    // Check if the user is valid
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return next(new AppError(req.t('leave.invalidUser'), 400));
    }

    // Check if a LeaveGrant with the same date for the same user already exists
    const existingLeaveGrant = await LeaveGrant.findOne({ user, date });
    if (existingLeaveGrant && existingLeaveGrant._id.toString() !== id) {
      return next(new AppError(req.t('leave.leaveGrantDateExists'), 400));
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

    // Generate navigation URL for leave grant (employee's own view)
    const leaveGrantUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-leave-grant`;

    SendUINotification('Your leave request has been updated', `Your leave request has been ${leaveGrant.status}.`,
      constants.Event_Notification_Type_Status.leave, existingUser?._id?.toString(), req.cookies.companyId, req, leaveGrantUrl);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: leaveGrant
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteEmployeeLeaveGrant = catchAsync(async (req, res, next) => {

  await LeaveGrant.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
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
    return next(new AppError(req.t('leave.companyIdNotFound'), 400));
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
    status: constants.APIResponseStatus.Success,
    data: leaveGrants,
    total: totalCount
  });
});

exports.getEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  const leaveGrants = await LeaveGrant.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveGrants,
  });
});

// Helper function to calculate leave days, now considering weekly offs
// Helper function to calculate leave days, now considering weekly offs and holidays
const calculateLeaveDays = (startDate, endDate, weeklyOffDays = [], includeWeeklyOffs = false, holidays = [], includeHolidays = false) => {
  let count = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  const abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create a Set of holiday time strings for O(1) lookup
  const holidaySet = new Set(holidays.map(h => new Date(h.date).toDateString()));

  while (currentDate <= end) {
    const dayIndex = currentDate.getDay();
    const dayOfWeekAbbreviated = abbreviatedDayNames[dayIndex];
    const currentDateString = currentDate.toDateString();
    const isHoliday = holidaySet.has(currentDateString);
    const isWeeklyOff = weeklyOffDays.includes(dayOfWeekAbbreviated);
    let isCountable = true;

    if (isWeeklyOff && !includeWeeklyOffs) {
      isCountable = false;
    }

    if (isHoliday && !includeHolidays) {
      isCountable = false;
    }
    if (isCountable) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

// Helper function to count weekly off days within a date range
const countWeeklyOffDays = (startDate, endDate, weeklyOffDays = []) => {
  let count = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // New array for abbreviations

  while (currentDate <= end) {
    const dayIndex = currentDate.getDay(); // Get the numeric day
    const dayOfWeekAbbreviated = abbreviatedDayNames[dayIndex]; // Get the abbreviated name

    if (weeklyOffDays.includes(dayOfWeekAbbreviated)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

// exports.createEmployeeLeaveApplication = async (req, res, next) => {
//   try {
//     const companyId = req.cookies.companyId;
//     if (!companyId) {
//       return next(new AppError(req.t('leave.companyIdNotFound'), 400));
//     }

//     const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption, status, haldDays, leaveApplicationAttachments } = req.body;

//     const cycle = await scheduleController.createFiscalCycle();
//     const assignmentExists = await scheduleController.doesLeaveAssignmentExist(employee, cycle, leaveCategory);

//     if (!assignmentExists) {
//       return res.status(400).json({
//         status: constants.APIResponseStatus.Failure,
//         data: null,
//         message: req.t('leave.leaveAssignmentNotExist')
//       });
//     }

//     const leaveAssigned = await LeaveAssigned.findOne({ employee: employee, cycle: cycle, category: leaveCategory });
//     const leaveCat = await LeaveCategory.findById(leaveCategory);
//     if (!leaveCat) {
//       return next(new AppError(req.t('leave.leaveCategoryNotFound'), 400));
//     }

//     const attendanceTemplate = await AttendanceTemplate.findOne({ company: companyId });
//     const weeklyOffDays = attendanceTemplate ? attendanceTemplate.weeklyOfDays : [];

//     const includeWeeklyOffsInLeaveDays = leaveCat.isWeeklyOffLeavePartOfNumberOfDaysTaken;

//     const leaveDays = calculateLeaveDays(startDate, endDate, weeklyOffDays, includeWeeklyOffsInLeaveDays);
//     const numberOfWeeklyOffDays = countWeeklyOffDays(startDate, endDate, weeklyOffDays);

//     if (leaveAssigned?.leaveRemaining < leaveDays) {
//       return res.status(400).json({
//         status: constants.APIResponseStatus.Failure,
//         data: null,
//         message: req.t('leave.insufficientLeaveBalance')
//       });
//     }

//     let documentLink;
//     if (leaveApplicationAttachments && leaveApplicationAttachments.length > 0) { 
//       for (const attachment of leaveApplicationAttachments) { 
//         if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || !attachment.extention || !attachment.file
//           || attachment.attachmentType === null || attachment.attachmentName === null || attachment.attachmentSize === null || attachment.extention === null || attachment.file === null) {
//           return res.status(400).json({ error: req.t('leave.AttachmentPropertiesMustBeProvided') });
//         }
//         const id = Date.now().toString(36);
//         attachment.filePath = attachment.attachmentName + "_" + id + attachment.extention;
//         documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.LeaveAttachment, attachment);
//       }
//     }

//     const newLeaveApplication = await LeaveApplication.create({
//       employee,
//       leaveCategory,
//       level1Reason,
//       level2Reason,
//       startDate,
//       endDate,
//       comment,
//       isHalfDayOption,
//       status,
//       company: req.cookies.companyId,
//       documentLink,
//       calculatedLeaveDays: leaveDays,
//       weeklyOffDaysIncluded: includeWeeklyOffsInLeaveDays,
//       numberOfWeeklyOffDays: numberOfWeeklyOffDays
//     });

//     let createdHalfDays = null;
//     if (Array.isArray(haldDays) && haldDays.length > 0) { // Check for empty array too
//       createdHalfDays = await LeaveApplicationHalfDay.insertMany(haldDays.map(haldDay => ({
//         leaveApplication: newLeaveApplication._id,
//         date: haldDay.date,
//         dayHalf: haldDay.dayHalf
//       })));
//       newLeaveApplication.halfDays = createdHalfDays.map(hd => hd._id); // Store only IDs
//       await newLeaveApplication.save(); // Save to link half-days
//     }

//     try {
//       leaveAssigned.leaveRemaining -= leaveDays;
//       leaveAssigned.leaveTaken += leaveDays;
//       await leaveAssigned.save();


//       const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(employee);
//       if (managerTeamsIds && managerTeamsIds.length > 0) {
//         const user = await User.findById(req.body.employee);
//         const userName = `${user?.firstName} ${user?.lastName}`;
//         SendUINotification(req.t('leave.employeeLeaveRequestNotificationTitle'), req.t('leave.employeeLeaveRequestNotificationMessage', { employeeName: userName, days: leaveDays }),
//           constants.Event_Notification_Type_Status.leave, user?._id?.toString(), companyId, req);

//         for (const managerId of managerTeamsIds) { 
//           const manager = await User.findById(managerId); 
//           const companyDetails = await Company.findById(req.cookies.companyId);
//           sendEmailToUsers(user, manager, constants.Email_template_constant.Leave_Application_Approval_Request, newLeaveApplication, companyDetails);

//           SendUINotification(req.t('leave.managerLeaveApprovalNotificationTitle'), req.t('leave.managerLeaveApprovalNotificationMessage', { firstName: manager?.firstName, lastName: manager?.lastName, employeeName: userName, days: leaveDays }),
//             constants.Event_Notification_Type_Status.leave, manager?._id?.toString(), companyId, req);
//         }
//       }
//     } catch (error) {
//       console.error("Error applying for leave and updating assigned leave:", error);
//     }

//     res.status(201).json({
//       status: constants.APIResponseStatus.Success,
//       data: newLeaveApplication 
//     });
//   } catch (error) {
//     next(error);
//   }
// };
exports.createEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const companyId = req.cookies.companyId;
    if (!companyId) {
      return next(new AppError(req.t('leave.companyIdNotFound'), 400));
    }

    const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption, status, halfDays, leaveApplicationAttachments } = req.body;
    const utcStartDate = toUTCDate(startDate);
    const utcEndDate = toUTCDate(endDate);

    const cycle = await scheduleController.createFiscalCycle();
    const createdOn = new Date();
    var currentMonth = createdOn.getMonth();
    const leaveCat = await LeaveCategory.findById(leaveCategory);
    const { startMonth, endMonth } = await scheduleController.getPeriodRange(currentMonth, leaveCat.leaveAccrualPeriod);

    const assignmentExists = await scheduleController.doesLeaveAssignmentExistV1({
      employee,
      category: leaveCat?._id,
      cycle,
      startMonth,
      endMonth
    });

    // const startDateObj = new Date(startDate);
    // const endDateObj = new Date(endDate);
    const startMonthOfLeave = utcStartDate.getMonth() + 1;
    const endMonthOfLeave = utcEndDate.getMonth() + 1;

    const isWithinRange = (startMonthOfLeave >= startMonth && startMonthOfLeave <= endMonth) &&
      (endMonthOfLeave >= startMonth && endMonthOfLeave <= endMonth);  //check if both leave start and end ate are within the range of the leave assignment leave balance

    if (!assignmentExists || !isWithinRange) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        data: null,
        message: req.t('leave.leaveAssignmentNotExist')
      });
    }

    const leaveAssigned = await LeaveAssigned.findOne({ employee: employee, cycle: cycle, category: leaveCategory });
    if (!leaveCat) {
      return next(new AppError(req.t('leave.leaveCategoryNotFound'), 400));
    }

    const assignment = await AttendanceTemplateAssignments
      .findOne({ employee: employee, company: companyId })
      .populate({
        path: 'attendanceTemplate',
        select: 'weeklyOfDays weklyofHalfDay attendanceMode'
      });
    const weeklyOffDays = assignment?.attendanceTemplate?.weeklyOfDays || [];
    // const attendanceTemplate = await AttendanceTemplate.findOne({ company: companyId });
    // const weeklyOffDays = attendanceTemplate ? attendanceTemplate.weeklyOfDays : [];

    const includeWeeklyOffsInLeaveDays = leaveCat.isWeeklyOffLeavePartOfNumberOfDaysTaken;
    const includeHolidaysInLeaveDays = leaveCat.isAnnualHolidayLeavePartOfNumberOfDaysTaken;

    // Fetch employee location
    const userEmployment = await UserEmployment.findOne({ user: employee });
    const employeeLocation = userEmployment?.location;

    // Fetch Holidays between startDate and endDate
    let holidays = await HolidayCalendar.find({
      company: companyId,
      date: {
        $gte: utcStartDate,
        $lte: utcEndDate
      }
    });

    // Filter holidays based on employee location
    if (employeeLocation && holidays.length > 0) {
      const filteredHolidays = [];
      for (const holiday of holidays) {
        if (holiday.locationAppliesTo === 'All-Locations') {
          filteredHolidays.push(holiday);
        } else if (holiday.locationAppliesTo === 'Selected-Locations') {
          const isApplicable = await HolidayApplicableOffice.findOne({
            holiday: holiday._id,
            office: employeeLocation
          });
          if (isApplicable) {
            filteredHolidays.push(holiday);
          }
        }
      }
      holidays = filteredHolidays;
    }

    let leaveDays = calculateLeaveDays(utcStartDate, utcEndDate, weeklyOffDays, includeWeeklyOffsInLeaveDays, holidays, includeHolidaysInLeaveDays);

    // Adjust leave days for half-day options
    if (isHalfDayOption && Array.isArray(halfDays) && halfDays.length > 0) {
      const totalHalfDaysCount = halfDays.length;

      if (leaveDays > 0) {
        leaveDays = leaveDays - (totalHalfDaysCount / 2);
      }
    }

    const numberOfWeeklyOffDays = countWeeklyOffDays(utcStartDate, utcEndDate, weeklyOffDays);

    // Negative Balance Check
    const negativePolicy = (leaveCat.negativeLeaveBalancePolicy || constants.Negative_Balance_Policy.None).toString().trim().toLowerCase();
    let isNegativeAllowed = leaveCat.isEmployeesAllowedToNegativeLeaveBalance;

    // Override old toggle if new policy is explicitly set
    if (negativePolicy === constants.Negative_Balance_Policy.No_Limit.toLowerCase() ||
      negativePolicy === constants.Negative_Balance_Policy.Mark_As_LOP.toLowerCase()) {
      isNegativeAllowed = true;
    } else if (negativePolicy === constants.Negative_Balance_Policy.None.toLowerCase()) {
      isNegativeAllowed = false;
    }

    if (!isNegativeAllowed && (leaveAssigned?.leaveRemaining || 0) < leaveDays) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        data: null,
        message: req.t('leave.insufficientLeaveBalance')
      });
    }


    // Additional policy checks could go here (e.g. Accrual period end check)
    // For now, we allow the application if policy is NOT 'none'.

    // Use an array to store all document links
    const documentLinks = [];
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit

    if (leaveApplicationAttachments && leaveApplicationAttachments.length > 0) {
      for (const attachment of leaveApplicationAttachments) {
        // Validate required attachment properties
        if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || !attachment.extention || !attachment.file) {
          return res.status(400).json({ error: req.t('leave.AttachmentPropertiesMustBeProvided') });
        }

        // Check for file size limit
        if (attachment.attachmentSize > MAX_FILE_SIZE_BYTES) {
          return res.status(500).json({
            status: constants.APIResponseStatus.Failure,
            message: req.t('common.fileSizeExceedsLimit') // Customize your translation key
          });
        }

        const id = Date.now().toString(36);
        attachment.filePath = attachment.attachmentName + "_" + id + attachment.extention;

        // Await the file upload and push the returned link to the array
        const documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.LeaveAttachment, attachment);
        documentLinks.push(documentLink);
      }
    }

    const newLeaveApplication = await LeaveApplication.create({
      employee,
      leaveCategory,
      level1Reason,
      level2Reason,
      startDate: utcStartDate,
      endDate: utcEndDate,
      comment,
      isHalfDayOption,
      status,
      company: req.cookies.companyId,
      documentLinks: documentLinks, // Save the array of links
      calculatedLeaveDays: leaveDays,
      weeklyOffDaysIncluded: includeWeeklyOffsInLeaveDays,
      numberOfWeeklyOffDays: numberOfWeeklyOffDays
    });

    let createdHalfDays = null;
    if (Array.isArray(halfDays) && halfDays.length > 0) {
      createdHalfDays = await LeaveApplicationHalfDay.insertMany(halfDays.map(halfDay => ({
        leaveApplication: newLeaveApplication._id,
        date: halfDay.date,
        dayHalf: halfDay.dayHalf
      })));
      newLeaveApplication.halfDays = createdHalfDays.map(hd => hd._id);
      await newLeaveApplication.save();
    }

    try {
      leaveAssigned.leaveRemaining -= leaveDays;
      //leaveAssigned.leaveTaken += leaveDays;
      leaveAssigned.leaveApplied += leaveDays;
      await leaveAssigned.save();


      //const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(employee);
      const user = await User.findById(req.body.employee);
      const userName = `${user?.firstName} ${user?.lastName}`;

      // Generate navigation URLs
      const leaveApplicationUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-application`;

      SendUINotification(req.t('leave.employeeLeaveRequestNotificationTitle'), req.t('leave.employeeLeaveRequestNotificationMessage', { employeeName: userName, days: leaveDays }),
        constants.Event_Notification_Type_Status.leave, user?._id?.toString(), companyId, req, leaveApplicationUrl);

      const LeaveApproval = await EmployeeLeaveAssignment.findOne({ user: employee })
        .select('primaryApprover');
      if (LeaveApproval) {
        //for (const managerId of managerTeamsIds) {
        const manager = await User.findById(LeaveApproval?.primaryApprover);
        const companyDetails = await Company.findById(req.cookies.companyId);

        // Generate approval URL for manager (team view)
        const approvalUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/team-application`;

        sendEmailToUsers(user, manager, constants.Email_template_constant.Leave_Application_Approval_Request, newLeaveApplication, companyDetails, leaveCat.label, approvalUrl);

        SendUINotification(req.t('leave.managerLeaveApprovalNotificationTitle'), req.t('leave.managerLeaveApprovalNotificationMessage', { firstName: manager?.firstName, lastName: manager?.lastName, employeeName: userName, days: leaveDays }),
          constants.Event_Notification_Type_Status.leave, manager?._id?.toString(), companyId, req, approvalUrl);
        //}
      }
    } catch (error) {
      console.error("Error applying for leave and updating assigned leave:", error);
    }

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: newLeaveApplication
    });
  } catch (error) {
    next(error);
  }
};

const sendEmailToUsers = async (user, manager, email_template_constant, leaveApplication, company, leaveCategoryLabel = null, approvalUrl = null) => {


  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(email_template_constant).where('company').equals(company._id);

  if (emailTemplate) {
    //if (email_template_constant == constants.Email_template_constant.Leave_Application_Approval_Request) {
    const template = emailTemplate.contentData;
    //const totalDays = leaveApplication.endDate - leaveApplication.startDate;
    const start = new Date(leaveApplication.startDate);
    const end = new Date(leaveApplication.endDate);
    const diffMs = end - start;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
console.log('send email approvalUrl' , approvalUrl);

    // Use provided leave category label or fallback to leaveApplication.leaveCategory
    const leaveTypeDisplay = leaveCategoryLabel || leaveApplication.leaveCategory?.label || leaveApplication.leaveCategory;
    const approvalLink = approvalUrl || '#';

    const message = template
      .replace("{firstName}", manager.firstName)
      .replace("{employeeName}", user.firstName + " " + user.lastName)
      .replace("{employeeName}", user.firstName + " " + user.lastName)
      .replace("{leaveType}", leaveTypeDisplay)
      .replace("{startDate}", formatDate(start))
      .replace("{endDate}", formatDate(end))
      .replace("{totalDays}", totalDays)
      .replace("{reason}", leaveApplication.comment || "-")
      .replace("{company}", company.companyName)
      .replace("{company}", company.companyName)
      .replace("{lastName}", manager.lastName)
      .replace("{leaveUrl}", approvalLink);
    //if (attendanceUser.email == "hrmeffortless@gmail.com") {
    try {
      await sendEmail({
        email: manager.email,
        subject: emailTemplate.subject,
        message
      });

    } catch (err) {
      console.error(`Error sending email to user ${user}:`, err);
    }
    //}
    //}
  }
};

// const calculateLeaveDays = (startDate, endDate) => {
//   // Ensure input is a string and convert to Date objects
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   // Check if the dates are valid
//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new Error(req.t('leave.InvaliddateFormat'));
//   }

//   // Ensure start is before end
//   if (end < start) {
//     throw new Error(req.t('leave.InvalidEndDate'));
//   }

//   // Calculate the difference in time
//   const differenceInTime = end.getTime() - start.getTime();

//   // Convert time difference from milliseconds to days
//   const differenceInDays = differenceInTime / (1000 * 3600 * 24);

//   return differenceInDays + 1; // +1 to include both start and end dates
// };

exports.updateEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const { halfDays, ...leaveApplicationData } = req.body;
    const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption, status, halfDays, leaveApplicationAttachments } = req.body;

    const updatedLeaveApplication = await LeaveApplication.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    await LeaveApplicationHalfDay.deleteMany({
      leaveApplication: updatedLeaveApplication._id,
    });
    var createdHalfDays = null;
    // Check if halfDays is provided and valid
    if (Array.isArray(halfDays)) {
      // Create halfDays instances
      createdHalfDays = await LeaveApplicationHalfDay.insertMany(halfDays.map(halfDay => ({
        leaveApplication: updatedLeaveApplication._id,
        date: halfDay.date,
        dayHalf: halfDay.dayHalf
      })));
    }
    updatedLeaveApplication.halfDays = createdHalfDays;
    if (!updatedLeaveApplication) {
      return next(new AppError(req.t('leave.leaveApplicationNotFound'), 404));
    }
    else {
      try {
        const companyId = req.cookies.companyId;
        const assignment = await AttendanceTemplateAssignments
          .findOne({ employee: updatedLeaveApplication.employee?._id, company: companyId })
          .populate({
            path: 'attendanceTemplate',
            select: 'weeklyOfDays weklyofHalfDay attendanceMode'
          });
        const weeklyOffDays = assignment?.attendanceTemplate?.weeklyOfDays || [];
        const includeWeeklyOffsInLeaveDays = updatedLeaveApplication?.leaveCategory?.isWeeklyOffLeavePartOfNumberOfDaysTaken;
        const includeHolidaysInLeaveDays = updatedLeaveApplication?.leaveCategory?.isAnnualHolidayLeavePartOfNumberOfDaysTaken;
        const holidays = await HolidayCalendar.find({
          company: companyId,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        });

        let leaveDays = updatedLeaveApplication.calculatedLeaveDays;
        const cycle = await scheduleController.createFiscalCycle();
        const leaveAssigned = await LeaveAssigned.findOne({ employee: updatedLeaveApplication.employee?._id, cycle: cycle, category: updatedLeaveApplication.leaveCategory?._id });
        const companyDetails = await Company.findById(req.cookies.companyId);
        const manager = await User.findById(updatedLeaveApplication?.employee?._id);

        if (req.body.status === constants.Leave_Application_Constant.Cancelled || req.body.status === constants.Leave_Application_Constant.Rejected) {
          leaveAssigned.leaveRemaining += leaveDays;
          leaveAssigned.leaveApplied = Math.max(0, leaveAssigned.leaveApplied - leaveDays); // Update the leave applied count

          // Save the updated leave assigned record
          await leaveAssigned.save();
          console.log('Sending rejection/cancellation email...');

          // Fetch leave category label
          const leaveCat = await LeaveCategory.findById(updatedLeaveApplication.leaveCategory?._id || updatedLeaveApplication.leaveCategory);
          const viewUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-application`;

          //sendEmailToUsers(req.body.employee, constants.Email_template_constant.CancelReject_Request_Leave_Application, updatedLeaveApplication, req.cookies.companyId);
          sendEmailToUsers(manager, manager, constants.Email_template_constant.CancelReject_Request_Leave_Application, updatedLeaveApplication, companyDetails, leaveCat?.label, viewUrl);
          SendUINotification(req.t('leave.leaveRejectNotificationTitle'), req.t('leave.leaveRejectNotificationMessage'), constants.Event_Notification_Type_Status.leave, updatedLeaveApplication.employee?._id?.toString(), req.cookies.companyId, req, viewUrl);
        }
        if (req.body.status === constants.Leave_Application_Constant.Approved) {
          console.log(`Leave approved, updating leave balance... ${startDate} # ${endDate} # ${leaveDays}`);
          leaveAssigned.leaveTaken += leaveDays;
          leaveAssigned.leaveApplied = Math.max(0, leaveAssigned.leaveApplied - leaveDays);
          await leaveAssigned.save();
          console.log('Sending approval email...');

          // Fetch leave category label
          const leaveCat = await LeaveCategory.findById(updatedLeaveApplication.leaveCategory?._id || updatedLeaveApplication.leaveCategory);
          const viewUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-application`;

          //sendEmailToUsers(req.body.employee, constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved, updatedLeaveApplication, req.cookies.companyId);
          sendEmailToUsers(manager, manager, constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved, updatedLeaveApplication, companyDetails, leaveCat?.label, viewUrl);
          SendUINotification(req.t('leave.leaveApprovalNotificationTitle'), req.t('leave.leaveApprovalNotificationMessage'), constants.Event_Notification_Type_Status.leave, updatedLeaveApplication.employee?._id?.toString(), req.cookies.companyId, req, viewUrl);
        }

        //Currently do not have the option for edit leave application so commented out the below code

        // let leaveDays = calculateLeaveDays(startDate, endDate, weeklyOffDays, includeWeeklyOffsInLeaveDays, holidays, includeHolidaysInLeaveDays);
        // const cycle = await scheduleController.createFiscalCycle();
        // const leaveAssigned = await LeaveAssigned.findOne({ employee: updatedLeaveApplication.employee?._id, cycle: cycle, category: updatedLeaveApplication.leaveCategory?._id });

        // if (req.body.status === constants.Leave_Application_Constant.Cancelled || req.body.status === constants.Leave_Application_Constant.Rejected) {
        //   //const leaveDays = calculateLeaveDays(startDate, endDate);
        //   //const cycle = await scheduleController.createFiscalCycle();
        //   //const leaveAssigned = await LeaveAssigned.findOne({ employee: updatedLeaveApplication.employee?._id, cycle: cycle, category: updatedLeaveApplication.leaveCategory?._id });
        //   // Deduct the applied leave days from the leave remaining
        //   leaveAssigned.leaveRemaining += leaveDays;
        //   leaveAssigned.leaveApplied = Math.max(0, leaveAssigned.leaveApplied - leaveDays); // Update the leave applied count

        //   // Save the updated leave assigned record
        //   await leaveAssigned.save();
        //   //sendEmailToUsers(req.body.employee, constants.Email_template_constant.CancelReject_Request_Leave_Application, updatedLeaveApplication, req.cookies.companyId);
        //   sendEmailToUsers(updatedLeaveApplication.employee, updatedLeaveApplication.employee, constants.Email_template_constant.CancelReject_Request_Leave_Application, updatedLeaveApplication, req.cookies.companyId);
        //   SendUINotification(req.t('leave.leaveRejectNotificationTitle'), req.t('leave.leaveRejectNotificationMessage'), constants.Event_Notification_Type_Status.leave, updatedLeaveApplication.employee?._id?.toString(), req.cookies.companyId, req);
        // }
        // if (req.body.status === constants.Leave_Application_Constant.Approved) {
        //   console.log(`Leave approved, updating leave balance... ${startDate} # ${endDate} # ${leaveDays}`);
        //   leaveAssigned.leaveTaken += leaveDays;
        //   leaveAssigned.leaveApplied = Math.max(0, leaveAssigned.leaveApplied - leaveDays);
        //   await leaveAssigned.save();
        //   //sendEmailToUsers(req.body.employee, constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved, updatedLeaveApplication, req.cookies.companyId);
        //   sendEmailToUsers(updatedLeaveApplication.employee, updatedLeaveApplication.employee, constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved, updatedLeaveApplication, req.cookies.companyId);
        //   SendUINotification(req.t('leave.leaveApprovalNotificationTitle'), req.t('leave.leaveApprovalNotificationMessage'), constants.Event_Notification_Type_Status.leave, updatedLeaveApplication.employee?._id?.toString(), req.cookies.companyId, req);
        // }

        //END Currently do not have the option for edit leave application so commented out the below code

      }
      catch (error) {
        console.error("Error updating leave balance:", error);
        return res.status(500).send(req.t('common.InternalServerError'));
      }
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: updatedLeaveApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new AppError(req.t('leave.statusRequired'), 400));
    }

    // Only update the status field
    const updatedLeaveApplication = await LeaveApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLeaveApplication) {
      return next(new AppError(req.t('leave.leaveApplicationNotFound'), 404));
    }

    try {
      // Generate navigation URL for leave application (employee's own view)
      const leaveApplicationUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-application`;

      if (
        status === constants.Leave_Application_Constant.Cancelled ||
        status === constants.Leave_Application_Constant.Rejected
      ) {
        const { startDate, endDate, user, leaveCategory } = updatedLeaveApplication;
        const leaveDays = calculateLeaveDays(startDate, endDate);
        const cycle = await scheduleController.createFiscalCycle();

        const leaveAssigned = await LeaveAssigned.findOne({
          employee: user._id,
          cycle,
          category: leaveCategory
        });

        if (leaveAssigned) {
          leaveAssigned.leaveRemaining += leaveDays;
          leaveAssigned.leaveTaken -= leaveDays;
          await leaveAssigned.save();
        }

        sendEmailToUsers(
          user._id,
          constants.Email_template_constant.CancelReject_Request_Leave_Application,
          updatedLeaveApplication,
          req.cookies.companyId
        );

        SendUINotification(
          req.t('leave.leaveRejectNotificationTitle'),
          req.t('leave.leaveRejectNotificationMessage'),
          constants.Event_Notification_Type_Status.leave,
          user._id?.toString(),
          req.cookies.companyId,
          req,
          leaveApplicationUrl
        );
      }

      if (status === constants.Leave_Application_Constant.Approved) {
        sendEmailToUsers(
          updatedLeaveApplication.user._id,
          constants.Email_template_constant.Your_Leave_Application_Has_Been_Approved,
          updatedLeaveApplication,
          req.cookies.companyId
        );

        SendUINotification(
          req.t('leave.leaveApprovalNotificationTitle'),
          req.t('leave.leaveApprovalNotificationMessage'),
          constants.Event_Notification_Type_Status.leave,
          updatedLeaveApplication.user._id?.toString(),
          req.cookies.companyId,
          req,
          leaveApplicationUrl
        );
      }
    } catch (error) {
      console.error("Error updating leave status notifications:", error);
      return res.status(500).send(req.t('common.InternalServerError'));
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: updatedLeaveApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeLeaveApplicationByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const skip = parseInt(req.body.skip);
    const limit = parseInt(req.body.next);
    const totalCount = await LeaveApplication.countDocuments({ employee: userId });

    const leaveApplications = await LeaveApplication.find({ employee: userId }).skip(parseInt(skip))
      .limit(parseInt(limit));

    // If no leave applications are found, return an empty array
    if (leaveApplications.length === 0) {
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: [],
        total: 0,
      });
    }

    for (var i = 0; i < leaveApplications.length; i++) {
      const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
      if (halfDays) {
        leaveApplications[i].halfDays = halfDays;
      }
      else {
        leaveApplications[i].halfDays = null;
      }

      // Fetch primary approver for this leave application's employee
      const employeeAssignment = await EmployeeLeaveAssignment.findOne({
        user: leaveApplications[i].employee
      })
      .select('primaryApprover')
      .populate('primaryApprover', '_id firstName lastName');

      // Attach primary approver to leave application
      leaveApplications[i]._doc.primaryApprover = employeeAssignment?.primaryApprover || null;
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: leaveApplications,
      total: totalCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeLeaveApplicationByTeam = catchAsync(async (req, res, next) => {
  let teamIdsArray = [];

  // Find subordinates' user IDs
  const subordinateIds = await userSubordinate.find({})
    .distinct('subordinateUserId')
    .where('userId')
    .equals(req.cookies.userId);

  if (subordinateIds.length > 0) {
    teamIdsArray = subordinateIds.map(id => new ObjectId(id));
  } else {
    // If no subordinates, return empty data as per the requirement to exclude current user
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: [],
      total: 0
    });
  }

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const totalCount = await LeaveApplication.countDocuments({ employee: { $in: teamIdsArray } });

  const leaveApplications = await LeaveApplication.find({
    employee: { $in: teamIdsArray }
  })
    .skip(skip)
    .limit(limit);

  // Populate halfDays for each leave application
  for (let i = 0; i < leaveApplications.length; i++) {
    const halfDays = await LeaveApplicationHalfDay.find({})
      .where('leaveApplication')
      .equals(leaveApplications[i]._id);
    // Assign halfDays, even if null, to avoid undefined properties and maintain consistency
    leaveApplications[i].halfDays = halfDays.length > 0 ? halfDays : null;

    // Fetch primary approver for this leave application's employee
    const employeeAssignment = await EmployeeLeaveAssignment.findOne({
      user: leaveApplications[i].employee
    })
    .select('primaryApprover')
    .populate('primaryApprover', '_id firstName lastName');

    // Attach primary approver to leave application
    leaveApplications[i]._doc.primaryApprover = employeeAssignment?.primaryApprover || null;
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: leaveApplications,
    total: totalCount
  });
});

exports.deleteEmployeeLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leaveApplication = await LeaveApplication.findById(id);
    if (leaveApplication) {
      const { status, calculatedLeaveDays: leaveDays, employee, leaveCategory } = leaveApplication;
      await LeaveApplication.findByIdAndDelete(id);

      const cycle = await scheduleController.createFiscalCycle();
      const leaveAssigned = await LeaveAssigned.findOne({ employee, cycle, category: leaveCategory });

      if (leaveAssigned) {
        if (status === constants.Leave_Application_Constant.Approved) {
          leaveAssigned.leaveTaken -= leaveDays;
          leaveAssigned.leaveRemaining += leaveDays;
        } else if (status === constants.Leave_Application_Constant.Level_1_Approval_Pending || status === constants.Leave_Application_Constant.Level_2_Approval_Pending) {
          leaveAssigned.leaveApplied = Math.max(0, leaveAssigned.leaveApplied - leaveDays);
          leaveAssigned.leaveRemaining += leaveDays;
        }
        await leaveAssigned.save();
      }
    }


    res.status(204).json({
      status: constants.APIResponseStatus.Success,
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

      // Fetch primary approver for this leave application's employee
      const employeeAssignment = await EmployeeLeaveAssignment.findOne({
        user: leaveApplications[i].employee
      })
      .select('primaryApprover')
      .populate('primaryApprover', '_id firstName lastName');

      // Attach primary approver to leave application
      leaveApplications[i]._doc.primaryApprover = employeeAssignment?.primaryApprover || null;
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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

    // Fetch primary approver for this leave application's employee
    const employeeAssignment = await EmployeeLeaveAssignment.findOne({
      user: leaveApplication.employee
    })
    .select('primaryApprover')
    .populate('primaryApprover', '_id firstName lastName');

    // Attach primary approver to leave application
    leaveApplication._doc.primaryApprover = employeeAssignment?.primaryApprover || null;

    if (!leaveApplication) {
      return next(new AppError(req.t('leave.leaveApplicationNotFound'), 404));
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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

    const user = await User.findById(req.body.employee);
    const userName = `${user?.firstName} ${user?.lastName}`;

    // Generate navigation URL for short leave (employee's own view)
    const shortLeaveUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-short-leave`;

    SendUINotification(req.t('leave.employeeShortLeaveRequestNotificationTitle'), req.t('leave.employeeShortLeaveRequestNotificationMessage', { employeeName: userName, duration: req.body?.durationInMinutes, date: req.body?.date }),
      constants.Event_Notification_Type_Status.leave, user?._id?.toString(), company, req, shortLeaveUrl);
    const managerTeamsIds = await userSubordinate.find({}).distinct("userId").where('subordinateUserId').equals(req.body.employee);
    if (managerTeamsIds) {
      for (var j = 0; j < managerTeamsIds.length; j++) {
        const manager = await User.findById(managerTeamsIds[j]._id);
        // Generate navigation URL for manager (team view)
        const managerShortLeaveUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/team-short-leave`;
        //send ui notification to manager
        SendUINotification(req.t('leave.managerShortLeaveApprovalNotificationTitle'), req.t('leave.managerShortLeaveApprovalNotificationMessage', { firstName: manager?.firstName, lastName: manager?.lastName, employeeName: userName, duration: req.body?.durationInMinutes, date: req.body?.date }),
          constants.Event_Notification_Type_Status.leave, manager?._id?.toString(), company, req, managerShortLeaveUrl);
      }
    }

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: shortLeave
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.getShortLeave = async (req, res, next) => {
  try {
    const shortLeave = await ShortLeave.findById(req.params.id);
    if (!shortLeave) {
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.shortLeaveNotFound')
      });
    } else {
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: shortLeave
      });
    }
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.updateShortLeave = async (req, res, next) => {
  try {
    const companyId = req.cookies.companyId;
    const shortLeave = await ShortLeave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shortLeave) {
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.shortLeaveNotFound')
      });
    } else {
      const user = await User.findById(req.body.employee);
      const userName = `${user?.firstName} ${user?.lastName}`;

      // Generate navigation URL for short leave (employee's own view)
      const shortLeaveUrl = `${process.env.WEBSITE_DOMAIN}/#/home/leave/my-short-leave`;

      if (req.body?.status?.toLowerCase() !== 'pending') {
        SendUINotification(req.t('leave.employeeShortLeaveUpdateNotificationTitle'), req.t('leave.employeeShortLeaveUpdateNotificationMessage', { employeeName: userName, duration: req.body?.durationInMinutes, date: req.body?.date, status: req.body?.status }),
          constants.Event_Notification_Type_Status.leave, user?._id?.toString(), companyId, req, shortLeaveUrl);
      }
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: shortLeave
      });
    }
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.deleteShortLeave = async (req, res, next) => {
  try {
    const shortLeave = await ShortLeave.findByIdAndDelete(req.params.id);
    if (!shortLeave) {
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('leave.shortLeaveNotFound')
      });
    } else {
      res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
      });
    }
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
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
      status: constants.APIResponseStatus.Success,
      data: shortLeaves,
      total: totalCount
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
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
    status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
      data: shortLeaves,
      total: totalCount
    });

  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

exports.getLeaveBalance = async (req, res, next) => {
  try {
    const leaveAssigned = await LeaveAssigned.find({ company: req.cookies.companyId }).where('employee').equals(req.body.user).where('cycle').equals(req.body.cycle).where('category').equals(req.body.category);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: leaveAssigned
    });

  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
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
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: leaveBalances,
    total: totalCount
  });
});

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
    (existing) => !updatedCategories.find((updated) => updated.leaveCategory === existing.leaveCategory._id.toString())
  );


  const removalPromises = categoriesToRemove.map(async (category) => {
    return LeaveTemplateCategory.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await LeaveTemplateCategory.find({ leaveTemplate: leaveTemplateId });
  return finalCategories;

}
