const Company = require('../models/companyModel');
const AttendanceMode = require('../models/attendance/attendanceMode');
const AttendanceTemplate = require('../models/attendance/attendanceTemplate');
const AttendanceTemplateAssignments = require('../models/attendance/attendanceTemplateAssignments');
const EmployeeOnDutyRequest = require('../models/attendance/EmployeeOnDutyRequest');
const GeneralSettings = require('../models/attendance/generalSettings');
const OnDutyReason = require("../models/attendance/onDutyReason");
const OnDutyTemplate = require('../models/attendance/onDutyTemplate');
const RegularizationReason = require("../models/attendance/regularizationReason");
const RoundingInformation = require('../models/attendance/roundingInformation');
const Shift = require('../models/attendance/shift');
const RosterShiftAssignment = require('../models/attendance/rosterShiftAssignment');

const ShiftTemplateAssignment = require('../models/attendance/shiftTemplateAssignment');
const UserOnDutyReason = require('../models/attendance/userOnDutyReason');
const UserOnDutyTemplate = require('../models/attendance/userOnDutyTemplate');
const UserRegularizationReason = require('../models/attendance/userRegularizationReason');
const EmployeeOnDutyShift= require('../models/attendance/employeeOnDutyShift');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/permissions/userModel');
const TimeLog = require('../models/timeLog');
const userOnDutyReason = require('../models/attendance/userOnDutyReason');
const AttendanceRegularization = require('../models/attendance/AttendanceRegularization');
const AttendanceRegularizationRestrictedIP = require('../models/attendance/AttendanceRegularizationRestrictedIP');
const AttendanceRegularizationRestrictedLocation= require('../models/attendance/attendanceRegularizationRestrictedLocation');
const manualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const Attandance = require('../models/attendance/attendanceRecords');
const AttendanceRecords = require('../models/attendance/attendanceRecords');
const manualTimeRequestModel = require('../models/manualTime/manualTimeRequestModel.js');
const OvertimeInformation = require('../models/attendance/overtimeInformation.js');

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
  regularizationReason.userRegularizationReasons=userRegularizationReasons;
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
  if(regularizationReason) 
      {
        
         
          const userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReason._id);  
          if(userRegularizationReasons) 
            {
              regularizationReason.userRegularizationReasons = userRegularizationReasons;
            }
            else{
              regularizationReason.userRegularizationReasons=null;
            }
          
      }
  res.status(200).json({
    status: 'success',
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
  console.log(newUsers);
  // Retrieve the existing users associated with the regularization reason
  const existingUsers = await UserRegularizationReason.find({ regularizationReason: isRegularizationReason._id });
  console.log(existingUsers);
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

  regularizationReason.userRegularizationReasons =  await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReason._id);;
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await RegularizationReason.countDocuments({ company: req.cookies.companyId });  
 
  const regularizationReasons = await RegularizationReason.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  if(regularizationReasons) 
      {
        
          for(var i = 0; i < regularizationReasons.length; i++) {     
          const userRegularizationReasons = await UserRegularizationReason.find({}).where('regularizationReason').equals(regularizationReasons[i]._id);  
          if(userRegularizationReasons) 
            {
              regularizationReasons[i].userRegularizationReasons = userRegularizationReasons;
            }
            else{
              regularizationReasons[i].userRegularizationReasons=null;
            }
          }
      }
  res.status(200).json({
    status: 'success',
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
  console.log(userOnDutyReasons);
  onDutyReason.userOnDutyReason=userOnDutyReasons;
  res.status(201).json({
    status: 'success',
    data: onDutyReason
  });
});

exports.getOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findById(req.params.id);

  if (!onDutyReason) {
    return next(new AppError('OnDuty Reason not found', 404));
  }
  if(onDutyReason) 
      {      
         const userOnDutyReasons = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReason._id);  
          if(userOnDutyReasons) 
            {
              onDutyReason.userOnDutyReason = userOnDutyReasons;
            }
            else{
              onDutyReason.userOnDutyReason=null;
            }          
      }
  res.status(200).json({
    status: 'success',
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
  console.log(newUsers);
  // Retrieve the existing users associated with the regularization reason
  const existingUsers = await UserOnDutyReason.find({ onDutyReason: isOnDutyReason._id });
  console.log(existingUsers);
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

  onDutyReason.userOnDutyReason =  await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReason._id);;
  res.status(200).json({
    status: 'success',
    data: onDutyReason
  });
});

exports.deleteOnDutyReason = catchAsync(async (req, res, next) => {
  const onDutyReason = await OnDutyReason.findByIdAndDelete(req.params.id);
  if (!onDutyReason) {
    return next(new AppError('OnDutyReason Reason not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllOnDutyReasons = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OnDutyReason.countDocuments({ company: req.cookies.companyId });  
 
  const onDutyReasons = await OnDutyReason.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));  
  if(onDutyReasons) 
      {
        
          for(var i = 0; i < onDutyReasons.length; i++) {     
          const userOnDutyReason = await UserOnDutyReason.find({}).where('onDutyReason').equals(onDutyReasons[i]._id);  
          if(userOnDutyReason) 
            {
              onDutyReasons[i].userOnDutyReason = userOnDutyReason;
            }
            else{
              onDutyReasons[i].userOnDutyReason=null;
            }
          }
      }
  res.status(200).json({
    status: 'success',
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

exports.getAttendanceTemplateByUser = catchAsync(async (req, res, next) => {
  console.log(req.params.userId);
  const attendanceTemplateAssignments = await AttendanceTemplateAssignments.find({ user: req.params.userId });  
 
  var attendanceTemplate =null;
  if(attendanceTemplateAssignments.length>0)
  {
  console.log(attendanceTemplateAssignments[0].attandanceTemplate);
  attendanceTemplate = await AttendanceTemplate.findById(attendanceTemplateAssignments[0].attandanceTemplate);
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
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
    console.log(IPDetails);
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
    console.log(locationDetails);
    attendanceRegularization.AttendanceRegularizationRestrictedLocations = await AttendanceRegularizationRestrictedLocation.insertMany(locationDetails);
    
  }

  res.status(201).json({
    status: "success",
    data: attendanceRegularization
  });
});

exports.getAttendanceRegularization = catchAsync(async (req, res, next) => {
  const attendanceRegularization = await AttendanceRegularization.findById(req.params.id);
  if (!attendanceRegularization) {
    return next(new AppError("Attendance Regularization not found", 404));
  }
  if(attendanceRegularization) 
  {  
      const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);  
      if(attendanceRegularizationRestrictedIP) 
        {
          attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
        }
        else{
          attendanceRegularization.AttendanceRegularizationRestrictedIPDetails=null;
        }
        const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);  
      if(attendanceRegularizationRestrictedLocation) 
        {
          attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
        }
        else{
          attendanceRegularization.AttendanceRegularizationRestrictedLocations=null;
        }
  }

  res.status(200).json({
    status: "success",
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
  if(attendanceRegularization) 
  {  
      const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);  
      if(attendanceRegularizationRestrictedIP) 
        {
          attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
        }
        else{
          attendanceRegularization.AttendanceRegularizationRestrictedIPDetails=null;
        }
        const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);  
      if(attendanceRegularizationRestrictedLocation) 
        {
          attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
        }
        else{
          attendanceRegularization.AttendanceRegularizationRestrictedLocations=null;
        }
  }

  res.status(200).json({
    status: "success",
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
  if(attendanceRegularizationRestrictedIP) 
    {
      attendanceRegularization.AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
    }
    else{
      attendanceRegularization.AttendanceRegularizationRestrictedIPDetails=null;
    }
    const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularization._id);  
  if(attendanceRegularizationRestrictedLocation) 
    {
      attendanceRegularization.AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
    }
    else{
      attendanceRegularization.AttendanceRegularizationRestrictedLocations=null;
    }
  res.status(200).json({
    status: "success",
    data: attendanceRegularization
  });
});

exports.getAllAttendanceRegularizationsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await AttendanceRegularization.countDocuments({ company: req.cookies.companyId });  
 
  const attendanceRegularizations = await AttendanceRegularization.find({ company: req.cookies.companyId }).skip(parseInt(skip)).limit(parseInt(limit));  
  if(attendanceRegularizations) 
  {
    
      for(var i = 0; i < attendanceRegularizations.length; i++) {     
        const attendanceRegularizationRestrictedIP = await AttendanceRegularizationRestrictedIP.find({}).where('attendanceRegularization').equals(attendanceRegularizations[i]._id);  
        if(attendanceRegularizationRestrictedIP) 
          {
            attendanceRegularizations[i].AttendanceRegularizationRestrictedIPDetails = attendanceRegularizationRestrictedIP;
          }
          else{
            attendanceRegularizations[i].AttendanceRegularizationRestrictedIPDetails=null;
          }
          const attendanceRegularizationRestrictedLocation = await AttendanceRegularizationRestrictedLocation.find({}).where('attendanceRegularization').equals(attendanceRegularizations[i]._id);  
        if(attendanceRegularizationRestrictedLocation) 
          {
            attendanceRegularizations[i].AttendanceRegularizationRestrictedLocations = attendanceRegularizationRestrictedLocation;
          }
          else{
            attendanceRegularizations[i].AttendanceRegularizationRestrictedLocations=null;
          }      
      }
  }
  res.status(200).json({
    status: "success",
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
    status: "success",
    data: null
  });
});

exports.addAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  const newLocation = await AttendanceRegularizationRestrictedLocation.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newLocation
  });
});

exports.getAllAttendanceRegularizationRestrictedLocations = catchAsync(async (req, res, next) => {
  const locations = await AttendanceRegularizationRestrictedLocation.find({ attendanceRegularization: req.params.attendanceRegularization });
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: updatedLocation
  });
});

exports.getAttendanceRegularizationRestrictedLocationById = catchAsync(async (req, res, next) => {
  const location = await AttendanceRegularizationRestrictedLocation.findById(req.params.id);

  if (!location) {
    return next(new AppError('No location found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: location
  });
});

exports.deleteAttendanceRegularizationRestrictedLocation = catchAsync(async (req, res, next) => {
  const location = await AttendanceRegularizationRestrictedLocation.findByIdAndDelete(req.params.id);

  if (!location) {
    return next(new AppError('No location found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
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
    status: "success",
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
    status: 'success',
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
    status: "success",
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
    status: 'success',
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
    status: 'success',
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await RoundingInformation.countDocuments({ company: req.cookies.companyId });  
 
  const roundingInformation = await RoundingInformation.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OvertimeInformation.countDocuments({ company: req.cookies.companyId });  
 
  const overtimeInformation = await OvertimeInformation.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));  
  res.status(200).json({
    status: 'success',
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OnDutyTemplate.countDocuments({ company: req.cookies.companyId});  
 
  const onDutyTemplates = await OnDutyTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));  
  res.status(200).json({
    status: 'success',
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

// Get a UserOnDutyTemplate by ID
exports.getUserOnDutyTemplateByUser = catchAsync(async (req, res, next) => {
  const userOnDutyTemplate = await UserOnDutyTemplate.find({ user: req.params.user });
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
    status: 'success',
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
    status: 'success',
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
    status: 'success',
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await Shift.countDocuments({ company: req.cookies.companyId });  
 
  const shifts = await Shift.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));  
  res.status(200).json({
    status: 'success',
    data: shifts,
    total: totalCount
  });
});
exports.getShiftByUser = catchAsync(async (req, res, next) => {
  console.log(req.params.userId);
  const shiftTemplateAssignments = await ShiftTemplateAssignment.find({ user: req.params.userId });  
 
  var shifts =null;
  if(shiftTemplateAssignments.length>0)
  {
  console.log(shiftTemplateAssignments[0].template);
  shifts = await Shift.findById(shiftTemplateAssignments[0].template);
  }
  res.status(200).json({
    status: 'success',
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
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await ShiftTemplateAssignment.countDocuments({ company: req.cookies.companyId });  
 
  const shiftTemplateAssignments = await ShiftTemplateAssignment.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));  
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: createdAssignments,
  });
});


exports.getRosterShiftAssignment = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.id);
  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: rosterShiftAssignment,
  });
});

exports.getRosterShiftAssignmentByUser = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findById(req.params.userId);
  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: rosterShiftAssignment,
  });
});

exports.deleteRosterShiftAssignment = catchAsync(async (req, res, next) => {
  const rosterShiftAssignment = await RosterShiftAssignment.findByIdAndDelete(req.params.id);

  if (!rosterShiftAssignment) {
    return next(new AppError('Roster shift assignment not found', 404));
  }

  res.status(204).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: employeeOnDutyRequest
  });
});

// Get a DutyRequest by ID
exports.getEmployeeDutyRequest = catchAsync(async (req, res, next) => {
  const dutyRequest = await EmployeeOnDutyRequest.findById(req.params.id);
  if(dutyRequest) 
  {
      const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(dutyRequest._id);  
      if(employeeOnDutyShifts) 
        {
          dutyRequest.employeeOnDutyShifts = employeeOnDutyShifts;
        }
        else{
          dutyRequest.employeeOnDutyShifts=null;
        }
  }

  res.status(200).json({
    status: 'success',
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

  if(employeeOnDutyRequest) 
  {  
      const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(employeeOnDutyRequest._id);  
      if(employeeOnDutyShifts) 
        {
          employeeOnDutyRequest.employeeOnDutyShifts = employeeOnDutyShifts;
        }
        else{
          employeeOnDutyRequest.employeeOnDutyShifts=null;
        }
  }

  res.status(200).json({
      status: 'success',
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
    status: 'success',
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
console.log(query);
  // Get the total count of documents matching the query
  const totalCount = await EmployeeOnDutyRequest.countDocuments(query);

  // Get the regularization requests matching the query with pagination
  const dutyRequests = await EmployeeOnDutyRequest.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));  
  if(dutyRequests) 
  {      
   for(var i = 0; i < dutyRequests.length; i++) {     
   
      const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(dutyRequests[i]._id);  
      if(employeeOnDutyShifts) 
        { console.log(employeeOnDutyShifts);
          dutyRequests[i].employeeOnDutyShifts = employeeOnDutyShifts;
        }
        else{
          dutyRequests[i].employeeOnDutyShifts=null;
        }
      }
 }
  res.status(200).json({
    status: 'success',
    data: dutyRequests,
    total: totalCount
  });
});

exports.getEmployeeDutyRequestsByUser = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await EmployeeOnDutyRequest.countDocuments({  user: req.params.userId }); 

  const dutyRequests = await EmployeeOnDutyRequest.find({ user: req.params.userId}).skip(parseInt(skip))
  .limit(parseInt(limit));  
 
  if(dutyRequests.length>0) 
    {      
       for(var i = 0; i < dutyRequests.length; i++) {     
     
        const employeeOnDutyShifts = await EmployeeOnDutyShift.find({}).where('employeeOnDutyRequest').equals(dutyRequests[i]._id);  
        if(employeeOnDutyShifts) 
          { console.log(employeeOnDutyShifts);
            dutyRequests[i].employeeOnDutyShifts = employeeOnDutyShifts;
          }
          else{
            dutyRequests[i].employeeOnDutyShifts=null;
          }
        }
  }
 
  res.status(200).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: null
  });
});

exports.MappedTimlogToAttandance = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  let filter = { status: 'Active', company: req.cookies.companyId };

  // Generate query based on request params
  const features = new APIFeatures(User.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

  // Run created query
  const document = await features.query;

  const endDate = new Date(); // Today's date
  const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // One week before endDate

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

              if (timeLogs) {
                  const attendanceRecords = await Promise.all(timeLogs.map(async log => {
                      const attendannceCount = await AttendanceRecords.countDocuments({ user: user._id, date: new Date(log._id) });
                      if (attendannceCount == 0) {
                          const timeLogCount = await TimeLog.countDocuments({ user: user._id, date: new Date(log._id) });
                          let shiftTiming = "";
                          let deviationHour = "";
                          let isOvertime = false;

                          if (shift.startTime && shift.endDate && shift.minHoursPerDayToGetCreditForFullDay) {
                              const timeDifference = getTimeDifference(shift.minHoursPerDayToGetCreditForFullDay);
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
                              deviationHour: '00:00',
                              shiftTiming: '00:00',
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
                  if(shift.isOvertime)
                  {
                  // Insert entries into OvertimeInformation for users with isOvertime set to true
                  const overtimeRecords = attendanceRecordsFiltered
                      .filter(record => record.isOvertime)
                      .map(record => ({
                          User: user._id, // Replace with appropriate user name
                          AttandanceShift: shift._id,
                          OverTime: record.deviationHour,                          
                          ShiftTime: shift.startTime+" "+shift.endTime,
                          Date: new Date(log._id),                          
                          CheckInDate: record.checkIn,
                          CheckOutDate: record.checkOut,
                          CheckInTime: record.checkIn,
                          CheckOutTime: record.checkOut,
                          company: companyId,
                      }));

                  if (overtimeRecords.length) {
                      await OvertimeInformation.insertMany(overtimeRecords);
                  }
                }
              }
          }
      }
  }));

  res.status(201).json({
      status: 'success',
      data: null
  });
});

// Function to get late coming remarks (if needed)
async function getLateComingRemarks(userId, logId) {
  const manualTime = await manualTimeRequest.findOne({
      user: userId,
      fromDate: { $lte: new Date(logId) },
      toDate: { $gte: new Date(logId) }
  });
  return manualTime ? manualTime.reason : 'N/A';
}

// Insert attendanceRecords
async function insertAttendanceRecords(attendanceRecords) {
  if (!attendanceRecords) {
      console.warn('No attendance records provided');
      return;
  }
  
  try {
      await AttendanceRecords.insertMany(attendanceRecords);
      console.log('Records inserted successfully');
  } catch (error) {
      console.error('Error inserting records:', error);
  }
}

// Assuming you are using a function to handle the insertion
async function insertAttendanceRecords(attendanceRecords) {
  // Check if attendanceRecords is null or undefined and handle accordingly
  if (!attendanceRecords) {
      // Handle the null or undefined case
      // For example, log a message, throw an error, or return a response
      console.warn('No attendance records provided');
      return; // or return a specific value or handle it as needed
  }
  
  // Insert records into the database
  try {
      await AttendanceRecords.insertMany(attendanceRecords);
      
      console.log('Records inserted successfully');
  } catch (error) {
      console.error('Error inserting records:', error);
      // Handle the error accordingly
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

  const totalCount =await getRecordsByYearAndMonth(req.body.year,req.body.month,req.body.skip,req.body.next);
  
  const attendanceRecords =await getRecordsByYearAndMonth(req.body.year,req.body.month,0,0);
  
  res.status(200).json({
    status: 'success',
    data: attendanceRecords,
    total: totalCount
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
  console.log(startDate);
  console.log(endDate);
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
          console.log(count);
          return { count };
      } else {
          const records = await AttendanceRecords.find({
              date: {
                  $gte: startDate,
                  $lt: endDate
              }
          }).skip(skip).limit(limit).exec();
          console.log(records);
          return records;
      }
  } catch (error) {
      console.error('Error fetching records:', error);
      throw error; // Rethrow or handle error as needed
  }
}
