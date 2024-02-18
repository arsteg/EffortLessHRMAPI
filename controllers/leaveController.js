const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/GeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");

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
