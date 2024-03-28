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
const User = require('../models/permissions/userModel');

const userOnDutyReason = require('../models/attendance/userOnDutyReason');
const AttendanceRegularization = require('../models/attendance/AttendanceRegularization');
const AttendanceRegularizationRestrictedIP = require('../models/attendance/AttendanceRegularizationRestrictedIP');
const AttendanceRegularizationRestrictedLocation= require('../models/attendance/attendanceRegularizationRestrictedLocation');

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
  const regularizationReasons = await RegularizationReason.find({}).where('company').equals(req.cookies.companyId);
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
    data: regularizationReasons
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
  const onDutyReasons = await OnDutyReason.find({}).where('company').equals(req.cookies.companyId);
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
    data: onDutyReasons
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
  const attendanceTemplates = await AttendanceTemplate.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: attendanceTemplates,
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
  const attendanceRegularizations = await AttendanceRegularization.find({ company: req.cookies.companyId });
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
    data: attendanceRegularizations
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
  const attendanceAssignment = await AttendanceAssignment.findById(req.params.id);
  if (!attendanceAssignment) {
    return next(new AppError('Attendance Template Assignment not found', 404));
  }

  // Update only primary and secondary approvers if provided in the request body
  if (req.body.primaryApprovar !== undefined) {
    attendanceAssignment.primaryApprovar = req.body.primaryApprovar;
  }
  if (req.body.secondaryApprovar !== undefined) {
    attendanceAssignment.secondaryApprovar = req.body.secondaryApprovar;
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
  const attendanceAssignments = await AttendanceTemplateAssignments.where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: attendanceAssignments,
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
  const roundingInformation = await RoundingInformation.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
    data: roundingInformation,
  });
});

exports.createOvertimeInformation = catchAsync(async (req, res, next) => {
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
   // Add companyId to the request body
   req.body.company = companyId;
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
  const overtimeInformation = await OvertimeInformation.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
    data: overtimeInformation,
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
  const onDutyTemplates = await OnDutyTemplate.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
    data: onDutyTemplates,
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
  const userOnDutyTemplates = await UserOnDutyTemplate.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
    data: userOnDutyTemplates,
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
  const shifts = await Shift.find({ company: req.cookies.companyId });
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
  const shiftTemplateAssignments = await ShiftTemplateAssignment.find({ company: req.cookies.companyId });  
  res.status(200).json({
    status: 'success',
    data: shiftTemplateAssignments
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
