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
const  websocketHandler  = require('../utils/websocketHandler');

// General Settings Controllers
exports.createGeneralSettings = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createGeneralSettings', constants.LOG_TYPES.INFO);
  
  const companyId = req.cookies.companyId;
  websocketHandler.sendLog(req, `Extracted companyId from cookies: ${companyId}`, constants.LOG_TYPES.TRACE);
  
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError('Company ID not found in cookies', 400));
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
      data: generalSettings,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error creating general settings: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError('Error creating general settings', 500));
  }
});

exports.getGeneralSettings = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  const generalSettings = await GeneralSettings.find({ company: companyId });
  if (!generalSettings) {
    return next(new AppError('GeneralSettings not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: generalSettings,
  });
});

exports.updateGeneralSettings = catchAsync(async (req, res, next) => {
  const generalSettings = await GeneralSettings.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!generalSettings) {
    return next(new AppError('GeneralSettings not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: generalSettings,
  });
});

exports.createRegularizationReason = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  req.body.company = company; // Set company in the request body

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
  const regularizationReason = await RegularizationReason.findById(req.params.id);

  if (!regularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
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
  const isRegularizationReason = await RegularizationReason.findById(req.params.id);

  if (!isRegularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
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
    return next(new AppError('Regularization Reason not found', 404));
  }

  regularizationReason.userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReason._id);;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: regularizationReason
  });
});


exports.deleteRegularizationReason = catchAsync(async (req, res, next) => {
  const regularizationReason = await RegularizationReason.findByIdAndDelete(req.params.id);
  if (!regularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllRegularizationReasons = catchAsync(async (req, res, next) => {
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
    data: regularizationReasons,
    total: totalCount
  });
});

exports.createOnDutyReason = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  req.body.company = company; // Set company in the request body

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
  const onDutyReason = await OnDutyReason.findById(req.params.id);

  if (!onDutyReason) {
    return next(new AppError('OnDuty Reason not found', 404));
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
    data: onDutyReason
  });
});

exports.updateOnDutyReason = catchAsync(async (req, res, next) => {
  const isOnDutyReason = await OnDutyReason.findById(req.params.id);

  if (!isOnDutyReason) {
    return next(new AppError('On Duty Reason not found', 404));
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
    return next(new AppError('Regularization Reason not found', 404));
  }

  onDutyReason.userOnDutyReason = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReason._id);;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyReason
  });
});

exports.deleteOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findByIdAndDelete(req.params.id);
  if (!onDutyReason) {
    return next(new AppError('OnDutyReason Reason not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllOnDutyReasons = catchAsync(async (req, res, next) => {
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
    data: onDutyReasons,
    total: totalCount
  });
});


// Create a new attendance mode
exports.createAttendanceMode = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
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
  const attendanceMode = await AttendanceMode.findById(req.params.id);
  if (!attendanceMode) {
    return next(new AppError('Attendance mode not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceMode,
  });
});

// Update an attendance mode by ID
exports.updateAttendanceMode = catchAsync(async (req, res, next) => {
  const attendanceMode = await AttendanceMode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!attendanceMode) {
    return next(new AppError('Attendance mode not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceMode,
  });
});

// Delete an attendance mode by ID
exports.deleteAttendanceMode = catchAsync(async (req, res, next) => {
  const attendanceMode = await AttendanceMode.findByIdAndDelete(req.params.id);

  if (!attendanceMode) {
    return next(new AppError('Attendance mode not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Get all attendance modes
exports.getAllAttendanceModes = catchAsync(async (req, res, next) => {
  const attendanceModes = await AttendanceMode.find();
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceModes,
  });
});

// Create a new Attendance Template
exports.createAttendanceTemplate = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
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
  const attendanceTemplate = await AttendanceTemplate.findById(req.params.id);
  if (!attendanceTemplate) {
    return next(new AppError('Attendance Template not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceTemplate,
  });
});

// Update an Attendance Template by ID
exports.updateAttendanceTemplate = catchAsync(async (req, res, next) => {
  const attendanceTemplate = await AttendanceTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!attendanceTemplate) {
    return next(new AppError('Attendance Template not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceTemplate,
  });
});

// Delete an Attendance Template by ID
exports.deleteAttendanceTemplate = catchAsync(async (req, res, next) => {
  const attendanceTemplate = await AttendanceTemplate.findByIdAndDelete(req.params.id);
  if (!attendanceTemplate) {
    return next(new AppError('Attendance Template not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAttendanceTemplateByUser = catchAsync(async (req, res, next) => {

  const attendanceTemplateAssignments = await AttendanceTemplateAssignments.find({ user: req.params.userId });

  var attendanceTemplate = null;
  if (attendanceTemplateAssignments.length > 0) {
    attendanceTemplate = await AttendanceTemplate.findById(attendanceTemplateAssignments[0].attandanceTemplate);
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceTemplate,
  });
});
// Get all Attendance Templates
exports.getAllAttendanceTemplates = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await AttendanceTemplate.countDocuments({ company: req.cookies.companyId });

  const attendanceTemplates = await AttendanceTemplate.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceTemplates,
    total: totalCount
  });
});

exports.addAttendanceRegularization = catchAsync(async (req, res, next) => {

  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  // Check if the attendanceTemplate exists
  const templateExists = await AttendanceTemplate.exists({ name: req.body.attendanceTemplate });
  if (!templateExists) {
    return next(new AppError('Invalid attendanceTemplate', 400));
  }

  // Check if AttendanceRegularization with the same attendanceTemplate already exists
  const existingRegularization = await AttendanceRegularization.findOne({ attendanceTemplate: req.body.attendanceTemplate });
  if (existingRegularization) {
    return next(new AppError('AttendanceRegularization with this attendanceTemplate already exists', 400));
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
    status:constants.APIResponseStatus.Success,
    data: attendanceRegularization
  });
});

exports.getAttendanceRegularization = catchAsync(async (req, res, next) => {
  const attendanceRegularization = await AttendanceRegularization.findById(req.params.id);
  if (!attendanceRegularization) {
    return next(new AppError("Attendance Regularization not found", 404));
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
    data: attendanceRegularization
  });
});

exports.getAttendanceRegularizationByTemplate = catchAsync(async (req, res, next) => {
  const attendanceRegularization = await AttendanceRegularization.findOne({
    attendanceTemplate: req.params.templateId,
    company: req.cookies.companyId,
  });
  if (!attendanceRegularization) {
    return next(new AppError("Attendance Regularization not found", 404));
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
    data: attendanceRegularization
  });
});
exports.updateAttendanceRegularization = catchAsync(async (req, res, next) => {
  // Check if the attendanceTemplate exists
  const templateExists = await AttendanceTemplate.exists({ name: req.body.attendanceTemplate });
  if (!templateExists) {
    return next(new AppError('Invalid attendanceTemplate', 400));
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
    return next(new AppError("Attendance Regularization not found", 404));
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
    data: attendanceRegularizations,
    total: totalCount
  });
});

exports.deleteAttendanceRegularization = catchAsync(async (req, res, next) => {
  const attendanceRegularization = await AttendanceRegularization.findByIdAndDelete(req.params.id);

  if (!attendanceRegularization) {
    return next(new AppError("Attendance Regularization not found", 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
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
  const locations = await AttendanceRegularizationRestrictedLocation.find({ attendanceRegularization: req.params.attendanceRegularization });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: locations
  });
});

exports.updateAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  const updatedLocation = await AttendanceRegularizationRestrictedLocation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedLocation) {
    return next(new AppError('No location found with that ID', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedLocation
  });
});

exports.getAttendanceRegularizationRestrictedLocationById = catchAsync(async (req, res, next) => {
  const location = await AttendanceRegularizationRestrictedLocation.findById(req.params.id);

  if (!location) {
    return next(new AppError('No location found with that ID', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

exports.deleteAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  const location = await AttendanceRegularizationRestrictedLocation.findByIdAndDelete(req.params.id);

  if (!location) {
    return next(new AppError('No location found with that ID', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Create a new Attendance Template Assignment
exports.createAttendanceAssignment = catchAsync(async (req, res, next) => {

  // Check if the attendanceTemplate exists
  const attendanceTemplate = await AttendanceTemplate.findOne({ _id: req.body.attandanceTemplate });
  if (!attendanceTemplate) {
    return next(new AppError('Invalid attendanceTemplate', 400));
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
    return next(new AppError('Invalid employee', 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  req.body.company = companyId;

  await AttendanceTemplateAssignments.deleteMany({ employee: req.body.employee });

  // Create the attendance assignment
  const attendanceAssignment = await AttendanceTemplateAssignments.create({
    employee: req.body.employee,
    attandanceTemplate: req.body.attandanceTemplate,
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
  const attendanceAssignment = await AttendanceTemplateAssignments.findById(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceAssignment,
  });
});

// Update an Attendance Template Assignment by ID
exports.updateAttendanceAssignment = catchAsync(async (req, res, next) => {
  // Check if the attendance assignment exists
  const attendanceAssignment = await AttendanceTemplateAssignments.findById(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
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
  const attendanceAssignment = await AttendanceTemplateAssignments.findByIdAndDelete(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Get all Attendance Template Assignments
exports.getAllAttendanceAssignments = catchAsync(async (req, res, next) => {
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
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
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
  const roundingInformation = await RoundingInformation.findById(req.params.id);
  if (!roundingInformation) {
    return next(new AppError('Rounding information not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingInformation,
  });
});

exports.updateRoundingInformation = catchAsync(async (req, res, next) => {
  const roundingInformation = await RoundingInformation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!roundingInformation) {
    return next(new AppError('Rounding information not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingInformation,
  });
});

exports.deleteRoundingInformation = catchAsync(async (req, res, next) => {
  const roundingInformation = await RoundingInformation.findByIdAndDelete(
    req.params.id
  );

  if (!roundingInformation) {
    return next(new AppError('Rounding information not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllRoundingInformation = catchAsync(async (req, res, next) => {
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
  const overtimeInformation = await OvertimeInformation.findById(req.params.id);
  if (!overtimeInformation) {
    return next(new AppError('Overtime Information not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: overtimeInformation,
  });
});

exports.deleteOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.findByIdAndDelete(req.params.id);
  if (!overtimeInformation) {
    return next(new AppError('Overtime Information not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllOvertimeInformation = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OvertimeInformation.countDocuments({ company: req.cookies.companyId });

  const overtimeInformation = await OvertimeInformation.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: overtimeInformation,
    total: totalCount
  });
});

exports.createOnDutyTemplate = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
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
  const onDutyTemplate = await OnDutyTemplate.findById(req.params.id);
  if (!onDutyTemplate) {
    return next(new AppError('OnDutyTemplate not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyTemplate,
  });
});

exports.updateOnDutyTemplate = catchAsync(async (req, res, next) => {
  const onDutyTemplate = await OnDutyTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!onDutyTemplate) {
    return next(new AppError('OnDutyTemplate not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyTemplate,
  });
});

exports.deleteOnDutyTemplate = catchAsync(async (req, res, next) => {
  const onDutyTemplate = await OnDutyTemplate.findByIdAndDelete(req.params.id);
  if (!onDutyTemplate) {
    return next(new AppError('OnDutyTemplate not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllOnDutyTemplates = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OnDutyTemplate.countDocuments({ company: req.cookies.companyId });

  const onDutyTemplates = await OnDutyTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: onDutyTemplates,
    total: totalCount
  });
});

// Create a UserOnDutyTemplate
exports.createUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  // Check if the user exists
  const userExists = await User.exists({ _id: req.body.user });
  if (!userExists) {
    return next(new AppError('User not found', 404));
  }

  // Check if the duty template exists
  const dutyTemplateExists = await OnDutyTemplate.exists({ _id: req.body.onDutyTemplate });
  if (!dutyTemplateExists) {
    return next(new AppError('Duty template not found', 404));
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
  const userOnDutyTemplate = await UserOnDutyTemplate.findById(req.params.id);
  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userOnDutyTemplate,
  });
});

// Get a UserOnDutyTemplate by ID
exports.getUserOnDutyTemplateByUser = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.find({ user: req.params.user });
  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userOnDutyTemplate,
  });
});

// Update a UserOnDutyTemplate by ID
exports.updateUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  // Check if the user on duty template exists
  const userOnDutyTemplate = await UserOnDutyTemplate.findById(req.params.id);
  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }

  // Check if the duty template exists
  const dutyTemplateExists = await OnDutyTemplate.exists({ _id: req.body.onDutyTemplate });
  if (!dutyTemplateExists) {
    return next(new AppError('Duty template not found', 404));
  }

  // Update the user on duty template, excluding the user field
  const updatedUserOnDutyTemplate = await UserOnDutyTemplate.findByIdAndUpdate(req.params.id, {
    ...req.body,
    user: userOnDutyTemplate.user // Exclude updating the user field
  }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedUserOnDutyTemplate,
  });
});

// Delete a UserOnDutyTemplate by ID
exports.deleteUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.findByIdAndDelete(req.params.id);

  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Get all UserOnDutyTemplates
exports.getAllUserOnDutyTemplates = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await UserOnDutyTemplate.countDocuments({ company: req.cookies.companyId });

  const userOnDutyTemplates = await UserOnDutyTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userOnDutyTemplates,
    total: totalCount
  });
});

exports.createShift = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const shift = await Shift.create(req.body);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: shift,
  });
});

exports.getShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    return next(new AppError('Shift not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shift,
  });
});

exports.updateShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!shift) {
    return next(new AppError('Shift not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: shift,
  });
});

exports.deleteShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);

  if (!shift) {
    return next(new AppError('Shift not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllShifts = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await Shift.countDocuments({ company: req.cookies.companyId });

  const shifts = await Shift.find({ company: req.cookies.companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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

  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const shiftTemplateAssignment = await ShiftTemplateAssignment.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: shiftTemplateAssignment
  });
});

// Get a ShiftTemplateAssignment by ID
exports.getShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignment = await ShiftTemplateAssignment.findById(req.params.id);
  if (!shiftTemplateAssignment) {
    return next(new AppError('ShiftTemplateAssignment not found', 404));
  }
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
    return next(new AppError('ShiftTemplateAssignment not found', 404));
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
    return next(new AppError('ShiftTemplateAssignment not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
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
    return next(new AppError('Company ID not found in cookies', 400));
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
  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.id);
  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: rosterShiftAssignment,
  });
});

exports.getRosterShiftAssignmentByUser = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.userId);
  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: rosterShiftAssignment,
  });
});
exports.updateRosterShiftAssignment = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: rosterShiftAssignment,
  });
});

exports.deleteRosterShiftAssignment = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findByIdAndDelete(req.params.id);

  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
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
    return next(new AppError('Company ID not found in cookies', 400));
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
  const userOnDutyTemplate = await UserOnDutyTemplate.find({ user: req.body.user });
  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not assigned for current user', 404));
  }

  const employeeOnDutyRequestIsExists = await EmployeeOnDutyRequest.find({ user: req.body.user });
  if (!employeeOnDutyRequestIsExists) {
    return next(new AppError('EmployeeOnDutyRequest is already assigned for current user', 404));
  }

  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  //self
  const employeeOnDutyRequest = await EmployeeOnDutyRequest.create(req.body);
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
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeOnDutyRequest
  });
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
  const employeeOnDutyRequest = await EmployeeOnDutyRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!employeeOnDutyRequest) {
    return next(new AppError('DutyRequest not found', 404));
  }

  if (employeeOnDutyRequest) {
    const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(employeeOnDutyRequest._id);
    if (employeeOnDutyShifts) {
      employeeOnDutyRequest.employeeOnDutyShifts = employeeOnDutyShifts;
    }
    else {
      employeeOnDutyRequest.employeeOnDutyShifts = null;
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeOnDutyRequest
  });
});

// Delete a DutyRequest by ID
exports.deleteEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await EmployeeOnDutyRequest.findByIdAndDelete(req.params.id);

  if (!dutyRequest) {
    return next(new AppError('DutyRequest not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Get all DutyRequests
exports.getAllEmployeeDutyRequests = catchAsync(async (req, res, next) => {
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
  const totalCount = await EmployeeOnDutyRequest.countDocuments(query);

  // Get the regularization requests matching the query with pagination
  const dutyRequests = await EmployeeOnDutyRequest.find(query).skip(parseInt(skip))
    .limit(parseInt(limit));
  if (dutyRequests) {
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
    return next(new AppError('TimeEntry not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.MappedTimlogToAttandance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const month = req.body.month || new Date().getMonth(); // Default to current month if not provided
  const year = req.body.year || new Date().getFullYear(); // Default to current year if not provided

  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  req.body.company = companyId;
  const startDate = new Date(year, month - 1, 1); // First day of the given month
  const endDate = new Date(year, month, 0); // Last day of the given month
  let filter = { status: 'Active', company: req.cookies.companyId };
  // Generate query based on request params
  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Run created query
  const document = await features.query;

  //  const endDate = new Date(); // Today's date

  // Move to the first day of the current month
  const firstDayOfCurrentMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  // Move to the last day of the previous month
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);

  // Get the day of the week of the last day of the previous month
  const lastDayOfWeek = lastDayOfPreviousMonth.getDay(); // (0 = Sunday, ..., 6 = Saturday)

  // Calculate how many days to subtract to get to the last Monday
  const daysToSubtract = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;

  // Calculate the last Monday of the previous month
  // const startDate = new Date(lastDayOfPreviousMonth.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));

  // Define start and end dates for the selected month

  // Perform additional work on each user
  const modifiedUsers = await Promise.all(document.map(async user => {
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
              lastTimeLog: { $max: '$endTime' }
            }
          }
        ]);
        console.log(timeLogs);
        if (timeLogs) {
          const attendanceRecords = await Promise.all(timeLogs.map(async log => {
            console.log(log._id);
            const attendannceCount = await AttendanceRecords.countDocuments({ user: user._id, date: new Date(log._id) });
            if (attendannceCount == 0) {
              const timeLogCount = await TimeLog.countDocuments({ user: user._id, date: new Date(log._id) });
              let shiftTiming = "";
              let deviationHour = "0";
              let isOvertime = false;
              if (shift.startTime && shift.endTime && shift.minHoursPerDayToGetCreditForFullDay) {
                const [hours, minutes] = shift.minHoursPerDayToGetCreditForFullDay.split(":").map(Number);
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
              // Fetch manual entry comment if any
              const lateComingRemarks = await getLateComingRemarks(user._id, log._id);

              return {
                date: new Date(log._id),
                checkIn: log.startTime,
                checkOut: log.lastTimeLog,
                user: user._id,
                duration: timeLogCount * 10,
                ODHours: 0,
                SSLHours: 0,
                beforeProcessing: 'N/A',
                afterProcessing: 'N/A',
                earlyLateStatus: 'N/A',
                deviationHour: deviationHour,
                shiftTiming: `${shift.startTime} - ${shift.endTime}`,       
                attandanceShift: shift._id, 
                lateComingRemarks: lateComingRemarks,
                company: req.cookies.companyId,     
                isOvertime: isOvertime,
              };
            }
          }));

          const attendanceRecordsFiltered = attendanceRecords.filter(record => record);

          //compare parameters from shift and calculte no of halfdays added based on tmelog
          //Need o chaeck flag and if fllag s set then only + applied
          //IF isovertimeallowed flag set to true then only overtime will be calculated
          // Insert attendanceRecords into AttendanceRecord collection
          await insertAttendanceRecords(attendanceRecordsFiltered);
          await insertOvertimeRecords(attendanceRecordsFiltered,req.cookies.companyId);         

        }
      }
    }
  }));

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Controller function to handle the upload and processing of attendance JSON data
exports.uploadAttendanceJSON = async (req, res, next) => {
  const attendanceData = req.body; // Array of attendance data sent in the request body

  // Check if the data is an array
  if (!Array.isArray(attendanceData)) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Invalid format: Data should be an array of objects',
    });
  }

  try {
    const attendanceRecords = [];

    // Loop through the attendance data and process each entry
    for (let i = 0; i < attendanceData.length; i++) {
      const { EmpCode, StartTime, EndTime, Date } = attendanceData[i];

      // Fetch user details using empCode
      const user = await getUserByEmpCode(EmpCode);

      if (!user) {
        console.error(`User with empCode ${EmpCode} not found`);
        continue; // Skip if the user is not found
      }

      // Process each record (this can be adjusted based on your logic)
      const attendanceRecord = await processAttendanceRecord(user, StartTime, EndTime, Date, req.cookies.companyId);

      if (attendanceRecord) {
        attendanceRecords.push(attendanceRecord);
      }
    }
    console.log(attendanceRecords);
    // If there are processed records, insert them into the database
    if (attendanceRecords.length > 0) {
      await insertAttendanceRecords(attendanceRecords);
      await insertOvertimeRecords(attendanceRecords,req.cookies.companyId);  
    }     

    // Send response back indicating success
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: 'Attendance records processed successfully',
      data: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: 'An error occurred while processing the attendance records',
    });
  }
};

// Helper function to fetch user by empCode
async function getUserByEmpCode(empCode) {
  try {
    console.log(empCode);
    // Fetch the appointment by empCode and populate the user data
    const appointments = await Appointment.find({ empCode: empCode })
      .populate('user')  // Populate the user field with user details
      .select('user empCode company joiningDate confirmationDate'); // Select relevant fields
    console.log(appointments);
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

async function processAttendanceRecord(user, startTime, endTime, date, companyId) {
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

      // Create an attendance record
      return {
        date: new Date(date),
        checkIn: startTime,
        checkOut: endTime,
        user: user._id,
        duration: duration, // Use total worked minutes instead of timeLogCount * 10
        deviationHour: deviationMinutes,
        shiftTiming: `${shift.startTime} - ${shift.endTime}`,
        lateComingRemarks,
        company: companyId,
        attandanceShift: shift._id,  
        isOvertime,
      };
      
    }
  }

  return null; // Return null if no valid shift is found
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
    .filter(record => record.isOvertime)
    .map(record => ({
      User: record.user, // Replace with appropriate user name
      AttandanceShift: record.attandanceShift,
      OverTime: record.deviationHour,
      ShiftTime: record.shiftTiming,
      Date: record.date,
      CheckInDate: record.date,
      CheckOutDate: record.date,
      CheckInTime: record.checkIn,
      CheckOutTime: record.checkOut,
      company: companyId,
    }));

  // Remove duplicates within the array based on Date, User, and AttandanceShift
  const uniqueOvertimeRecords = Array.from(
    new Map(overtimeRecords.map(record =>
      [`${record.User}-${record.AttandanceShift}-${record.Date}`, record]
    )).values()
  );

  // Check for existing records in the database to avoid duplicates
  if (uniqueOvertimeRecords.length) {
    // Fetch existing records from the database that match the User, AttandanceShift, and Date
    const existingRecords = await OvertimeInformation.find({
      User: { $in: uniqueOvertimeRecords.map(record => record.User) },
      AttandanceShift: { $in: uniqueOvertimeRecords.map(record => record.AttandanceShift) },
      Date: { $in: uniqueOvertimeRecords.map(record => record.Date) },
    });

    // Filter out records that already exist in the database
    const newRecords = uniqueOvertimeRecords.filter(record =>
      !existingRecords.some(existing =>
        existing.User.toString() === record.User.toString() &&
        existing.AttandanceShift.toString() === record.AttandanceShift.toString() &&
        existing.Date === record.Date
      )
    );

    // Insert only new records
    if (newRecords.length) {
      await OvertimeInformation.insertMany(newRecords);
    }
  }
}

// Insert attendanceRecords
async function insertAttendanceRecords(attendanceRecords) {
  // Check if attendanceRecords is null or undefined and handle accordingly
  if (!attendanceRecords) {
    console.warn('No attendance records provided');
    return;
  }

  // Insert records into the database, avoiding duplicates
  try {
    // Assuming each attendance record has a unique combination of employeeId and date
    const insertPromises = attendanceRecords.map(async (record) => {
      // Check if the record already exists based on unique fields (e.g., employeeId, date)
      const existingRecord = await AttendanceRecords.findOne({
        user: record.user,
        date: record.date
      });

      // If no record exists, insert it
      if (!existingRecord) {
        await AttendanceRecords.create(record);
      
      } else {
        console.log('Duplicate found for record:', record);
      }
    });

    // Wait for all insertions to complete
    await Promise.all(insertPromises);

   
  } catch (error) {
    console.error('Error inserting records:', error);
  }
}

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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const totalCount = await getRecordsByYearAndMonth(req.body.year, req.body.month, skip, limit);

  const attendanceRecords = await getRecordsByYearAndMonth(req.body.year, req.body.month, 0, 0);

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
async function getRecordsByYearAndMonth(year, month, skip = 0, limit = 0) {
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
        }
      }).exec();
      return { count };
    } else {
      const records = await AttendanceRecords.find({
        date: {
          $gte: startDate,
          $lt: endDate
        }
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
    }).exec();
    return records;

  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
exports.ProcessAttendanceAndLOP = catchAsync(async (req, res, next) => {
  try {
    // Calculate the start and end dates for the month
    const startOfMonth = new Date(req.body.year, req.body.month - 1, 2);
    const endOfMonth = new Date(req.body.year, req.body.month, 0); // Last day of the month      
    const attendanceAssignment = await AttendanceTemplateAssignments.findOne({ user: req.body.user });
    if (attendanceAssignment) {
      const attandanceTemplate = await AttendanceTemplate.findOne({ _id: attendanceAssignment.attandanceTemplate });
      if (attandanceTemplate) {
        // Step 1: Get attendance records for the specified month
        const attendanceRecords = await AttendanceRecords.find({
          user: req.body.user,
          company: req.cookies.companyId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        // Step 2: Get approved leave applications for the specified month
        const approvedLeaves = await LeaveApplication.find({
          user: req.body.user,
          status: constants.Leave_Application_Constant.app,
          startDate: { $gte: startOfMonth, $lte: endOfMonth },
          endDate: { $gte: startOfMonth, $lte: endOfMonth },
        });

        // Extract approved leave days
        const approvedLeaveDays = approvedLeaves.flatMap(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          const leaveDays = [];

          for (let d = leaveStart; d <= leaveEnd; d.setDate(d.getDate() + 1)) {
            if (d >= startOfMonth && d <= endOfMonth) {
              leaveDays.push(d.toISOString().split('T')[0]); // Store as ISO string for comparison
            }
          }
          return leaveDays;
        });
        const holidays = await HolidayCalendar.find({ company: req.cookies.companyId });
        const holidayDates = holidays.map(holiday => holiday.date.toISOString().split('T')[0]); // Convert holiday dates to ISO strings

        // Iterate through the days of the month
        const daysInMonth = endOfMonth.getDate(); // Get the number of days in the month 

        for (let day = 1; day <= daysInMonth; day++) {

          // Create the date in UTC, setting the time to midnight (start of the day)
          const currentDate = new Date(Date.UTC(req.body.year, req.body.month - 1, day));
          // Convert it back to your local timezone (optional)
          const localDate = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          const dayOfWeek = currentDate.getDay();
          const weeklyOffDays = attandanceTemplate.weeklyOfDays; // e.g., ['Sunday', 'Saturday']
          const alternateWeekOffRoutine = attandanceTemplate.alternateWeekOffRoutine; // 'none', 'odd', or 'even'
          const daysForAlternateWeekOffRoutine = attandanceTemplate.daysForAlternateWeekOffRoutine || []; // e.g., ['Sunday', 'Wednesday']                
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          // Create a set of weekly off days for efficient lookup
          const weeklyOffDaysSet = new Set(weeklyOffDays);
          // Create a set for alternate weekly off days
          const alternateWeekOffDaysSet = new Set(daysForAlternateWeekOffRoutine);
          // Get the name of the day (e.g., 'Sunday', 'Monday')
          const dayName = daysOfWeek[dayOfWeek];
          // Function to get the current week number of the year
          function getWeekNumber(date) {
            const startDate = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000)); // Total days from the start of the year
            const weekNumber = Math.ceil((days + 1) / 7); // Week number (1-based)
            return weekNumber;
          }
          // Get the current week number
          const currentWeekNumber = getWeekNumber(currentDate);
          // Determine if the week is odd or even
          const isOddWeek = currentWeekNumber % 2 !== 0; // Odd week if the week number is odd    
          let currentWeekOffDaysSet;
          if (alternateWeekOffRoutine === 'odd' || alternateWeekOffRoutine === 'even') {
            if (alternateWeekOffRoutine === 'odd' && isOddWeek) {
              // For odd weeks, use the first set of alternate days                      
              currentWeekOffDaysSet = alternateWeekOffDaysSet;
            } else if (alternateWeekOffRoutine === 'even' && !isOddWeek) {
              // For even weeks, use the alternate days
              currentWeekOffDaysSet = alternateWeekOffDaysSet;
            }
            if (currentWeekOffDaysSet && currentWeekOffDaysSet.has) {
              const isAlternateWeekOffDay = currentWeekOffDaysSet.has(dayName);
              if (isAlternateWeekOffDay) {
                // Skip the current day (it's an alternate weekly off or holiday)
                continue; // skip or continue logic
              }
            }
          }

          const isWeeklyOffDay = weeklyOffDaysSet.has(dayName) || holidayDates.includes(currentDate.toISOString().split('T')[0]);

          if (!isWeeklyOffDay) {
            const currentDateForValidate = new Date(Date.UTC(req.body.year, req.body.month - 1, day));

            const isPresent = attendanceRecords.find(record => {
              var flag = record.date.toISOString().split('T')[0] === currentDateForValidate.toISOString().split('T')[0];
              if (flag)
                return record.date.toISOString().split('T')[0] === currentDateForValidate.toISOString().split('T')[0];
            });
            // If not present and not an approved leave, mark as LOP
            if (!isPresent && !approvedLeaveDays.includes(currentDateForValidate.toISOString().split('T')[0])) {
              // Insert into LOP
              const existingRecord = await LOP.findOne({
                user: req.body.user,
                date: currentDate,
                company: req.cookies.companyId
              });

              if (existingRecord) {
                res.status(200).json({
                  status:constants.APIResponseStatus.Failure,
                  message: 'Lop Already Processed for respective uer'
                });
              }
              else {
                const lopRecord = new LOP({
                  user: req.body.user,
                  date: currentDate,
                  company: req.cookies.companyId
                });
                await lopRecord.save();
              }
            }
          }
        }
      }
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success
    });
  } catch (error) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure
    });
  }
});

exports.ProcessAttendanceUpdate = async (req, res) => {
  try {
    const { attandanaceProcessPeroid, runDate, status, exportToPayroll, users } = req.body;

    // 1. Create or find the AttendanceProcess record
    let attendanceProcess = await AttendanceProcess.findOneAndUpdate(
      { attendanceProcessPeriod: attandanaceProcessPeroid, runDate: new Date(runDate) },
      { status, exportToPayroll },
      { new: true, upsert: true }
    );

    // 2. Loop through the users array and create or update AttendanceProcessUsers
    for (let userEntry of users) {
      const { user, status } = userEntry;

      // Create or update user attendance for the process
      await AttendanceProcessUsers.findOneAndUpdate(
        { attendanceProcess: attendanceProcess._id, user: user },
        { status },
        { new: true, upsert: true }
      );
    }

    return res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: 'Attendance processed successfully',
      data: {
        attendanceProcess,
        users
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
};
exports.GetProcessAttendanceAndLOP = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const totalCount = await getLOPRecordsByYearAndMonth(req.body.year, req.body.month, skip, limit);

  const attendanceRecords = await getLOPRecordsByYearAndMonth(req.body.year, req.body.month, 0, 0);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords,
    total: totalCount
  });

});

async function getLOPRecordsByYearAndMonth(year, month, skip = 0, limit = 0) {
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
      const count = await LOP.countDocuments({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }).exec();
      return { count };
    } else {
      const records = await LOP.find({
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }).skip(skip).limit(limit).exec();
      return records;
    }
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error; // Rethrow or handle error as needed
  }
}
// Controller to process attendance LOP (Insert method)
exports.ProcessAttendance = async (req, res) => {

  try {
    const companyId = req.cookies.companyId;
    var isFNF = false;
    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    req.body.company = companyId;
    if (req.body.isFNF) {
      isFNF = true;
    }
    const { attendanceProcessPeriodMonth, attendanceProcessPeriodYear, runDate, exportToPayroll, users, company } = req.body;
    // Extract companyId from req.cookies
    let existingProcess = await AttendanceProcess.findOne({
      attendanceProcessPeriodMonth: attendanceProcessPeriodMonth,
      attendanceProcessPeriodYear: attendanceProcessPeriodYear,
      isFNF: isFNF,
    });
    if (!isFNF) {
      if (existingProcess) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Attendance process for this period already exists'
        });
      }
    }
    // 1. Insert a new AttendanceProcess record
    let attendanceProcess = await AttendanceProcess.create({
      attendanceProcessPeriodMonth: attendanceProcessPeriodMonth,
      attendanceProcessPeriodYear: attendanceProcessPeriodYear,
      runDate: new Date(runDate),
      isFNF: isFNF,
      exportToPayroll,
      company
    });

    // 2. Prepare AttendanceProcessUsers records for bulk insert
    const attendanceProcessUsers = users.map(userEntry => ({
      attendanceProcess: attendanceProcess._id,
      user: userEntry.user,
      status: userEntry.status
    }));

    // 3. Insert multiple AttendanceProcessUsers records
    await AttendanceProcessUsers.insertMany(attendanceProcessUsers);

    //await sendEmailToUsers(attendanceProcessUsers);
    //loop for user
    //send email to user that your ttdance is processed
    //Send email to managers that respective users has attendance process

    if (isFNF) {
      // make user as settled if its
      // 1) Get user from collection 
      for (let userEntry of users) {
        const user = await User.findById(userEntry.user);
        // 2) Check if POSTed current password is correct 
        // 3) If so, update password
        user.status = constants.User_Status.Settled;
        await user.save();
      }
    }
    return res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: 'Attendance processed successfully',
      data: {
        attendanceProcess,
        users: attendanceProcessUsers
      }
    });
  } catch (error) {
    return res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
};

const sendEmailToUsers = async (attendanceProcessUsers) => {
  for (const userEntry of attendanceProcessUsers) {
    const { user, status } = userEntry;

    const attendanceUser = await User.findById(user);

    const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.CancelReject_Request_Leave_Application).where('company').equals(companyId);
    if (emailTemplate) {
      const template = emailTemplate.contentData;
      const message = template
        .replace("{firstName}", attendanceUser.firstName)
        .replace("{company}", req.cookies.companyName)
        .replace("{company}", req.cookies.companyName)
        .replace("{lastName}", attendanceUser.lastName);
      console.log(attendanceUser.email);
      console.log(emailTemplate.subject);
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
// Controller to delete attendance process and associated users
exports.deleteAttendance = async (req, res) => {
  try {
    const { attandanaceProcessPeroidMonth, attandanaceProcessPeroidYear } = req.body;

    // 1. Find the AttendanceProcess record
    let attendanceProcess = await AttendanceProcess.findOne({
      attendanceProcessPeriodMonth: attandanaceProcessPeroidMonth,
      attendanceProcessPeriodYear: attandanaceProcessPeroidYear
    });

    // If no record found, return a 404 error
    if (!attendanceProcess) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Attendance process for this period not found'
      });
    }
    // 2. Check if exportToPayroll is true
    if (attendanceProcess.exportToPayroll === true) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Cannot delete the attendance process as it has already been exported to payroll'
      });
    }
    // 3. Delete the found AttendanceProcess record
    await AttendanceProcess.findByIdAndDelete(attendanceProcess._id);

    // 4. Delete associated AttendanceProcessUsers records
    await AttendanceProcessUsers.deleteMany({ attendanceProcess: attendanceProcess._id });

    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: 'Attendance process and associated users deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
};

exports.GetOvertimeByMonth = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const attendanceRecords = await getOvertimeRecordsByYearAndMonth(req.body.year, req.body.month);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: attendanceRecords
  });

});

async function getOvertimeRecordsByYearAndMonth(year, month) {
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
    const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();
      // Get all records for the month, applying skip and limit for pagination
      const records = await OvertimeInformation.find({
        CheckInDate: {
          $gte: startDate,
          $lt: endDate
        }
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
  const totalCount = await getAttendanceProcessRecordsByYearAndMonth(req.body.year, req.body.month, skip, limit, isFNF);

  const attendanceRecords = await getAttendanceProcessRecordsByYearAndMonth(req.body.year, req.body.month, 0, 0, isFNF);
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

async function getAttendanceProcessRecordsByYearAndMonth(year, month, skip = 0, limit = 0, isFNF = false) {
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
      const count = await AttendanceProcess.countDocuments({
        runDate: {
          $gte: startDate,
          $lt: endDate
        },
        "isFNF": isFNF
      }).exec();
      return { count };
    } else {
      const records = await AttendanceProcess.find({
        runDate: {
          $gte: startDate,
          $lt: endDate
        },
        "isFNF": isFNF
      }).skip(skip).limit(limit).exec();
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
    return next(new AppError('User ID, month, and year are required', 400));
  }

  const overtimeRecords = await getOvertimeRecordsByUserYearAndMonth(user, year, month);

  if (!overtimeRecords || overtimeRecords.length === 0) {
    return next(new AppError('Overtime records not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: overtimeRecords,
  });
});

// ...existing code...