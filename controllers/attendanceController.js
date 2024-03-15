const Company = require('../models/companyModel');
const AttendanceMode = require('../models/attendance/attendanceMode');
const AttendanceTemplate = require('../models/attendance/attendanceTemplate');
const AttendanceTemplateAssignments = require('../models/attendance/attendanceTemplateAssignments');
const DutyRequest = require('../models/attendance/dutyRequest');
const GeneralSettings = require('../models/attendance/generalSettings');
const OnDutyReason = require("../models/attendance/onDutyReason");
const OnDutyTemplate = require('../models/attendance/onDutyTemplate');
const OvertimeInformation = require('../models/attendance/overtimeInformation');
const RegularizationReason = require("../models/attendance/regularizationReason");
const RegularizationRequest = require('../models/attendance/RegularizationRequest');
const RoundingInformation = require('../models/attendance/roundingInformation');
const Shift = require('../models/attendance/shift');
const ShiftTemplateAssignment = require('../models/attendance/shiftTemplateAssignment');
const UserOnDutyReason = require('../models/attendance/userOnDutyReason');
const UserOnDutyTemplate = require('../models/attendance/userOnDutyTemplate');
const UserRegularizationReason = require('../models/attendance/userRegularizationReason');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createGeneralSettings = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  req.body.company = companyId;
  const filter = { company: companyId };
  const update = req.body;

  const options = {
    new: true, // Return the updated document
    upsert: true, // Create the document if it doesn't exist
    setDefaultsOnInsert: true, // Apply default values specified in the schema
  };

  const generalSettings = await GeneralSettings.findOneAndUpdate(filter, update, options);

  res.status(201).json({
    status: 'success',
    data: generalSettings,
  });
});

exports.getGeneralSettings = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  const generalSettings = await GeneralSettings.find({company:companyId});
  if (!generalSettings) {
    return next(new AppError('GeneralSettings not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: generalSettings,
  });
});

exports.createRegularizationReason = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  req.body.company = company; // Set company in the request body
  const regularizationReason = await RegularizationReason.create(req.body);
  res.status(201).json({
    status: 'success',
    data: regularizationReason
  });
});

exports.getRegularizationReason = catchAsync(async (req, res, next) => {
  const regularizationReason = await RegularizationReason.findById(req.params.id);
  if (!regularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: regularizationReason
  });
});

exports.updateRegularizationReason = catchAsync(async (req, res, next) => {
  const regularizationReason = await RegularizationReason.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!regularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: regularizationReason
  });
});

exports.deleteRegularizationReason = catchAsync(async (req, res, next) => {
  const regularizationReason = await RegularizationReason.findByIdAndDelete(req.params.id);
  if (!regularizationReason) {
    return next(new AppError('Regularization Reason not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllRegularizationReasons = catchAsync(async (req, res, next) => {
  const regularizationReasons = await RegularizationReason.find();
  res.status(200).json({
    status: 'success',
    data: regularizationReasons
  });
});

exports.createOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.create(req.body);
  res.status(201).json({
    status: 'success',
    data: onDutyReason,
  });
});

exports.getOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findById(req.params.id);
  if (!onDutyReason) {
    return next(new AppError('OnDutyReason not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: onDutyReason,
  });
});

exports.updateOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!onDutyReason) {
    return next(new AppError('OnDutyReason not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: onDutyReason,
  });
});

exports.deleteOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findByIdAndDelete(req.params.id);
  if (!onDutyReason) {
    return next(new AppError('OnDutyReason not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllOnDutyReasons = catchAsync(async (req, res, next) => {
  const onDutyReasons = await OnDutyReason.find();
  res.status(200).json({
    status: 'success',
    data: onDutyReasons,
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: null,
  });
});

// Get all attendance modes
exports.getAllAttendanceModes = catchAsync(async (req, res, next) => {
  const attendanceModes = await AttendanceMode.find();
  res.status(200).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: null,
  });
});

// Get all Attendance Templates
exports.getAllAttendanceTemplates = catchAsync(async (req, res, next) => {
  const attendanceTemplates = await AttendanceTemplate.find();
  res.status(200).json({
    status: 'success',
    data: attendanceTemplates,
  });
});

// Create a new Attendance Template Assignment
exports.createAttendanceAssignment = catchAsync(async (req, res, next) => {
  const attendanceAssignment = await AttendanceTemplateAssignments.create(req.body);
  res.status(201).json({
    status: 'success',
    data: attendanceAssignment,
  });
});

// Get an Attendance Template Assignment by ID
exports.getAttendanceAssignment = catchAsync(async (req, res, next) => {
  const attendanceAssignment = await AttendanceTemplateAssignments.findById(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: attendanceAssignment,
  });
});

// Update an Attendance Template Assignment by ID
exports.updateAttendanceAssignment = catchAsync(async (req, res, next) => {
  const attendanceAssignment = await AttendanceTemplateAssignments.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: attendanceAssignment,
  });
});

// Delete an Attendance Template Assignment by ID
exports.deleteAttendanceAssignment = catchAsync(async (req, res, next) => {
  const attendanceAssignment = await AttendanceTemplateAssignments.findByIdAndDelete(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get all Attendance Template Assignments
exports.getAllAttendanceAssignments = catchAsync(async (req, res, next) => {
  const attendanceAssignments = await AttendanceTemplateAssignments.find();
  res.status(200).json({
    status: 'success',
    data: attendanceAssignments,
  });
});

// Create a new DutyRequest
exports.createDutyRequest = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
 
  const dutyRequest = await DutyRequest.create(req.body);
  res.status(201).json({
    status: 'success',
    data: dutyRequest
  });
});

// Get a DutyRequest by ID
exports.getDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await DutyRequest.findById(req.params.id);
  if (!dutyRequest) {
    return next(new AppError('DutyRequest not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: dutyRequest
  });
});

// Update a DutyRequest by ID
exports.updateDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await DutyRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!dutyRequest) {
    return next(new AppError('DutyRequest not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: dutyRequest
  });
});

// Delete a DutyRequest by ID
exports.deleteDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await DutyRequest.findByIdAndDelete(req.params.id);
  
  if (!dutyRequest) {
    return next(new AppError('DutyRequest not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get all DutyRequests
exports.getAllDutyRequests = catchAsync(async (req, res, next) => {
  const dutyRequests = await DutyRequest.find();
  res.status(200).json({
    status: 'success',
    data: dutyRequests
  });
});






exports.createOnDutyTemplate = catchAsync(async (req, res, next) => {
  const onDutyTemplate = await OnDutyTemplate.create(req.body);
  res.status(201).json({
    status: 'success',
    data: onDutyTemplate,
  });
});

exports.getOnDutyTemplate = catchAsync(async (req, res, next) => {
  const onDutyTemplate = await OnDutyTemplate.findById(req.params.id);
  if (!onDutyTemplate) {
    return next(new AppError('OnDutyTemplate not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: onDutyTemplate,
  });
});

exports.deleteOnDutyTemplate = catchAsync(async (req, res, next) => {
  const onDutyTemplate = await OnDutyTemplate.findByIdAndDelete(req.params.id);
  if (!onDutyTemplate) {
    return next(new AppError('OnDutyTemplate not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllOnDutyTemplates = catchAsync(async (req, res, next) => {
  const onDutyTemplates = await OnDutyTemplate.find();
  res.status(200).json({
    status: 'success',
    data: onDutyTemplates,
  });
});

exports.createOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.create(req.body);
  res.status(201).json({
    status: 'success',
    data: overtimeInformation,
  });
});

exports.getOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.findById(req.params.id);
  if (!overtimeInformation) {
    return next(new AppError('Overtime Information not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: overtimeInformation,
  });
});

exports.updateOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!overtimeInformation) {
    return next(new AppError('Overtime Information not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: overtimeInformation,
  });
});

exports.deleteOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.findByIdAndDelete(req.params.id);
  if (!overtimeInformation) {
    return next(new AppError('Overtime Information not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllOvertimeInformation = catchAsync(async (req, res, next) => {
  const overtimeInformation = await OvertimeInformation.find();
  res.status(200).json({
    status: 'success',
    data: overtimeInformation,
  });
});



exports.createRegularizationRequest = catchAsync(async (req, res, next) => {
  const regularizationRequest = await RegularizationRequest.create(req.body);
  res.status(201).json({
    status: 'success',
    data: regularizationRequest,
  });
});

exports.getRegularizationRequest = catchAsync(async (req, res, next) => {
  const regularizationRequest = await RegularizationRequest.findById(req.params.id);
  if (!regularizationRequest) {
    return next(new AppError('Regularization Request not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: regularizationRequest,
  });
});

exports.updateRegularizationRequest = catchAsync(async (req, res, next) => {
  const regularizationRequest = await RegularizationRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!regularizationRequest) {
    return next(new AppError('Regularization Request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: regularizationRequest,
  });
});

exports.deleteRegularizationRequest = catchAsync(async (req, res, next) => {
  const regularizationRequest = await RegularizationRequest.findByIdAndDelete(
    req.params.id
  );

  if (!regularizationRequest) {
    return next(new AppError('Regularization Request not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllRegularizationRequests = catchAsync(async (req, res, next) => {
  const regularizationRequests = await RegularizationRequest.find();
  res.status(200).json({
    status: 'success',
    data: regularizationRequests,
  });
});


exports.createRoundingInformation = catchAsync(async (req, res, next) => {
  const roundingInformation = await RoundingInformation.create(req.body);
  res.status(201).json({
    status: 'success',
    data: roundingInformation,
  });
});

exports.getRoundingInformation = catchAsync(async (req, res, next) => {
  const roundingInformation = await RoundingInformation.findById(req.params.id);
  if (!roundingInformation) {
    return next(new AppError('Rounding information not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: null,
  });
});

exports.getAllRoundingInformation = catchAsync(async (req, res, next) => {
  const roundingInformation = await RoundingInformation.find();
  res.status(200).json({
    status: 'success',
    data: roundingInformation,
  });
});


exports.createShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.create(req.body);
  res.status(201).json({
    status: 'success',
    data: shift,
  });
});

exports.getShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    return next(new AppError('Shift not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: shift,
  });
});

exports.deleteShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);

  if (!shift) {
    return next(new AppError('Shift not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllShifts = catchAsync(async (req, res, next) => {
  const shifts = await Shift.find();
  res.status(200).json({
    status: 'success',
    data: shifts,
  });
});

// Create a new ShiftTemplateAssignment
exports.createShiftTemplateAssignment = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignment = await ShiftTemplateAssignment.create(req.body);
  res.status(201).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: null
  });
});

// Get all ShiftTemplateAssignments
exports.getAllShiftTemplateAssignments = catchAsync(async (req, res, next) => {
  const shiftTemplateAssignments = await ShiftTemplateAssignment.find();
  res.status(200).json({
    status: 'success',
    data: shiftTemplateAssignments
  });
});



// Create a UserOnDutyTemplate
exports.createUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.create(req.body);
  res.status(201).json({
    status: 'success',
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
    status: 'success',
    data: userOnDutyTemplate,
  });
});

// Update a UserOnDutyTemplate by ID
exports.updateUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: userOnDutyTemplate,
  });
});

// Delete a UserOnDutyTemplate by ID
exports.deleteUserOnDutyTemplate = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.findByIdAndDelete(req.params.id);

  if (!userOnDutyTemplate) {
    return next(new AppError('UserOnDutyTemplate not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get all UserOnDutyTemplates
exports.getAllUserOnDutyTemplates = catchAsync(async (req, res, next) => {
  const userOnDutyTemplates = await UserOnDutyTemplate.find();
  res.status(200).json({
    status: 'success',
    data: userOnDutyTemplates,
  });
});



