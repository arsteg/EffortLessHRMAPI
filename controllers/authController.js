const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/permissions/userModel');
const Company = require('../models/companyModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const sendEmailLog = require('../email/emailLog');
const Role = require('../models/permissions/roleModel');
const { request } = require('http');
const userSubordinate = require('../models/userSubordinateModel');
const { distinct } = require('../models/permissions/userModel');
const RolePermission = require('../models/permissions/rolePermissionModel');
const factory = require('./handlerFactory');
const TimeLog = require('../models/timeLog');
const { timeLog } = require('console');
const TaskStatus = require('../models/commons/taskStatusModel');
const TaskPriority = require('../models/commons/taskPriorityModel');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const mongoose = require('mongoose');
const constants = require('../constants');
const Subscription = require('../models/pricing/subscriptionModel');
const Razorpay = require('razorpay');
const Appointment = require("../models/permissions/appointmentModel");
const websocketHandler = require('../utils/websocketHandler');
const IncomeTaxSection = require('../models/commons/IncomeTaxSectionModel');
const IncomeTaxComponant = require("../models/commons/IncomeTaxComponant");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
  headers: {
    "X-Razorpay-Account": process.env.RAZORPAY_MERCHANT || "PWAQUL4NNnybvx"
  }
});
const { logUserAction } = require('./userController');

const signToken = async (id) => {
  websocketHandler.sendLog(null, `Generating token for user ID: ${id}`, constants.LOG_TYPES.INFO);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = async (user, statusCode, res) => {
  websocketHandler.sendLog(null, `Starting createAndSendToken for user: ${user._id}`, constants.LOG_TYPES.INFO);
  const token = await signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    res.cookie('companyId', user.company.id, {
      secure: true,
      sameSite: 'none'
    });
    res.cookie('userId', user._id, {
      secure: true,
      sameSite: 'none'
    });
    res.cookie('companyName', user.company.companyName, {
      secure: true,
      sameSite: 'none'
    });
  } else {
    res.cookie('companyId', user.company.id);
    res.cookie('userId', user._id);
    res.cookie('companyName', user.company.companyName);
  }
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  const subscriptions = await Subscription.find({
    companyId: user.company.id,
    "razorpaySubscription.status": { $in: constants.Active_Subscription }
  }).populate("currentPlanId");
  websocketHandler.sendLog(null, `Fetched ${subscriptions.length} subscriptions for company: ${user.company.id}`, constants.LOG_TYPES.DEBUG);
  const activeSubscription = subscriptions.find((item) => { return item.razorpaySubscription.status === 'active' });
  let companySubscription = { status: 'new' };
  if (activeSubscription) {
    companySubscription = activeSubscription.razorpaySubscription;
    const addOns = await razorpay.addons.all({
      subscription_id: companySubscription.id
    });
    companySubscription.addOns = addOns.items;
    websocketHandler.sendLog(null, `Fetched ${addOns.items.length} add-ons for subscription: ${companySubscription.id}`, constants.LOG_TYPES.DEBUG);
  } else if (subscriptions.length > 0) {
    const razorpaySubscription = await razorpay.subscriptions.fetch(subscriptions[0].subscriptionId);
    companySubscription = razorpaySubscription;
    websocketHandler.sendLog(null, `Fetched subscription details for ID: ${subscriptions[0].subscriptionId}`, constants.LOG_TYPES.DEBUG);
  }

  websocketHandler.sendLog(null, `Token created and sent for user: ${user._id}`, constants.LOG_TYPES.INFO);
  res.status(statusCode).json({
    status: constants.APIResponseStatus.Success,
    token,
    data: {
      user,
      companySubscription
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting signup', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Signup attempt for email: ${req.body.email}, companyId: ${req.body.companyId}`, constants.LOG_TYPES.TRACE);

  const company = await Company.findOne({ _id: req.body.companyId });
  websocketHandler.sendLog(req, `Fetched company: ${company?._id || 'not found'}`, constants.LOG_TYPES.TRACE);
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    isSuperAdmin: false,
    company: company,
    status: constants.User_Status.Active,
    active: true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())
  });
  websocketHandler.sendLog(req, `User created: ${newUser._id}`, constants.LOG_TYPES.INFO);

  createAndSendToken(newUser, 201, res);
});

exports.webSignup = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting webSignup', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Web signup attempt for email: ${req.body.email}, companyName: ${req.body.companyName}`, constants.LOG_TYPES.TRACE);

  var company = await Company.findOne({ companyName: req.body.companyName });
  websocketHandler.sendLog(req, `Fetched company: ${company?._id || 'not found'}`, constants.LOG_TYPES.TRACE);
  var newCompany = false;
  if (company === null) {
    newCompany = true;
  }
  var companyId = process.env.DEFAULT_COMPANY_Id;
  if (company === null) {
    company = await Company.create({
      companyName: req.body.companyName,
      contactPerson: req.body.firstName + " " + req.body.lastName,
      email: req.body.email,
      active: true,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now())
    });
    websocketHandler.sendLog(req, `Created new company: ${company._id}`, constants.LOG_TYPES.INFO);

    const rolesToDuplicate = await Role.find({ company: companyId });
    if (taskStatusToDuplicate.length > 0) {
      const duplicatedRoles = rolesToDuplicate.map((record) => {
        const duplicatedRole = Object.assign({}, record.toObject());
        duplicatedRole._id = new mongoose.Types.ObjectId();
        duplicatedRole.company = company._id;
        return duplicatedRole;
      });
      await Role.insertMany(duplicatedRoles);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedRoles.length} roles for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Roles found to duplicate.');
    }
    const taskStatusToDuplicate = await TaskStatus.find({ company: companyId });
    if (taskStatusToDuplicate.length > 0) {
      const duplicatedTaskStatusList = taskStatusToDuplicate.map((record) => {
        const duplicatedTaskStatus = Object.assign({}, record.toObject());
        duplicatedTaskStatus._id = new mongoose.Types.ObjectId();
        duplicatedTaskStatus.company = company._id;
        return duplicatedTaskStatus;
      });
      await TaskStatus.insertMany(duplicatedTaskStatusList);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedTaskStatusList.length} task statuses for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Task Status Templates found to duplicate.');
    }
    const taskPriorityToDuplicate = await TaskPriority.find({ company: companyId });
    if (taskPriorityToDuplicate.length > 0) {
      const duplicatedTaskPriorityList = taskPriorityToDuplicate.map((record) => {
        const duplicatedTaskPriority = Object.assign({}, record.toObject());
        duplicatedTaskPriority.company = company._id;
        duplicatedTaskPriority._id = new mongoose.Types.ObjectId();
        return duplicatedTaskPriority;
      });
      await TaskPriority.insertMany(duplicatedTaskPriorityList);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedTaskPriorityList.length} task priorities for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Task Priority Templates found to duplicate.');
    }
    const emailTemplateToDuplicate = await EmailTemplate.find({ company: companyId });
    if (emailTemplateToDuplicate.length > 0) {
      const duplicatedEmailTemplateList = emailTemplateToDuplicate.map((record) => {
        const duplicatedEmailTemplate = Object.assign({}, record.toObject());
        duplicatedEmailTemplate.company = company._id;
        duplicatedEmailTemplate._id = new mongoose.Types.ObjectId();
        duplicatedEmailTemplate.isDelete = false;
        return duplicatedEmailTemplate;
      });
      await EmailTemplate.insertMany(duplicatedEmailTemplateList);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedEmailTemplateList.length} email templates for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Email Templates found to duplicate.');
    }

    const taxSectonsToDuplicate = await IncomeTaxSection.find({ company: companyId });
    if (taxSectonsToDuplicate.length > 0) {
      const duplicatedTaxSectionList = taxSectonsToDuplicate.map((record) => {
        const duplicatedTaxSection = Object.assign({}, record.toObject());
        duplicatedTaxSection._id = new mongoose.Types.ObjectId();
        duplicatedTaxSection.company = company._id;
        return duplicatedTaxSection;
      });
      await IncomeTaxSection.insertMany(duplicatedTaxSectionList);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedTaxSectionList.length} tax sections for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Tax Sections found to duplicate.');
    }

    const taxComponanatsToDuplicate = await IncomeTaxComponant.find({ company: companyId });
    if (taxComponanatsToDuplicate.length > 0) {
      const duplicatedTaxComponantList = taxComponanatsToDuplicate.map((record) => {
        const duplicatedTaxComponant = Object.assign({}, record.toObject());
        duplicatedTaxComponant._id = new mongoose.Types.ObjectId();
        duplicatedTaxComponant.company = company._id;
        return duplicatedTaxComponant;
      });
      await IncomeTaxComponant.insertMany(duplicatedTaxComponantList);
      websocketHandler.sendLog(req, `Duplicated ${duplicatedTaxComponantList.length} tax components for company: ${company._id}`, constants.LOG_TYPES.DEBUG);
    } else {
      console.log('No Tax Componants found to duplicate.');
    }
  }
  var role = null;
  if (newCompany == true) {
    role = await Role.findOne({
      company: company._id,
      Name: "Admin"
    });
  } else {
    role = await Role.findOne({
      company: company._id,
      Name: "User"
    });
  }
  websocketHandler.sendLog(req, `Selected role: ${role?._id || 'not found'} for user`, constants.LOG_TYPES.TRACE);

  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: role.id,
    isSuperAdmin: false,
    company: company.id,
    status: constants.User_Status.Active,
    active: true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())
  });
  websocketHandler.sendLog(req, `User created: ${newUser._id}`, constants.LOG_TYPES.INFO);

  if (newUser) {
    const newAppointment = new Appointment({
      user: newUser._id,
      salaryTypePaid: '',
      joiningDate: null,
      confirmationDate: null,
      company: company.id,
    });
    await newAppointment.save();
    websocketHandler.sendLog(req, `Created appointment for user: ${newUser._id}`, constants.LOG_TYPES.INFO);

    const resetURL = `${req.protocol}://${process.env.WEBSITE_DOMAIN}/updateuser/${newUser._id}`;
    const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.UPDATE_PROFILE).where('company').equals(companyId);
    if (emailTemplate) {
      const template = emailTemplate.contentData;
      const message = template
        .replace("{firstName}", newUser.firstName)
        .replace("{url}", resetURL)
        .replace("{company}", req.cookies.companyName)
        .replace("{company}", req.cookies.companyName)
        .replace("{lastName}", newUser.lastName);

      try {
        await sendEmail({
          email: newUser.email,
          subject: emailTemplate.subject,
          message
        });
        websocketHandler.sendLog(req, `Sent profile update email to: ${newUser.email}`, constants.LOG_TYPES.INFO);
      } catch (err) {
        websocketHandler.sendLog(req, `Error sending email to ${newUser.email}: ${err.message}`, constants.LOG_TYPES.ERROR);
        return next(
          new AppError(req.t('auth.emailSendFailure'), 500)
        );
      }
    }
    createAndSendToken(newUser, 201, res);
  }
});

exports.CreateUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting CreateUser', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Creating user with email: ${req.body.email} for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  try {
    const subscription = await Subscription.findOne({
      companyId: req.cookies.companyId,
      "razorpaySubscription.status": {
        $in: constants.Active_Subscription
      }
    }).populate('currentPlanId');
    const activeUsers = await User.count({
      company: mongoose.Types.ObjectId(req.cookies.companyId),
      status: { $in: constants.Active_Statuses }
    });
    websocketHandler.sendLog(req, `Checked subscription: ${subscription?._id || 'none'}, active users: ${activeUsers}`, constants.LOG_TYPES.DEBUG);

    if (subscription?.currentPlanId?.users <= activeUsers) {
      websocketHandler.sendLog(req, `User limit exceeded: ${activeUsers}/${subscription.currentPlanId.users}`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        error: req.t('auth.userLimitExceeded', { maxUsers: subscription.currentPlanId.users })
      });
    }
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      phone: req.body.phone,
      jobTitle: req.body.jobTitle,
      isSuperAdmin: false,
      status: constants.User_Status.Active,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      company: req.cookies.companyId
    });
    websocketHandler.sendLog(req, `User created: ${newUser._id}`, constants.LOG_TYPES.INFO);

    const newAppointment = new Appointment({
      user: newUser._id,
      salaryTypePaid: '',
      joiningDate: null,
      confirmationDate: null,
      company: req.cookies.companyId,
    });
    await newAppointment.save();
    websocketHandler.sendLog(req, `Created appointment for user: ${newUser._id}`, constants.LOG_TYPES.INFO);
    newUser.appointment = newAppointment;

    const resetURL = `${req.protocol}://${process.env.WEBSITE_DOMAIN}/updateuser/${newUser._id}`;
    const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.UPDATE_PROFILE).where('company').equals(req.cookies.companyId);
    if (emailTemplate) {
      const template = emailTemplate.contentData;
      const message = template
        .replace("{firstName}", newUser.firstName)
        .replace("{url}", resetURL)
        .replace("{company}", req.cookies.companyName)
        .replace("{company}", req.cookies.companyName)
        .replace("{lastName}", newUser.lastName);
      try {
        await sendEmail({
          email: newUser.email,
          subject: emailTemplate.subject,
          message
        });
        websocketHandler.sendLog(req, `Sent profile update email to: ${newUser.email}`, constants.LOG_TYPES.INFO);
      } catch (err) {
        websocketHandler.sendLog(req, `Error sending email to ${newUser.email}: ${err.message}`, constants.LOG_TYPES.ERROR);
        return next(
          new AppError(req.t('auth.emailSendFailure'), 500)
        );
      }
    }
    const userAction = {
      userId: newUser._id,
      companyId: req.cookies.companyId,
      oldStatus: newUser.status || '',
      newStatus: constants.User_Status.Active,
      timestamp: new Date().toISOString(),
      action: 'New user added'
    };
    await logUserAction(req, userAction, next);
    websocketHandler.sendLog(req, `Logged user action for: ${newUser._id}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        User: newUser
      }
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error creating user: ${err.message}`, constants.LOG_TYPES.ERROR);
    console.log(err);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      error: err
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting login', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Login attempt for email: ${req.body.email}`, constants.LOG_TYPES.TRACE);

  const { email, password } = req.body;

  if (!email || !password) {
    websocketHandler.sendLog(req, 'Email or password not provided', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.emailOrPasswordMissing'), 400));
  }
  const user = await User.findOne({
    email,
    status: { $ne: constants.User_Status.Deleted }
  }).select('+password');
  websocketHandler.sendLog(req, `Fetched user: ${user?._id || 'not found'}`, constants.LOG_TYPES.TRACE);

  if (!user || !(await user.correctPassword(password, user.password))) {
    websocketHandler.sendLog(req, `Invalid credentials for email: ${email}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.incorrectEmailOrPassword'), 401));
  }

  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting protect middleware', constants.LOG_TYPES.INFO);

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    websocketHandler.sendLog(req, `Extracted token: ${token.substring(0, 10)}...`, constants.LOG_TYPES.TRACE);
  }

  if (!token) {
    websocketHandler.sendLog(req, 'No token provided', constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.notLoggedIn'), 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  websocketHandler.sendLog(req, `Token decoded for user ID: ${decoded.id}`, constants.LOG_TYPES.DEBUG);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    websocketHandler.sendLog(req, `User not found for ID: ${decoded.id}`, constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.userNotFound'), 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    websocketHandler.sendLog(req, `Password changed after token issuance for user: ${currentUser._id}`, constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.passwordChanged'), 401)
    );
  }

  const subscription = await Subscription.findOne({
    $and: [{
      companyId: currentUser.company.id,
      'razorpaySubscription.status': { $in: constants.Active_Subscription }
    }]
  });
  websocketHandler.sendLog(req, `Checked subscription for company: ${currentUser.company.id}, found: ${subscription?._id || 'none'}`, constants.LOG_TYPES.DEBUG);

  if (!subscription) {
    const companyDetails = await Company.findById(currentUser.company._id);
    websocketHandler.sendLog(req, `Fetched company details: ${companyDetails?._id || 'not found'}`, constants.LOG_TYPES.TRACE);
    if (!companyDetails.freeCompany) {
      websocketHandler.sendLog(req, `Subscription inactive for company: ${currentUser.company.id}`, constants.LOG_TYPES.ERROR);
      return next(
        new AppError(req.t('auth.subscriptionInactive'), 401).sendErrorJson(res)
      );
    }
  }

  req.user = currentUser;
  websocketHandler.sendLog(req, `Access granted to user: ${currentUser._id}`, constants.LOG_TYPES.INFO);
  next();
});

exports.protectUnsubscribed = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting protectUnsubscribed middleware', constants.LOG_TYPES.INFO);

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    websocketHandler.sendLog(req, `Extracted token: ${token.substring(0, 10)}...`, constants.LOG_TYPES.TRACE);
  }

  if (!token) {
    websocketHandler.sendLog(req, 'No token provided', constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.notLoggedIn'), 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  websocketHandler.sendLog(req, `Token decoded for user ID: ${decoded.id}`, constants.LOG_TYPES.DEBUG);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    websocketHandler.sendLog(req, `User not found for ID: ${decoded.id}`, constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.userNotFound'), 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    websocketHandler.sendLog(req, `Password changed after token issuance for user: ${currentUser._id}`, constants.LOG_TYPES.ERROR);
    return next(
      new AppError(req.t('auth.passwordChanged'), 401)
    );
  }

  req.user = currentUser;
  websocketHandler.sendLog(req, `Access granted to user: ${currentUser._id}`, constants.LOG_TYPES.INFO);
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting forgotPassword', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Password reset request for email: ${req.body.email}`, constants.LOG_TYPES.TRACE);

  const user = await User.findOne({ email: req.body.email });
  websocketHandler.sendLog(req, `Fetched user: ${user?._id || 'not found'}`, constants.LOG_TYPES.TRACE);
  if (!user) {
    websocketHandler.sendLog(req, `No user found for email: ${req.body.email}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('auth.forgotPasswordNoUser'),
      data: {
        user: null
      }
    });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  websocketHandler.sendLog(req, `Generated reset token for user: ${user._id}`, constants.LOG_TYPES.INFO);

  const resetURL = `${process.env.WEBSITE_DOMAIN}/#/resetPassword/${resetToken}`;
  var companyId = process.env.DEFAULT_COMPANY_Id;
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.Forgot_Password).where('company').equals(companyId);
  if (emailTemplate) {
    const template = emailTemplate.contentData;
    const message = template
      .replace("{firstName}", user.firstName)
      .replace("{url}", resetURL)
      .replace("{lastName}", user.lastName);

    try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        message
      });
      websocketHandler.sendLog(req, `Sent reset email to: ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Error sending email to ${user.email}: ${err.message}`, constants.LOG_TYPES.ERROR);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(req.t('auth.emailSendFailure'), 500)
      );
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting resetPassword', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Reset password attempt with token: ${req.params.token.substring(0, 10)}...`, constants.LOG_TYPES.TRACE);

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  websocketHandler.sendLog(req, `Fetched user: ${user?._id || 'not found'} for token`, constants.LOG_TYPES.TRACE);

  if (!user) {
    websocketHandler.sendLog(req, `Invalid or expired token: ${hashedToken.substring(0, 10)}...`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.invalidOrExpiredToken'), 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  websocketHandler.sendLog(req, `Password reset for user: ${user._id}`, constants.LOG_TYPES.INFO);

  createAndSendToken(user, 200, res);
});

exports.sendLog = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting sendLog', constants.LOG_TYPES.INFO);

  const managerIds = await userSubordinate.find({}).distinct("userId");
  websocketHandler.sendLog(req, `Fetched ${managerIds.length} manager IDs`, constants.LOG_TYPES.DEBUG);
  if (managerIds) {
    for (var i = 0; i < managerIds.length; i++) {
      const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(managerIds[i]);
      websocketHandler.sendLog(req, `Fetched ${managerTeamsIds.length} subordinate IDs for manager: ${managerIds[i]}`, constants.LOG_TYPES.DEBUG);
      if (managerTeamsIds) {
        /*
        for(var j = 0; j < managerTeamsIds.length; j++) 
        {       
          const userSubordinates = await userSubordinate.find({}).where('subordinateUserId').equals(managerTeamsIds[j]._id);  
          if(userSubordinates)
          {
          for(var k = 0; k < userSubordinates.length; k++) 
            {
            const timeLogs = await TimeLog.find({}).where('user').equals(userSubordinates[k].subordinateUserId.email).where('date').equals("2023-01-16");       
            }
          }
        }
        */
      }
    }
  }

  const userListmy = await User.find({}).where("status").equals(constants.User_Status.Active);
  const userList = await User.find({}).where("email").equals("sapana@arsteg.com");
  websocketHandler.sendLog(req, `Fetched ${userList.length} users for email: sapana@arsteg.com`, constants.LOG_TYPES.TRACE);

  if (userList) {
    for (var i = 0; i < userList.length; i++) {
      try {
        const timeLogs = await TimeLog.find({}).where('user').equals(userList[i].email).where('date').equals("2023-01-04");
        websocketHandler.sendLog(req, `Fetched ${timeLogs.length} time logs for user: ${userList[i]._id}`, constants.LOG_TYPES.DEBUG);
        for (const timeLog of timeLogs) {
          timeLog.startTime = timeLog.startTime.getHours();
        }
        await sendEmailLog({
          email: userList[i].email,
          subject: 'Tracker Log',
          data: {
            name: userList[i].firstName + " " + userList[i].lastName,
            total: '0.00',
            logs: timeLogs,
            managerName: userList[i].firstName + " " + userList[i].lastName
          },
          htmlPath: "home.pug"
        }).then(() => {
          websocketHandler.sendLog(req, `Sent log email to: ${userList[i].email}`, constants.LOG_TYPES.INFO);
          console.log('Email has been sent!');
        }).catch((error) => {
          websocketHandler.sendLog(req, `Error sending log email: ${error.message}`, constants.LOG_TYPES.ERROR);
          console.log(error);
        });
      } catch (err) {
        websocketHandler.sendLog(req, `Error processing logs for ${userList[i].email}: ${err.message}`, constants.LOG_TYPES.ERROR);
        return next(
          new AppError(req.t('auth.emailSendFailure'), 500)
        );
      }
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('auth.sendLogSuccess')
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updatePassword', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating password for user ID: ${req.body.id}`, constants.LOG_TYPES.TRACE);

  const user = await User.findById(req.body.id).select('+password');
  websocketHandler.sendLog(req, `Fetched user: ${user?._id || 'not found'}`, constants.LOG_TYPES.TRACE);

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    websocketHandler.sendLog(req, `Incorrect current password for user: ${req.body.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.incorrectCurrentPassword'), 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  websocketHandler.sendLog(req, `Password updated for user: ${user._id}`, constants.LOG_TYPES.INFO);

  createAndSendToken(user, 200, res);
});

exports.updateUserbyinvitation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateUserbyinvitation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating user by invitation for ID: ${req.body.id}`, constants.LOG_TYPES.TRACE);

  const user = await User.findById(req.body.id);
  websocketHandler.sendLog(req, `Fetched user: ${user?._id || 'not found'}`, constants.LOG_TYPES.TRACE);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.address = req.body.passwordConfirm; // Note: This is unchanged as per original code
  user.jobTitle = req.body.jobTitle;
  user.city = req.body.city;
  user.state = req.body.state;
  user.country = req.body.country;
  user.pincode = req.body.pincode;
  user.phone = req.body.phone;
  user.extraDetails = req.body.extraDetails;
  await user.save();
  websocketHandler.sendLog(req, `User updated: ${user._id}`, constants.LOG_TYPES.INFO);

  createAndSendToken(user, 200, res);
});

exports.addRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addRole', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Adding role: ${req.body.name} for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const newRole = await Role.create({
    Name: req.body.name,
    company: req.cookies.companyId,
    active: true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())
  });
  websocketHandler.sendLog(req, `Role created: ${newRole._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      Role: newRole
    }
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteRole', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting role with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const user = await User.find({}).where('role').equals(req.params.id);
  websocketHandler.sendLog(req, `Checked users with role: ${req.params.id}, found: ${user.length}`, constants.LOG_TYPES.DEBUG);
  if (user.length > 0) {
    websocketHandler.sendLog(req, `Role ${req.params.id} is in use`, constants.LOG_TYPES.ERROR);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('auth.roleInUse')
    });
  }
  const document = await Role.findByIdAndDelete(req.params.id);
  if (!document) {
    websocketHandler.sendLog(req, `Role not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.roleNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Role deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.updateRole = factory.updateOne(Role);

exports.getRole = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRole', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching role with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const role = await Role.find({}).where('_id').equals(req.params.id);
  if (!role) {
    websocketHandler.sendLog(req, `Role not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.roleNotFound'), 403));
  }
  websocketHandler.sendLog(req, `Role retrieved: ${role[0]?._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: role
  });
});

exports.getRoles = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRoles', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching roles for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const roles = await Role.find({}).where('company').equals(req.cookies.companyId);
  if (!roles) {
    websocketHandler.sendLog(req, `No roles found for company: ${req.cookies.companyId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.roleNotFound'), 403));
  }
  websocketHandler.sendLog(req, `Retrieved ${roles.length} roles`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: roles
  });
});

exports.addSubordinate = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addSubordinate', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Adding subordinate ${req.body.subordinateUserId} to user: ${req.body.userId}`, constants.LOG_TYPES.TRACE);

  const userSubordinates = await userSubordinate.find({}).where('userId').equals(req.body.userId).where('subordinateUserId').equals(req.body.subordinateUserId);
  if (userSubordinates.length > 0) {
    websocketHandler.sendLog(req, `Subordinate already exists for user: ${req.body.userId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.subordinateExists'), 403));
  } else {
    const subordinate = await userSubordinate.create({
      userId: req.body.userId,
      subordinateUserId: req.body.subordinateUserId,
      modifiedOn: new Date(Date.now()),
      modifiedBy: req.cookies.userId
    });
    websocketHandler.sendLog(req, `Subordinate created: ${subordinate._id}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: subordinate
    });
  }
});

exports.getSubordinates = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getSubordinates', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching subordinates for user: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const ids = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(req.params.id);
  websocketHandler.sendLog(req, `Fetched ${ids.length} subordinate IDs`, constants.LOG_TYPES.DEBUG);

  const activeUsers = await User.find({
    _id: { $in: ids },
    active: true
  });
  const activeUserIds = activeUsers.map(user => user._id);
  websocketHandler.sendLog(req, `Retrieved ${activeUserIds.length} active subordinates`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: activeUserIds
  });
});

exports.deleteSubordinates = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteSubordinates', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting subordinate ${req.params.subordinateUserId} for user: ${req.params.userId}`, constants.LOG_TYPES.TRACE);

  userSubordinate.deleteOne({ userId: req.params.userId, subordinateUserId: req.params.subordinateUserId }, function (err) {
    if (err) {
      websocketHandler.sendLog(req, `Error deleting subordinate: ${err.message}`, constants.LOG_TYPES.ERROR);
      console.log(err);
    }
    websocketHandler.sendLog(req, `Subordinate deleted successfully`, constants.LOG_TYPES.INFO);
    console.log("Successful deletion");
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: ''
  });
});

exports.getRolePermission = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getRolePermission', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching role permission with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const rolePermission = await RolePermission.find({}).where('_id').equals(req.params.id);
  if (!rolePermission) {
    websocketHandler.sendLog(req, `Role permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.getRolePermissionFailure'), 403));
  }
  websocketHandler.sendLog(req, `Role permission retrieved: ${rolePermission[0]?._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermission
  });
});

exports.getAllRolePermissions = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllRolePermissions', constants.LOG_TYPES.INFO);

  const rolePermissions = await RolePermission.find({});
  websocketHandler.sendLog(req, `Retrieved ${rolePermissions.length} role permissions`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermissions
  });
});

exports.createRolePermission = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createRolePermission', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Creating role permission for role: ${req.body.roleId}, permission: ${req.body.permissionId}`, constants.LOG_TYPES.TRACE);

  const rolePermissionexists = await RolePermission.find({}).where('permissionId').equals(req.body.permissionId).where('roleId').equals(req.body.roleId);
  if (rolePermissionexists.length > 0) {
    websocketHandler.sendLog(req, `Role permission already exists for role: ${req.body.roleId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.rolePermissionExists'), 403));
  } else {
    const rolePermission = await RolePermission.create({
      roleId: req.body.roleId,
      permissionId: req.body.permissionId,
      company: req.cookies.companyId
    });
    websocketHandler.sendLog(req, `Role permission created: ${rolePermission._id}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: rolePermission
    });
  }
});

exports.updateRolePermission = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateRolePermission', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating role permission with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const rolePermissionexists = await RolePermission.find({}).where('permissionId').equals(req.body.permissionId).where('roleId').equals(req.body.roleId);
  if (rolePermissionexists.length > 0) {
    websocketHandler.sendLog(req, `Role permission already exists for role: ${req.body.roleId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.rolePermissionExists'), 403));
  } else {
    const rolePermission = await RolePermission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!rolePermission) {
      websocketHandler.sendLog(req, `Role permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('auth.deleteRolePermissionFailure'), 404));
    }
    websocketHandler.sendLog(req, `Role permission updated: ${rolePermission._id}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: rolePermission
    });
  }
});

exports.deleteRolePermission = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteRolePermission', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting role permission with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const rolePermission = await RolePermission.findByIdAndDelete(req.params.id);
  if (!rolePermission) {
    websocketHandler.sendLog(req, `Role permission not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('auth.deleteRolePermissionFailure'), 404));
  }
  websocketHandler.sendLog(req, `Role permission deleted: ${rolePermission._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermission
  });
});