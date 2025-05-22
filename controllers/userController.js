const User = require("../models/permissions/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError.js");
const APIFeatures = require("../utils/apiFeatures");
const userSubordinate = require("../models/userSubordinateModel");
const ProjectUsers = require("../models/projectUserModel");
const Subscription = require("../models/pricing/subscriptionModel");
const UserEmployment = require("../models/Employment/UserEmploymentModel");
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel");
const EmployeeTaxAndSalutaorySetting = require("../models/Employment/EmployeeSalaryTaxAndStatutorySettingModel.js");
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const IncomeTaxComponant = require("../models/commons/IncomeTaxComponant");
const SalaryComponentFixedAllowance = require("../models/Employment/SalaryComponentFixedAllowanceModel");
const SalaryComponentEmployerContribution = require("../models/Employment/SalaryComponentEmployerContribution");
const SalaryComponentFixedDeduction = require("../models/Employment/SalaryComponentFixedDeduction");
const SalaryComponentVariableDeduction = require("../models/Employment/SalaryComponentVariableDeduction");
const SalaryComponentPFCharge = require("../models/Employment/SalaryComponentPFCharge");
const SalaryComponentVariableAllowance = require("../models/Employment/SalaryComponentVariableAllowance");
const FixedAllowance = require("../models/Payroll/fixedAllowancesModel");
const FixedContribution = require("../models/Payroll/fixedContributionModel");
const FixedDeduction = require("../models/Payroll/fixedDeductionModel");
const VariableAllowance = require("../models/Payroll/variableAllowanceModel");
const VariableDeduction = require("../models/Payroll/variableDeductionModel");
const PFCharge = require("../models/Payroll/pfChargeModel");
const EmployeeLoanAdvance = require("../models/Employment/EmployeeLoanAdvanceModel.js");
const EmployeeIncomeTaxDeclaration = require("../models/Employment/EmployeeIncomeTaxDeclaration");
const EmployeeIncomeTaxDeclarationComponent = require("../models/Employment/EmployeeIncomeTaxDeclarationComponent");
const EmployeeIncomeTaxDeclarationHRA = require("../models/Employment/EmployeeIncomeTaxDeclarationHRA");
const EmailTemplate = require('../models/commons/emailTemplateModel');
var mongoose = require("mongoose");
const constants = require('../constants');
const OTP = require("../models/commons/otp");
const sendEmail = require('../utils/email');
const Appointment = require("../models/permissions/appointmentModel");  // Import the Appointment model
const UserActionLog = require("../models/Logging/userActionModel");
const StorageController = require('./storageController.js');
const websocketHandler = require('../utils/websocketHandler');

exports.logUserAction = catchAsync(async (req, action, next) => {
  websocketHandler.sendLog(req, 'Starting user action logging', constants.LOG_TYPES.TRACE);
  try {
    const userAction = {
      userId: action.userId,
      companyId: action.companyId,
      oldStatus: action.oldStatus || '',
      newStatus: action.newStatus,
      timestamp: action.timestamp,
      action: action.action
    }
    websocketHandler.sendLog(req, `Creating user action log for user ${action.userId}`, constants.LOG_TYPES.DEBUG);
    const log = await UserActionLog.create(userAction);
    websocketHandler.sendLog(req, `User action logged successfully with ID: ${log._id}`, constants.LOG_TYPES.INFO);
    return log;
  } catch (error) {
    websocketHandler.sendLog(req, `Error logging user action: ${error.message}`, constants.LOG_TYPES.ERROR);
    console.log(error);
    return error;
  }
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all users', constants.LOG_TYPES.TRACE);
  let filter = { 
    status: { $ne: 'Deleted' }, 
    company: req.cookies.companyId 
  };
  websocketHandler.sendLog(req, `Applying filter: ${JSON.stringify(filter)}`, constants.LOG_TYPES.DEBUG);

  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  websocketHandler.sendLog(req, 'Executing user query', constants.LOG_TYPES.TRACE);
  const users = await features.query;
  
  websocketHandler.sendLog(req, `Found ${users.length} active users`, constants.LOG_TYPES.INFO);
  
  for (let user of users) {
    websocketHandler.sendLog(req, `Fetching appointments for user ${user._id}`, constants.LOG_TYPES.TRACE);
    const appointments = await Appointment.find({ user: user._id });

    // Attach the appointments to the user object
    user.appointment = appointments;
    websocketHandler.sendLog(req, `Attached ${appointments.length} appointments to user ${user._id}`, constants.LOG_TYPES.DEBUG);
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    results: users.length,
    data: {
      data: users,
    },
  });
  websocketHandler.sendLog(req, 'Successfully returned all users', constants.LOG_TYPES.INFO);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Attempting to delete user ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const document = await User.findByIdAndUpdate(req.params.id, { status: "Deleted" });
  
  if (!document) {
    websocketHandler.sendLog(req, `No user found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noDocumentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `User ${req.params.id} status updated to Deleted`, constants.LOG_TYPES.INFO);
  
  const userAction = {
    userId: document._id,
    companyId: req.cookies.companyId,
    oldStatus: document.status || '',
    newStatus: "Deleted",
    timestamp: new Date().toISOString(),
    action: 'User Deleted'
  }
  await exports.logUserAction(req, userAction, next);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: document,
  });
  websocketHandler.sendLog(req, `User ${req.params.id} deletion completed`, constants.LOG_TYPES.INFO);
});

exports.getUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching user with ID ${req.body.id}`, constants.LOG_TYPES.TRACE);
  
  const users = await User.findById(req.body.id)
    .where("status")
    .equals("Active");
  
  if (!users) {
    websocketHandler.sendLog(req, `No active user found with ID ${req.body.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noUserFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `User ${req.body.id} found`, constants.LOG_TYPES.INFO);
  
  let companySubscription = { status: 'new' };
  if (users) {
    websocketHandler.sendLog(req, `Fetching subscription for company ${users.company.id}`, constants.LOG_TYPES.TRACE);
    companySubscription = await Subscription.findOne({
      companyId: users.company.id,
      "razorpaySubscription.status": { $in: constants.Active_Subscription }
    })
      .populate("currentPlanId");
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      users: users,
      companySubscription: companySubscription,
    },
  });
  websocketHandler.sendLog(req, `User ${req.body.id} data returned successfully`, constants.LOG_TYPES.INFO);
});
exports.getUsersByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  websocketHandler.sendLog(req, `Fetching users with status ${status}`, constants.LOG_TYPES.TRACE);
  
  if (!Object.values(constants.User_Status).includes(status)) {
    websocketHandler.sendLog(req, `Invalid status value: ${status}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({ message: req.t('user.invalidStatus')
    });
  }  
  websocketHandler.sendLog(req, `Querying users with status ${status} for company ${req.cookies.companyId}`, constants.LOG_TYPES.DEBUG);
  const users = await User.find({
    status: { $ne: constants.User_Status.Deleted },  // Exclude 'Deleted' users
    company: req.cookies.companyId,                            // Match users by companyId
    status: status                                 // Match users by provided status
  });  
  websocketHandler.sendLog(req, `Found ${users.length} users with status ${status}`, constants.LOG_TYPES.INFO);  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      users: users,
    },
  });
});

// Function to get the list of users by empCode
exports.getUsersByEmpCode = catchAsync(async (req, res, next) => {
  const { empCode } = req.params;
  const companyId = req.cookies.companyId;
  websocketHandler.sendLog(req, `Fetching users by empCode ${empCode}`, constants.LOG_TYPES.TRACE);
  
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }
  
  websocketHandler.sendLog(req, `Querying appointments for empCode ${empCode}`, constants.LOG_TYPES.DEBUG);
  const appointments = await Appointment.find({ empCode })
    .populate('user')  // Populate the user field with user details
    .select('user empCode company joiningDate confirmationDate');  // Select relevant fields

  // Filter appointments by companyId
  const filteredAppointments = appointments.filter(appointment =>
    appointment.company._id.toString() === companyId
  );

  // If no appointments are found for the empCode and companyId
  if (filteredAppointments.length === 0) {
    websocketHandler.sendLog(req, `No users found for empCode ${empCode} in company ${companyId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noUsersForEmpCode')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Found ${filteredAppointments.length} users for empCode ${empCode}`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredAppointments.map(appointment => appointment.user)
  });
});

exports.getUsersByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching users for company ${req.params.companyId}`, constants.LOG_TYPES.TRACE);
  
  const users = await User.find({
    status: { $ne: constants.User_Status.Deleted },
    company: req.params.companyId,
  });
  
  websocketHandler.sendLog(req, `Found ${users.length} users for company ${req.params.companyId}`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      users: users,
    },
  });
});

// controllers/appointmentController.js
exports.createAppointment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating new appointment', constants.LOG_TYPES.TRACE);
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies for appointment creation', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  websocketHandler.sendLog(req, `Creating appointment for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  const appointment = await Appointment.create(req.body);
  websocketHandler.sendLog(req, `Appointment created with ID ${appointment._id}`, constants.LOG_TYPES.INFO);
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: appointment
  });
});

exports.getAppointmentByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching appointment for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const appointment = await Appointment.findOne({ user: req.params.userId })
    .populate('company', 'name');
  
  websocketHandler.sendLog(req, appointment ? 
    `Appointment found for user ${req.params.userId}` : 
    `No appointment found for user ${req.params.userId}`, 
    constants.LOG_TYPES.INFO
  );
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: appointment
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating appointment ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!appointment) {
    websocketHandler.sendLog(req, `No appointment found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noAppointmentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Appointment ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: appointment
  });
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting appointment ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  
  if (!appointment) {
    websocketHandler.sendLog(req, `No appointment found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noAppointmentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Appointment ${req.params.id} deleted successfully`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

const filterObj = (obj, ...allowedFields) => {
  websocketHandler.sendLog(null, 'Filtering object fields', constants.LOG_TYPES.TRACE);
  const newObj = {};
  // Loop through every property in an object
  Object.keys(obj).forEach((el) => {
    // If property is inside allowed fields array
    // add copy current property to new object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating user ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  if (req.body.password || req.body.passwordConfirm) {
    websocketHandler.sendLog(req, 'Attempt to update password through wrong route', constants.LOG_TYPES.WARN);
    return next(new AppError(
      req.t('user.passwordUpdateNotAllowed')


    ));
  }
  
  const filteredBody = filterObj(req.body, "name", "email");
  websocketHandler.sendLog(req, `Filtered update body: ${JSON.stringify(filteredBody)}`, constants.LOG_TYPES.DEBUG);
  
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  if (!updatedUser) {
    websocketHandler.sendLog(req, `No user found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noUserFound')
    , 404));
  }
  
  websocketHandler.sendLog(req, `User ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting user ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const user = await User.findByIdAndUpdate(req.params.id, { status: "Deleted" });
  
  if (!user) {
    websocketHandler.sendLog(req, `No user found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noUserFound')

    , 404));
  }
  
  const userAction = {
    userId: user._id,
    companyId: req.cookies.companyId,
    oldStatus: user.status || '',
    newStatus: "Deleted",
    timestamp: new Date().toISOString(),
    action: 'Update razorpay subscription'
  }
  await exports.logUserAction(req, userAction, next);
  websocketHandler.sendLog(req, `User ${req.params.id} marked as deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Attempt to create user through undefined route', constants.LOG_TYPES.WARN);
  
  res.status(500).json({
    status: constants.APIResponseStatus.Error,
    message: "This route is not defined! Please use /signup instead",
  });
});

exports.getMe = (req, res, next) => {
  websocketHandler.sendLog(req, 'Getting current user profile', constants.LOG_TYPES.TRACE);
  req.params.id = req.user.id;
  req.query.status = "Active";
  websocketHandler.sendLog(req, `Set user ID to ${req.user.id} for profile fetch`, constants.LOG_TYPES.DEBUG);
  next();
};

exports.getUsers = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching users with IDs: ${req.body.userId}`, constants.LOG_TYPES.TRACE);
  
  var users = await User.find({
    _id: { $in: req.body.userId },
    status: { $ne: constants.User_Status.Deleted },
  });
  
  websocketHandler.sendLog(req, `Found ${users.length} users`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: users,
  });
});

exports.getUserManagers = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching managers for user ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  let managers = [];
  let list = await userSubordinate
    .distinct("userId")
    .find({ subordinateUserId: { $in: req.params.id } });
  
  websocketHandler.sendLog(req, `Found ${list.length} potential managers`, constants.LOG_TYPES.DEBUG);
  
  for (let i = 0; i < list.length; i++) {
    let manager = await User.findOne({
      _id: { $in: list[i].userId },
      status: { $ne: constants.User_Status.Deleted },
    });
    if (manager) {
      managers.push({
        id: manager.id,
        name: `${manager?.firstName} ${manager?.lastName}`,
      });
      websocketHandler.sendLog(req, `Added manager ${manager.id} to list`, constants.LOG_TYPES.DEBUG);
    }
  }
  
  websocketHandler.sendLog(req, `Returning ${managers.length} managers`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: managers,
  });
});

exports.getUserProjects = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching projects for user ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  let projects = [];
  let projectUsers = await ProjectUsers.find({})
    .where("user")
    .equals(req.params.id);
  
  websocketHandler.sendLog(req, `Found ${projectUsers.length} project associations`, constants.LOG_TYPES.DEBUG);
  
  for (let i = 0; i < projectUsers.length; i++) {
    let user = await User.findOne({
      _id: { $in: projectUsers[i].user },
      status: { $ne: "Deleted" },
    });
    if (user) {
      projects.push(projectUsers[i].project);
      websocketHandler.sendLog(req, `Added project ${projectUsers[i].project} to list`, constants.LOG_TYPES.DEBUG);
    }
  }
  
  websocketHandler.sendLog(req, `Returning ${projects.length} projects`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: projects,
  });
});

exports.createUserEmployment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating user employment record', constants.LOG_TYPES.TRACE);
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }

  req.body.company = companyId;
  websocketHandler.sendLog(req, `Creating employment for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  const userEmployment = await UserEmployment.create(req.body);
  websocketHandler.sendLog(req, `User employment created with ID ${userEmployment._id}`, constants.LOG_TYPES.INFO);
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: userEmployment,
  });
});

exports.getUserEmploymentByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching employment records for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const userEmployment = await UserEmployment.find({})
    .where("user")
    .equals(req.params.userId);
  if (!userEmployment) {
    websocketHandler.sendLog(req, `No employment records found for user ${req.params.userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noEmploymentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Found ${userEmployment.length} employment records`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userEmployment,
  });
});

exports.getUserEmployment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching employment record ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const userEmployment = await UserEmployment.findById(req.params.id);
  if (!userEmployment) {
    websocketHandler.sendLog(req, `No employment record found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noEmploymentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Employment record ${req.params.id} retrieved`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userEmployment,
  });
});

exports.updateUserEmployment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating employment record ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const userEmployment = await UserEmployment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!userEmployment) {
    websocketHandler.sendLog(req, `No employment record found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noEmploymentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Employment record ${req.params.id} updated`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userEmployment,
  });
});

exports.deleteUserEmployment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting employment record ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const userEmployment = await UserEmployment.findByIdAndDelete(req.params.id);

  if (!userEmployment) {
    websocketHandler.sendLog(req, `No employment record found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noEmploymentFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Employment record ${req.params.id} deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});
async function checkUserExistence(criterion) {
  websocketHandler.sendLog(null, `Checking user existence with criterion: ${JSON.stringify(criterion)}`, constants.LOG_TYPES.TRACE);
  try {
    const user = await User.findOne(criterion);
    websocketHandler.sendLog(null, user ? 'User exists' : 'User does not exist', constants.LOG_TYPES.DEBUG);
    return user ? true : false;
  } catch (error) {
    websocketHandler.sendLog(null, `Error checking user existence: ${error.message}`, constants.LOG_TYPES.ERROR);
    throw error;
  }
}

// controllers/employeeSalaryDetailsController.js
exports.createEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating employee salary details', constants.LOG_TYPES.TRACE);
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

, 400));
  }
  const criterion = { _id: req.body.user }; // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    websocketHandler.sendLog(req, `Invalid ObjectId: ${req.body.user}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({ error: `${req.body.user}` + req.t('user.invalidObjectId')    });
  }
  checkUserExistence(criterion)
    .then((userExists) => {
      if (userExists) {
        console.log("User exists");
      } else {
        console.log("User does not exist");
      }
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error checking user: ${error.message}`, constants.LOG_TYPES.ERROR);
    });
  const fixedAllowances = await FixedAllowance.find({ company: companyId })
    .select("_id")
    .exec();
  const validAllowances = fixedAllowances.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      websocketHandler.sendLog(req, `Invalid fixed allowance: ${item.fixedAllowance}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.fixedAllowance, type: 'fixed allowance' }), 400))


    }
  }

  const fixedContribution = await FixedContribution.find({ company: companyId })
    .select("_id")
    .exec();
  const validEmployeeContribution = fixedContribution.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentEmployerContribution) {
    if (!validEmployeeContribution.includes(item.employerContribution)) {
      next(new AppError(req.t('user.invalidComponent', { id: item.employerContribution, type: 'Fixed Contribution' }), 400))
    }
  }

  const variableAllowance = await VariableAllowance.find({ company: companyId })
    .select("_id")
    .exec();
  const validVariableAllowance = variableAllowance.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentVariableAllowance) {
    if (!validVariableAllowance.includes(item.variableAllowance)) {
      websocketHandler.sendLog(req, `Invalid variable allowance: ${item.variableAllowance}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.variableAllowance, type: 'Variable Allowance' }), 400))


    }
  }

  const fixedDeduction = await FixedDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validFixedDeduction = fixedDeduction.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      websocketHandler.sendLog(req, `Invalid fixed deduction: ${item.fixedDeduction}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.fixedDeduction, type: 'Fixed Deduction' }), 400))


    }
  }

  const variableDeduction = await VariableDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validVariableDeduction = variableDeduction.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentVariableDeduction) {
    if (!validVariableDeduction.includes(item.variableDeduction)) {
      websocketHandler.sendLog(req, `Invalid variable deduction: ${item.variableDeduction}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.variableDeduction, type: 'Variable Deduction' }), 400))


    }
  }

  const pfCharge = await PFCharge.find({ company: companyId })
    .select("_id")
    .exec();
  const validPFCharge = pfCharge.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      websocketHandler.sendLog(req, `Invalid PF charge: ${item.pfCharge}`, constants.LOG_TYPES.WARN);      
      next(new AppError(req.t('user.invalidComponent', { id: item.pfCharge, type: 'PF Charge' }), 400))


    }
  }

  req.body.company = companyId;
  websocketHandler.sendLog(req, 'Creating employee salary details record', constants.LOG_TYPES.DEBUG);
  const employeeSalaryDetails = await EmployeeSalaryDetails.create(req.body);
  const employeeSalaryTaxAndStatutorySetting =
    req.body.employeeSalaryTaxAndStatutorySetting.map((item) => {
      return {
        ...item,
        company: companyId,
        employeeSalaryDetails: employeeSalaryDetails._id,
      };
    });

  const employeeTaxAndSalutaorySetting =
    await EmployeeTaxAndSalutaorySetting.create(
      employeeSalaryTaxAndStatutorySetting
    );
  employeeSalaryDetails.taxAndSalutaorySetting = employeeTaxAndSalutaorySetting;

  const employeesalaryComponentFixedAllowance =
    req.body.salaryComponentFixedAllowance.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });

  const salaryComponentFixedAllowance =
    await SalaryComponentFixedAllowance.create(
      employeesalaryComponentFixedAllowance
    );
  employeeSalaryDetails.fixedAllowanceList = salaryComponentFixedAllowance;

  const employeeSalaryComponentEmployerContribution =
    req.body.salaryComponentEmployerContribution.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });
  const salaryComponentEmployerContribution =
    await SalaryComponentEmployerContribution.create(
      employeeSalaryComponentEmployerContribution
    );
  employeeSalaryDetails.employerContributionList =
    salaryComponentEmployerContribution;

  const employeesalaryComponentFixedDeduction =
    req.body.salaryComponentFixedDeduction.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });
  const salaryComponentFixedDeduction =
    await SalaryComponentFixedDeduction.create(
      employeesalaryComponentFixedDeduction
    );
  employeeSalaryDetails.fixedDeductionList = salaryComponentFixedDeduction;

  const employeeSalaryComponentVariableDeduction =
    req.body.salaryComponentVariableDeduction.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });
  const salaryComponentVariableDeduction =
    await SalaryComponentVariableDeduction.create(
      employeeSalaryComponentVariableDeduction
    );
  employeeSalaryDetails.variableDeductionList =
    salaryComponentVariableDeduction;

  const employeeSalaryComponentPFCharge = req.body.salaryComponentPFCharge.map(
    (item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    }
  );
  const salaryComponentPFCharge = await SalaryComponentPFCharge.create(
    employeeSalaryComponentPFCharge
  );
  employeeSalaryDetails.pfChargeList = salaryComponentPFCharge;

  const employeeSalaryComponentVariableAllowance =
    req.body.salaryComponentVariableAllowance.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });
  const salaryComponentVariableAllowance =
    await SalaryComponentVariableAllowance.create(
      employeeSalaryComponentVariableAllowance
    );
  employeeSalaryDetails.variableAllowanceList =
    salaryComponentVariableAllowance;

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalaryDetails,
  });
});

exports.getEmployeeSalaryDetailsByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salary details for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalaryDetails = await EmployeeSalaryDetails.find({})
    .where("user")
    .equals(req.params.userId);
  console.log(req.params.userId);
  if (!employeeSalaryDetails) {
    websocketHandler.sendLog(req, `No salary details found for user ${req.params.userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalaryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Found ${employeeSalaryDetails.length} salary detail records`, constants.LOG_TYPES.INFO);
  
  for (let i = 0; i < employeeSalaryDetails.length; i++) {
    websocketHandler.sendLog(req, `Fetching related data for salary detail ${employeeSalaryDetails[i]._id}`, constants.LOG_TYPES.TRACE);
    employeeSalaryDetails[i].taxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].fixedAllowanceList = await SalaryComponentFixedAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);  
    employeeSalaryDetails[i].employerContributionList = await SalaryComponentEmployerContribution.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].fixedDeductionList = await SalaryComponentFixedDeduction.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].variableDeductionList = await SalaryComponentVariableDeduction.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].pfChargeList = await SalaryComponentPFCharge.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].variableAllowanceList = await SalaryComponentVariableAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    websocketHandler.sendLog(req, `Attached related data to salary detail ${employeeSalaryDetails[i]._id}`, constants.LOG_TYPES.DEBUG);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalaryDetails,
  });
  websocketHandler.sendLog(req, `Returned salary details for user ${req.params.userId}`, constants.LOG_TYPES.INFO);
});
// controllers/employeeSalaryDetailsController.js
exports.getEmployeeBasicSalaryByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salary details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalaryDetails = await EmployeeSalaryDetails.findOne(({ user: req.params.userId })).sort({ payrollEffectiveFrom: -1 });;
  
  if (!employeeSalaryDetails) {
    websocketHandler.sendLog(req, `No salary details found with ID ${req.params.userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalaryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, 'Fetching related salary components', constants.LOG_TYPES.TRACE);

  const fixedAllowances = await SalaryComponentFixedAllowance.find({
    employeeSalaryDetails: employeeSalaryDetails._id
  }).populate({
    path: 'fixedAllowance',
    select: 'label'
  });
  // Filter in JS where label is "Basic Salary"
  employeeSalaryDetails.fixedAllowanceList = fixedAllowances.filter(
    item => item.fixedAllowance?.label === constants.Salaray_Default_Fixed_Allowance.Basic_Salary
  );
  if (!employeeSalaryDetails) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  let basicSalary = 0;
  if (!employeeSalaryDetails.fixedAllowanceList.length > 0) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  else
  {
  basicSalary = employeeSalaryDetails.fixedAllowanceList[0].monthlyAmount;
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: basicSalary,
  });
});

// controllers/employeeSalaryDetailsController.js
exports.getEmployeeHRAByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salary details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalaryDetails = await EmployeeSalaryDetails.findOne(({ user: req.params.userId })).sort({ payrollEffectiveFrom: -1 });;
  
  if (!employeeSalaryDetails) {
    websocketHandler.sendLog(req, `No salary details found with ID ${req.params.userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalaryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, 'Fetching related salary components', constants.LOG_TYPES.TRACE);

  const fixedAllowances = await SalaryComponentFixedAllowance.find({
    employeeSalaryDetails: employeeSalaryDetails._id
  }).populate({
    path: 'fixedAllowance',
    select: 'label'
  });
  // Filter in JS where label is "Basic Salary"
  employeeSalaryDetails.fixedAllowanceList = fixedAllowances.filter(
    item => item.fixedAllowance?.label === constants.Salaray_Default_Fixed_Allowance.HRA
  );
  if (!employeeSalaryDetails) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  let hra = 0;
  if (!employeeSalaryDetails.fixedAllowanceList.length > 0) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  else
  {
  hra = employeeSalaryDetails.fixedAllowanceList[0].monthlyAmount;
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: hra,
  });
});
// controllers/employeeSalaryDetailsController.js
exports.getEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salary details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(req.params.id);
  
  if (!employeeSalaryDetails) {
    websocketHandler.sendLog(req, `No salary details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalaryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, 'Fetching related salary components', constants.LOG_TYPES.TRACE);
  employeeSalaryDetails.taxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList = await SalaryComponentFixedAllowance.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.employerContributionList = await SalaryComponentEmployerContribution.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.fixedDeductionList = await SalaryComponentFixedDeduction.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.variableDeductionList = await SalaryComponentVariableDeduction.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.pfChargeList = await SalaryComponentPFCharge.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.variableAllowanceList =
    await SalaryComponentVariableAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);

  if (!employeeSalaryDetails) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalaryDetails,
  });
});

// controllers/employeeSalaryDetailsController.js
exports.updateEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating salary details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const employeeSalaryDetailsId = req.params.id;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')
    , 400));
  }

  const employeeSalaryDetailsExists = await EmployeeSalaryDetails.findById(
    req.params.id
  );

  if (!employeeSalaryDetailsExists) {
    websocketHandler.sendLog(req, `No salary details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalaryDetailsFound')
    , 404));
  }
  
  websocketHandler.sendLog(req, 'Validating salary components', constants.LOG_TYPES.TRACE);
  const fixedAllowances = await FixedAllowance.find({ company: companyId }).select("_id").exec();
  const validAllowances = fixedAllowances.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      websocketHandler.sendLog(req, `Invalid fixed allowance: ${item.fixedAllowance}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.fixedAllowance, type: 'fixed allowance' }), 400))


    }
  }

  const fixedContribution = await FixedContribution.find({ company: companyId })
    .select("_id")
    .exec();
  const validEmployeeContribution = fixedContribution.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentEmployerContribution) {
    if (!validEmployeeContribution.includes(item.employerContribution)) {
      next(new AppError(req.t('user.invalidComponent', { id: item.employerContribution, type: 'Fixed Contribution' }), 400))


    }
  }

  const variableAllowance = await VariableAllowance.find({ company: companyId })
    .select("_id")
    .exec();
  const validVariableAllowance = variableAllowance.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentVariableAllowance) {
    if (!validVariableAllowance.includes(item.variableAllowance)) {
      websocketHandler.sendLog(req, `Invalid variable allowance: ${item.variableAllowance}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.variableAllowance, type: 'Variable Allowance' }), 400))


    }
  }

  const fixedDeduction = await FixedDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validFixedDeduction = fixedDeduction.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      websocketHandler.sendLog(req, `Invalid fixed deduction: ${item.fixedDeduction}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.fixedDeduction, type: 'Fixed Deduction' }), 400))


    }
  }

  const variableDeduction = await VariableDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validVariableDeduction = variableDeduction.map((fa) =>
    fa._id.toString()
  );

  for (const item of req.body.salaryComponentVariableDeduction) {
    if (!validVariableDeduction.includes(item.variableDeduction)) {
      websocketHandler.sendLog(req, `Invalid variable deduction: ${item.variableDeduction}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.variableDeduction, type: 'Variable Deduction' }), 400))


    }
  }

  const pfCharge = await PFCharge.find({ company: companyId })
    .select("_id")
    .exec();
  const validPFCharge = pfCharge.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      websocketHandler.sendLog(req, `Invalid PF charge: ${item.pfCharge}`, constants.LOG_TYPES.WARN);
      next(new AppError(req.t('user.invalidComponent', { id: item.pfCharge, type: 'PF Charge' }), 400))
    }
  }

  const updateOrCreateRecords = async (model, requestData, idField) => {
    websocketHandler.sendLog(req, `Updating/creating records for ${idField}`, constants.LOG_TYPES.TRACE);
    const requestIds = requestData
      .filter((item) => item._id) // Ensure only existing IDs are considered
      .map((item) => item._id.toString());

    const existingRecords = await model
      .find({ employeeSalaryDetails: employeeSalaryDetailsId })
      .select("_id")
      .exec();
    const existingIds = existingRecords.map((record) => record._id.toString());

    // Update or create records
    for (const item of requestData) {
      if (item._id && existingIds.includes(item._id.toString())) {
        await model.findByIdAndUpdate(item._id, item, {
          new: true,
          runValidators: true,
        });
      } else {
        await model.create({
          ...item,
          employeeSalaryDetails: employeeSalaryDetailsId,
        });
      }
    }

    // Delete records not in the request
    for (const id of existingIds) {
      if (!requestIds.includes(id)) {
        await model.findByIdAndDelete(id);
      }
    }
  };

  // Handle SalaryComponentPFCharge
  if (req.body.salaryComponentFixedAllowance.length > 0) {
  
    await updateOrCreateRecords(
      SalaryComponentFixedAllowance,
      req.body.salaryComponentFixedAllowance,
      "fixedAllowance"
    );
  }

  if (req.body.salaryComponentPFCharge.length > 0) {   
    await updateOrCreateRecords(
      SalaryComponentPFCharge,
      req.body.salaryComponentPFCharge,
      "pfCharge"
    );
  }

  if (req.body.salaryComponentEmployerContribution.length > 0) {
    await updateOrCreateRecords(
      SalaryComponentEmployerContribution,
      req.body.salaryComponentEmployerContribution,
      "employerContribution"
    );
  }
  if (req.body.salaryComponentFixedDeduction.length > 0) {
    await updateOrCreateRecords(
      SalaryComponentFixedDeduction,
      req.body.salaryComponentFixedDeduction,
      "fixedDeduction"
    );
  }
  if (req.body.salaryComponentVariableDeduction.length > 0) {
    await updateOrCreateRecords(
      SalaryComponentVariableDeduction,
      req.body.salaryComponentVariableDeduction,
      "variableDeduction"
    );
  }
  if (req.body.salaryComponentVariableAllowance.length > 0) {
    await updateOrCreateRecords(
      SalaryComponentVariableAllowance,
      req.body.salaryComponentVariableAllowance,
      "variableAllowance"
    );
  }
  const employeeSalaryDetails = await EmployeeSalaryDetails.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employeeSalaryDetails) {
    return next(new AppError(req.t('user.noSalaryDetailsFound'), 404));
  }
  employeeSalaryDetails.taxAndSalutaorySetting =
    await EmployeeTaxAndSalutaorySetting.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList =
    await SalaryComponentFixedAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.employerContributionList =
    await SalaryComponentEmployerContribution.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.fixedDeductionList =
    await SalaryComponentFixedDeduction.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.variableDeductionList =
    await SalaryComponentVariableDeduction.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.pfChargeList = await SalaryComponentPFCharge.find({})
    .where("employeeSalaryDetails")
    .equals(req.params.id);
  employeeSalaryDetails.variableAllowanceList =
    await SalaryComponentVariableAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalaryDetails,
  });
});

// controllers/employeeSalaryDetailsController.js
exports.deleteEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting salary details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const employeeSalaryDetailsId = req.params.id;
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(
    employeeSalaryDetailsId
  );

  if (!employeeSalaryDetails) {
    websocketHandler.sendLog(req, `No salary details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    next(new AppError(req.t('user.noSalaryDetailsFound'), 404))


  }

  // Delete related records from different collections
  await EmployeeTaxAndSalutaorySetting.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentFixedAllowance.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentEmployerContribution.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentFixedDeduction.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentVariableDeduction.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentPFCharge.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentVariableAllowance.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });

  // Finally, delete the EmployeeSalaryDetails record itself
  await EmployeeSalaryDetails.findByIdAndDelete(employeeSalaryDetailsId);
  websocketHandler.sendLog(req, `Salary details ${req.params.id} and related components deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

/**
 * Create Employee Salary, Tax, and Salutaory Setting
 */
exports.createEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating employee tax and statutory settings', constants.LOG_TYPES.TRACE);
  
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    new AppError(req.t('user.companyIdRequired'), 400)


  }
  
  req.body.company = companyId;
  websocketHandler.sendLog(req, `Creating settings for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.create(req.body);
  websocketHandler.sendLog(req, `Settings created with ID ${employeeSettings._id}`, constants.LOG_TYPES.INFO);
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSettings,
  });
});

/**
 * Get Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.getEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching tax and statutory settings ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findById(req.params.id);
  
  if (!employeeSettings) {
    websocketHandler.sendLog(req, `No settings found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSettingsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Settings ${req.params.id} retrieved`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSettings,
  });
});

/**
 * Update Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.updateEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating tax and statutory settings ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!employeeSettings) {
    websocketHandler.sendLog(req, `No settings found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSettingsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Settings ${req.params.id} updated`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSettings,
  });
});

/**
 * Delete Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.deleteEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting tax and statutory settings ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findByIdAndDelete(req.params.id);
  
  if (!employeeSettings) {
    websocketHandler.sendLog(req, `No settings found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSettingsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Settings ${req.params.id} deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.createEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating employee salutatory details', constants.LOG_TYPES.TRACE);
  
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }
  
  req.body.company = companyId;
  websocketHandler.sendLog(req, `Creating salutatory details for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.create(req.body);
  websocketHandler.sendLog(req, `Salutatory details created with ID ${employeeSalutatoryDetails._id}`, constants.LOG_TYPES.INFO);
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalutatoryDetails,
  });
});

exports.getEmployeeSalutatoryDetailsByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salutatory details for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findOne({ user: req.params.userId });
  websocketHandler.sendLog(req, `Found salutatory details`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalutatoryDetails,
  });
});

exports.getEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching salutatory details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findById(req.params.id);
  
  if (!employeeSalutatoryDetails) {
    websocketHandler.sendLog(req, `No salutatory details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalutatoryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Salutatory details ${req.params.id} retrieved`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalutatoryDetails,
  });
});

exports.updateEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating salutatory details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!employeeSalutatoryDetails) {
    websocketHandler.sendLog(req, `No salutatory details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalutatoryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Salutatory details ${req.params.id} updated`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeSalutatoryDetails,
  });
});

exports.deleteEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting salutatory details ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findByIdAndDelete(req.params.id);
  
  if (!employeeSalutatoryDetails) {
    websocketHandler.sendLog(req, `No salutatory details found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noSalutatoryDetailsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Salutatory details ${req.params.id} deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.createEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating employee loan advance', constants.LOG_TYPES.TRACE);
  
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }
  
  req.body.company = companyId;
  req.body.remainingInstallment =  req.body.noOfInstallment;
  req.body.status=constants.Employee_Loan_Advance_status.Requested;
  websocketHandler.sendLog(req, `Creating loan advance for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    websocketHandler.sendLog(req, `Invalid user ObjectId: ${req.body.user}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.invalidObjectId', { id: req.body.user }), 400))


  }
  
  const criterion = { _id: req.body.user };
  await checkUserExistence(criterion)
    .then((userExists) => {
      websocketHandler.sendLog(req, userExists ? 'User exists' : 'User does not exist', constants.LOG_TYPES.DEBUG);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error checking user existence: ${error.message}`, constants.LOG_TYPES.ERROR);
    });
  
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
    websocketHandler.sendLog(req, `Invalid loan category ObjectId: ${req.body.loanAdvancesCategory}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.invalidObjectId', { id: req.body.loanAdvancesCategory }), 400))


  }
  
  const criterionCategory = { _id: req.body.loanAdvancesCategory };
  await checkUserExistence(criterionCategory)
    .then((categoryExists) => {
      websocketHandler.sendLog(req, categoryExists ? 'Loan category exists' : 'Loan category does not exist', constants.LOG_TYPES.DEBUG);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error checking category existence: ${error.message}`, constants.LOG_TYPES.ERROR);
    });
  
  const employeeLoanAdvances = await EmployeeLoanAdvance.create(req.body);
  websocketHandler.sendLog(req, `Loan advance created with ID ${employeeLoanAdvances._id}`, constants.LOG_TYPES.INFO);
  
  const user = await User.findById(req.body.user);
  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name')
    .equals(constants.Email_template_constant.LoanAdvance_Disbursement_Notification)
    .where('company')
    .equals(companyId);
  
  if (emailTemplate) {
    websocketHandler.sendLog(req, `Preparing notification email for ${user.email}`, constants.LOG_TYPES.TRACE);
    const template = emailTemplate.contentData;
    const message = template
      .replace("{firstName}", user.firstName)
      .replace("{company}", req.cookies.companyName)
      .replace("{company}", req.cookies.companyName)
      .replace("{lastName}", user.lastName);
    
    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        message
      });
      websocketHandler.sendLog(req, `Notification email sent to ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Error sending email: ${err.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('user.emailError')

      , 500));
    }
  }
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLoanAdvances,
  });
});

exports.getEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching loan advance ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeLoanAdvances = await EmployeeLoanAdvance.findById(req.params.id);
  
  if (!employeeLoanAdvances) {
    websocketHandler.sendLog(req, `No loan advance found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noLoanAdvanceFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Loan advance ${req.params.id} retrieved`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLoanAdvances,
  });
});


exports.updateEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating loan advance ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
    websocketHandler.sendLog(req, `Invalid loan category ObjectId: ${req.body.loanAdvancesCategory}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.invalidObjectId', { id: req.body.loanAdvancesCategory }), 400))


  }
  
  const criterionCategory = { _id: req.body.loanAdvancesCategory };
  await checkUserExistence(criterionCategory)
    .then((categoryExists) => {
      websocketHandler.sendLog(req, categoryExists ? 'Loan category exists' : 'Loan category does not exist', constants.LOG_TYPES.DEBUG);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error checking category: ${error.message}`, constants.LOG_TYPES.ERROR);
    });
  
  // ✅ Fetch the existing loan advance
  const existingLoanAdvance = await EmployeeLoanAdvance.findById(req.params.id);
  if (!existingLoanAdvance) {
    websocketHandler.sendLog(req, `No loan advance found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noLoanAdvanceFound'), 404));
  }

  // ✅ Check status before updating
  if (existingLoanAdvance.status !== constants.Employee_Loan_Advance_status.Requested) {
    websocketHandler.sendLog(req, `Loan advance ${req.params.id} not editable due to status: ${existingLoanAdvance.status}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.statusEditRestriction'), 400));
  }

  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!employeeLoanAdvances) {
    websocketHandler.sendLog(req, `No loan advance found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noLoanAdvanceFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Loan advance ${req.params.id} updated`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLoanAdvances,
  });
});


exports.deleteEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting loan advance ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndDelete(req.params.id);
  
  if (!employeeLoanAdvances) {
    websocketHandler.sendLog(req, `No loan advance found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noLoanAdvanceFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Loan advance ${req.params.id} deleted`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});


exports.getAllEmployeeLoanAdvancesByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all loan advances for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  
  const companyId = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const totalCount = await EmployeeLoanAdvance.countDocuments({ company: companyId });
  websocketHandler.sendLog(req, `Total loan advances count: ${totalCount}`, constants.LOG_TYPES.DEBUG);
  
  const employeeLoanAdvances = await EmployeeLoanAdvance.find({ company: companyId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  
  websocketHandler.sendLog(req, `Retrieved ${employeeLoanAdvances.length} loan advances`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLoanAdvances,
    total: totalCount,
  });
});

exports.getAllEmployeeLoanAdvancesByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all loan advances for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const totalCount = await EmployeeLoanAdvance.countDocuments({ user: req.params.userId });
  websocketHandler.sendLog(req, `Total loan advances count: ${totalCount}`, constants.LOG_TYPES.DEBUG);
  
  const employeeLoanAdvances = await EmployeeLoanAdvance.find({ user: req.params.userId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  
  websocketHandler.sendLog(req, `Retrieved ${employeeLoanAdvances.length} loan advances`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeLoanAdvances,
    total: totalCount,
  });
});

// Add Employee Income Tax Declaration
exports.createEmployeeIncomeTaxDeclaration = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating employee income tax declaration', constants.LOG_TYPES.TRACE);
  
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Missing company ID in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.companyIdRequired')

    , 400));
  }
  
  req.body.company = companyId;
  websocketHandler.sendLog(req, `Creating declaration for company ${companyId}`, constants.LOG_TYPES.DEBUG);
  
  const incomeTaxComponents = await IncomeTaxComponant.find().select("_id").exec();
  const validIncomeTaxComponent = incomeTaxComponents.map((fa) => fa._id.toString());
  
  for (const item of req.body.employeeIncomeTaxDeclarationComponent) {
    if (!validIncomeTaxComponent.includes(item.incomeTaxComponent)) {
      websocketHandler.sendLog(req, `Invalid income tax component: ${item.incomeTaxComponent}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('user.invalidComponent', { id: item.incomeTaxComponent, type: 'Income Tax Declaration Component' }), 400))


    }
  }
  
  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.create(req.body);
  websocketHandler.sendLog(req, `Declaration created with ID ${employeeIncomeTaxDeclaration._id}`, constants.LOG_TYPES.INFO);
  
  const employeeIncomeTaxDeclarationComponent = await Promise.all(
    req.body.employeeIncomeTaxDeclarationComponent.map(async (item) => {
      if (item.employeeIncomeTaxDeclarationAttachments != null) {
        websocketHandler.sendLog(req, `Processing ${item.employeeIncomeTaxDeclarationAttachments.length} attachments`, constants.LOG_TYPES.TRACE);
        for (let i = 0; i < item.employeeIncomeTaxDeclarationAttachments.length; i++) {
          const attachment = item.employeeIncomeTaxDeclarationAttachments[i];
          
          if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || 
              !attachment.extention || !attachment.file || attachment.attachmentType === null ||
              attachment.attachmentName === null || attachment.attachmentSize === null ||
              attachment.extention === null || attachment.file === null) {
            websocketHandler.sendLog(req, 'Missing attachment properties', constants.LOG_TYPES.WARN);
            return res.status(400).json({ error: req.t('user.missingAttachmentProperties')

            });
          }
          
          const id = new Date().getTime();
          attachment.filePath = attachment.attachmentName + "_" + id + attachment.extention;
          websocketHandler.sendLog(req, `Uploading attachment ${attachment.filePath}`, constants.LOG_TYPES.DEBUG);
          
          const documentLink = await StorageController.createContainerInContainer(
            req.cookies.companyId,
            constants.SubContainers.TaxDeclarionAttachment,
            attachment
          );
          item.documentLink = documentLink;
          websocketHandler.sendLog(req, `Attachment uploaded: ${documentLink}`, constants.LOG_TYPES.DEBUG);
        }
      }
      return { ...item, employeeIncomeTaxDeclaration: employeeIncomeTaxDeclaration._id };
    })
  );
  
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclarationComponent.create(employeeIncomeTaxDeclarationComponent);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent = employeeIncomeTaxDeclarations;
  websocketHandler.sendLog(req, `Created ${employeeIncomeTaxDeclarations.length} components`, constants.LOG_TYPES.INFO);
  
  const employeeIncomeTaxDeclarationHRA = await Promise.all(
    req.body.employeeIncomeTaxDeclarationHRA.map(async (item) => {
      if (item.employeeIncomeTaxDeclarationHRAAttachments != null) {
        websocketHandler.sendLog(req, `Processing ${item.employeeIncomeTaxDeclarationHRAAttachments.length} HRA attachments`, constants.LOG_TYPES.TRACE);
        for (let i = 0; i < item.employeeIncomeTaxDeclarationHRAAttachments.length; i++) {
          const attachment = item.employeeIncomeTaxDeclarationHRAAttachments[i];
          
          if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || 
              !attachment.extention || !attachment.file || attachment.attachmentType === null ||
              attachment.attachmentName === null || attachment.attachmentSize === null ||
              attachment.extention === null || attachment.file === null) {
            websocketHandler.sendLog(req, 'Missing HRA attachment properties', constants.LOG_TYPES.WARN);
            return next(new AppError(req.t('user.missingAttachmentProperties'), 400))


          }
          
          const id = new Date().getTime();
          attachment.filePath = attachment.attachmentName + "_" + id + attachment.extention;
          websocketHandler.sendLog(req, `Uploading HRA attachment ${attachment.filePath}`, constants.LOG_TYPES.DEBUG);
          
          const documentLink = await StorageController.createContainerInContainer(
            req.cookies.companyId,
            constants.SubContainers.TaxDeclarionAttachment,
            attachment
          );
          item.documentLink = documentLink;
          websocketHandler.sendLog(req, `HRA attachment uploaded: ${documentLink}`, constants.LOG_TYPES.DEBUG);
        }
      }
      return { ...item, employeeIncomeTaxDeclaration: employeeIncomeTaxDeclaration._id };
    })
  );
  
  const employeeHRA = await EmployeeIncomeTaxDeclarationHRA.create(employeeIncomeTaxDeclarationHRA);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA = employeeHRA;
  websocketHandler.sendLog(req, `Created ${employeeHRA.length} HRA records`, constants.LOG_TYPES.INFO);
  
  const user = await User.findById(req.body.user);
  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name')
    .equals(constants.Email_template_constant.Employee_Tax_Declaration_Submission_Notification_For_Employee)
    .where('company')
    .equals(companyId);
  
  if (emailTemplate) {
    websocketHandler.sendLog(req, `Preparing notification email for ${user.email}`, constants.LOG_TYPES.TRACE);
    const template = emailTemplate.contentData;
    const message = template
      .replace("{firstName}", user.firstName)
      .replace("{company}", req.cookies.companyName)
      .replace("{company}", req.cookies.companyName)
      .replace("{lastName}", user.lastName);
    
    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        message
      });
      websocketHandler.sendLog(req, `Notification email sent to ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Error sending email: ${err.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('user.emailError')

      , 500));
    }
  }
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclaration
  });
});

// Get All Employee Income Tax Declarations by Company
exports.getAllEmployeeIncomeTaxDeclarationsByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all tax declarations for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const totalCount = await EmployeeIncomeTaxDeclaration.countDocuments({ company: req.cookies.companyId });
  websocketHandler.sendLog(req, `Total declarations count: ${totalCount}`, constants.LOG_TYPES.DEBUG);
  
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclaration.find({ company: req.cookies.companyId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  
  for (let i = 0; i < employeeIncomeTaxDeclarations.length; i++) {
    websocketHandler.sendLog(req, `Fetching components for declaration ${employeeIncomeTaxDeclarations[i]._id}`, constants.LOG_TYPES.TRACE);
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({})
      .where('employeeIncomeTaxDeclaration')
      .equals(employeeIncomeTaxDeclarations[i]._id);
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({})
      .where('employeeIncomeTaxDeclaration')
      .equals(employeeIncomeTaxDeclarations[i]._id);
    websocketHandler.sendLog(req, `Loaded components for declaration ${employeeIncomeTaxDeclarations[i]._id}`, constants.LOG_TYPES.DEBUG);
  }
  
  if (!employeeIncomeTaxDeclarations) {
    websocketHandler.sendLog(req, `No declarations found for company ${req.cookies.companyId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noDeclarationsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Retrieved ${employeeIncomeTaxDeclarations.length} declarations`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclarations,
    total: totalCount
  });
});


// Get All Employee Income Tax Declarations by Company
exports.getAllEmployeeIncomeTaxDeclarationsByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching all tax declarations for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const totalCount = await EmployeeIncomeTaxDeclaration.countDocuments({ user: req.params.userId });
  websocketHandler.sendLog(req, `Total declarations count: ${totalCount}`, constants.LOG_TYPES.DEBUG);
  
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclaration.find({ user: req.params.userId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  
  for (let i = 0; i < employeeIncomeTaxDeclarations.length; i++) {
    websocketHandler.sendLog(req, `Fetching components for declaration ${employeeIncomeTaxDeclarations[i]._id}`, constants.LOG_TYPES.TRACE);
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({})
      .where('employeeIncomeTaxDeclaration')
      .equals(employeeIncomeTaxDeclarations[i]._id);
    
    if (employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent.length > 0) {
      for (let j = 0; j < employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent.length; j++) {
        const incomeTaxComponent = await IncomeTaxComponant.findById(employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent[j].incomeTaxComponent);
        employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent[j].section = incomeTaxComponent.section;
        websocketHandler.sendLog(req, `Added section to component ${employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent[j]._id}`, constants.LOG_TYPES.DEBUG);
      }
    }
    
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({})
      .where('employeeIncomeTaxDeclaration')
      .equals(employeeIncomeTaxDeclarations[i]._id);
  }
  
  if (!employeeIncomeTaxDeclarations) {
    websocketHandler.sendLog(req, `No declarations found for user ${req.params.userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noDeclarationsFound')

    , 404));
  }
  
  websocketHandler.sendLog(req, `Retrieved ${employeeIncomeTaxDeclarations.length} declarations`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclarations,
    total: totalCount
  });
});

// Update Employee Income Tax Declaration
exports.updateEmployeeIncomeTaxDeclaration = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating income tax declaration ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeIncomeTaxDeclarationId = req.params.id;
  
  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!employeeIncomeTaxDeclaration) {
    websocketHandler.sendLog(req, `No declaration found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noTaxDeclarationFound')

    , 404));
  }
  
  const updateOrCreateRecords = async (model, requestData, idField) => {
    websocketHandler.sendLog(req, `Updating/creating records for ${idField}`, constants.LOG_TYPES.TRACE);
    const requestIds = requestData
      .filter(item => item._id)
      .map(item => item._id.toString());
    
    const existingRecords = await model.find({ employeeIncomeTaxDeclaration: employeeIncomeTaxDeclarationId }).select('_id').exec();
    const existingIds = existingRecords.map(record => record._id.toString());
    
    for (const item of requestData) {
      if (item._id && existingIds.includes(item._id.toString())) {
        await model.findByIdAndUpdate(item._id, item, { new: true, runValidators: true });
        websocketHandler.sendLog(req, `Updated ${idField} record ${item._id}`, constants.LOG_TYPES.DEBUG);
      } else {
        await model.create({ ...item, employeeIncomeTaxDeclaration: employeeIncomeTaxDeclarationId });
        websocketHandler.sendLog(req, `Created new ${idField} record`, constants.LOG_TYPES.DEBUG);
      }
    }
    
    for (const id of existingIds) {
      if (!requestIds.includes(id)) {
        await model.findByIdAndDelete(id);
        websocketHandler.sendLog(req, `Deleted ${idField} record ${id}`, constants.LOG_TYPES.DEBUG);
      }
    }
  };
  
  if (req.body.employeeIncomeTaxDeclarationHRA.length > 0) {
    websocketHandler.sendLog(req, `Processing ${req.body.employeeIncomeTaxDeclarationHRA.length} HRA records`, constants.LOG_TYPES.TRACE);
    for (let j = 0; j < req.body.employeeIncomeTaxDeclarationHRA.length; j++) {
      if (req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments != null) {
        for (let i = 0; i < req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments.length; i++) {
          const attachment = req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments[i];
          
          if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || 
              !attachment.extention || !attachment.file || attachment.attachmentType === null ||
              attachment.attachmentName === null || attachment.attachmentSize === null ||
              attachment.extention === null || attachment.file === null) {
            websocketHandler.sendLog(req, 'Missing HRA attachment properties', constants.LOG_TYPES.WARN);
            return res.status(400).json({ error: req.t('user.missingAttachmentProperties')

            });
          }
          
          const id = new Date().getTime();
          attachment.filePath = attachment.attachmentName + "_" + id + attachment.extention;
          websocketHandler.sendLog(req, `Uploading HRA attachment ${attachment.filePath}`, constants.LOG_TYPES.DEBUG);
          
          const documentLink = await StorageController.createContainerInContainer(
            req.cookies.companyId,
            constants.SubContainers.TaxDeclarionAttachment,
            attachment
          );
          req.body.employeeIncomeTaxDeclarationHRA[j].documentLink = documentLink;
          websocketHandler.sendLog(req, `HRA attachment uploaded: ${documentLink}`, constants.LOG_TYPES.DEBUG);
        }
      }
    }
    await updateOrCreateRecords(EmployeeIncomeTaxDeclarationHRA, req.body.employeeIncomeTaxDeclarationHRA, 'incomeTaxDeclarationHRA');
  } else {
    websocketHandler.sendLog(req, 'Processing HRA deletion', constants.LOG_TYPES.TRACE);
    const taxDeclarationHRAs = await EmployeeIncomeTaxDeclarationHRA.find({ employeeIncomeTaxDeclaration: req.params.id });
    if (taxDeclarationHRAs) {
      websocketHandler.sendLog(req, `Deleting ${taxDeclarationHRAs.length} HRA records`, constants.LOG_TYPES.DEBUG);
      for (let i = 0; i < taxDeclarationHRAs.length; i++) {
        if (taxDeclarationHRAs[i].documentLink) {
          websocketHandler.sendLog(req, `Deleting HRA attachment ${taxDeclarationHRAs[i].documentLink}`, constants.LOG_TYPES.DEBUG);
          await StorageController.deleteBlobFromContainer(req.cookies.companyId, taxDeclarationHRAs[i].documentLink);
        }
      }
      await EmployeeIncomeTaxDeclarationHRA.deleteMany({ employeeIncomeTaxDeclaration: req.params.id });
      websocketHandler.sendLog(req, 'HRA records deleted', constants.LOG_TYPES.INFO);
    }
  }
  
  employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({})
    .where('employeeIncomeTaxDeclaration')
    .equals(req.params.id);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({})
    .where('employeeIncomeTaxDeclaration')
    .equals(req.params.id);
  
  websocketHandler.sendLog(req, `Declaration ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclaration,
  });
});

// Get Employee Income Tax Declaration by ID
exports.getEmployeeIncomeTaxDeclarationById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching income tax declaration ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findById(req.params.id);
  
  if (!employeeIncomeTaxDeclaration) {
    websocketHandler.sendLog(req, `No declaration found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noTaxDeclarationFound')

    , 404));
  }
  
  employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({})
    .where("employeeIncomeTaxDeclaration")
    .equals(req.params.id);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({})
    .where("employeeIncomeTaxDeclaration")
    .equals(req.params.id);
  
  websocketHandler.sendLog(req, `Declaration ${req.params.id} retrieved with components`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclaration,
  });
});

// Delete Employee Income Tax Declaration
exports.deleteEmployeeIncomeTaxDeclaration = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting income tax declaration ${req.params.id}`, constants.LOG_TYPES.TRACE);
  
  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findByIdAndDelete(req.params.id);
  if (!employeeIncomeTaxDeclaration) {
    websocketHandler.sendLog(req, `No declaration found with ID ${req.params.id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noTaxDeclarationFound')

    , 404));
  }
  
  const taxDeclarationComponents = await EmployeeIncomeTaxDeclarationComponent.find({ employeeIncomeTaxDeclaration: req.params.id });
  if (taxDeclarationComponents) {
    websocketHandler.sendLog(req, `Deleting ${taxDeclarationComponents.length} components`, constants.LOG_TYPES.DEBUG);
    for (let i = 0; i < taxDeclarationComponents.length; i++) {
      if (taxDeclarationComponents[i].documentLink) {
        websocketHandler.sendLog(req, `Deleting component attachment ${taxDeclarationComponents[i].documentLink}`, constants.LOG_TYPES.DEBUG);
        await StorageController.deleteBlobFromContainer(req.cookies.companyId, taxDeclarationComponents[i].documentLink);
      }
    }
    await EmployeeIncomeTaxDeclarationComponent.deleteMany({ employeeIncomeTaxDeclaration: req.params.id });
    websocketHandler.sendLog(req, 'Components deleted', constants.LOG_TYPES.INFO);
  }
  
  const taxDeclarationHRAs = await EmployeeIncomeTaxDeclarationHRA.find({ employeeIncomeTaxDeclaration: req.params.id });
  if (taxDeclarationHRAs) {
    websocketHandler.sendLog(req, `Deleting ${taxDeclarationHRAs.length} HRA records`, constants.LOG_TYPES.DEBUG);
    for (let i = 0; i < taxDeclarationHRAs.length; i++) {
      if (taxDeclarationHRAs[i].documentLink) {
        websocketHandler.sendLog(req, `Deleting HRA attachment ${taxDeclarationHRAs[i].documentLink}`, constants.LOG_TYPES.DEBUG);
        await StorageController.deleteBlobFromContainer(req.cookies.companyId, taxDeclarationHRAs[i].documentLink);
      }
    }
    await EmployeeIncomeTaxDeclarationHRA.deleteMany({ employeeIncomeTaxDeclaration: req.params.id });
    websocketHandler.sendLog(req, 'HRA records deleted', constants.LOG_TYPES.INFO);
  }
  
  websocketHandler.sendLog(req, `Declaration ${req.params.id} deleted successfully`, constants.LOG_TYPES.INFO);
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.updateEmployeeIncomeTaxDeclarationComponant = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating income tax declaration component', constants.LOG_TYPES.TRACE);
  
  try {
    const incomeTaxComponents = await IncomeTaxComponant.find().select("_id").exec();
    const validIncomeTaxComponent = incomeTaxComponents.map((fa) => fa._id.toString());
    
    if (!validIncomeTaxComponent.includes(req.body.incomeTaxComponent)) {
      websocketHandler.sendLog(req, `Invalid income tax component: ${req.body.incomeTaxComponent}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('user.invalidComponent', { id: req.body.incomeTaxComponent, type: 'income tax component' }), 400))


    }
    
    const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findById(req.body.employeeIncomeTaxDeclaration);
    if (!employeeIncomeTaxDeclaration) {
      websocketHandler.sendLog(req, `Declaration ${req.body.employeeIncomeTaxDeclaration} not found`, constants.LOG_TYPES.WARN);
      return res.status(404).json({ error: req.t('user.noTaxDeclarationFound')

      });
    }
    
    if (req.body.employeeIncomeTaxDeclarationAttachments) {
      websocketHandler.sendLog(req, `Processing ${req.body.employeeIncomeTaxDeclarationAttachments.length} attachments`, constants.LOG_TYPES.TRACE);
      for (let i = 0; i < req.body.employeeIncomeTaxDeclarationAttachments.length; i++) {
        let attachment = req.body.employeeIncomeTaxDeclarationAttachments[i];
        
        if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || 
            !attachment.extention || !attachment.file) {
          websocketHandler.sendLog(req, 'Missing attachment properties', constants.LOG_TYPES.WARN);
          return next(new AppError(req.t('user.missingAttachmentProperties'), 400))


        }
        
        const id = new Date().getTime();
        attachment.filePath = `${attachment.attachmentName}_${id}${attachment.extention}`;
        websocketHandler.sendLog(req, `Uploading attachment ${attachment.filePath}`, constants.LOG_TYPES.DEBUG);
        
        const documentLink = await StorageController.createContainerInContainer(
          req.cookies.companyId,
          constants.SubContainers.TaxDeclarionAttachment,
          attachment
        );
        attachment.documentLink = documentLink;
        websocketHandler.sendLog(req, `Attachment uploaded: ${documentLink}`, constants.LOG_TYPES.DEBUG);
      }
    }
    
    const employeeIncomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.findOneAndUpdate(
      {
        employeeIncomeTaxDeclaration: req.body.employeeIncomeTaxDeclaration,
        incomeTaxComponent: req.body.incomeTaxComponent,
      },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    
    websocketHandler.sendLog(req, `Component updated/created with ID ${employeeIncomeTaxDeclarationComponent._id}`, constants.LOG_TYPES.INFO);
    
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: employeeIncomeTaxDeclarationComponent,
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error updating component: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ error: req.t('common.internalError') });
  }
});

exports.updateEmployeeIncomeTaxDeclarationHRA = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating HRA for declaration ${req.body.employeeIncomeTaxDeclaration}`, constants.LOG_TYPES.TRACE);
  
  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findById(req.body.employeeIncomeTaxDeclaration);
  if (!employeeIncomeTaxDeclaration) {
    websocketHandler.sendLog(req, `Declaration ${req.body.employeeIncomeTaxDeclaration} not found`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noTaxDeclarationFound'), 404))


  }
  
  if (req.body.employeeIncomeTaxDeclarationAttachments) {
    websocketHandler.sendLog(req, `Processing ${req.body.employeeIncomeTaxDeclarationAttachments.length} HRA attachments`, constants.LOG_TYPES.TRACE);
    for (let i = 0; i < req.body.employeeIncomeTaxDeclarationAttachments.length; i++) {
      let attachment = req.body.employeeIncomeTaxDeclarationAttachments[i];
      
      if (!attachment.attachmentType || !attachment.attachmentName || !attachment.attachmentSize || 
          !attachment.extention || !attachment.file) {
        websocketHandler.sendLog(req, 'Missing HRA attachment properties', constants.LOG_TYPES.WARN);
        return next(new AppError(req.t('user.missingAttachmentProperties'), 400))


      }
      
      const id = new Date().getTime();
      attachment.filePath = `${attachment.attachmentName}_${id}${attachment.extention}`;
      websocketHandler.sendLog(req, `Uploading HRA attachment ${attachment.filePath}`, constants.LOG_TYPES.DEBUG);
      
      const documentLink = await StorageController.createContainerInContainer(
        req.cookies.companyId,
        constants.SubContainers.TaxDeclarionAttachment,
        attachment
      );
      attachment.documentLink = documentLink;
      websocketHandler.sendLog(req, `HRA attachment uploaded: ${documentLink}`, constants.LOG_TYPES.DEBUG);
    }
  }
  
  const existingRecord = await EmployeeIncomeTaxDeclarationHRA.findOne({
    employeeIncomeTaxDeclaration: req.body.employeeIncomeTaxDeclaration,
    month: req.body.month,
  });
  
  let employeeIncomeTaxDeclarationHRA;
  if (existingRecord) {
    websocketHandler.sendLog(req, `Updating existing HRA record ${existingRecord._id}`, constants.LOG_TYPES.DEBUG);
    employeeIncomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.findByIdAndUpdate(
      existingRecord._id,
      req.body,
      { new: true, runValidators: true }
    );
  } else {
    websocketHandler.sendLog(req, 'Creating new HRA record', constants.LOG_TYPES.DEBUG);
    employeeIncomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.create(req.body);
  }
  
  websocketHandler.sendLog(req, `HRA record ${employeeIncomeTaxDeclarationHRA._id} processed`, constants.LOG_TYPES.INFO);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeIncomeTaxDeclarationHRA,
  });
});

exports.generateOTP = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Generating OTP for ${req.body.email}`, constants.LOG_TYPES.TRACE);
  
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    websocketHandler.sendLog(req, `Generated OTP: ${otp}`, constants.LOG_TYPES.DEBUG);
    
    const newOTP = new OTP({
      otp: otp,
      email: req.body.email,
      createdAt: new Date(),
      status: 'active'
    });
    
    await newOTP.save();
    websocketHandler.sendLog(req, 'OTP saved to database', constants.LOG_TYPES.DEBUG);
    
    const message = `Your one-time password (OTP) for verification is: ${otp}. \n Please do not share this OTP with anyone. If you did not request this, please ignore this email or contact our support team immediately.`;
    try {
      await sendEmail({
        email: req.body.email,
        subject: 'OTP',
        message
      });
      websocketHandler.sendLog(req, `OTP email sent to ${req.body.email}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Error sending OTP email: ${err.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('user.emailError')

      , 500));
    }
    
    res.status(200).json({ message: 'OTP generated and emailed successfully.' });
  } catch (error) {
    websocketHandler.sendLog(req, `Error generating OTP: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: 'Error generating OTP' + error });
  }
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Verifying OTP ${req.body.otp} for ${req.body.email}`, constants.LOG_TYPES.TRACE);
  
  try {
    const { email, otp } = req.body;
    const existingOTP = await OTP.findOne({ email, otp });
    
    if (!existingOTP || existingOTP.status !== 'active') {
      websocketHandler.sendLog(req, 'Invalid or expired OTP', constants.LOG_TYPES.WARN);
      return res.status(400).json({ message: req.t('user.invalidOtp')

      });
    }
    
    existingOTP.status = 'verified';
    await existingOTP.save();
    websocketHandler.sendLog(req, 'OTP verified and status updated', constants.LOG_TYPES.INFO);
    
    res.status(200).json({ message: req.t('user.otpVerifiedSuccessfully') });
  } catch (error) {
    websocketHandler.sendLog(req, `Error verifying OTP: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: req.t('user.ErrorVerifyingOTP') + error });
  }
});

exports.cancelOTP = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Canceling OTP ${req.body.otp} for ${req.body.email}`, constants.LOG_TYPES.TRACE);
  
  try {
    const { email, otp } = req.body;
    const existingOTP = await OTP.findOne({ email, otp });
    
    if (!existingOTP) {
      websocketHandler.sendLog(req, req.t('user.otpNotFound')

      , constants.LOG_TYPES.WARN);
      return res.status(400).json({ message: req.t('user.otpNotFound')

      });
    }
    
    existingOTP.status = 'cancelled';
    await existingOTP.save();
    websocketHandler.sendLog(req, 'OTP cancelled', constants.LOG_TYPES.INFO);
    
    res.status(200).json({ message: req.t('user.OTPCancelledSuccessfully') });
  } catch (error) {
    websocketHandler.sendLog(req, `Error cancelling OTP: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: req.t('user.ErrorCancellingOTP') });
  }
});

exports.updateUserProfilePicture = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating profile picture for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  
  const user = await User.findById(req.params.userId);
  if (!user) {
    websocketHandler.sendLog(req, `User ${req.params.userId} not found`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('user.noUser')

    , 404));
  }
  
  for (let i = 0; i < req.body.profileImage.length; i++) {
    if (!req.body.profileImage[i].attachmentSize || !req.body.profileImage[i].extention || !req.body.profileImage[i].file ||
        req.body.profileImage[i].attachmentSize === null || req.body.profileImage[i].extention === null || req.body.profileImage[i].file === null) {
      websocketHandler.sendLog(req, 'Missing profile image properties', constants.LOG_TYPES.WARN);
      return res.status(400).json({ error: req.t('user.missingProfileImageProperties')

      });
    }
    
    const attachmentName = user.firstName;
    req.body.profileImage[i].filePath = attachmentName + "_" + user._id + req.body.profileImage[i].extention;
    websocketHandler.sendLog(req, `Uploading profile image ${req.body.profileImage[i].filePath}`, constants.LOG_TYPES.DEBUG);
    
    const url = await StorageController.createContainerInContainer(
      req.cookies.companyId,
      constants.SubContainers.Profile,
      req.body.profileImage[i]
    );
    
    user.photo = url;
    await user.save();
    websocketHandler.sendLog(req, `Profile picture updated with URL ${url}`, constants.LOG_TYPES.INFO);
  }
  
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: user
  });
});