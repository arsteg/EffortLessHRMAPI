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
const AttendanceMode = require('../models/attendance/attendanceMode');
const UserRole = require('../models/permissions/userRoleModel');
const FixedAllowances = require("../models/Payroll/fixedAllowancesModel");
const fs = require('fs');
const path = require('path');
const Permission = require('../models/permissions/permissionModel');
const { SendUINotification } = require('../utils/uiNotificationSender');
const eventNotificationType = require('../models/eventNotification/eventNotificationType.js');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
  headers: {
    "X-Razorpay-Account": process.env.RAZORPAY_MERCHANT || "PWAQUL4NNnybvx"
  }
});
const { logUserAction } = require('./userController');

const signToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = async (user, statusCode, res, req, next) => {
  try {
    const token = await signToken(user._id);

    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60),
      httpOnly: true
    };

    if (['production', 'development', 'test'].includes(process.env.NODE_ENV)) {
      cookieOptions.secure = true;
      res.cookie('companyId', user.company.id, { secure: true, sameSite: 'none' });
      res.cookie('userId', user._id, { secure: true, sameSite: 'none' });
      res.cookie('companyName', user.company.companyName, { secure: true, sameSite: 'none' });
    } else {
      res.cookie('companyId', user.company.id);
      res.cookie('userId', user._id);
      res.cookie('companyName', user.company.companyName);
    }

    user.password = undefined;
    let companySubscription = null;
    const companyDetails = await Company.findById(user.company.id);
    //use test card do not use freecompany
    //if (!companyDetails.freeCompany) {
    companySubscription = await checkCompanySubscription(user, req);
    //}
    res.status(statusCode).json({
      status: constants.APIResponseStatus.Success,
      token,
      data: {
        user,
        companySubscription
      }
    });

  } catch (error) {
    const message = typeof req?.t === 'function'
      ? req.t('auth.noSubscription')
      : 'Your company does not have a valid subscription.';
    throw new AppError(error.description || message, 403);
  }
};

// const checkCompanySubscription = async (user, req) => {
//   const subscriptions = await Subscription.find({
//     companyId: user.company.id,
//     "razorpaySubscription.status": { $in: constants.Active_Subscription }
//   }).populate("currentPlanId");

//   const activeSubscription = subscriptions.find((item) =>
//     item.razorpaySubscription.status === 'active'
//   );

//   if (activeSubscription) {
//     const companySubscription = activeSubscription.razorpaySubscription;
//     const addOns = await razorpay.addons.all({
//       subscription_id: companySubscription.id
//     });
//     companySubscription.addOns = addOns.items;
//     return companySubscription;
//   } else if (subscriptions.length > 0) {
//     const fallback = await razorpay.subscriptions.fetch(subscriptions[0].subscriptionId);
//     return fallback;
//   } else {
//     return {
//         id: null,
//         companyId: user.company.id,
//         status: "",
//         currentPlanId: null,
//         addOns: [],
//         pendingUpdates: [],
//         scheduledChanges: null,
//       };
//     // const message = typeof req?.t === 'function'
//     //   ? req.t('auth.noSubscription')
//     //   : 'Your company does not have a valid subscription.';

//     // throw new AppError(message, 403);
//   }
// };

const checkCompanySubscription = async (user, req) => {
  try {
    if (!user?.company?.id) {
      return getSafeSubscription(user); // helper for null response
    }
    const subscriptions = await Subscription.find({
      companyId: user.company.id,
      "razorpaySubscription.status": { $in: constants.Active_Subscription }
    }).populate("currentPlanId");

    if (!subscriptions || subscriptions.length === 0) {
      return getSafeSubscription(user);
    }

    const activeSubscription = subscriptions.find((item) =>
      item.razorpaySubscription.status === 'active'
    );

    if (activeSubscription) {
      const companySubscription = activeSubscription.razorpaySubscription;
      if (!companySubscription?.id) {
        console.error('Error: companySubscription.id is undefined or null');
        return {
          ...companySubscription,
          addOns: [],
        };
      }

      try {
        const addOns = await razorpay.addons.all({
          subscription_id: companySubscription.id
        });
        companySubscription.addOns = addOns.items || [];
        return companySubscription;
      } catch (error) {
        companySubscription.addOns = [];
        return companySubscription;
      }
    } else if (subscriptions.length > 0) {
      const fallback = await razorpay.subscriptions.fetch(subscriptions[0].subscriptionId);
      return fallback;
    } else {
      return getSafeSubscription(user);
    }
  } catch (error) {
    console.error("checkCompanySubscription error:", error);
    return getSafeSubscription(user);
  }
};

const getSafeSubscription = (user) => {
  return {
    id: null,
    companyId: user?.company?.id || null,
    status: "",
    currentPlanId: null,
    addOns: [],
    pendingUpdates: [],
    scheduledChanges: null,
  };
}

exports.signup = catchAsync(async (req, res, next) => {

  const company = await Company.findOne({ _id: req.body.companyId });
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
  createAndSendToken(newUser, 201, res);
});

exports.webSignup = catchAsync(async (req, res, next) => {
  const { companyName, firstName, lastName, email, password, passwordConfirm } = req.body;

  if (!email) {
    return next(
      new AppError(
        req.t('auth.emailRequired') || 'Email is required.',
        400
      )
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError(
        req.t('auth.emailExistsForUser'),
        400
      )
    );
  }
  const existingCompany = await Company.findOne({ companyName });
  const isNewCompany = !existingCompany;
  let company = existingCompany;
  let newUser = null;
  // 1. Create company if it doesn't exist
  if (!existingCompany) {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return next(
        new AppError(
          req.t('auth.emailExistsForComapny'),
          400
        )
      );
    }
    company = await Company.create({
      companyName,
      contactPerson: `${firstName} ${lastName}`,
      email,
      active: true,
      createdOn: new Date(),
      updatedOn: new Date()
    });
    try {
      // 2. Duplicate master data
      await seedCompanyData(company._id);
    }
    catch (err) {
      return next(err);
    }
    try {
      await seedIncomeTaxComponents(company._id);
    }
    catch (err) {
      return next(err);
    }

    // 3. Seed role permissions
    await seedRolePermissions(company);
  }

  // 4. Get role
  const roleName = isNewCompany ? 'Admin' : 'User';
  const role = await Role.findOne({ company: company._id, Name: roleName });

  if (!role) {
    return next(new AppError(req.t('auth.roleNotFound') || 'User role could not be found.', 500));
  }
  try {

    // 5. Create user
    newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role: role.id,
      isSuperAdmin: false,
      company: company.id,
      status: constants.User_Status.Active,
      active: true,
      createdOn: new Date(),
      updatedOn: new Date()
    });

    // 6. Create appointment record
    if (newUser) {
      try {
        await Appointment.create({
          user: newUser._id,
          salaryTypePaid: '',
          joiningDate: null,
          confirmationDate: null,
          company: company.id
        });
      } catch (err) {
        return next(
          new AppError(
            req.t('auth.appointmentCreateError') || 'Could not create appointment record for the new user.',
            500
          )
        );
      }
    }
  }
  catch (err) {
    return next(
      new AppError(
        req.t('auth.userCreateError') || 'Could not create user record for the new user.',
        500
      )
    );
  }

  // 7. Send welcome/update profile email
  try {
    const resetURL = `${process.env.WEBSITE_DOMAIN}/#/home/profile/employee-profile`;
    const emailTemplate = await EmailTemplate.findOne({
      Name: constants.Email_template_constant.UPDATE_PROFILE,
      company: company.id
    });
    console.log(newUser);
    if (emailTemplate) {
      const message = emailTemplate.contentData
        .replace("{firstName}", newUser.firstName)
        .replace("{lastName}", newUser.lastName)
        .replaceAll("{company}", req.cookies.companyName)
        .replace("{url}", resetURL);

      await sendEmail({
        email: newUser.email,
        subject: emailTemplate.subject,
        message
      });
    }
  } catch (err) {
    console.log(err.message);
    return next(new AppError(req.t('auth.emailSendError') || 'Failed to send welcome email.', 500));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      User: newUser
    }
  });
  // 8. Send auth token response
  // return createAndSendToken(newUser, 201, res);  

});

async function seedCompanyData(newCompanyId, req, next) {
  const seedFiles = [
    { model: Role, file: 'Role.json' },
    { model: EmailTemplate, file: 'EmailTemplate.json' },
    { model: IncomeTaxSection, file: 'IncomeTaxSection.json' },
    { model: TaskPriority, file: 'TaskPriority.json' },
    { model: AttendanceMode, file: 'AttendanceMode.json' },
    { model: eventNotificationType, file: 'EventNotificationType.json' },
    { model: FixedAllowances, file: 'fixedAllowancesModel.json' },
    { model: TaskStatus, file: 'TaskStatus.json' }
  ];

  for (const { model, file } of seedFiles) {
    const filePath = path.join(__dirname, '..', 'config', file);
    let data;

    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`Unable to read/parse ${file}:`, err);
      // Immediately return error up the chain
      throw new AppError(`Failed to load configuration for ${file}`,
        500
      );
    }

    // Prepare docs
    const docs = data.map(d => ({
      ...d,
      company: newCompanyId,
      createdOn: new Date(),
      updatedOn: new Date()
    }));

    try {
      const result = await model.insertMany(docs);
      console.log(`Seeded ${model.modelName} (${result.length} docs)`);
    } catch (err) {
      console.error(`Insert failure for ${file}:`, err);
      // Return upstream if one seeding fails
      throw new AppError(`Failed to seed ${model.modelName}`,
        500
      );
    }
  }

  // If all files succeeded
  console.log('All seed data inserted successfully');
}

async function seedIncomeTaxComponents(newCompanyId, req, next) {
  const filePath = path.join(__dirname, '..', 'config', 'IncomeTaxComponant.json');
  let data;

  // 1️⃣ Load and parse JSON file
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Failed to read or parse IncomeTaxComponant.json: ${err.message}`);
    throw new AppError('Failed to load tax components file', 500);
  }

  // 2️⃣ Load sections for mapping
  let sections;
  try {
    sections = await IncomeTaxSection.find({ company: newCompanyId });
  } catch (err) {
    console.error(`Failed to fetch IncomeTaxSection for company ${newCompanyId}: ${err.message}`);
    throw new AppError('Failed to query tax sections', 500);
  }
  const sectionMap = Object.fromEntries(sections.map(s => [s.section, s._id]));

  // 3️⃣ Build component docs
  const promiseDocs = data.map(async item => {
    const sectionId = sectionMap[item.section];
    if (!sectionId) {
      console.error(`Section missing for "${item.section}"`);
      return null;
    }
    return {
      componantName: item.componantName,
      section: sectionId,
      maximumAmount: item.maximumAmount,
      order: item.order,
      company: newCompanyId
    };
  });

  const resolved = await Promise.all(promiseDocs);
  const validDocs = resolved.filter(d => d);

  // 4️⃣ Insert documents or handle error
  if (validDocs.length) {
    try {
      const result = await IncomeTaxComponant.insertMany(validDocs);
      console.log(`Seeded ${result.length} tax components.`);
    } catch (err) {
      console.error(`Failed to insert tax components: ${err.message}`);
      throw new AppError('Failed to seed tax components', 500);
    }
  } else {
    console.log('No valid tax components to insert.');
  }
}

exports.CreateUser = catchAsync(async (req, res, next) => {
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
    if (subscription?.currentPlanId?.users <= activeUsers) {
      return next(new AppError(req.t('auth.userLimitReached', { userLimit: subscription?.currentPlanId?.users }), 500))
    }
    //Trial user limit
    const companyDetails = await Company.findById(req.cookies.companyId);

    if (companyDetails?.isTrial) {
      if (companyDetails?.trialUserLimit <= activeUsers) {
        return next(new AppError(req.t('auth.trialUserLimitReached', { userLimit: companyDetails?.trialUserLimit }), 500))
      }
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
    const newAppointment = new Appointment({
      user: newUser._id,   // Linking the user with the attendance record
      salaryTypePaid: '',
      joiningDate: null,
      confirmationDate: null,
      // Add other necessary fields here as empty or default values
      company: req.cookies.companyId,
    });
    await newAppointment.save();
    newUser.appointment = newAppointment

    // 3) Send it to user's email
    const resetURL = `${process.env.WEBSITE_DOMAIN}/#/home/profile/employee-profile`;
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
      } catch (err) {
        return next(
          new AppError(req.t('auth.emailSendError'), 500)
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
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        User: newUser
      }
    });
  }
  catch (err) {
    console.log(err);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      error: err
    })
  }
  // createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(req.t('auth.emailOrPasswordNotSpecified'), 400));
  }
  const user = await User.findOne({
    email,
    status: constants.User_Status.Active
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(req.t('auth.incorrectEmailOrPassword'), 401));
  }
  const appointments = await Appointment.find({ user: user._id });
  user.appointment = appointments;
  const userObj = user.toObject();
  const company = await Company.findById(user.company.id);
  if (company && company.isTrial) {
    const trialStart = company.createdOn;
    const trialDays = company.trialPeriodDays || 30;
    const trialEnd = new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    const trialEndDate = new Date(trialEnd.getFullYear(), trialEnd.getMonth(), trialEnd.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (nowDate > trialEndDate) {
      company.isTrial = false;
      await company.save();
      userObj.trialInfo = {
        isTrial: false,
        trialEndsOn: trialEndDate,
        daysLeft: 0
      };
    } else {
      userObj.trialInfo = {
        isTrial: true,
        trialEndsOn: trialEndDate,
        daysLeft: Math.ceil((trialEndDate - nowDate) / (1000 * 60 * 60 * 24))
      };
    }
  } else if (company) {
    const trialStart = company.createdOn;
    const trialDays = company.trialPeriodDays || 30;
    const trialEnd = new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);
    userObj.trialInfo = {
      isTrial: false,
      trialEndsOn: trialEnd,
      daysLeft: 0
    };
  }
  // ✅ Send token and check subscription
  await createAndSendToken(userObj, 200, res, req, next);
});

// Authentication
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it's there
  // It is a standard to send header in this format
  // Key: Authorization
  // Value: Bearer <TOKEN_VALUE>
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token wasn't specified throw an error
  if (!token) {
    return next(
      new AppError(req.t('auth.notLoggedIn'), 401)
    );
  }

  // 2) Token verification
  // jwt.verify(token, process.env.JWT_SECRET) takes in a callback
  // In order to not brake our async await way to deal with async code
  // We can transform it into a promise using promisify from util pckg
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(req.t('auth.userNotExist'), 401)
    );

  // 4) Check if user changed password after the token was issued
  // iat stands for issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(req.t('auth.passwordChanged'), 401)
    );
  }
  // Grant access to protected route
  const subscription = await Subscription.findOne({
    $and: [{
      companyId: currentUser.company.id,
      'razorpaySubscription.status': { $in: constants.Active_Subscription }
    }]
  });


  if (!subscription) {
    const companyDetails = await Company.findById(currentUser.company._id);

    if (companyDetails.isTrial) {
      const trialStart = companyDetails.createdOn;
      const trialDays = companyDetails.trialPeriodDays || 30;
      const trialEnd = new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      const trialEndDate = new Date(trialEnd.getFullYear(), trialEnd.getMonth(), trialEnd.getDate());
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (nowDate <= trialEndDate) {
        req.user = currentUser;
        return next();
      } else {
        companyDetails.isTrial = false;
        await companyDetails.save();
      }
    }

    if (!companyDetails.freeCompany) {
      return next(
        new AppError(req.t('auth.subscriptionInactive'), 401).sendErrorJson(res)
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.protectUnsubscribed = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it's there
  // It is a standard to send header in this format
  // Key: Authorization
  // Value: Bearer <TOKEN_VALUE>
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If token wasn't specified throw an error
  if (!token) {
    return next(
      new AppError(req.t('auth.notLoggedIn'), 401)
    );
  }

  // 2) Token verification
  // jwt.verify(token, process.env.JWT_SECRET) takes in a callback
  // In order to not brake our async await way to deal with async code
  // We can transform it into a promise using promisify from util pckg
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(req.t('auth.userNotExist'), 401)
    );

  // 4) Check if user changed password after the token was issued
  // iat stands for issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(req.t('auth.passwordChanged'), 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['Admin', 'Super Admin']. 
    // The role might be a string or an object with a Name property depending on population
    const userRole = req.user.role?.Name || req.user.role;

    if (!roles.includes(userRole)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(200).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('auth.noAccountFound'),
      data: {
        user: null
      }
    });
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  // Deactivate all validators - thanks to it, we don't have to specify email
  await user.save({ validateBeforeSave: false });


  // 3) Send it to user's email
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

    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(req.t('auth.emailSendError'), 500)
      );
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) return next(new AppError(req.t('auth.tokenInvalidOrExpired'), 400)); // ✅ GOOD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // It is set every time that password property changes
  // 4) Log the user in, send JWT
  await createAndSendToken(user, 200, res);
});
exports.sendLog = catchAsync(async (req, res, next) => {

  // Thanks to merging params in routers      
  // Generate query based on request params
  const managerIds = await userSubordinate.find({}).distinct("userId");
  if (managerIds) {
    for (var i = 0; i < managerIds.length; i++) {
      const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(managerIds[i]);
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

  if (userList) {
    for (var i = 0; i < userList.length; i++) {
      try {
        const timeLogs = await TimeLog.find({}).where('user').equals(userList[i].email).where('date').equals("2023-01-04");
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
          console.log('Email has been sent!');
        }).catch((error) => {
          console.log(error);
        })
      } catch (err) {
        return next(
          new AppError(req.t('auth.emailSendError'), 500)
        )
      }

    }
  }
  // const timeLogs = await TimeLog.find({}).where('user').equals("sapana@arsteg.com").where('date').equals('2023-01-04');    


});
exports.updatePassword = catchAsync(async (req, res, next) => {

  // 1) Get user from collection
  const user = await User.findById(req.body.id).select('+password');
  // 2) Check if POSTed current password is correct 
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    new AppError(req.t('auth.currentPasswordWrong'), 401)
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});
exports.updateUserbyinvitation = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.body.id);
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.address = req.body.passwordConfirm;
  user.jobTitle = req.body.jobTitle;
  user.city = req.body.city;
  user.state = req.body.state;
  user.country = req.body.country;
  user.pincode = req.body.pincode;
  user.phone = req.body.phone;
  user.extraDetails = req.body.extraDetails;
  await user.save();
  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});


exports.addRole = catchAsync(async (req, res, next) => {


  const newRole = await Role.create({
    name: req.body.name,
    description: req.body.description,
    company: req.cookies.companyId,
    active: true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())
  });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      Role: newRole
    }
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  const user = await User.find({}).where('role').equals(req.params.id);
  if (user.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('auth.roleInUse'),
    });
  }
  const document = await Role.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError(req.t('auth.noDocumentFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.updateRole = async (req, res) => {
  console.log('[updateRole] Request received:', {
    params: req.params,
    body: req.body,
    headers: req.headers,
  });

  const { id } = req.params;
  const { name, description } = req.body;

  console.log('[updateRole] Extracted data:', { id, name, description });

  try {
    console.log('[updateRole] Attempting to update role with ID:', id);

    const role = await Role.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    console.log('[updateRole] Update result:', role);

    if (!role) {
      console.error('[updateRole] Error: Role not found with ID:', id);
      return res.status(404).json({ message: req.t('common.recordNotFound') });
    }

    console.log('[updateRole] Successfully updated role:', role);
    res.json(role);
  } catch (error) {
    console.error('[updateRole] Error:', {
      errorMessage: error.message,
      stack: error.stack,
      fullError: error,
    });

    res.status(500).json({ message: req.t('common.serverError') });
  }
};


exports.getRole = catchAsync(async (req, res, next) => {
  const role = await Role.find({}).where('_id').equals(req.params.id);
  if (!role) {
    return next(new AppError(req.t('auth.roleNotFound'), 403));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: role
  });
});

exports.getRoles = catchAsync(async (req, res, next) => {
  const roles = await Role.find({}).where('company').equals(req.cookies.companyId);
  if (!roles) {
    return next(new AppError(req.t('auth.noRoleFound'), 403));
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: roles
  });
});

exports.addSubordinate = catchAsync(async (req, res, next) => {

  const userSubordinates = await userSubordinate.find({}).where('userId').equals(req.body.userId).where('subordinateUserId').equals(req.body.subordinateUserId);

  if (userSubordinates.length > 0) {
    return next(new AppError(req.t('auth.userSubordinateExists'), 403));
  }
  else {
    const subordinate = await userSubordinate.create({
      userId: req.body.userId,
      subordinateUserId: req.body.subordinateUserId,
      modifiedOn: new Date(Date.now()),
      modifiedBy: req.cookies.userId
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: subordinate
    });
  }
});

exports.getSubordinates = catchAsync(async (req, res, next) => {
  const ids = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(req.params.id);

  const activeUsers = await User.find({
    _id: { $in: ids },
    active: true
  }).select('_id firstName lastName');

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: activeUsers
  });
});
exports.getManagers = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  if (!companyId) {
    return next(new AppError('Company ID is missing in cookies', 400));
  }

  const ids = await userSubordinate
    .find({ company: companyId })
    .distinct("userId");
  const activeUsers = await User.find({
    _id: { $in: ids },
    active: true,
    status: 'Active' || 'Resigned' || 'Terminated',
    company: companyId // <-- Add this to filter users by company too
  }).select('_id firstName lastName');

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: activeUsers
  });
});

exports.deleteSubordinates = catchAsync(async (req, res, next) => {
  userSubordinate.deleteOne({ userId: req.params.userId, subordinateUserId: req.params.subordinateUserId }, function (err) {
    if (err) console.log(err);
    console.log("Successful deletion");
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: ''
  });
});
//#region Role Permissions
exports.getRolePermission = catchAsync(async (req, res, next) => {
  const rolePermission = await RolePermission.find({}).where('_id').equals(req.params.id);

  if (!rolePermission) {
    return next(new AppError(req.t('auth.noRolePermissionFound'), 403));
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermission
  });
});

exports.getAllRolePermissions = catchAsync(async (req, res, next) => {
  const rolePermissions = await RolePermission.find({}).where('company').equals(req.cookies.companyId);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermissions
  });
});

exports.getPermissionsByRole = catchAsync(async (req, res, next) => {
  const roleName = req.query.roleName;
  if (!roleName) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.notFound')
    });
  }
  // Get the role by name
  const role = await Role.findOne({ name: roleName, company: req.cookies.companyId });
  if (!role) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('common.notFound')
    });
  }

  // Get role-permission mappings for the role
  const rolePermissions = await RolePermission.find({
    roleId: role._id,
    company: req.cookies.companyId
  }).populate('permissionId');

  // Extract permission names
  //const permissionNames = rolePermissions.map(rp => rp.permission.name);
  const permissionNames = rolePermissions
    .filter(rp => rp?.permissionId?.permissionName)  // Filter valid permissionIds
    .map(rp => rp.permissionId.permissionName);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: permissionNames
  });
});

exports.createRolePermission = catchAsync(async (req, res, next) => {
  const { roleId, permissionId } = req.body;
  const companyId = req.cookies.companyId;
  const rolePermissionexists = await RolePermission.findOne({
    company: companyId,
    roleId: roleId,
    permissionId: permissionId
  });

  if (rolePermissionexists) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "This role already has the selected permission assigned.",
    });
  }
  else {
    const rolePermission = await RolePermission.create({
      roleId: req.body.roleId,
      permissionId: req.body.permissionId,
      company: req.cookies.companyId
    });
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: rolePermission
    });
  }

});

exports.updateRolePermission = catchAsync(async (req, res, next) => {
  const rolePermissionExists = await RolePermission.find({
    _id: { $ne: req.params.id }, // Exclude the record being updated
    company: req.cookies.companyId,
    roleId: req.body.roleId,
    permissionId: req.body.permissionId
  });

  if (rolePermissionExists.length > 0) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "This role already has the selected permission assigned."
    });
  }

  const rolePermission = await RolePermission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!rolePermission) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "No role permission found with this ID."
    });
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermission
  });
});

exports.deleteRolePermission = catchAsync(async (req, res, next) => {
  const rolePermission = await RolePermission.findByIdAndDelete(req.params.id);
  if (!rolePermission) {
    return next(new AppError(req.t('auth.noRolePermissionFound'), 404));
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: rolePermission
  });
});


// Create UserRole
exports.createUserRole = catchAsync(async (req, res, next) => {
  const userRoleExists = await UserRole.find({
    userId: req.body.userId,
    company: req.cookies.companyId,
  });

  if (userRoleExists.length > 0) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "This user already has a role assigned."
    });
  }

  const userRole = await UserRole.create({
    userId: req.body.userId,
    roleId: req.body.roleId,
    company: req.cookies.companyId,
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
    createdOn: new Date(),
    updatedOn: new Date(),
  });

  const role = await Role.findById(req.body.roleId);
  SendUINotification(req.t('auth.roleAssignmentNotificationTitle'), req.t('auth.roleAssignmentNotificationMessage', { roleName: role.name }),
    constants.Event_Notification_Type_Status.role_assignment, req.body?.userId, req.cookies.companyId, req);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: userRole,
  });
});

// Get UserRole by ID
exports.getUserRole = catchAsync(async (req, res, next) => {
  const userRole = await UserRole.findById(req.params.id);

  if (!userRole) {
    return next(new AppError(req.t('auth.userRoleNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userRole,
  });
});

// Get All UserRoles
exports.getAllUserRoles = catchAsync(async (req, res, next) => {
  const userRoles = await UserRole.find({ company: req.cookies.companyId });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userRoles,
  });
});

// Update UserRole
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const userRoleExists = await UserRole.find({
    userId: req.body.userId,
    company: req.cookies.companyId,
    _id: { $ne: req.params.id },
  });

  if (userRoleExists.length > 0) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "This user already has a role assigned."
    });
  }

  const userRole = await UserRole.findByIdAndUpdate(
    req.params.id,
    {
      userId: req.body.userId,
      roleId: req.body.roleId,
      updatedBy: req.cookies.userId,
      updatedOn: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!userRole) {
    return res.status(409).json({
      status: constants.APIResponseStatus.Error,
      message: "User role not found with this ID."
    });
  }

  const role = await Role.findById(req.body.roleId);
  SendUINotification(req.t('auth.roleAssignmentNotificationTitle'), req.t('auth.roleAssignmentNotificationMessage', { roleName: role.name }),
    constants.Event_Notification_Type_Status.role_assignment, req.body?.userId?.toString(), req.cookies.companyId, req);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: userRole,
  });
});

// Delete UserRole
exports.deleteUserRole = catchAsync(async (req, res, next) => {
  const userRole = await UserRole.findByIdAndDelete(req.params.id);

  if (!userRole) {
    return next(new AppError(req.t('auth.userRoleNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

//#endregion

async function seedRolePermissions(company) {
  try {
    // Step 1: Read role-permission mappings from RolePermission.json
    const rolePermissionFilePath = path.join(__dirname, '../config/rolePermissions.json');
    const rolePermissionData = JSON.parse(fs.readFileSync(rolePermissionFilePath, 'utf-8'));

    // Step 2: Fetch all roles for the current company and map by name
    const roles = await Role.find({ company: company._id });
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role._id.toString();
    });

    // Step 3: Fetch all permissions and map by name
    const permissions = await Permission.find();
    const permissionMap = {};
    permissions.forEach(permission => {
      permissionMap[permission.permissionName] = permission._id.toString();
    });

    // Step 4: Prepare RolePermission entries
    const rolePermissionRecords = [];

    for (const roleEntry of rolePermissionData) {
      const roleId = roleMap[roleEntry.roleName];
      if (!roleId) {
        console.warn(`Role not found: ${roleEntry.roleName}`);
        continue;
      }

      for (const permissionName of roleEntry.permissions) {
        const permissionId = permissionMap[permissionName];
        if (!permissionId) {
          console.warn(`Permission not found: ${permissionName}`);
          continue;
        }

        rolePermissionRecords.push({
          roleId,
          permissionId,
          company: company._id,
          createdBy: null,
          updatedBy: null,
          createdOn: new Date(),
          updatedOn: new Date(),
        });
      }
    }

    // Step 5: Insert RolePermission entries
    if (rolePermissionRecords.length > 0) {
      await RolePermission.insertMany(rolePermissionRecords);
      console.log('RolePermissions seeded successfully.');
    } else {
      console.log('No RolePermissions to insert.');
    }
  } catch (error) {
    console.error('Error while seeding RolePermissions:', error);
  }
}