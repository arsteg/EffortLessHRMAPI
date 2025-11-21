const Company = require('../models/companyModel');
const AttendanceMode = require('../models/attendance/attendanceMode');
const AttendanceTemplate = require('../models/attendance/attendanceTemplate');
const AttendanceTemplateAssignments = require('../models/attendance/attendanceTemplateAssignments');
const EmployeeOnDutyRequest = require('../models/attendance/employeeOnDutyRequest.js');
const GeneralSettings = require('../models/attendance/generalSettings');
const OnDutyReason = require("../models/attendance/onDutyReason");
const OnDutyTemplate = require('../models/attendance/onDutyTemplate');
const RegularizationReason = require("../models/attendance/regularizationReason");
const RoundingInformation = require('../models/attendance/roundingInformation');
const Shift = require('../models/attendance/shift');
const RosterShiftAssignment = require('../models/attendance/rosterShiftAssignment');
const LeaveApplication = require('../models/Leave/LeaveApplicationModel');
const ShiftTemplateAssignment = require('../models/attendance/shiftTemplateAssignment');
const UserOnDutyReason = require('../models/attendance/userOnDutyReason');
const UserOnDutyTemplate = require('../models/attendance/userOnDutyTemplate');
const UserRegularizationReason = require('../models/attendance/userRegularizationReason');
const EmployeeOnDutyShift = require('../models/attendance/employeeOnDutyShift');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/permissions/userModel');
const TimeLog = require('../models/timeLog');
const userOnDutyReason = require('../models/attendance/userOnDutyReason');
const AttendanceRegularization = require('../models/attendance/attendanceRegularization');
const AttendanceRegularizationRestrictedIP = require('../models/attendance/attendanceRegularizationRestrictedIP');
const AttendanceRegularizationRestrictedLocation = require('../models/attendance/attendanceRegularizationRestrictedLocation');
const manualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const Attandance = require('../models/attendance/attendanceRecords');
const AttendanceRecords = require('../models/attendance/attendanceRecords');
const manualTimeRequestModel = require('../models/manualTime/manualTimeRequestModel');
const OvertimeInformation = require('../models/attendance/overtimeInformation');
const LOP = require('../models/attendance/lop.js');
const constants = require('../constants');
const HolidayCalendar = require('../models/Company/holidayCalendar');
const AttendanceProcess = require('../models/attendance/AttendanceProcess');
const AttendanceProcessUsers = require('../models/attendance/AttendanceProcessUsers.js');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const Appointment = require("../models/permissions/appointmentModel");
const moment = require('moment'); // Using moment.js for easy date manipulation
const websocketHandler = require('../utils/websocketHandler');
const { SendUINotification } = require('../utils/uiNotificationSender');
const mongoose = require('mongoose'); // Added mongoose import
const { toUTCDate, combineDateAndTime } = require('../utils/utcConverter');
// General Settings Controllers
exports.createGeneralSettings = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createGeneralSettings', constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  websocketHandler.sendLog(req, `Extracted companyId from cookies: ${companyId}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }

  req.body.company = companyId;
  const filter = { company: companyId };
  const update = req.body;
  websocketHandler.sendLog(req, `Preparing to update general settings with filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.DEBUG);

  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  };

  try {
    const generalSettings = await GeneralSettings.findOneAndUpdate(filter, update, options);
    websocketHandler.sendLog(req, `Successfully created/updated general settings: ${generalSettings._id}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.createGeneralSettingsSuccess', { companyId }),
      data: generalSettings,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error creating general settings: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.createGeneralSettingsFailure'),
      error: error.message
    });
  }
});

exports.getGeneralSettings = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching general settings for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  const generalSettings = await GeneralSettings.find({ company: companyId });

  if (!generalSettings || generalSettings.length === 0) {
    websocketHandler.sendLog(req, `No general settings found for company: ${companyId}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getGeneralSettingsFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved general settings for company: ${companyId}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getGeneralSettingsSuccess', { companyId }),
    data: generalSettings,
  });
});

exports.updateGeneralSettings = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating general settings with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const generalSettings = await GeneralSettings.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!generalSettings) {
    websocketHandler.sendLog(req, `General settings not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.notFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated general settings: ${generalSettings._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateGeneralSettingsSuccess', { recordId: generalSettings._id }),
    data: generalSettings,
  });
});

exports.createRegularizationReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating regularization reason for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const company = req.cookies.companyId;
  req.body.company = company;

  const regularizationReason = await RegularizationReason.create(req.body);
  const users = req.body.users;

  // Iterate through the users array and add unique user IDs to uniqueUsers array
  const uniqueUsers = new Set(); // Using a Set to store unique user IDs

  // Iterate through the users array and add unique user IDs to uniqueUsers set
  for (const val of users) {
    const userId = val.user; // Get the user ID from the object
    if (!uniqueUsers.has(userId)) { // Check if user ID already exists
      uniqueUsers.add(userId);
    }
  }
  // Iterate through the users array and create UserRegularizationReason for each user
  const userRegularizationReasons = [];
  for (const user of uniqueUsers) {
    const userRegularizationReason = await UserRegularizationReason.create({
      user: user,
      regularizationReason: regularizationReason._id // Assuming regularizationReason is the newly created document
    });
    userRegularizationReasons.push(userRegularizationReason);
  }
  regularizationReason.userRegularizationReasons = userRegularizationReasons;
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: regularizationReason
  });
});

exports.getRegularizationReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching regularization reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const regularizationReason = await RegularizationReason.findById(req.params.id);

  if (!regularizationReason) {
    websocketHandler.sendLog(req, `Regularization reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getRegularizationReasonFailure')
    });
  }
  if (regularizationReason) {


    const userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReason._id);
    if (userRegularizationReasons) {
      regularizationReason.userRegularizationReasons = userRegularizationReasons;
    }
    else {
      regularizationReason.userRegularizationReasons = null;
    }

  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: regularizationReason
  });
});

exports.updateRegularizationReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating regularization reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const isRegularizationReason = await RegularizationReason.findById(req.params.id);

  if (!isRegularizationReason) {
    websocketHandler.sendLog(req, `Regularization reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getRegularizationReasonFailure')
    });
  }

  // Extract the user IDs from the request body
  const { users: allUsers } = req.body;

  // Iterate through the users array and add unique user IDs to newUsers Set
  const newUsers = new Set();
  for (const val of allUsers) {
    const userId = val.user; // Get the user ID from the object
    newUsers.add(userId);
  }
  // Retrieve the existing users associated with the regularization reason
  const existingUsers = await UserRegularizationReason.find({ regularizationReason: isRegularizationReason._id });

  // Extract the existing user IDs
  const existingUserIds = existingUsers.map(user => user.user.toString());

  // Find users to be removed (existing users not present in the request)
  const usersToRemove = existingUsers.filter(user => !newUsers.has(user.user.toString()));

  // Remove the users to be removed
  await Promise.all(usersToRemove.map(async user => await user.remove()));

  // Find new users to be added (users in the request not already associated)
  const newUsersToAdd = Array.from(newUsers).filter(userId => !existingUserIds.includes(userId));

  // Add new users
  const userRegularizationReasons = await Promise.all(newUsersToAdd.map(async userId => {
    return await UserRegularizationReason.create({
      user: userId,
      regularizationReason: isRegularizationReason._id
    });
  }));

  const regularizationReason = await RegularizationReason.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!regularizationReason) {
    return next(new AppError(req.t('attendance.getRegularizationReasonFailure'), 404));
  }

  regularizationReason.userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReason._id);;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: regularizationReason
  });
});


exports.deleteRegularizationReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting regularization reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const regularizationReason = await RegularizationReason.findByIdAndDelete(req.params.id);
  if (!regularizationReason) {
    websocketHandler.sendLog(req, `Regularization reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.deleteRegularizationReasonFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted regularization reason: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteRegularizationReasonSuccess', { recordId: req.params.id }),
    data: null
  });
});

exports.getAllRegularizationReasons = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all regularization reasons for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await RegularizationReason.countDocuments({ company: req.cookies.companyId });

  const regularizationReasons = await RegularizationReason.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  if (regularizationReasons) {

    for (var i = 0; i < regularizationReasons.length; i++) {
      const userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReasons[i]._id);
      if (userRegularizationReasons) {
        regularizationReasons[i].userRegularizationReasons = userRegularizationReasons;
      }
      else {
        regularizationReasons[i].userRegularizationReasons = null;
      }
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllRegularizationReasonsSuccess', { companyId: req.cookies.companyId }),
    data: regularizationReasons,
    total: totalCount
  });
});

exports.createOnDutyReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating on-duty reason for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const company = req.cookies.companyId;
  req.body.company = company;

  const onDutyReason = await OnDutyReason.create(req.body);
  const users = req.body.users;

  // Iterate through the users array and add unique user IDs to uniqueUsers array
  const uniqueUsers = new Set(); // Using a Set to store unique user IDs

  // Iterate through the users array and add unique user IDs to uniqueUsers set
  for (const val of users) {
    const userId = val.user; // Get the user ID from the object
    if (!uniqueUsers.has(userId)) { // Check if user ID already exists
      uniqueUsers.add(userId);
    }
  }
  // Iterate through the users array and create UserRegularizationReason for each user
  const userOnDutyReasons = [];
  for (const user of uniqueUsers) {
    const userOnDutyReason = await UserOnDutyReason.create({
      user: user,
      onDutyReason: onDutyReason._id // Assuming regularizationReason is the newly created document
    });
    userOnDutyReasons.push(userOnDutyReason);
  }
  onDutyReason.userOnDutyReason = userOnDutyReasons;
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyReason
  });
});

exports.getOnDutyReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching on-duty reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const onDutyReason = await OnDutyReason.findById(req.params.id);

  if (!onDutyReason) {
    websocketHandler.sendLog(req, `On-duty reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getOnDutyReasonFailure')
    });
  }
  if (onDutyReason) {
    const userOnDutyReasons = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReason._id);
    if (userOnDutyReasons) {
      onDutyReason.userOnDutyReason = userOnDutyReasons;
    }
    else {
      onDutyReason.userOnDutyReason = null;
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getOnDutyReasonSuccess', { recordId: onDutyReason._id }),
    data: onDutyReason
  });
});

exports.updateOnDutyReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating on-duty reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const isOnDutyReason = await OnDutyReason.findById(req.params.id);

  if (!isOnDutyReason) {
    websocketHandler.sendLog(req, `On-duty reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getOnDutyReasonFailure')
    });
  }

  // Extract the user IDs from the request body
  const { users: allUsers } = req.body;

  // Iterate through the users array and add unique user IDs to newUsers Set
  const newUsers = new Set();
  for (const val of allUsers) {
    const userId = val.user; // Get the user ID from the object
    newUsers.add(userId);
  }
  // Retrieve the existing users associated with the regularization reason
  const existingUsers = await UserOnDutyReason.find({ onDutyReason: isOnDutyReason._id });
  // Extract the existing user IDs
  const existingUserIds = existingUsers.map(user => user.user.toString());

  // Find users to be removed (existing users not present in the request)
  const usersToRemove = existingUsers.filter(user => !newUsers.has(user.user.toString()));

  // Remove the users to be removed
  await Promise.all(usersToRemove.map(async user => await user.remove()));

  // Find new users to be added (users in the request not already associated)
  const newUsersToAdd = Array.from(newUsers).filter(userId => !existingUserIds.includes(userId));

  // Add new users
  const userOnDutyReasons = await Promise.all(newUsersToAdd.map(async userId => {
    return await UserOnDutyReason.create({
      user: userId,
      onDutyReason: isOnDutyReason._id
    });
  }));

  const onDutyReason = await OnDutyReason.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!onDutyReason) {
    return next(new AppError(req.t('attendance.getRegularizationReasonFailure'), 404));
  }

  onDutyReason.userOnDutyReason = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReason._id);;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateOnDutyReasonSuccess', { recordId: onDutyReason._id }),
    data: onDutyReason
  });
});

exports.deleteOnDutyReason = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting on-duty reason with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const onDutyReason = await OnDutyReason.findByIdAndDelete(req.params.id);
  if (!onDutyReason) {
    websocketHandler.sendLog(req, `On-duty reason not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.deleteOnDutyReasonFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted on-duty reason: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteOnDutyReasonSuccess', { recordId: req.params.id }),
    data: null
  });
});

exports.getAllOnDutyReasons = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all on-duty reasons for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OnDutyReason.countDocuments({ company: req.cookies.companyId });

  const onDutyReasons = await OnDutyReason.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  if (onDutyReasons) {

    for (var i = 0; i < onDutyReasons.length; i++) {
      const userOnDutyReason = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReasons[i]._id);
      if (userOnDutyReason) {
        onDutyReasons[i].userOnDutyReason = userOnDutyReason;
      }
      else {
        onDutyReasons[i].userOnDutyReason = null;
      }
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllOnDutyReasonsSuccess', { companyId: req.cookies.companyId }),
    data: onDutyReasons,
    total: totalCount
  });
});


// Create a new attendance mode
exports.createAttendanceMode = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating attendance mode for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.missingParams')
    });
  }
  // Add companyId to the request body
  req.body.company = companyId;

  const attendanceMode = await AttendanceMode.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceMode,
  });
});

// Get an attendance mode by ID
exports.getAttendanceMode = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance mode with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceMode = await AttendanceMode.findById(req.params.id);
  if (!attendanceMode) {
    websocketHandler.sendLog(req, `Attendance mode not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getAttendanceModeFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved attendance mode: ${attendanceMode._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAttendanceModeSuccess', { recordId: attendanceMode._id }),
    data: attendanceMode,
  });
});

// Update an attendance mode by ID
exports.updateAttendanceMode = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating attendance mode with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceMode = await AttendanceMode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!attendanceMode) {
    websocketHandler.sendLog(req, `Attendance mode not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getAttendanceModeFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated attendance mode: ${attendanceMode._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateAttendanceModeSuccess', { recordId: attendanceMode._id }),
    data: attendanceMode,
  });
});

// Delete an attendance mode by ID
exports.deleteAttendanceMode = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting attendance mode with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceMode = await AttendanceMode.findByIdAndDelete(req.params.id);

  if (!attendanceMode) {
    websocketHandler.sendLog(req, `Attendance mode not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.deleteAttendanceModeFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted attendance mode: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteAttendanceModeSuccess', { recordId: req.params.id }),
    data: null,
  });
});

// Get all attendance modes
exports.getAllAttendanceModes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all attendance modes', constants.LOG_TYPES.INFO);

  const attendanceModes = await AttendanceMode.find({}).where('company').equals(req.cookies.companyId);

  websocketHandler.sendLog(req, `Successfully retrieved ${attendanceModes.length} attendance modes`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllAttendanceModesSuccess'),
    data: attendanceModes,
  });
});

// Create a new Attendance Template
exports.createAttendanceTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating attendance template for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }

  const { label } = req.body;

  // Check if a template with the same label already exists for the company
  const existingTemplate = await AttendanceTemplate.findOne({ label, company: companyId, isDelete: { $ne: true } });
  if (existingTemplate) {
    websocketHandler.sendLog(req, `Attendance template with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.templateAlreadyExists'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const attendanceTemplate = await AttendanceTemplate.create(req.body);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceTemplate,
  });
});


// Get an Attendance Template by ID
exports.getAttendanceTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceTemplate = await AttendanceTemplate.findById(req.params.id);
  if (!attendanceTemplate) {
    websocketHandler.sendLog(req, `Attendance template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);

    return next(new AppError(req.t('attendance.attendanceTemplateNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Successfully retrieved attendance template: ${attendanceTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAttendanceTemplateSuccess', { recordId: attendanceTemplate._id }),
    data: attendanceTemplate,
  });
});

// Update an Attendance Template by ID
exports.updateAttendanceTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating attendance template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  const companyId = req.cookies.companyId;

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }

  const label = req.body.label?.trim();

  // 🔍 Check if another template with the same label exists (excluding the current one)
  const duplicate = await AttendanceTemplate.findOne({
    _id: { $ne: req.params.id },
    company: companyId,
    label: { $regex: new RegExp(`^${label}$`, 'i') } // case-insensitive match
  });

  if (duplicate) {
    websocketHandler.sendLog(req, `Duplicate label "${label}" found for another template`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.templateAlreadyExists'), 400));
  }
  const attendanceTemplate = await AttendanceTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!attendanceTemplate) {
    websocketHandler.sendLog(req, `Attendance template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.attendanceTemplateNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Successfully updated attendance template: ${attendanceTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateAttendanceTemplateSuccess', { recordId: attendanceTemplate._id }),
    data: attendanceTemplate,
  });
});

// Delete an Attendance Template by ID
exports.deleteAttendanceTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting attendance template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceTemplate = await AttendanceTemplate.findByIdAndDelete(req.params.id);
  if (!attendanceTemplate) {
    websocketHandler.sendLog(req, `Attendance template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.attendanceTemplateNotFound')
    });
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAttendanceTemplateByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance template for user: ${req.params.userId}`, constants.LOG_TYPES.INFO);

  const attendanceTemplateAssignments = await AttendanceTemplateAssignments.find({ employee: req.params.userId });
  //console.log('attendance template assignment:', attendanceTemplateAssignments);
  const totalCount = await AttendanceTemplate.countDocuments({ employee: req.params.userId });
  websocketHandler.sendLog(req, `Successfully retrieved attendance template for user: ${req.params.userId}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllAttendanceTemplatesSuccess', { companyId: req.cookies.companyId }),
    data: attendanceTemplateAssignments,
    total: totalCount
  });
});
// Get all Attendance Templates
exports.getAllAttendanceTemplates = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all attendance templates for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await AttendanceTemplate.countDocuments({ company: req.cookies.companyId });

  const attendanceTemplates = await AttendanceTemplate.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllAttendanceTemplatesSuccess', { companyId: req.cookies.companyId }),
    data: attendanceTemplates,
    total: totalCount
  });
});

exports.addAttendanceRegularization = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Adding attendance regularization for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.missingParams')
    });
  }
  // Add companyId to the request body
  req.body.company = companyId;
  // Check if the attendanceTemplate exists
  const templateExists = await AttendanceTemplate.exists({ name: req.body.attendanceTemplate });
  if (!templateExists) {
    websocketHandler.sendLog(req, `Invalid attendance template: ${req.body.attendanceTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidAttendanceTemplate')
    });
  }

  // Check if AttendanceRegularization with the same attendanceTemplate already exists
  const existingRegularization = await AttendanceRegularization.findOne({ attendanceTemplate: req.body.attendanceTemplate });
  if (existingRegularization) {
    websocketHandler.sendLog(req, `Attendance regularization already exists for template: ${req.body.attendanceTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.attendanceRegularizationExists')
    });
  }

  // Create the main AttendanceRegularization document
  const attendanceRegularization = await AttendanceRegularization.create(req.body);

  // Insert IP addresses and location details into AttendanceRegularizationRestrictedIP model
  if (req.body.IPDetails && req.body.IPDetails.length > 0) {
    const IPDetails = req.body.IPDetails.map(ip => ({
      attendanceRegularization: attendanceRegularization._id,
      IP: ip.IP
    }));
    attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = await AttendanceRegularizationRestrictedIP.insertMany(IPDetails);

  }

  // Insert restrictLocationDetails into AttendanceRegularizationRestrictedIP model
  if (req.body.restrictLocationDetails && req.body.restrictLocationDetails.length > 0) {

    const locationDetails = req.body.restrictLocationDetails.map(location => ({
      attendanceRegularization: attendanceRegularization._id,
      Location: location.Location,
      Latitude: location.Latitude,
      Longitude: location.Longitude,
      Radius: location.Radius
    }));
    attendanceRegularization.AttendanceRegularizationRestrictedLocations = await AttendanceRegularizationRestrictedLocation.insertMany(locationDetails);

  }

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRegularization
  });
});

exports.getAttendanceRegularization = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance regularization with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceRegularization = await AttendanceRegularization.findById(req.params.id);
  if (!attendanceRegularization) {
    websocketHandler.sendLog(req, `Attendance regularization not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.AttendanceRegularizationNF'), 404));
  }

  const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
  attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP || null;

  const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
  attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation || null;

  websocketHandler.sendLog(req, `Successfully retrieved attendance regularization: ${attendanceRegularization._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRegularization
  });
});

exports.getAttendanceRegularizationByTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance regularization by template: ${req.params.templateId}`, constants.LOG_TYPES.INFO);

  const attendanceRegularization = await AttendanceRegularization.findOne({
    attendanceTemplate: req.params.templateId,
    company: req.cookies.companyId,
  });
  if (!attendanceRegularization) {
    websocketHandler.sendLog(req, `Attendance regularization not found for template: ${req.params.templateId}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getAttendanceRegularizationFailure')
    });
  }
  if (attendanceRegularization) {
    const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
    if (attendanceRegularizationRestrictedIP) {
      attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
    }
    else {
      attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = null;
    }
    const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
    if (attendanceRegularizationRestrictedLocation) {
      attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
    }
    else {
      attendanceRegularization.AttendanceRegularizationRestrictedLocations = null;
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAttendanceRegularizationByTemplateSuccess', { templateId: req.params.templateId }),
    data: attendanceRegularization
  });
});
exports.updateAttendanceRegularization = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating attendance regularization with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const templateExists = await AttendanceTemplate.exists({ name: req.body.attendanceTemplate });
  if (!templateExists) {
    websocketHandler.sendLog(req, `Invalid attendance template: ${req.body.attendanceTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidAttendanceTemplate')
    });
  }

  // Update existing record
  const attendanceRegularization = await AttendanceRegularization.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!attendanceRegularization) {
    return next(new AppError(req.t('attendance.AttendanceRegularizationNF'), 404));
  }
  // Update or create IP records
  if (req.body.IPDetails && req.body.IPDetails.length > 0) {
    await Promise.all(req.body.IPDetails.map(async (ipDetail) => {
      const existingIP = await AttendanceRegularizationRestrictedIP.findOne({ IP: ipDetail.IP });
      if (existingIP) {
        // Update existing IP record
        await AttendanceRegularizationRestrictedIP.findByIdAndUpdate(existingIP._id, ipDetail);
      } else {
        // Create new IP record
        await AttendanceRegularizationRestrictedIP.create(ipDetail);
      }
    }));
  }

  // Update or create location records
  if (req.body.restrictLocationDetails && req.body.restrictLocationDetails.length > 0) {
    await Promise.all(req.body.restrictLocationDetails.map(async (locationDetail) => {
      const existingLocation = await AttendanceRegularizationRestrictedLocation.findOne({ Location: locationDetail.Location });
      if (existingLocation) {
        // Update existing location record
        await AttendanceRegularizationRestrictedLocation.findByIdAndUpdate(existingLocation._id, locationDetail);
      } else {
        // Create new location record
        await AttendanceRegularizationRestrictedLocation.create(locationDetail);
      }
    }));
  }

  // Remove records from the database that are not present in the arrays
  await Promise.all([
    AttendanceRegularizationRestrictedIP.deleteMany({ IP: { $nin: req.body.IPDetails.map(ip => ip.IP) } }),
    AttendanceRegularizationRestrictedLocation.deleteMany({ Location: { $nin: req.body.restrictLocationDetails.map(location => location.Location) } })
  ]);

  const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
  if (attendanceRegularizationRestrictedIP) {
    attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
  }
  else {
    attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = null;
  }
  const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);
  if (attendanceRegularizationRestrictedLocation) {
    attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
  }
  else {
    attendanceRegularization.AttendanceRegularizationRestrictedLocations = null;
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRegularization
  });
});

exports.getAllAttendanceRegularizationsByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all attendance regularizations for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await AttendanceRegularization.countDocuments({ company: req.cookies.companyId });

  const attendanceRegularizations = await AttendanceRegularization.find({ company: req.cookies.companyId }).skip(parseInt(skip)).limit(parseInt(limit));
  if (attendanceRegularizations) {

    for (var i = 0; i < attendanceRegularizations.length; i++) {
      const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularizations[i]._id);
      if (attendanceRegularizationRestrictedIP) {
        attendanceRegularizations[i].AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
      }
      else {
        attendanceRegularizations[i].AttendanceRegularizationRestrictedIPDetails = null;
      }
      const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularizations[i]._id);
      if (attendanceRegularizationRestrictedLocation) {
        attendanceRegularizations[i].AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
      }
      else {
        attendanceRegularizations[i].AttendanceRegularizationRestrictedLocations = null;
      }
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllAttendanceRegularizationsSuccess', { companyId: req.cookies.companyId }),
    data: attendanceRegularizations,
    total: totalCount
  });
});

exports.deleteAttendanceRegularization = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting attendance regularization with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceRegularization = await AttendanceRegularization.findByIdAndDelete(req.params.id);

  if (!attendanceRegularization) {
    websocketHandler.sendLog(req, `Attendance regularization not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.deleteAttendanceRegularizationFailure')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted attendance regularization: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteAttendanceRegularizationSuccess', { recordId: req.params.id }),
    data: null
  });
});

exports.addAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  const newLocation = await AttendanceRegularizationRestrictedLocation.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: newLocation
  });
});

exports.getAllAttendanceRegularizationRestrictedLocations = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching restricted locations for regularization: ${req.params.attendanceRegularization}`, constants.LOG_TYPES.INFO);

  const locations = await AttendanceRegularizationRestrictedLocation.find({ attendanceRegularization: req.params.attendanceRegularization });

  websocketHandler.sendLog(req, `Successfully retrieved ${locations.length} restricted locations`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllRestrictedLocationsSuccess', { regularizationId: req.params.attendanceRegularization }),
    data: locations
  });
});

exports.updateAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating restricted location with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const updatedLocation = await AttendanceRegularizationRestrictedLocation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedLocation) {
    websocketHandler.sendLog(req, `Restricted location not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.restrictedLocationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated restricted location: ${updatedLocation._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateRestrictedLocationSuccess', { recordId: updatedLocation._id }),
    data: updatedLocation
  });
});

exports.getAttendanceRegularizationRestrictedLocationById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching restricted location with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const location = await AttendanceRegularizationRestrictedLocation.findById(req.params.id);

  if (!location) {
    websocketHandler.sendLog(req, `Restricted location not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.restrictedLocationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved restricted location: ${location._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getRestrictedLocationSuccess', { recordId: location._id }),
    data: location
  });
});

exports.deleteAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting restricted location with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const location = await AttendanceRegularizationRestrictedLocation.findByIdAndDelete(req.params.id);

  if (!location) {
    websocketHandler.sendLog(req, `Restricted location not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.restrictedLocationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted restricted location: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteRestrictedLocationSuccess', { recordId: req.params.id }),
    data: null
  });
});

// Create a new Attendance Template Assignment
exports.createAttendanceAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating attendance assignment for employee: ${req.body.employee}`, constants.LOG_TYPES.INFO);

  const attendanceTemplate = await AttendanceTemplate.findOne({ _id: req.body.attendanceTemplate });
  if (!attendanceTemplate) {
    websocketHandler.sendLog(req, `Invalid attendance template: ${req.body.attendanceTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidAttendanceTemplate')
    });
  }

  let primaryApprover = req.body.primaryApprover;
  let secondaryApprover = req.body.secondaryApprover;

  // If approval type is "template-wise", retrieve primary and secondary approvers from attendanceTemplate
  if (attendanceTemplate.approvalType === "template-wise") {
    primaryApprover = attendanceTemplate.primaryApprover;
    secondaryApprover = attendanceTemplate.primaryApprover;
  }
  // Check if the employee exists
  const employee = await User.findById(req.body.employee);
  if (!employee) {
    websocketHandler.sendLog(req, `Invalid employee: ${req.body.employee}`, constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidEmployee')
    });
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.missingParams')
    });
  }
  req.body.company = companyId;

  await AttendanceTemplateAssignments.deleteMany({ employee: req.body.employee });

  // Create the attendance assignment
  const attendanceAssignment = await AttendanceTemplateAssignments.create({
    employee: req.body.employee,
    attendanceTemplate: req.body.attendanceTemplate,
    effectiveFrom: req.body.effectiveFrom,
    primaryApprover: primaryApprover,
    secondaryApprover: secondaryApprover,
    company: req.body.company
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceAssignment
  });
});

// Get an Attendance Template Assignment by ID
exports.getAttendanceAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching attendance assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceAssignment = await AttendanceTemplateAssignments.findById(req.params.id);
  if (!attendanceAssignment) {
    websocketHandler.sendLog(req, `Attendance assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.attendanceAssignmentNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved attendance assignment: ${attendanceAssignment._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAttendanceAssignmentSuccess', { recordId: attendanceAssignment._id }),
    data: attendanceAssignment,
  });
});

// Update an Attendance Template Assignment by ID
exports.updateAttendanceAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating attendance assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceAssignment = await AttendanceTemplateAssignments.findById(req.params.id);
  if (!attendanceAssignment) {
    websocketHandler.sendLog(req, `Attendance assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.attendanceAssignmentNotFound')
    });
  }

  // Update only primary and secondary approvers if provided in the request body
  if (req.body.primaryApprovar !== undefined) {
    attendanceAssignment.primaryApprover = req.body.primaryApprovar;
  }
  if (req.body.secondaryApprovar !== undefined) {
    attendanceAssignment.secondaryApprover = req.body.secondaryApprovar;
  }

  // Save the updated assignment
  await attendanceAssignment.save();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceAssignment
  });
});

// Delete an Attendance Template Assignment by ID
exports.deleteAttendanceAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting attendance assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const attendanceAssignment = await AttendanceTemplateAssignments.findByIdAndDelete(req.params.id);
  if (!attendanceAssignment) {
    websocketHandler.sendLog(req, `Attendance assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.attendanceAssignmentNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted attendance assignment: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteAttendanceAssignmentSuccess', { recordId: req.params.id }),
    data: null,
  });
});

// Get all Attendance Template Assignments
exports.getAllAttendanceAssignments = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all attendance assignments for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await AttendanceTemplateAssignments.countDocuments({ company: req.cookies.companyId });

  const attendanceAssignments = await AttendanceTemplateAssignments.where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceAssignments,
    total: totalCount
  });
});

exports.createRoundingInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating rounding information for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.missingParams')
    });
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const roundingInformation = await RoundingInformation.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: roundingInformation,
  });
});

exports.getRoundingInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching rounding information with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const roundingInformation = await RoundingInformation.findById(req.params.id);
  if (!roundingInformation) {
    websocketHandler.sendLog(req, `Rounding information not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.roundingInformationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved rounding information: ${roundingInformation._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getRoundingInformationSuccess', { recordId: roundingInformation._id }),
    data: roundingInformation,
  });
});

exports.updateRoundingInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating rounding information with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const roundingInformation = await RoundingInformation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!roundingInformation) {
    websocketHandler.sendLog(req, `Rounding information not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.roundingInformationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated rounding information: ${roundingInformation._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateRoundingInformationSuccess', { recordId: roundingInformation._id }),
    data: roundingInformation,
  });
});

exports.deleteRoundingInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting rounding information with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const roundingInformation = await RoundingInformation.findByIdAndDelete(req.params.id);

  if (!roundingInformation) {
    websocketHandler.sendLog(req, `Rounding information not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.roundingInformationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted rounding information: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteRoundingInformationSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllRoundingInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all rounding information for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await RoundingInformation.countDocuments({ company: req.cookies.companyId });

  const roundingInformation = await RoundingInformation.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingInformation,
    total: totalCount
  });
});



exports.getOvertimeInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching overtime information with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const overtimeInformation = await OvertimeInformation.findById(req.params.id);
  if (!overtimeInformation) {
    websocketHandler.sendLog(req, `Overtime information not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.overtimeInformationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved overtime information: ${overtimeInformation._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getOvertimeInformationSuccess', { recordId: overtimeInformation._id }),
    data: overtimeInformation,
  });
});

exports.deleteOvertimeInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting overtime information with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const overtimeInformation = await OvertimeInformation.findByIdAndDelete(req.params.id);
  if (!overtimeInformation) {
    websocketHandler.sendLog(req, `Overtime information not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.overtimeInformationNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted overtime information: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteOvertimeInformationSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllOvertimeInformation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all overtime information for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OvertimeInformation.countDocuments({ company: req.cookies.companyId });

  const overtimeInformation = await OvertimeInformation.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllOvertimeInformationSuccess', { companyId: req.cookies.companyId }),
    data: overtimeInformation,
    total: totalCount
  });
});

exports.createOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating on-duty template for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.missingParams')
    });
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const onDutyTemplate = await OnDutyTemplate.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyTemplate,
  });
});

exports.getOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const onDutyTemplate = await OnDutyTemplate.findById(req.params.id);
  if (!onDutyTemplate) {
    websocketHandler.sendLog(req, `On-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.onDutyTemplateNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved on-duty template: ${onDutyTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getOnDutyTemplateSuccess', { recordId: onDutyTemplate._id }),
    data: onDutyTemplate,
  });
});

exports.updateOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const onDutyTemplate = await OnDutyTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!onDutyTemplate) {
    websocketHandler.sendLog(req, `On-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.onDutyTemplateNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated on-duty template: ${onDutyTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateOnDutyTemplateSuccess', { recordId: onDutyTemplate._id }),
    data: onDutyTemplate,
  });
});

exports.deleteOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const onDutyTemplate = await OnDutyTemplate.findByIdAndDelete(req.params.id);
  if (!onDutyTemplate) {
    websocketHandler.sendLog(req, `On-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.onDutyTemplateNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted on-duty template: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteOnDutyTemplateSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllOnDutyTemplates = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all on-duty templates for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OnDutyTemplate.countDocuments({ company: req.cookies.companyId });

  const onDutyTemplates = await OnDutyTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllOnDutyTemplatesSuccess', { companyId: req.cookies.companyId }),
    data: onDutyTemplates,
    total: totalCount
  });
});

// Create a UserOnDutyTemplate
exports.createUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating user on-duty template for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  // Check if the user exists
  const userExists = await User.exists({ _id: req.body.user });
  if (!userExists) {
    websocketHandler.sendLog(req, `User not found: ${req.body.user}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.userNotFound')
    });
  }

  // Check if the duty template exists
  const dutyTemplateExists = await OnDutyTemplate.exists({ _id: req.body.onDutyTemplate });
  if (!dutyTemplateExists) {
    websocketHandler.sendLog(req, `Duty template not found: ${req.body.onDutyTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.onDutyTemplateNotFound')
    });
  }
  await UserOnDutyTemplate.deleteMany({ user: req.body.user });
  const userOnDutyTemplate = await UserOnDutyTemplate.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: userOnDutyTemplate,
  });
});

// Get a UserOnDutyTemplate by ID
exports.getUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching user on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const userOnDutyTemplate = await UserOnDutyTemplate.findById(req.params.id);
  if (!userOnDutyTemplate) {
    websocketHandler.sendLog(req, `User on-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.userOnDutyTemplateNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully retrieved user on-duty template: ${userOnDutyTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getUserOnDutyTemplateSuccess', { recordId: userOnDutyTemplate._id }),
    data: userOnDutyTemplate,
  });
});

// Get a UserOnDutyTemplate by ID
exports.getUserOnDutyTemplateByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching user on-duty template for user: ${req.params.user}`, constants.LOG_TYPES.INFO);

  const userOnDutyTemplate = await UserOnDutyTemplate.find({ user: req.params.user });
  if (!userOnDutyTemplate) {
    return next(new AppError(req.t('attendance.UserOnDutyTemplateNF'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved user on-duty template for user: ${req.params.user}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getUserOnDutyTemplateByUserSuccess', { userId: req.params.user }),
    data: userOnDutyTemplate,
  });
});

// Update a UserOnDutyTemplate by ID
exports.updateUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating user on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const userOnDutyTemplate = await UserOnDutyTemplate.findById(req.params.id);
  if (!userOnDutyTemplate) {
    websocketHandler.sendLog(req, `User on-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.userOnDutyTemplateNotFound')
    });
  }

  // Check if the duty template exists
  const dutyTemplateExists = await OnDutyTemplate.exists({ _id: req.body.onDutyTemplate });
  if (!dutyTemplateExists) {
    websocketHandler.sendLog(req, `Duty template not found: ${req.body.onDutyTemplate}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.onDutyTemplateNotFound')
    });
  }

  // Update the user on duty template, excluding the user field
  const updatedUserOnDutyTemplate = await UserOnDutyTemplate.findByIdAndUpdate(req.params.id, {
    ...req.body,
    user: userOnDutyTemplate.user // Exclude updating the user field
  }, {
    new: true,
    runValidators: true,
  });

  websocketHandler.sendLog(req, `Successfully updated user on-duty template: ${updatedUserOnDutyTemplate._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateUserOnDutyTemplateSuccess', { recordId: updatedUserOnDutyTemplate._id }),
    data: updatedUserOnDutyTemplate,
  });
});

// Delete a UserOnDutyTemplate by ID
exports.deleteUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting user on-duty template with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const userOnDutyTemplate = await UserOnDutyTemplate.findByIdAndDelete(req.params.id);

  if (!userOnDutyTemplate) {
    websocketHandler.sendLog(req, `User on-duty template not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.userOnDutyTemplateNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted user on-duty template: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteUserOnDutyTemplateSuccess', { recordId: req.params.id }),
    data: null,
  });
});

// Get all UserOnDutyTemplates
exports.getAllUserOnDutyTemplates = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all user on-duty templates for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await UserOnDutyTemplate.countDocuments({ company: req.cookies.companyId });

  const userOnDutyTemplates = await UserOnDutyTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllUserOnDutyTemplatesSuccess', { companyId: req.cookies.companyId }),
    data: userOnDutyTemplates,
    total: totalCount
  });
});

exports.createShift = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating shift for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const { name } = req.body;

  // Check for duplicate shift label in same company
  const existingShift = await Shift.findOne({ name: name, company: companyId, isDelete: { $ne: true } });

  if (existingShift) {
    websocketHandler.sendLog(req, `Shift with label "${name}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.shiftAlreadyExists'), 400));
  }
  const shift = await Shift.create(req.body);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: shift,
  });
});

exports.getShift = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching shift with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    websocketHandler.sendLog(req, `Shift not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.shiftNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Successfully retrieved shift: ${shift._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getShiftSuccess', { recordId: shift._id }),
    data: shift,
  });
});

exports.updateShift = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating shift with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  const companyId = req.cookies.companyId;

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.missingParams'), 400));
  }

  const name = req.body.name?.trim();

  // 🔍 Check if another template with the same label exists (excluding the current one)
  const duplicate = await Shift.findOne({
    _id: { $ne: req.params.id },
    company: companyId,
    name: { $regex: new RegExp(`^${name}$`, 'i') } // case-insensitive match
  });

  if (duplicate) {
    websocketHandler.sendLog(req, `Duplicate name "${name}" found for another template`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.shiftAlreadyExists'), 400));
  }
  const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!shift) {
    websocketHandler.sendLog(req, `Shift not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.shiftNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Successfully updated shift: ${shift._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateShiftSuccess', { recordId: shift._id }),
    data: shift,
  });
});

exports.deleteShift = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting shift with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
  const isAssigned = await ShiftTemplateAssignment.exists({ template: req.params.id });

  if (isAssigned) {
    websocketHandler.sendLog(req, `Shift ID ${req.params.id} is currently assigned and cannot be deleted`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.deleteRestricted'), 400));
  }
  const shift = await Shift.findByIdAndDelete(req.params.id);

  if (!shift) {
    websocketHandler.sendLog(req, `Shift not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.shiftNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Successfully deleted shift: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteShiftSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllShifts = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all shifts for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || '';
  const limit = parseInt(req.body.next) || '';
  const totalCount = await Shift.countDocuments({ company: req.cookies.companyId });

  const shifts = await Shift.find({ company: req.cookies.companyId }).skip(skip).limit(limit);

  websocketHandler.sendLog(req, `Successfully retrieved ${shifts.length} shifts`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getAllShiftsSuccess', { companyId: req.cookies.companyId }),
    data: shifts,
    total: totalCount
  });
});
exports.getShiftByUser = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignments = await ShiftTemplateAssignment.find({ user: req.params.userId });

  var shifts = null;
  if (shiftTemplateAssignments.length > 0) {
    shifts = await Shift.findById(shiftTemplateAssignments[0].template);
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shifts,
  });
});

//Shift Assignment API

// Create a new ShiftTemplateAssignment
exports.createShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Creating shift template assignment for company: ${req.cookies.companyId}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    websocketHandler.sendLog(req, `Invalid user ID: ${req.body.user}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.invalidUserId'), 400));
  }

  console.log('Request body:', req.body);

  // Convert req.body.user to ObjectId
  const userId = new mongoose.Types.ObjectId(req.body.user);
  const shiftTemplateAssignmentExists = await ShiftTemplateAssignment.find({ user: userId });
  console.log('Existing assignments:', shiftTemplateAssignmentExists);

  // Check if any assignments exist for the user
  if (shiftTemplateAssignmentExists.length > 0) {
    websocketHandler.sendLog(req, `Shift template assignment found for User: ${req.body.userd}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.shiftTemplateAssignmentExists'), 404));
  }
  req.body.company = companyId;
  const shiftTemplateAssignment = await ShiftTemplateAssignment.create(req.body);

  websocketHandler.sendLog(req, `Successfully created shift template assignment: ${shiftTemplateAssignment._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: shiftTemplateAssignment
  });
});

// Get a ShiftTemplateAssignment by ID
exports.getShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching shift template assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const shiftTemplateAssignment = await ShiftTemplateAssignment.findById(req.params.id);
  if (!shiftTemplateAssignment) {
    websocketHandler.sendLog(req, `Shift template assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return next(new AppError(req.t('attendance.ShiftTemplateAssignmentNF'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved shift template assignment: ${shiftTemplateAssignment._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shiftTemplateAssignment
  });
});

// Update a ShiftTemplateAssignment by ID
exports.updateShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignment = await ShiftTemplateAssignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!shiftTemplateAssignment) {
    return next(new AppError(req.t('attendance.ShiftTemplateAssignmentNF'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shiftTemplateAssignment
  });
});

// Delete a ShiftTemplateAssignment by ID
exports.deleteShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignment = await ShiftTemplateAssignment.findByIdAndDelete(req.params.id);
  if (!shiftTemplateAssignment) {
    return next(new AppError(req.t('attendance.ShiftTemplateAssignmentNF'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted shift assignment: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteShiftAssignmentSuccess', { recordId: req.params.id }),
    data: null,
  });
});

// Get all ShiftTemplateAssignments
exports.getAllShiftTemplateAssignments = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await ShiftTemplateAssignment.countDocuments({ company: req.cookies.companyId });

  const shiftTemplateAssignments = await ShiftTemplateAssignment.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shiftTemplateAssignments,
    total: totalCount
  });
});

exports.createRosterShiftAssignment = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  // Extract dates array from the request body
  const { dates, ...restBody } = req.body;

  // Create an array of roster shift assignments, one for each date
  const rosterShiftAssignments = dates.map(date => ({
    ...restBody,
    date, // Assign each date individually
    company: companyId,
  }));

  // Insert multiple documents at once
  const createdAssignments = await RosterShiftAssignment.insertMany(rosterShiftAssignments);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: createdAssignments,
  });
});


exports.getRosterShiftAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRosterShiftAssignment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching roster shift assignment with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.id);

  if (!rosterShiftAssignment) {
    websocketHandler.sendLog(req, `Roster shift assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.getRosterShiftAssignmentFailure'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved roster shift assignment: ${rosterShiftAssignment._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getRosterShiftAssignmentSuccess', { recordId: req.params.id }),
    data: rosterShiftAssignment,
  });
});

exports.getRosterShiftAssignmentByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRosterShiftAssignmentByUser', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching roster shift assignment for user ID: ${req.params.userId}`, constants.LOG_TYPES.TRACE);

  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.userId);

  if (!rosterShiftAssignment) {
    websocketHandler.sendLog(req, `Roster shift assignment not found for user ID: ${req.params.userId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.getRosterShiftAssignmentByUserFailure'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved roster shift assignment for user: ${rosterShiftAssignment._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getRosterShiftAssignmentByUserSuccess', { userId: req.params.userId }),
    data: rosterShiftAssignment,
  });
});

exports.updateRosterShiftAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating roster shift assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const rosterShiftAssignment = await RosterShiftAssignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!rosterShiftAssignment) {
    websocketHandler.sendLog(req, `Roster shift assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.rosterShiftAssignmentNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully updated roster shift assignment: ${rosterShiftAssignment._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateRosterShiftAssignmentSuccess', { recordId: rosterShiftAssignment._id }),
    data: rosterShiftAssignment,
  });
});

exports.deleteRosterShiftAssignment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting roster shift assignment with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  const rosterShiftAssignment = await RosterShiftAssignment.findByIdAndDelete(req.params.id);

  if (!rosterShiftAssignment) {
    websocketHandler.sendLog(req, `Roster shift assignment not found for ID: ${req.params.id}`, constants.LOG_TYPES.WARNING);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.rosterShiftAssignmentNotFound')
    });
  }

  websocketHandler.sendLog(req, `Successfully deleted roster shift assignment: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteRosterShiftAssignmentSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllRosterShiftAssignmentsBycompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  // Extract companyId from req.cookies
  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }
  const query = { company: company };
  // Get the total count of documents matching the query
  const totalCount = await RosterShiftAssignment.countDocuments(query);

  const rosterShiftAssignments = await RosterShiftAssignment.find(query);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: rosterShiftAssignments,
    total: totalCount
  });
});


// Create a new DutyRequest
exports.createEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createEmployeeDutyRequest', constants.LOG_TYPES.INFO);

  const userOnDutyTemplate = await UserOnDutyTemplate.find({ user: req.body.user });
  websocketHandler.sendLog(req, `Checked for UserOnDutyTemplate for user: ${req.body.user}`, constants.LOG_TYPES.TRACE);

  if (!userOnDutyTemplate || userOnDutyTemplate.length === 0) {
    websocketHandler.sendLog(req, `UserOnDutyTemplate not found for user: ${req.body.user}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.userOnDutyTemplateNotFound'), 404));
  }

  const employeeOnDutyRequestIsExists = await EmployeeOnDutyRequest.find({ user: req.body.user });
  websocketHandler.sendLog(req, `Checked for existing EmployeeOnDutyRequest for user: ${req.body.user}`, constants.LOG_TYPES.TRACE);

  if (employeeOnDutyRequestIsExists && employeeOnDutyRequestIsExists.length > 0) {
    websocketHandler.sendLog(req, `EmployeeOnDutyRequest already exists for user: ${req.body.user}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.employeeOnDutyRequestExists'), 404));
  }

  const companyId = req.cookies.companyId;
  websocketHandler.sendLog(req, `Extracted companyId from cookies: ${companyId}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.companyIdNotFound'), 400));
  }

  req.body.company = companyId;
  websocketHandler.sendLog(req, `Preparing to create employee duty request for company: ${companyId}`, constants.LOG_TYPES.DEBUG);

  try {
    const employeeOnDutyRequest = await EmployeeOnDutyRequest.create(req.body);
    websocketHandler.sendLog(req, `Created employee duty request: ${employeeOnDutyRequest._id}`, constants.LOG_TYPES.INFO);

    if (req.body.onDutyShift && req.body.onDutyShift.length > 0) {
      const employeeOnDutyShift = req.body.onDutyShift.map(shift => ({
        employeeOnDutyRequest: employeeOnDutyRequest._id,
        date: shift.date,
        shift: shift.shift,
        shiftDuration: shift.shiftDuration,
        startTime: shift.startTime,
        endTime: shift.endTime,
        remarks: shift.remarks,
      }));
      employeeOnDutyRequest.employeeOnDutyShifts = await EmployeeOnDutyShift.insertMany(employeeOnDutyShift);
      websocketHandler.sendLog(req, `Inserted ${employeeOnDutyShift.length} employee on-duty shifts`, constants.LOG_TYPES.INFO);
    }

    SendUINotification(req.t('attendance.createOnDutyRequestsNotificationTitle'), req.t('attendance.createOnDutyRequestsNotificationMessage', { startDate: moment(employeeOnDutyRequest.startDate).format('YYYY-MM-DD HH:mm:ss'), endDate: moment(employeeOnDutyRequest.endDate).format('YYYY-MM-DD HH:mm:ss') }),
      constants.Event_Notification_Type_Status.attendance, req.body.user?.toString(), companyId, req);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.createEmployeeDutyRequestSuccess', { companyId }),
      data: employeeOnDutyRequest,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error creating employee duty request: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.createEmployeeDutyRequestFailure'),
      error: error.message,
    });
  }
});

// Get a DutyRequest by ID
exports.getEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await EmployeeOnDutyRequest.findById(req.params.id);
  if (dutyRequest) {
    const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(dutyRequest._id);
    if (employeeOnDutyShifts) {
      dutyRequest.employeeOnDutyShifts = employeeOnDutyShifts;
    }
    else {
      dutyRequest.employeeOnDutyShifts = null;
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: dutyRequest
  });
});

// Update a DutyRequest by ID
exports.updateEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateEmployeeDutyRequest', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating employee duty request with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const employeeOnDutyRequest = await EmployeeOnDutyRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!employeeOnDutyRequest) {
    websocketHandler.sendLog(req, `Employee duty request not found for ID: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.updateEmployeeDutyRequestFailure'), 404));
  }

  if (employeeOnDutyRequest) {
    const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(employeeOnDutyRequest._id);
    websocketHandler.sendLog(req, `Fetched ${employeeOnDutyShifts.length} employee on-duty shifts for request: ${employeeOnDutyRequest._id}`, constants.LOG_TYPES.DEBUG);
    employeeOnDutyRequest.employeeOnDutyShifts = employeeOnDutyShifts.length > 0 ? employeeOnDutyShifts : null;
  }

  websocketHandler.sendLog(req, `Successfully updated employee duty request: ${employeeOnDutyRequest._id}`, constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  SendUINotification(req.t('attendance.updateOnDutyRequestsNotificationTitle'), req.t('attendance.updateOnDutyRequestsNotificationMessage', { startDate: moment(employeeOnDutyRequest.startDate).format('YYYY-MM-DD HH:mm:ss'), endDate: moment(employeeOnDutyRequest.endDate).format('YYYY-MM-DD HH:mm:ss'), status: employeeOnDutyRequest.status }),
    constants.Event_Notification_Type_Status.attendance, employeeOnDutyRequest.user?._id?.toString(), companyId, req);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.updateEmployeeDutyRequestSuccess', { recordId: req.params.id }),
    data: employeeOnDutyRequest,
  });
});

// Delete a DutyRequest by ID
exports.deleteEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteEmployeeDutyRequest', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting employee duty request with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const dutyRequest = await EmployeeOnDutyRequest.findByIdAndDelete(req.params.id);

  if (!dutyRequest) {
    websocketHandler.sendLog(req, `Employee duty request not found for ID: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.deleteEmployeeDutyRequestFailure'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted employee duty request: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.deleteEmployeeDutyRequestSuccess', { recordId: req.params.id }),
    data: null,
  });
});

// Get all DutyRequests
exports.getAllEmployeeDutyRequests = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllEmployeeDutyRequests', constants.LOG_TYPES.INFO);

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const company = req.cookies.companyId;
  websocketHandler.sendLog(req, `Extracted companyId from cookies: ${company}`, constants.LOG_TYPES.TRACE);

  if (!company) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.companyIdNotFound'), 400));
  }

  const query = { company: company };
  if (req.body.status) {
    query.status = req.body.status;
  }
  websocketHandler.sendLog(req, `Preparing query: ${JSON.stringify(query)}`, constants.LOG_TYPES.DEBUG);

  try {
    const totalCount = await EmployeeOnDutyRequest.countDocuments(query);
    const dutyRequests = await EmployeeOnDutyRequest.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    for (let i = 0; i < dutyRequests.length; i++) {
      const employeeOnDutyShifts = await EmployeeOnDutyShift.find({})
        .where('employeeOnDutyRequest')
        .equals(dutyRequests[i]._id);
      dutyRequests[i].employeeOnDutyShifts = employeeOnDutyShifts.length > 0 ? employeeOnDutyShifts : null;
      websocketHandler.sendLog(req, `Fetched ${employeeOnDutyShifts.length} shifts for duty request: ${dutyRequests[i]._id}`, constants.LOG_TYPES.DEBUG);
    }

    websocketHandler.sendLog(req, `Successfully retrieved ${dutyRequests.length} employee duty requests`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.getAllEmployeeDutyRequestsSuccess', { companyId: company }),
      data: dutyRequests,
      total: totalCount,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error retrieving employee duty requests: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.getAllEmployeeDutyRequestsFailure'),
      error: error.message,
    });
  }
});


exports.getEmployeeDutyRequestsByUser = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await EmployeeOnDutyRequest.countDocuments({ user: req.params.userId });

  const dutyRequests = await EmployeeOnDutyRequest.find({ user: req.params.userId }).skip(parseInt(skip))
    .limit(parseInt(limit));

  if (dutyRequests.length > 0) {
    for (var i = 0; i < dutyRequests.length; i++) {

      const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(dutyRequests[i]._id);
      if (employeeOnDutyShifts) {
        dutyRequests[i].employeeOnDutyShifts = employeeOnDutyShifts;
      }
      else {
        dutyRequests[i].employeeOnDutyShifts = null;
      }
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: dutyRequests,
    total: totalCount
  });
});

exports.getAllTimeEntriesByCompanyId = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await TimeEntry.countDocuments({ company: req.cookies.companyId });
  const timeEntries = await TimeEntry.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: timeEntries,
    total: totalCount
  });
});

exports.deleteTimeEntry = catchAsync(async (req, res, next) => {
  const timeEntry = await TimeEntry.findByIdAndDelete(req.params.id);

  if (!timeEntry) {
    return next(new AppError(req.t('attendance.TimeEntryNF'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.MappedTimlogToAttendance = async (req, res, next) => {

  websocketHandler.sendLog(req, 'Starting MappedTimlogToAttendance', constants.LOG_TYPES.INFO);
  const companyId = req.cookies.companyId;
  const month = req.body.month || new Date().getMonth(); // +1 since getMonth is 0-based
  const year = req.body.year || new Date().getFullYear();
  websocketHandler.sendLog(req, `Extracted companyId: ${companyId}, month: ${month}, year: ${year}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.companyIdNotFound'), 400));
  }
  req.body.company = companyId;
  const startDate = new Date(year, month - 1, 1);
  //const endDate = new Date(year, month, 0);
  //Replaced the enddate to include time 18:29:59.999 on last day of month according to UTC so that can pull all timelogs entered on that day
  const lastDay = new Date(Date.UTC(year, month, 0));  
  const endDate = toUTCDate(lastDay.setUTCHours(18, 29, 59, 999));
  let filter = { status: 'Active', company: req.cookies.companyId };
  websocketHandler.sendLog(req, `Preparing user query with filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.DEBUG);

  try {
    const features = new APIFeatures(User.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const document = await features.query;

    await Promise.all(document.map(async user => {
      const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user._id });
      if (shiftAssignment) {
        const shift = await Shift.findOne({ _id: shiftAssignment.template });
        if (shift) {
          const timeLogs = await TimeLog.aggregate([
            { $match: { user: user._id, date: { $gte: startDate, $lte: endDate } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                startTime: { $min: '$startTime' },
                lastTimeLog: { $max: '$endTime' },
              },
            },
          ]);
          websocketHandler.sendLog(req, `Aggregated ${timeLogs.length} time logs for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

          if (timeLogs) {
            const attendanceRecords = await Promise.all(timeLogs.map(async log => {
              const attendanceCount = await AttendanceRecords.countDocuments({ user: user._id, date: new Date(log._id) });
              if (attendanceCount === 0) {
                const timeLogCount = await TimeLog.countDocuments({ user: user._id, date: new Date(log._id) });
                let shiftTiming = '';
                let deviationHour = '0';
                let isOvertime = false;
                if (shift.startTime && shift.endTime && shift.minHoursPerDayToGetCreditForFullDay) {
                  const [hours, minutes] = shift.minHoursPerDayToGetCreditForFullDay.split(':').map(Number);
                  const timeDifference = hours * 60;
                  const timeWorked = timeLogCount * 10;
                  if (timeWorked < timeDifference) {
                    deviationHour = timeDifference - timeWorked;
                  }
                  if (timeDifference < timeWorked) {
                    deviationHour = timeWorked - timeDifference;
                    isOvertime = true;
                  }
                }
                const lateComingRemarks = await getLateComingRemarks(user._id, log._id);
                //const timelogDateTime = combineDateAndTime(log._id, log.startTime);
                //const checkInTime = log.startTime ? new Date(log.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "0:00";
                //const checkOutTime = log.lastTimeLog ? new Date(log.lastTimeLog).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "0:00";
                return {
                  date: toUTCDate(log._id),
                  checkIn: toUTCDate(log.startTime),
                  checkOut: toUTCDate(log.lastTimeLog),
                  user: user._id,
                  duration: timeLogCount * 10,
                  ODHours: 0,
                  SSLHours: 0,
                  beforeProcessing: 'N/A',
                  afterProcessing: 'N/A',
                  earlyLateStatus: 'N/A',
                  deviationHour: deviationHour,
                  shiftTiming: `${shift.startTime} - ${shift.endTime}`,
                  attendanceShift: shift._id,
                  lateComingRemarks: lateComingRemarks,
                  company: req.cookies.companyId,
                  isOvertime: isOvertime,
                };
              }
            }));

            const attendanceRecordsFiltered = attendanceRecords.filter(record => record);
            websocketHandler.sendLog(req, `Prepared ${attendanceRecordsFiltered.length} attendance records for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

            await insertAttendanceRecords(attendanceRecordsFiltered);
            await insertOvertimeRecords(attendanceRecordsFiltered, req.cookies.companyId);
            websocketHandler.sendLog(req, `Inserted attendance and overtime records for user: ${user._id}`, constants.LOG_TYPES.INFO);
          }
        }
      }
    }));

    websocketHandler.sendLog(req, `Successfully mapped time logs to attendance for company: ${companyId}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.mappedTimlogToAttendanceSuccess', { companyId }),
      data: null,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error mapping time logs to attendance: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.mappedTimlogToAttendanceFailure'),
      error: error.message,
    });
  }
};

const cornMappedTimlogToAttendance = async (company) => {
  if (company.companyId.toString() !== '68a579feda9656f78e4f84d7') {
    return;
  }

  const month = 7;// new Date().getMonth(); // +1 since getMonth is 0-based
  const year = new Date().getFullYear();
  const companyId = company.companyId;

  if (!companyId) {
    const errorMessage = 'Company ID not found';
    throw new Error(errorMessage);
  }

  const startDate = new Date(year, month - 1, 1);
  //const endDate = new Date(year, month, 0);
  //Replaced the enddate to include time 18:29:59.999 on last day of month according to UTC so that can pull all timelogs entered on that day
  const lastDay = new Date(Date.UTC(year, month, 0));  
  const endDate = toUTCDate(lastDay.setUTCHours(18, 29, 59, 999));

  const filter = { status: 'Active', company: companyId };
  console.log('start date:', startDate, 'end date:', endDate);

  const users = await User.find(filter);

  await Promise.all(users.map(async (user) => {
    const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user._id });
    if (!shiftAssignment) {
      return;
    }

    const shift = await Shift.findOne({ _id: shiftAssignment.template });
    if (!shift) {
      return;
    }

    const timeLogs = await TimeLog.aggregate([
      { $match: { user: user._id, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          startTime: { $min: '$startTime' },
          lastTimeLog: { $max: '$endTime' },
        },
      },
    ]);

    if (!timeLogs.length) {
      return;
    }
    const attendanceRecords = await Promise.all(timeLogs.map(async (log) => {
      const attendanceCount = await AttendanceRecords.countDocuments({ user: user._id, date: new Date(log._id) });
      // if (attendanceCount > 0) {
      //   return null;
      // }
      const timeLogCount = await TimeLog.countDocuments({ user: user._id, date: new Date(log._id) });
      let shiftTiming = '';
      let deviationHour = '0';
      let isOvertime = false;
      if (shift.startTime && shift.endTime && shift.minHoursPerDayToGetCreditForFullDay) {
        const [hours, minutes] = shift.minHoursPerDayToGetCreditForFullDay.split(':').map(Number);
        const timeDifference = hours * 60;
        const timeWorked = timeLogCount * 10;
        if (timeWorked < timeDifference) {
          deviationHour = (timeDifference - timeWorked).toString();
        } else if (timeWorked > timeDifference) {
          deviationHour = (timeWorked - timeDifference).toString();
          isOvertime = true;
        }
      }
      const lateComingRemarks = await getLateComingRemarks(user._id, log._id);
      //const timelogDateTime = combineDateAndTime(log._id, log.startTime);
      //const checkInTime = log.startTime ? new Date(log.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "0:00";
      //const checkOutTime = log.lastTimeLog ? new Date(log.lastTimeLog).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "0:00";
      return {
        date: toUTCDate(log._id),
        checkIn: toUTCDate(log.startTime),
        checkOut: toUTCDate(log.lastTimeLog),
        user: user._id,
        duration: timeLogCount * 10,
        ODHours: 0,
        SSLHours: 0,
        beforeProcessing: 'N/A',
        afterProcessing: 'N/A',
        earlyLateStatus: 'N/A',
        deviationHour,
        shiftTiming: `${shift.startTime} - ${shift.endTime}`,
        attendanceShift: shift._id,
        lateComingRemarks,
        company: companyId,
        isOvertime,
      };
    }));

    const attendanceRecordsFiltered = attendanceRecords.filter(record => record);
//console.log('attendanceRecordsFiltered length:', attendanceRecordsFiltered);
//return;
    if (attendanceRecordsFiltered.length > 0) {
      console.log(`Inserting ${attendanceRecordsFiltered.length} attendance records for user: ${user._id}`);
      await insertAttendanceRecords(attendanceRecordsFiltered);
      await insertOvertimeRecords(attendanceRecordsFiltered, companyId);
    }
  }));
};

// Controller function to handle the upload and processing of attendance single record.
exports.uploadAttendanceJSON = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting single attendance upload', constants.LOG_TYPES.INFO);

  const { EmpCode, StartTime, EndTime, Date } = req.body;

  // Validate input
  if (!EmpCode || !StartTime || !EndTime || !Date) {
    websocketHandler.sendLog(req, 'Invalid input: missing required fields', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidAttendanceJSONFormat'),
    });
  }

  try {
    websocketHandler.sendLog(req, `Processing attendance record for EmpCode: ${EmpCode}`, constants.LOG_TYPES.TRACE);

    const user = await getUserByEmpCode(EmpCode, req.cookies.companyId);
    if (!user) {
      websocketHandler.sendLog(req, `User with EmpCode ${EmpCode} not found`, constants.LOG_TYPES.ERROR);
      return res.status(200).json({
        status: constants.APIResponseStatus.Failure,
        EmpCode,
        message: req.t('attendance.empCodeNotValid'),
      });
    }

    const attendanceRecord = await processAttendanceRecord(user, StartTime, EndTime, Date, req);

    if (!attendanceRecord) {
      websocketHandler.sendLog(req, `Failed to process record for EmpCode: ${EmpCode}`, constants.LOG_TYPES.ERROR);
      return res.status(200).json({
        status: constants.APIResponseStatus.Failure,
        EmpCode,
        message: req.t('attendance.recordProcessingFailed'),
      });
    }

    await insertAttendanceRecords([attendanceRecord]);
    await insertOvertimeRecords([attendanceRecord], req.cookies.companyId);

    websocketHandler.sendLog(req, `Successfully processed attendance for EmpCode: ${EmpCode}`, constants.LOG_TYPES.INFO);

    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      EmpCode,
      message: req.t('attendance.uploadAttendanceJSONSuccess'),
    });

  } catch (error) {
    websocketHandler.sendLog(req, `Error processing attendance record: ${error.message}`, constants.LOG_TYPES.ERROR);
    return res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      EmpCode: req.body.EmpCode,
      message: error.message || req.t('attendance.uploadAttendanceJSONFailure'),
    });
  }
});
// exports.uploadAttendanceJSON = catchAsync(async (req, res, next) => {
//   websocketHandler.sendLog(req, 'Starting uploadAttendanceJSON', constants.LOG_TYPES.INFO);

//   const attendanceData = req.body;
//   websocketHandler.sendLog(req, `Received attendance data with ${attendanceData.length} records`, constants.LOG_TYPES.TRACE);

//   if (!Array.isArray(attendanceData)) {
//     websocketHandler.sendLog(req, 'Invalid format: Data is not an array', constants.LOG_TYPES.ERROR);
//     return res.status(400).json({
//       status: constants.APIResponseStatus.Failure,
//       message: req.t('attendance.invalidAttendanceJSONFormat'),
//     });
//   }

//   try {
//     const results = [];
//     const attendanceRecords = [];

//     for (let i = 0; i < attendanceData.length; i++) {
//       const { EmpCode, StartTime, EndTime, Date } = attendanceData[i];
//       websocketHandler.sendLog(req, `Processing attendance record for EmpCode: ${EmpCode}`, constants.LOG_TYPES.TRACE);
//       try {
//         const user = await getUserByEmpCode(EmpCode, req.cookies.companyId);
//         if (!user) {
//           websocketHandler.sendLog(req, `User with EmpCode ${EmpCode} not found`, constants.LOG_TYPES.ERROR);
//           return next(new AppError(req.t('attendance.empCodeNotValid'), 400));
//         }
//         const attendanceRecord = await processAttendanceRecord(user, StartTime, EndTime, Date, req);
//         if (attendanceRecord) {
//           attendanceRecords.push(attendanceRecord);
//           websocketHandler.sendLog(req, `Processed attendance record for user: ${user._id}`, constants.LOG_TYPES.DEBUG);
//         }
//       } catch (err) {
//         websocketHandler.sendLog(req, `Error processing record for EmpCode ${EmpCode}: ${err.message}`, constants.LOG_TYPES.ERROR);
//         results.push({EmpCode, status: 'failure', message: err.message || 'Unknown error'});
//       }
//     }

//     if (attendanceRecords.length > 0) {
//       try {
//         await insertAttendanceRecords(attendanceRecords);
//         await insertOvertimeRecords(attendanceRecords, req.cookies.companyId);
//         websocketHandler.sendLog(req, `Inserted ${attendanceRecords.length} attendance records`, constants.LOG_TYPES.INFO);
//       } catch (insertErr) {
//         websocketHandler.sendLog(req, `Database insert error: ${insertErr.message}`, constants.LOG_TYPES.ERROR);
//         results.push({ EmpCode: 'ALL', status: 'failure', message: `Database insert error: ${insertErr.message}`});
//       }
//     }
//     // else {
//     //   return next(new AppError(req.t('attendance.uploadAttendanceJSONNoData'), 400));
//     // }

//     websocketHandler.sendLog(req, 'Successfully processed attendance records', constants.LOG_TYPES.INFO);

//     res.status(200).json({
//       status: constants.APIResponseStatus.Success,
//       message: req.t('attendance.uploadAttendanceJSONSuccess'),
//       data: attendanceRecords,
//     });
//   } catch (error) {
//     if (error instanceof AppError) {
//       return next(error);
//     }
//     websocketHandler.sendLog(req, `Error processing attendance records: ${error.message}`, constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('attendance.uploadAttendanceJSONFailure'), 400));
//   }
// });

// Controller function to handle the upload and processing of attendance JSON data.
exports.uploadAttendanceJSONBackup = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting uploadAttendanceJSON', constants.LOG_TYPES.INFO);

  const attendanceData = req.body;
  websocketHandler.sendLog(req, `Received attendance data with ${attendanceData.length} records`, constants.LOG_TYPES.TRACE);

  if (!Array.isArray(attendanceData)) {
    websocketHandler.sendLog(req, 'Invalid format: Data is not an array', constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.invalidAttendanceJSONFormat'),
    });
  }

  try {
    const attendanceRecords = [];

    for (let i = 0; i < attendanceData.length; i++) {
      const { EmpCode, StartTime, EndTime, Date } = attendanceData[i];
      websocketHandler.sendLog(req, `Processing attendance record for EmpCode: ${EmpCode}`, constants.LOG_TYPES.TRACE);
      const user = await getUserByEmpCode(EmpCode, req.cookies.companyId);
      if (!user) {
        websocketHandler.sendLog(req, `User with EmpCode ${EmpCode} not found`, constants.LOG_TYPES.ERROR);
        return next(new AppError(req.t('attendance.empCodeNotValid'), 400));
      }
      const attendanceRecord = await processAttendanceRecord(user, StartTime, EndTime, Date, req);
      if (attendanceRecord) {
        attendanceRecords.push(attendanceRecord);
        websocketHandler.sendLog(req, `Processed attendance record for user: ${user._id}`, constants.LOG_TYPES.DEBUG);
      }
    }

    if (attendanceRecords.length > 0) {
      await insertAttendanceRecords(attendanceRecords);
      await insertOvertimeRecords(attendanceRecords, req.cookies.companyId);
      websocketHandler.sendLog(req, `Inserted ${attendanceRecords.length} attendance records`, constants.LOG_TYPES.INFO);
    }
    else {
      return next(new AppError(req.t('attendance.uploadAttendanceJSONNoData'), 400));
    }

    websocketHandler.sendLog(req, 'Successfully processed attendance records', constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.uploadAttendanceJSONSuccess'),
      data: attendanceRecords,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    websocketHandler.sendLog(req, `Error processing attendance records: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.uploadAttendanceJSONFailure'), 400));
  }
});

// Helper function to fetch user by empCode
async function getUserByEmpCode(empCode, company) {
  try {
    // Fetch the appointment by empCode and populate the user data
    const appointments = await Appointment.find({ empCode: empCode, company: company })
      .populate('user')  // Populate the user field with user details
      .select('user empCode company joiningDate confirmationDate'); // Select relevant fields    
    if (appointments && appointments.length > 0) {
      return appointments[0].user;  // Return the user details from the first matched appointment
    } else {
      return null;  // If no appointments found, return null
    }
  } catch (error) {
    console.error('Error fetching user by empCode:', error);
    return null;
  }
}

// Helper function to process each individual attendance record

async function processAttendanceRecord(user, startTime, endTime, date, req) {
  const companyId = req.cookies.companyId;

  const isInvalid = (time) => !time || time === '0:00' || time === '00:00';
  if (isInvalid(startTime) && isInvalid(endTime)) {
    // Case 1: Both times missing or invalid → default to "10:00"
    startTime = '10:00';
    endTime = '10:00';
  } else if (isInvalid(startTime)) {
    // Case 2: Only startTime invalid → use endTime
    startTime = endTime;
  } else if (isInvalid(endTime)) {
    // Case 3: Only endTime invalid → use startTime
    endTime = startTime;
  }

  const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user._id });
  if (shiftAssignment) {
    const shift = await Shift.findOne({ _id: shiftAssignment.template });
    if (shift) {
      let deviationMinutes = 0;
      let isOvertime = false;
      let duration = 0; // Total minutes worked

      if (startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const start = new Date(date);
        start.setHours(startHours, startMinutes, 0, 0);

        const end = new Date(date);
        end.setHours(endHours, endMinutes, 0, 0);

        duration = (end - start) / (1000 * 60); // Convert milliseconds to minutes
        const [shiftStartHours, shiftStartMinutes] = shift.startTime.split(':').map(Number);
        const [shiftEndHours, shiftEndMinutes] = shift.endTime.split(':').map(Number);

        const shiftTotalMinutes = (shiftEndHours * 60 + shiftEndMinutes) - (shiftStartHours * 60 + shiftStartMinutes);

        if (duration < shiftTotalMinutes) {
          deviationMinutes = shiftTotalMinutes - duration; // Deviation in minutes
        }
        if (duration > shiftTotalMinutes) {
          deviationMinutes = duration - shiftTotalMinutes; // Deviation in minutes
          isOvertime = true;
        }
      }

      // Fetch manual entry comment if any
      const lateComingRemarks = await getLateComingRemarks(user._id, date);

      // const formattedDate = new Date(Date.UTC(
      //   new Date(date).getFullYear(),
      //   new Date(date).getMonth(),
      //   new Date(date).getDate(),
      //   0, 0, 0, 0
      // ));
      const formattedDate = toUTCDate(date);
      //console.log('Formatted Date:', formattedDate);

      // Create an attendance record
      return {
        date: formattedDate,
        checkIn: startTime,
        checkOut: endTime,
        user: user._id,
        duration: duration, // Use total worked minutes instead of timeLogCount * 10
        deviationHour: deviationMinutes,
        shiftTiming: `${shift.startTime} - ${shift.endTime}`,
        lateComingRemarks,
        company: companyId,
        attendanceShift: shift._id,
        isOvertime,
      };

    }
  }
  else {
    const usename = `${user?.firstName} ${user?.lastName}`;
    throw new AppError(req.t('attendance.shiftNotAssigned', { usename }), 400); //throw error so that parent function can catch it
    //return next(new AppError(req.t('attendance.shiftNotAssigned'), 400));
  }
}

// Function to get late coming remarks (if needed)
async function getLateComingRemarks(userId, logId) {
  const manualTime = await manualTimeRequest.findOne({
    user: userId,
    fromDate: { $lte: new Date(logId) },
    toDate: { $gte: new Date(logId) }
  });
  return manualTime ? manualTime.reason : 'N/A';
}
async function insertOvertimeRecords(attendanceRecords, companyId) {
  const overtimeRecords = attendanceRecords
    //.filter(record => record.isOvertime)
    .map(record => ({
      User: record.user, // Replace with appropriate user name
      attendanceShift: record.attendanceShift,
      OverTime: record.deviationHour,
      ShiftTime: record.shiftTiming,
      Date: record.date,
      CheckInDate: record.date,
      CheckOutDate: record.date,
      CheckInTime: record.checkIn,
      CheckOutTime: record.checkOut,
      company: companyId,
      isOvertime: record.isOvertime
    }));

  // Remove duplicates within the array based on Date, User, and AttendanceShift
  const uniqueOvertimeRecords = Array.from(
    new Map(overtimeRecords.map(record =>
      [`${record.User}-${record.attendanceShift}-${record.Date}`, record]
    )).values()
  );

  if (!uniqueOvertimeRecords.length) return;

  try {
    for (const record of uniqueOvertimeRecords) {
      // Find an existing record for same user, shift, and date
      const existingRecord = await OvertimeInformation.findOne({
        User: record.User,
        attendanceShift: record.attendanceShift,
        CheckInDate: record.Date
      });

      const isInvalid = (time) => !time || time === '0:00' || time === '00:00';
      if (isInvalid(record.CheckInTime) && isInvalid(record.CheckOutTime)) {
        // Case 1: Both times missing or invalid → use "10:00"
        record.CheckInTime = '10:00';
        record.CheckOutTime = '10:00';
        record.OverTime = '0';
        record.isOvertime = false;
      } else if (isInvalid(record.CheckInTime)) {
        // Case 2: Only CheckInTime invalid → use CheckOutTime
        record.CheckInTime = record.CheckOutTime;
        record.OverTime = '0';
        record.isOvertime = false;
      } else if (isInvalid(record.CheckOutTime)) {
        // Case 3: Only CheckOutTime invalid → use CheckInTime
        record.CheckOutTime = record.CheckInTime;
        record.OverTime = '0';
        record.isOvertime = false;
      }

      if (!existingRecord) {
        if(record.isOvertime) {
          await OvertimeInformation.create(record);
        }
      } else {
          existingRecord.CheckInTime = record.CheckInTime;
          existingRecord.CheckOutTime = record.CheckOutTime;
          existingRecord.ShiftTime = record.ShiftTime;
          existingRecord.CheckInDate = record.CheckInDate;
          existingRecord.CheckOutDate = record.CheckOutDate;
          existingRecord.company = record.company;

          if(record.isOvertime) {
            existingRecord.OverTime = record.OverTime;
          }
          else{
            existingRecord.OverTime = '0';
          }
          await existingRecord.save();
      }
    }
  } catch (error) {
    console.error('Error inserting or updating overtime records:', error);
  } 
}

// async function insertOvertimeRecordsBackup(attendanceRecords, companyId) {
//   const overtimeRecords = attendanceRecords
//     .filter(record => record.isOvertime)
//     .map(record => ({
//       User: record.user, // Replace with appropriate user name
//       attendanceShift: record.attendanceShift,
//       OverTime: record.deviationHour,
//       ShiftTime: record.shiftTiming,
//       Date: record.date,
//       CheckInDate: record.date,
//       CheckOutDate: record.date,
//       CheckInTime: record.checkIn,
//       CheckOutTime: record.checkOut,
//       company: companyId,
//     }));

//   // Remove duplicates within the array based on Date, User, and AttendanceShift
//   const uniqueOvertimeRecords = Array.from(
//     new Map(overtimeRecords.map(record =>
//       [`${record.User}-${record.attendanceShift}-${record.Date}`, record]
//     )).values()
//   );

//   // Check for existing records in the database to avoid duplicates
//   if (uniqueOvertimeRecords.length) {
//     // Fetch existing records from the database that match the User, AttendanceShift, and Date
//     const existingRecords = await OvertimeInformation.find({
//       User: { $in: uniqueOvertimeRecords.map(record => record.User) },
//       attendanceShift: { $in: uniqueOvertimeRecords.map(record => record.attendanceShift) },
//       Date: { $in: uniqueOvertimeRecords.map(record => record.Date) },
//     });

//     // Filter out records that already exist in the database
//     const newRecords = uniqueOvertimeRecords.filter(record =>
//       !existingRecords.some(existing =>
//         existing.User.toString() === record.User.toString() &&
//         existing.attendanceShift.toString() === record.attendanceShift.toString() &&
//         existing.Date === record.Date
//       )
//     );

//     // Insert only new records
//     if (newRecords.length) {
//       await OvertimeInformation.insertMany(newRecords);
//     }
//   }
// }

// Insert attendanceRecords
async function insertAttendanceRecords(attendanceRecords) {
  // Check if attendanceRecords is null or undefined and handle accordingly
  if (!attendanceRecords) {
    console.warn('No attendance records provided');
    return;
  }

  // Insert records into the database, avoiding duplicates
  try {
    for (const record of attendanceRecords) {
      const existingRecord = await AttendanceRecords.findOne({
        user: record.user,
        date: record.date
      });

      const isInvalid = (time) => !time || time === '0:00' || time === '00:00';
      if (isInvalid(record.checkIn) && isInvalid(record.checkOut)) {
        // Case 1: Both times missing or invalid → use "10:00"
        record.checkIn = '10:00';
        record.checkOut = '10:00';
        record.isOvertime = false;
        record.deviationHour = '0';
        record.duration = 0;
      } else if (isInvalid(record.checkIn)) {
        // Case 2: Only checkIn invalid → use checkOut
        record.checkIn = record.checkOut;
        record.isOvertime = false;
        record.deviationHour = '0';
        record.duration = 0;
      } else if (isInvalid(record.checkOut)) {
        // Case 3: Only checkOut invalid → use checkIn
        record.checkOut = record.checkIn;
        record.isOvertime = false;
        record.deviationHour = '0';
        record.duration = 0;
      }

      if (!existingRecord) {
        await AttendanceRecords.create(record);
      } else {
          existingRecord.checkIn = record.checkIn;
          existingRecord.checkOut = record.checkOut;
          existingRecord.duration = record.duration;
          existingRecord.deviationHour = record.deviationHour;
          existingRecord.isOvertime = record.isOvertime;
          existingRecord.attendanceShift = record.attendanceShift;
          existingRecord.shiftTiming = record.shiftTiming;
          existingRecord.lateComingRemarks = record.lateComingRemarks;
          existingRecord.company = record.company;
          existingRecord.beforeProcessing = record.beforeProcessing;
          existingRecord.afterProcessing = record.afterProcessing;
          existingRecord.earlyLateStatus = record.earlyLateStatus;

          await existingRecord.save();
      }
    }
  } catch (error) {
    console.error('Error inserting records:', error);
  }
}

// // Insert attendanceRecords
// async function insertAttendanceRecords(attendanceRecords) {
//   // Check if attendanceRecords is null or undefined and handle accordingly
//   if (!attendanceRecords) {
//     console.warn('No attendance records provided');
//     return;
//   }

//   // Insert records into the database, avoiding duplicates
//   try {
//     // Assuming each attendance record has a unique combination of employeeId and date
//     const insertPromises = attendanceRecords.map(async (record) => {
//       // Check if the record already exists based on unique fields (e.g., employeeId, date)
//       const existingRecord = await AttendanceRecords.findOne({
//         user: record.user,
//         date: record.date
//       });

//       // If no record exists, insert it
//       if (!existingRecord) {
//         await AttendanceRecords.create(record);

//       } else {
//         console.log('Duplicate found for record:', record);
//       }
//     });

//     // Wait for all insertions to complete
//     await Promise.all(insertPromises);


//   } catch (error) {
//     console.error('Error inserting records:', error);
//   }
// }

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date().setHours(hours, minutes, 0, 0); // Use today's date with the given time
}

function getTimeDifference(minHoursPerDayToGetCreditForFullDay) {

  const differenceInMilliseconds = minHoursPerDayToGetCreditForFullDay;
  // If the end time is before the start time, assume it's the next day
  if (differenceInMilliseconds < 0) {
    differenceInMilliseconds += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
  }

  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  return differenceInMinutes;
}

exports.GetAttendanceByMonth = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip);
  const limit = parseInt(req.body.next);

  const totalCount = await getRecordsByYearAndMonth(req.body.year, req.body.month, skip, limit, req.cookies.companyId);

  const attendanceRecords = await getRecordsByYearAndMonth(req.body.year, req.body.month, 0, 0, req.cookies.companyId);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords,
    total: totalCount
  });

});
exports.GetAttendanceByMonthAndUser = catchAsync(async (req, res, next) => {

  const attendanceRecords = await getRecordsByYearAndMonthByUser(req.body.year, req.body.month, req.body.user);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords
  });

});
async function getRecordsByYearAndMonth(year, month, skip = 0, limit = 0, companyId) {
  // Validate input
  if (!year || !month) {
    throw new Error('Year and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 1); // Start of the next month

  // Fetch records from the database
  try {
    // Check if skip and limit are provided
    if (skip > 0 || limit > 0) {
      const count = await AttendanceRecords.countDocuments({
        date: {
          $gte: startDate,
          $lt: endDate
        },
        company: companyId
      }).exec();
      return { count };
    } else {
      const records = await AttendanceRecords.find({
        date: {
          $gte: startDate,
          $lt: endDate
        },
        company: companyId
      }).skip(skip).limit(limit).exec();
      return records;
    }
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
async function getRecordsByYearAndMonthByUser(year, month, user) {
  // Validate input
  if (!year || !month) {
    throw new Error('Year and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 1); // Start of the next month

  // Fetch records from the database
  try {
    // Check if skip and limit are provided     
    const records = await AttendanceRecords.find({
      date: {
        $gte: startDate,
        $lt: endDate
      },
      user: user
    }).sort({ date: 1 }).exec();
    return records;

  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
exports.ProcessAttendanceAndLOP = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting ProcessAttendanceAndLOP', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Processing for user: ${req.body.user}, month: ${req.body.month}, year: ${req.body.year}`, constants.LOG_TYPES.TRACE);

  try {
    const { user, month, year } = req.body;
    const companyId = req.cookies.companyId;

    const { startOfMonth, endOfMonth } = await getStartAndEndDates(req, year, month);
    websocketHandler.sendLog(req, `Calculated startOfMonth: ${startOfMonth}, endOfMonth: ${endOfMonth}`, constants.LOG_TYPES.DEBUG);
    const { attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates } =
    await getAttendanceAndLeaveData(user, startOfMonth, endOfMonth, companyId, req);
    websocketHandler.sendLog(req, `Fetched attendance and leave data for user`, constants.LOG_TYPES.DEBUG);

    await processLOPForMonth({
      user, month, year, attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates, companyId, req
    });
    websocketHandler.sendLog(req, `Lop processed`, constants.LOG_TYPES.DEBUG);

    websocketHandler.sendLog(req, `Successfully processed attendance and LOP for user: ${user}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.processAttendanceAndLOPSuccess', { userId: user }),
    });

  } catch (error) {
    websocketHandler.sendLog(req, `Error processing attendance and LOP: ${error.message}`, constants.LOG_TYPES.ERROR);
    console.log('Error:', error.message);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.processAttendanceAndLOPFailure'),
      error: error.message,
    });
  }
});
async function getStartAndEndDates(req, year, month) {
  year = parseInt(year, 10);
  month = parseInt(month, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 1900 || year > 9999) {
    throw new Error('Invalid year or month');
  }


  // const utcStartOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // const utcEndOfMonth = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0));
  const utcStartOfMonth = new Date(year, month - 1, 1);
  //Replaced the enddate to include time 18:29:59.999 on last day of month according to UTC so that can pull all timelogs entered on that day
  const lastDay = new Date(Date.UTC(year, month, 0));  
  const utcEndOfMonth = toUTCDate(lastDay.setUTCHours(18, 29, 59, 999));
  console.log('startOfMonth:', utcStartOfMonth, 'endOfMonth:', utcEndOfMonth);
  console.log('startOfMonth:', utcStartOfMonth.toISOString(), 'endOfMonth:', utcEndOfMonth.toISOString());

  websocketHandler.sendLog(req, `UTC Start of month: ${utcStartOfMonth.toISOString()}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, `UTC End of month: ${utcEndOfMonth.toISOString()}`, constants.LOG_TYPES.DEBUG);
  return { startOfMonth: utcStartOfMonth, endOfMonth: utcEndOfMonth };
}
async function getStartAndEndDatesV1(req, year, month) {
  // Ensure inputs are integers
  year = parseInt(year, 10);
  month = parseInt(month, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 1900 || year > 9999) {
    throw new Error('Invalid year or month');
  }

  const timeZone = 'Asia/Kolkata';
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  // Manually format YYYY-MM-DD (zero-padded)
  const pad = (n) => n.toString().padStart(2, '0');

  const startDateStr = `${year}-${pad(month)}-01`;  // Always 1st day
  const endDateStr = `${year}-${pad(month)}-${pad(end.getUTCDate())}`; // last day

  console.log(`Start date string in IST: ${startDateStr}`);
  console.log(`End date string in IST: ${endDateStr}`);
  websocketHandler.sendLog(req, `Start date string in IST: ${startDateStr}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, `End date string in IST: ${endDateStr}`, constants.LOG_TYPES.DEBUG);

  // Convert these back into UTC-based JS Dates for MongoDB range queries
  const utcstartOfMonth = new Date(`${startDateStr}T00:00:00+05:30`);
  const utcendOfMonth = new Date(`${endDateStr}T23:59:59+05:30`);

  websocketHandler.sendLog(req, `UTC Start of month: ${utcstartOfMonth}`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, `UTC End of month: ${utcendOfMonth}`, constants.LOG_TYPES.DEBUG);
  return { startOfMonth: utcstartOfMonth, endOfMonth: utcendOfMonth };
}
// async function getStartAndEndDates(req, year, month) {
//   // Ensure inputs are integers
//   year = parseInt(year, 10);
//   month = parseInt(month, 10);
//   if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < 1900 || year > 9999) {
//     throw new Error('Invalid year or month');
//   }

//   const timeZone = 'Asia/Kolkata';
//   const startDateStr = new Date(Date.UTC(year, month - 1, 1))
//     .toLocaleDateString('en-CA', { timeZone }); // e.g. "2025-06-01"
//   websocketHandler.sendLog(req, `Start date string in IST: ${startDateStr}`, constants.LOG_TYPES.DEBUG);
//   const endDateStr = new Date(Date.UTC(year, month, 0))
//     .toLocaleDateString('en-CA', { timeZone }); // e.g. "2025-06-30"
//     websocketHandler.sendLog(req, `End date string in IST: ${endDateStr}`, constants.LOG_TYPES.DEBUG);

//   // Convert these back into UTC-based JS Dates for MongoDB range queries
//   const utcstartOfMonth = new Date(`${startDateStr}T00:00:00+05:30`);
//   websocketHandler.sendLog(req, `UTC Start of month: ${utcstartOfMonth.toISOString()}`, constants.LOG_TYPES.DEBUG);
//   const utcendOfMonth = new Date(`${endDateStr}T23:59:59+05:30`);
//   console.log(utcstartOfMonth);
//   console.log(utcendOfMonth);
//   websocketHandler.sendLog(req, `UTC End of month: ${utcendOfMonth.toISOString()}`, constants.LOG_TYPES.DEBUG);
//   return { startOfMonth: utcstartOfMonth, endOfMonth: utcendOfMonth };
// }
async function getAttendanceAndLeaveData(user, startOfMonth, endOfMonth, companyId, req) {
  const assignment = await AttendanceTemplateAssignments.findOne({ employee: user });
  if (!assignment) throw new Error("Attendance template assignment not found");

  const attendanceTemplate = await AttendanceTemplate.findById(assignment.attendanceTemplate);
  if (!attendanceTemplate) throw new Error("Attendance template not found");

  const attendanceRecords = await AttendanceRecords.find({
    user, company: companyId, date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const approvedLeaves = await LeaveApplication.find({
    user,
    status: constants.Leave_Application_Constant.Approved,
    startDate: { $lte: endOfMonth },
    endDate: { $gte: startOfMonth },
    company: companyId
  });

  const approvedLeaveDays = approvedLeaves.flatMap(leave => {
    const days = [];
    let d = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (d <= end) {
      if (d >= startOfMonth && d <= endOfMonth) {
        //days.push(toISTDateString(d)); //(d.toISOString().split('T')[0]); // "YYYY-MM-DD"
        days.push(d.toISOString());
      }
      d.setDate(d.getDate() + 1);
    }
    return days;
  });

  const holidays = await HolidayCalendar.find({ company: companyId });

  const holidayDates = holidays.map(h => {
    // const parts = h.date.toLocaleDateString('en-CA').split('/'); // 'YYYY-MM-DD'
    // return parts.join('-');
    //const parts = toISTDateString(h.date);//h.date.toISOString().split('T')[0];
    const parts = h.date.toISOString();
    return parts;
  });
  websocketHandler.sendLog(req, `Attendance and leave data fetched`, constants.LOG_TYPES.DEBUG);

  return { attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates };
}

function toISTDateString(dateInput) {
  const timeZone = 'Asia/Kolkata';
  const date = new Date(dateInput);
  // Convert to same calendar day in IST
  const local = new Date(date.toLocaleString('en-US', { timeZone }));
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toUTCDateString(d) {
  return new Date(d).toISOString().substring(0, 10);
}

function toLocalDateStringFromUTC(dateInput) {
  const d = new Date(dateInput);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, '0') + "-" +
    String(d.getDate()).padStart(2, '0');
}

// full utc based
async function processLOPForMonth({ user, month, year, attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates, companyId, req }) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weeklyOffSet = new Set(attendanceTemplate.weeklyOfDays);
  const alternateSet = new Set(attendanceTemplate.daysForAlternateWeekOffRoutine || []);
  const isAlternateOdd = attendanceTemplate.alternateWeekOffRoutine === 'odd';
  const isAlternateEven = attendanceTemplate.alternateWeekOffRoutine === 'even';
  const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user }); 
  let fullDayDuration = null;
  let halfDayDuration = null;
  let isHalfDayApplicable = false;
  if (shiftAssignment?.template) {
    fullDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditForFullDay * 60;
    halfDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditforHalfDay * 60;
    isHalfDayApplicable = !!shiftAssignment.template.isHalfDayApplicable;
  }
  
  // Normalize attendance dates
  const attendMap = new Map();
  for (const r of attendanceRecords) {
    attendMap.set(toLocalDateStringFromUTC(r.date), r);
  }
  websocketHandler.sendLog(req, `Attendance map created with: ${JSON.stringify([...attendMap.entries()])}`, constants.LOG_TYPES.DEBUG);
  const leaveSet = new Set(approvedLeaveDays.map(toLocalDateStringFromUTC));
  websocketHandler.sendLog(req, `Leave set created with: ${JSON.stringify([...leaveSet])}`, constants.LOG_TYPES.DEBUG);  
  const holidaySet = new Set(holidayDates.map(toLocalDateStringFromUTC));
  websocketHandler.sendLog(req, `Holiday set created with: ${JSON.stringify([...holidaySet])}`, constants.LOG_TYPES.DEBUG);

  for (let day = 1; day <= daysInMonth; day++) {

    const currentDate = new Date(Date.UTC(year, month - 1, day));
    const dateStr = toUTCDateString(currentDate);

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

    // Week number (UTC)
    const weekNumber = getWeekNumber(currentDate);
    const isOddWeek = weekNumber % 2 !== 0;

    const isAlternateOff =
      ((isAlternateOdd && isOddWeek) || (isAlternateEven && !isOddWeek)) &&
      alternateSet.has(dayName);

    const isWeeklyOff = weeklyOffSet.has(dayName) || isAlternateOff;
    if (isWeeklyOff) continue;

    const wasPresent = attendMap.get(dateStr);
    const isOnLeave = leaveSet.has(dateStr);
    const isHoliday = holidaySet.has(dateStr);

    let wasUserPresent = false;
    let wasHalfday = false;

    if (wasPresent) {
      if (wasPresent.duration >= fullDayDuration) {
        wasUserPresent = true;
      } else if (isHalfDayApplicable && wasPresent.duration >= halfDayDuration) {
        wasUserPresent = true;
        wasHalfday = true;
      }
    }

    const shouldInsertLOP = (!wasUserPresent || (wasUserPresent && wasHalfday)) && !isOnLeave;
    if (shouldInsertLOP) {
      const existingLOP = await LOP.findOne({ user, date: currentDate, company: companyId });
      if (!existingLOP) {
        await new LOP({ user, date: currentDate, company: companyId, isHalfDay: wasHalfday }).save();
        websocketHandler.sendLog(req, `Inserted LOP for ${user} on ${currentDate}`, constants.LOG_TYPES.INFO);
      } else {
        websocketHandler.sendLog(req, `LOP already exists for ${user} on ${currentDate}`, constants.LOG_TYPES.WARN);
      }
    }
  }
}

async function processLOPForMonthBackup({ user, month, year, attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates, companyId, req }) {
  const timeZone = 'Asia/Kolkata';
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeklyOffSet = new Set(attendanceTemplate.weeklyOfDays);
  const alternateSet = new Set(attendanceTemplate.daysForAlternateWeekOffRoutine || []);
  const isAlternateOdd = attendanceTemplate.alternateWeekOffRoutine === 'odd';
  const isAlternateEven = attendanceTemplate.alternateWeekOffRoutine === 'even';
  const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user }); 
  let fullDayDuration = null;
  let halfDayDuration = null;
  let isHalfDayApplicable = false;
  if (shiftAssignment?.template) {
    fullDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditForFullDay * 60;
    halfDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditforHalfDay * 60;
    isHalfDayApplicable = !!shiftAssignment.template.isHalfDayApplicable;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const pad = (n) => n.toString().padStart(2, '0');
    const localDateStr = `${year}-${pad(month)}-${pad(day)}`; // always YYYY-MM-DD
    const d = new Date(localDateStr);
    const currentDate = new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0, 0, 0, 0
    ));
    const dateStr = currentDate.toISOString().split('T')[0]; // use "YYYY-MM-DD" string consistently
    // Get weekday name in IST
    const dayName = new Date(currentDate)
      .toLocaleDateString('en-US', { weekday: 'short', timeZone });
    
    const currentWeekNumber = getWeekNumber(currentDate);
    const isOddWeek = currentWeekNumber % 2 !== 0;

    let isAlternateOff = false;
    if ((isAlternateOdd && isOddWeek) || (isAlternateEven && !isOddWeek)) {
      isAlternateOff = alternateSet.has(dayName);
    }
    const isHoliday = holidayDates.some(d => toISTDateString(d) === dateStr);//holidayDates.includes(dateStr);
    const isWeeklyOff = weeklyOffSet.has(dayName) || isAlternateOff || isHoliday;

    if (isWeeklyOff) continue;
    const wasPresent = attendanceRecords.find(r => toISTDateString(r.date) === dateStr);
    const isOnLeave = approvedLeaveDays.some(d => toISTDateString(d) === dateStr);//approvedLeaveDays.includes(dateStr);

    let wasUserPresent = false;
    let wasHalfday = false;

    if(wasPresent){
      if (wasPresent?.duration == 0) {
        wasUserPresent = false;
      }
      else if (wasPresent?.duration >= fullDayDuration) {
        wasUserPresent = true;
      } 
      else if (isHalfDayApplicable && wasPresent?.duration >= halfDayDuration) {
        wasUserPresent = true;
        //if(isOnLeave.)
        wasHalfday = true;
      } else {
        wasUserPresent = false;
      }
    }

    const shouldInsertLOP = (!wasUserPresent || (wasUserPresent && wasHalfday)) && !isOnLeave;
websocketHandler.sendLog(req, `Date: ${currentDate}, dateStr: ${dateStr}, wasUserPresent: ${wasUserPresent}, wasHalfday: ${wasHalfday}, isOnLeave: ${isOnLeave}, shouldInsertLOP: ${shouldInsertLOP}`, constants.LOG_TYPES.DEBUG);
    if (shouldInsertLOP) {
      const existingLOP = await LOP.findOne({ user, date: currentDate, company: companyId });
      if (!existingLOP) {
        await new LOP({ user, date: currentDate, company: companyId, isHalfDay: wasHalfday }).save();
        websocketHandler.sendLog(req, `Inserted LOP for ${user} on ${currentDate}`, constants.LOG_TYPES.INFO);
      } else {
        websocketHandler.sendLog(req, `LOP already exists for ${user} on ${currentDate}`, constants.LOG_TYPES.WARN);
      }
    }
  }
}

async function processLOPForMonthv1({ user, month, year, attendanceTemplate, attendanceRecords, approvedLeaveDays, holidayDates, companyId, req }) {
  const timeZone = 'Asia/Kolkata';
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeklyOffSet = new Set(attendanceTemplate.weeklyOfDays);
  const alternateSet = new Set(attendanceTemplate.daysForAlternateWeekOffRoutine || []);
  const isAlternateOdd = attendanceTemplate.alternateWeekOffRoutine === 'odd';
  const isAlternateEven = attendanceTemplate.alternateWeekOffRoutine === 'even';
  const shiftAssignment = await ShiftTemplateAssignment.findOne({ user: user }); 
  let fullDayDuration = null;
  let halfDayDuration = null;
  let isHalfDayApplicable = false;
  if (shiftAssignment?.template) {
    fullDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditForFullDay * 60;
    halfDayDuration = shiftAssignment.template.minHoursPerDayToGetCreditforHalfDay * 60;
    isHalfDayApplicable = !!shiftAssignment.template.isHalfDayApplicable;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const pad = (n) => n.toString().padStart(2, '0');
    const localDateStr = `${year}-${pad(month)}-${pad(day)}`; // always YYYY-MM-DD
    // const localDateStr = new Date(Date.UTC(year, month - 1, day))
    //   .toLocaleDateString('en-CA', { timeZone }); // e.g. "2025-06-01"
    // Create UTC equivalent of that local day
    const currentDate = new Date(`${localDateStr}T00:00:00+05:30`);
    const dateStr = currentDate.toISOString().split('T')[0]; // use "YYYY-MM-DD" string consistently
    // Get weekday name in IST
    const dayName = new Date(`${localDateStr}T00:00:00+05:30`)
      .toLocaleDateString('en-US', { weekday: 'short', timeZone });
    const currentWeekNumber = getWeekNumber(currentDate);
    const isOddWeek = currentWeekNumber % 2 !== 0;

    let isAlternateOff = false;
    if ((isAlternateOdd && isOddWeek) || (isAlternateEven && !isOddWeek)) {
      isAlternateOff = alternateSet.has(dayName);
    }
    const isHoliday = holidayDates.includes(dateStr);
    const isWeeklyOff = weeklyOffSet.has(dayName) || isAlternateOff || isHoliday;

    if (isWeeklyOff) continue;
    const wasPresent = attendanceRecords.find(r => r.date.toISOString().split('T')[0] === dateStr);
    const isOnLeave = approvedLeaveDays.includes(dateStr);
    let wasUserPresent = false;
    let wasHalfday = false;

    if(wasPresent){
      if (wasPresent?.duration == 0) {
        wasUserPresent = false;
      }
      else if (wasPresent?.duration >= fullDayDuration) {
        wasUserPresent = true;
      } 
      else if (isHalfDayApplicable && wasPresent?.duration >= halfDayDuration) {
        wasUserPresent = true;
        //if(isOnLeave.)
        wasHalfday = true;
      } else {
        wasUserPresent = false;
      }
    }

    const shouldInsertLOP = (!wasUserPresent || (wasUserPresent && wasHalfday)) && !isOnLeave;

    if (shouldInsertLOP) {
      const existingLOP = await LOP.findOne({ user, date: currentDate, company: companyId });
      if (!existingLOP) {
        await new LOP({ user, date: currentDate, company: companyId, isHalfDay: wasHalfday }).save();
        websocketHandler.sendLog(req, `Inserted LOP for ${user} on ${currentDate}`, constants.LOG_TYPES.INFO);
      } else {
        websocketHandler.sendLog(req, `LOP already exists for ${user} on ${currentDate}`, constants.LOG_TYPES.WARN);
      }
    }
  }
}
function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((diff + 1) / 7);
}
exports.validateCompleteAttendanceMonthByUser = catchAsync(async (req, res, next) => {
  const { user, month, year } = req.body;
  const isMonthComplete = await validateCompleteAttendanceMonth(req, user, month, year, req.cookies.companyId);

  res.status(200).json({
    status: isMonthComplete,
    message: req.t('attendance.processAttendanceAndLOPSuccess', { userId: user }),
  });

});
async function validateCompleteAttendanceMonth(req, user, month, year, companyId) {
  const { startOfMonth, endOfMonth } = await getStartAndEndDates(req, year, month);
  const assignment = await AttendanceTemplateAssignments.findOne({ employee: user });
  if (!assignment) return false;

  const attendanceTemplate = await AttendanceTemplate.findById(assignment.attendanceTemplate);
  if (!attendanceTemplate) return false;

  const attendanceRecords = await AttendanceRecords.find({
    user, company: companyId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const leaves = await LeaveApplication.find({
    user,
    status: constants.Leave_Application_Constant.Approved,
    startDate: { $lte: endOfMonth },
    endDate: { $gte: startOfMonth },
  });
  const holidays = await HolidayCalendar.find({ company: companyId });
  const lopRecords = await LOP.find({
    user,
    company: companyId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });
  const timeZone = 'Asia/Kolkata'; // ✅ Added for consistent local date handling
  // Convert to date strings for easy matching
  const attendanceDates = new Set(attendanceRecords.map(r => r.date.toISOString().split('T')[0]));
  const lopDates = new Set(lopRecords.map(r => r.date.toISOString().split('T')[0]));
  const holidayDates = new Set(holidays.map(h => {
    // const parts = h.date.toLocaleDateString('en-CA').split('/'); // YYYY/MM/DD
    // return parts.join('-'); // YYYY-MM-DD
    const parts = h.date.toISOString().split('T')[0];
    return parts;
  }));
  const leaveDates = new Set();
  for (const leave of leaves) {
    let d = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (d <= end) {
      const localDateStr = d.toISOString().split('T')[0]; //d.toLocaleDateString('en-CA', { timeZone });
      leaveDates.add(localDateStr);
      d.setDate(d.getDate() + 1);
    }
  }
  const weeklyOffSet = new Set(attendanceTemplate.weeklyOfDays);
  const alternateSet = new Set(attendanceTemplate.daysForAlternateWeekOffRoutine || []);
  const isAlternateOdd = attendanceTemplate.alternateWeekOffRoutine === 'odd';
  const isAlternateEven = attendanceTemplate.alternateWeekOffRoutine === 'even';

  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const localDateStr = new Date(Date.UTC(year, month - 1, day))
      .toLocaleDateString('en-CA', { timeZone }); // e.g. "2025-06-01"
    // Create UTC equivalent of that local day
    const currentDate = new Date(`${localDateStr}T00:00:00+05:30`);
    const dateStr = currentDate.toISOString().split('T')[0]; // use "YYYY-MM-DD" string consistently
    // Get weekday name in IST
    const dayName = new Date(`${localDateStr}T00:00:00+05:30`)
      .toLocaleDateString('en-US', { weekday: 'short', timeZone });    

    // Check alternate week offs
    const weekNumber = getWeekNumber(currentDate);
    const isOddWeek = weekNumber % 2 !== 0;
    const isAlternateOff = (isAlternateOdd && isOddWeek) || (isAlternateEven && !isOddWeek)
      ? alternateSet.has(dayName)
      : false;

    const isWeeklyOff = weeklyOffSet.has(dayName) || isAlternateOff;

    // Check if the date is covered
    const isCovered =
      attendanceDates.has(dateStr) ||
      leaveDates.has(dateStr) ||
      holidayDates.has(dateStr) ||
      isWeeklyOff ||
      lopDates.has(dateStr);

    if (!isCovered) {
      return false; // Found a missing day
    }
  }

  return true; // All days accounted for
}

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((diff + 1) / 7);
}

exports.ProcessAttendanceUpdate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting ProcessAttendanceUpdate', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Processing attendance for period: ${req.body.attendanceProcessPeriod}`, constants.LOG_TYPES.TRACE);

  try {
    const { attendanceProcessPeriod, runDate, status, exportToPayroll, users } = req.body;

    let attendanceProcess = await AttendanceProcess.findOneAndUpdate(
      { attendanceProcessPeriod: attendanceProcessPeriod, runDate: new Date(runDate) },
      { status, exportToPayroll },
      { new: true, upsert: true }
    );
    websocketHandler.sendLog(req, `Updated/Created attendance process: ${attendanceProcess._id}`, constants.LOG_TYPES.INFO);

    for (let userEntry of users) {
      const { user, status } = userEntry;
      await AttendanceProcessUsers.findOneAndUpdate(
        { attendanceProcess: attendanceProcess._id, user: user },
        { status },
        { new: true, upsert: true }
      );
      websocketHandler.sendLog(req, `Updated/Created attendance process user: ${user}`, constants.LOG_TYPES.DEBUG);
    }

    websocketHandler.sendLog(req, `Successfully processed attendance for period: ${attendanceProcessPeriod}`, constants.LOG_TYPES.INFO);

    return res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.processAttendanceUpdateSuccess', { attendanceProcessPeriod }),
      data: {
        attendanceProcess,
        users,
      },
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error processing attendance: ${error.message}`, constants.LOG_TYPES.ERROR);
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.processAttendanceUpdateFailure'),
      error: error.message,
    });
  }
});

exports.GetProcessAttendanceAndLOP = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const totalCount = await getLOPRecordsByYearAndMonth(req.cookies.companyId, req.body.year, req.body.month, skip, limit);

  const attendanceRecords = await getLOPRecordsByYearAndMonth(req.cookies.companyId, req.body.year, req.body.month, 0, 0);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords,
    total: totalCount
  });

});

async function getLOPRecordsByYearAndMonth(companyId, year, month, skip = 0, limit = 0) {
  // Validate input
  if (!year || !month) {
    throw new Error('Year and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 1); // Start of the next month

  // Fetch records from the database
  try {
    // Check if skip and limit are provided
    const filter = {
      date: { $gte: startDate, $lt: endDate },
      company: new mongoose.Types.ObjectId(companyId)
    };

    // If skip or limit is provided, return count instead of full records
    if (skip > 0 || limit > 0) {
      const count = await LOP.countDocuments(filter).exec();
      return { count };
    }

    // Fetch records with optional pagination
    const records = await LOP.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    return records;
    // if (skip > 0 || limit > 0) {
    //   const count = await LOP.countDocuments({
    //     date: {
    //       $gte: startDate,
    //       $lt: endDate
    //     },
    //     company: companyId
    //   }).exec();
    //   return { count };
    // } else {
    //   const records = await LOP.find({
    //     date: {
    //       $gte: startDate,
    //       $lt: endDate
    //     },
    //     company: companyId
    //   }).skip(skip).limit(limit).exec();
    //   return records;
    // }
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
// Controller to process attendance LOP (Insert method)
exports.ProcessAttendance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting ProcessAttendance', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Processing attendance for period: ${req.body.attendanceProcessPeriodMonth}-${req.body.attendanceProcessPeriodYear}`, constants.LOG_TYPES.TRACE);

  try {
    const companyId = req.cookies.companyId;
    let isFNF = false;
    websocketHandler.sendLog(req, `Extracted companyId: ${companyId}`, constants.LOG_TYPES.TRACE);

    if (!companyId) {
      websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('attendance.companyId　　　NotFound'), 400));
    }

    req.body.company = companyId;
    if (req.body.isFNF) {
      isFNF = true;
    }
    const { attendanceProcessPeriodMonth, attendanceProcessPeriodYear, runDate, exportToPayroll, users, company } = req.body;

    let existingProcess = await AttendanceProcess.findOne({
      attendanceProcessPeriodMonth: attendanceProcessPeriodMonth,
      attendanceProcessPeriodYear: attendanceProcessPeriodYear,
      isFNF: isFNF,
      company: company,
    });
    if (!isFNF && existingProcess) {
      websocketHandler.sendLog(req, `Attendance process already exists for period: ${attendanceProcessPeriodMonth}-${attendanceProcessPeriodYear}`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('attendance.attendanceProcessExists'),
      });
    }

    let attendanceProcess = await AttendanceProcess.create({
      attendanceProcessPeriodMonth: attendanceProcessPeriodMonth,
      attendanceProcessPeriodYear: attendanceProcessPeriodYear,
      runDate: new Date(runDate),
      isFNF: isFNF,
      exportToPayroll,
      company,
    });
    websocketHandler.sendLog(req, `Created attendance process: ${attendanceProcess._id}`, constants.LOG_TYPES.INFO);

    const attendanceProcessUsers = users.map(userEntry => ({
      attendanceProcess: attendanceProcess._id,
      user: userEntry.user,
      status: userEntry.status,
    }));

    await AttendanceProcessUsers.insertMany(attendanceProcessUsers);
    websocketHandler.sendLog(req, `Inserted ${attendanceProcessUsers.length} attendance process users`, constants.LOG_TYPES.INFO);

    if (isFNF) {
      for (let userEntry of users) {
        const user = await User.findById(userEntry.user);
        user.status = constants.User_Status.Settled;
        await user.save();
        websocketHandler.sendLog(req, `Updated user status to Settled: ${userEntry.user}`, constants.LOG_TYPES.INFO);
      }
    }

    websocketHandler.sendLog(req, `Successfully processed attendance for period: ${attendanceProcessPeriodMonth}-${attendanceProcessPeriodYear}`, constants.LOG_TYPES.INFO);

    return res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.processAttendanceSuccess', { attendanceProcessPeriodMonth, attendanceProcessPeriodYear }),
      data: {
        attendanceProcess,
        users: attendanceProcessUsers,
      },
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error processing attendance: ${error.message}`, constants.LOG_TYPES.ERROR);
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.processAttendanceFailure'),
      error: error.message,
    });
  }
});

// Controller to delete attendance process and associated users
exports.deleteAttendance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteAttendance', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting attendance process for period: ${req.body.attendanceProcessPeriodMonth}-${req.body.attendanceProcessPeriodYear}`, constants.LOG_TYPES.TRACE);

  try {
    const { attendanceProcessPeriodMonth, attendanceProcessPeriodYear } = req.body;

    let attendanceProcess = await AttendanceProcess.findOne({
      attendanceProcessPeriodMonth: attendanceProcessPeriodMonth,
      attendanceProcessPeriodYear: attendanceProcessPeriodYear,
      company: req.cookies.companyId
    });
    if (!attendanceProcess) {
      websocketHandler.sendLog(req, `Attendance process not found for period: ${attendanceProcessPeriodMonth}-${attendanceProcessPeriodYear}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('attendance.attendanceProcessNotFound'),
      });
    }

    if (attendanceProcess.exportToPayroll === true) {
      websocketHandler.sendLog(req, `Cannot delete attendance process due to payroll export: ${attendanceProcess._id}`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('attendance.cannotDeleteAttendanceProcess'),
      });
    }

    const deleteResult = await AttendanceProcess.findByIdAndDelete(attendanceProcess._id);
    if (!deleteResult) {
      websocketHandler.sendLog(req, `Failed to delete attendance process: ${attendanceProcess._id}`, constants.LOG_TYPES.ERROR);
      return res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('attendance.deleteAttendanceFailure'),
      });
    }

    const deleteUsersResult = await AttendanceProcessUsers.deleteMany({ attendanceProcess: attendanceProcess._id });
    websocketHandler.sendLog(req, `Deleted attendance process: ${attendanceProcess._id}, removed ${deleteUsersResult.deletedCount} associated users`, constants.LOG_TYPES.INFO);

    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('attendance.deleteAttendanceSuccess', { attendanceProcessPeriodMonth, attendanceProcessPeriodYear }),
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error deleting attendance process: ${error.message}`, constants.LOG_TYPES.ERROR);
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('attendance.deleteAttendanceFailure'),
      error: error.message,
    });
  }
});

exports.GetOvertimeByMonth = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const attendanceRecords = await getOvertimeRecordsByYearAndMonth(req.body.year, req.body.month, req.cookies.companyId);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords
  });

});

async function getOvertimeRecordsByYearAndMonth(year, month, companyId) {
  // Validate input
  if (!year || !month) {
    throw new Error('Year and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  //const startDate = new Date(year, month - 1, 1); // Start of the month
  //const endDate = new Date(year, month, 1); // Start of the next month


  // Fetch records from the database
  try {
    // Check if skip and limit are provided

    // Convert start and end date based on the year and month

    // const formattedMonth = String(month).padStart(2, '0');
    // const startDate = moment(`${year}-${formattedMonth}-01`, 'YYYY-MM-DD').startOf('month').toDate();

    const startDate = moment(`${year}-${month}-01`, 'YYYY-M-D').startOf('month').toDate();
    // const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();
    // Get all records for the month, applying skip and limit for pagination
    const records = await OvertimeInformation.find({
      CheckInDate: {
        $gte: startDate,
        $lt: endDate
      },
      company: companyId
    }).exec();
    return records; // Return the actual records
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
exports.GetProcessAttendance = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  var isFNF = false;
  if (req.body.isFNF) {
    isFNF = req.body.isFNF;
  }
  const totalCount = await getAttendanceProcessRecordsByYearAndMonth(req.cookies.companyId, req.body.year, req.body.month, skip, limit, isFNF);

  const attendanceRecords = await getAttendanceProcessRecordsByYearAndMonth(req.cookies.companyId, req.body.year, req.body.month, 0, 0, isFNF);
  if (attendanceRecords) {
    for (var i = 0; i < attendanceRecords.length; i++) {
      const user = await AttendanceProcessUsers.find({}).where('attendanceProcess').equals(attendanceRecords[i]._id).select('user');
      if (user) {
        attendanceRecords[i].users = user;
      }
      else {
        attendanceRecords[i].users = null;
      }
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords,
    total: totalCount
  });

});

async function getAttendanceProcessRecordsByYearAndMonth(companyId, year, month, skip = 0, limit = 0, isFNF = false) {
  // Validate input
  if (!year || !month) {
    throw new Error('Year and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 1); // Start of the next month
  // Fetch records from the database
  try {
    const query = {
      runDate: {
        $gte: startDate,
        $lt: endDate
      },
      isFNF: isFNF,
      company: companyId // <-- Add company check here
    };
    // Check if skip and limit are provided
    if (skip > 0 || limit > 0) {
      const count = await AttendanceProcess.countDocuments(query).exec();
      return { count };
      // const count = await AttendanceProcess.countDocuments({
      //   runDate: {
      //     $gte: startDate,
      //     $lt: endDate
      //   },
      //   "isFNF": isFNF
      // }).exec();
      // return { count };
    } else {
      // const records = await AttendanceProcess.find({
      //   runDate: {
      //     $gte: startDate,
      //     $lt: endDate
      //   },
      //   "isFNF": isFNF
      // }).skip(skip).limit(limit).exec();
      // return records;
      const records = await AttendanceProcess.find(query)
        .skip(skip)
        .limit(limit)
        .exec();
      return records;
    }
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}

// ...existing code...

async function getOvertimeRecordsByUserYearAndMonth(user, year, month, skip = 0, limit = 0) {
  // Validate input
  if (!year || !month || !user) {
    throw new Error('User ID, year, and month are required');
  }
  // Ensure month is 1-based and convert to 0-based for JavaScript Date
  const startDate = new Date(year, month - 1, 1); // Start of the month
  const endDate = new Date(year, month, 0, 23, 59, 59); // End of the month

  // Fetch records from the database
  try {
    // Check if skip and limit are provided
    if (skip > 0 || limit > 0) {
      const count = await OvertimeInformation.countDocuments({
        User: user,
        CheckInDate: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      }).exec();
      return { count };
    } else {
      const records = await OvertimeInformation.find({
        User: user,
        CheckInDate: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      }).skip(skip).limit(limit).exec();
      return records;
    }
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}

exports.getOvertimeByUser = catchAsync(async (req, res, next) => {
  const { user, month, year } = req.body;

  // Validate input
  if (!user || !month || !year) {
    return next(new AppError(req.t('attendance.UserIDMonthYearRequired'), 400));
  }

  const overtimeRecords = await getOvertimeRecordsByUserYearAndMonth(user, year, month);

  if (!overtimeRecords || overtimeRecords.length === 0) {
    return next(new AppError(req.t('attendance.OvertimeRecordsNF'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: overtimeRecords,
  });
}); exports.getOvertimeByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getOvertimeByUser', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching overtime records for user: ${req.body.user}, month: ${req.body.month}, year: ${req.body.year}`, constants.LOG_TYPES.TRACE);

  const { user, month, year } = req.body;

  if (!user || !month || !year) {
    websocketHandler.sendLog(req, 'Missing required fields: user, month, or year', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.getOvertimeByUserFailure'), 400));
  }

  const overtimeRecords = await getOvertimeRecordsByUserYearAndMonth(user, year, month);

  if (!overtimeRecords || overtimeRecords.length === 0) {
    websocketHandler.sendLog(req, `No overtime records found for user: ${user}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('attendance.getOvertimeByUserFailure'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved ${overtimeRecords.length} overtime records for user: ${user}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('attendance.getOvertimeByUserSuccess', { userId: user }),
    data: overtimeRecords,
  });
});

exports.validateAttendanceProcess = catchAsync(async (req, res, next) => {
  const { year, month } = req.body;
  const companyId = req.cookies.companyId;

  if (!year || !month || !companyId) {
    return next(new AppError("Year, month, and company ID are required.", 400));
  }
console.log({ year, month, companyId, isFNF: false });
  const attendance = await AttendanceProcess.findOne({
    attendanceProcessPeriodYear: year.toString(),
    attendanceProcessPeriodMonth: month.toString(),
    company: companyId,
    isFNF: false
  });
  console.log(attendance);
  if (!attendance) {
    return res.status(200).json({
      exists: false,
      message: `Attendance process not completed for ${month}/${year}`
    });
  }

  res.status(200).json({
    exists: true,
    message: `Attendance process exists for ${month}/${year}`
  });
});

exports.MappedTimlogToAttendanceHelper = async () => {
  let companies = await Company.find({}).select('_id');
  for (let company of companies) {
    //console.log(`Processing company ID: ${company._id}`);
    await cornMappedTimlogToAttendance({
      companyId: company._id
    });
  }
};