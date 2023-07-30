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
const signToken = async (id) => {
   return jwt.sign({ id },process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = async (user, statusCode, res) => {  
  const token = await signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 
    ),
    httpOnly: true
  };    
  if (process.env.NODE_ENV === 'production')
  {
      res.cookie('companyId', user.company.id, {
        secure: true,
        sameSite: 'none'
      });
      res.cookie('userId', user._id, {
        secure: true,
        sameSite: 'none'
      });
  }
  else
  {
    res.cookie('companyId', user.company.id);
    res.cookie('userId', user._id);
  }
  // In production save cookie only in https connection
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async(req, res, next) => { 

  const company = await Company.findOne({_id:req.body.companyId});
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,    
    role: req.body.role,   
    isSuperAdmin: false,
    company:company,
    status:"Active",   
    active:true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())    
  }); 
  createAndSendToken(newUser, 201, res);
});

exports.webSignup = catchAsync(async(req, res, next) => {
  var company = await Company.findOne({companyName:req.body.companyName});
 
  if(company === null){
    console.log("Company Not Exsists");
    company = await Company.create({
    companyName: req.body.companyName,
    contactPerson: req.body.firstName + " "+ req.body.lastName,
    email: req.body.email,      
    active:true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())    
  }); 

    var companyId = process.env.DEFAULT_COMPANY_Id;
    const rolesToDuplicate = await Role.find({ company: companyId });
    // Step 3: Create new records by cloning and assigning a new id
    const duplicatedRoles= rolesToDuplicate.map((record) => {
      // Create a new object with the same properties as the original record
      const duplicatedRole = Object.assign({}, record.toObject());
      duplicatedRole._id = new mongoose.Types.ObjectId();
      // Assign a new id to the duplicated record (you can generate new id as you like)
      duplicatedRole.company = company._id; // For example, assigning a new id of 2 to the duplicated records
      return duplicatedRole;
      console.log(duplicatedRole);
  
    });
     // Step 4: Save the duplicated records back to the database
        await Role.insertMany(duplicatedRoles);

    const taskStatusToDuplicate = await TaskStatus.find({ company: companyId });
    // Step 3: Create new records by cloning and assigning a new id
    const duplicatedTaskStatusList = taskStatusToDuplicate.map((record) => {
      // Create a new object with the same properties as the original record
      const duplicatedTaskStatus= Object.assign({}, record.toObject());
      duplicatedTaskStatus._id = new mongoose.Types.ObjectId();
   
      // Assign a new id to the duplicated record (you can generate new id as you like)
      duplicatedTaskStatus.company = company._id; // For example, assigning a new id of 2 to the duplicated records
      return duplicatedTaskStatus;
    });
    // Step 4: Save the duplicated records back to the database
        await TaskStatus.insertMany(duplicatedTaskStatusList);
      
        const taskPriorityToDuplicate = await TaskPriority.find({ company: companyId });
        // Step 3: Create new records by cloning and assigning a new id
        const duplicatedTaskPriorityList = taskPriorityToDuplicate.map((record) => {
          // Create a new object with the same properties as the original record
          const duplicatedTaskPriority  = Object.assign({}, record.toObject());
          // Assign a new id to the duplicated record (you can generate new id as you like)
          duplicatedTaskPriority.company = company._id; // For example, assigning a new id of 2 to the duplicated records
          duplicatedTaskPriority._id = new mongoose.Types.ObjectId();
          return duplicatedTaskPriority;
        });
        await TaskPriority.insertMany(duplicatedTaskPriorityList);
  
  }
  const roles = await Role.find({ company: company._id });
  console.log(roles);
  const role = await Role.findOne({
    company: company._id,
    Name: "Admin"
  });
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,    
    role: role.id,   
    isSuperAdmin: false,
    company:company.id,
    status:"Active",
    active:true,
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now())
  }); 
  if(newUser)
  {
  const resetURL = `${req.protocol}://${process.env.WEBSITE_DOMAIN}/updateuser/${newUser._id}`;
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Update Your Profile").where('company').equals(req.cookies.companyId); 

  const template = emailTemplate.contentData; 
  const message = template
  .replace("{firstName}", newUser.firstName)
  .replace("{url}", resetURL)
  .replace("{lastName}", newUser.lastName);
     try {
      await sendEmail({
        email: newUser.email,
        subject: emailTemplate.subject,
        message
      });
      res.status(200).json({
        status: 'success',
        message: 'update profile link sent to email!'
      });
    } catch (err) {   
      return next(
        new AppError(
          'There was an error sending the email. Try again later.',
          500
        )
    );
   }
  createAndSendToken(newUser, 201, res);
  }

});
exports.CreateUser = catchAsync(async(req, res, next) => {      
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    phone: req.body.phone,
    isSuperAdmin: false,
    status:"Active",
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
    company: req.cookies.companyId
  }); 
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${process.env.WEBSITE_DOMAIN}/updateuser/${newUser._id}`;
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Update Your Profile").where('company').equals(req.cookies.companyId); 

  const template = emailTemplate.contentData; 
  const message = template
  .replace("{firstName}", newUser.firstName)
  .replace("{url}", resetURL)
  .replace("{lastName}", newUser.lastName); try {
    await sendEmail({
      email: newUser.email,
      subject: emailTemplate.subject,
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'update profile link sent to email!'
    });
  } catch (err) {   
    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500
      )
    );
  }
  createAndSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError(`Email or password not specified.`, 400));
  }
  // 2) Check if user exitsts && password is correct
  // Password is hidden for selection (select: false)
  // So we need to explicitly select it here
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password.`, 401));
  }
  
   // 3) If everything ok, send token to client
  createAndSendToken(user, 200, res);
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
      new AppError('You are not logged in! Please log in to get access.', 401)
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
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );

  // 4) Check if user changed password after the token was issued
  // iat stands for issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }
  // Grant access to protected route
  req.user = currentUser;  
  next();
});

// Authorization
// IMPORTANT: We can use closure if we want to pass parameter to a function but
// do not run it.
// exports.restrictTo = (...roles) => {
//   console.log('calling restrictTo');
//   return (req, res, next) => {
//     // roles ['admin', 'lead-guide'] role='user'
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action', 403)
//       );
//     }

//     next();
//   };
// };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  
  // Deactivate all validators - thanks to it, we don't have to specify email
  await user.save({ validateBeforeSave: false });


  // 3) Send it to user's email
  const resetURL = `${process.env.WEBSITE_DOMAIN}/#/resetPassword/${resetToken}`;  
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals("Forgot Password").where('company').equals(req.cookies.companyId); 

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
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500
      )
    );
  }
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
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // It is set every time that password property changes

  // 4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});
exports.sendLog = catchAsync(async (req, res, next) => {
 
  // Thanks to merging params in routers      
  // Generate query based on request params
  const managerIds = await userSubordinate.find({}).distinct("userId");  
  if(managerIds)
      {
          for(var i = 0; i < managerIds.length; i++) 
          {
            const managerTeamsIds = await userSubordinate.find({}).distinct("subordinateUserId").where('userId').equals(managerIds[i]);      
            if(managerTeamsIds)
            {
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
 
  const userListmy = await User.find({}).where("status").equals("Active");  
  const userList = await User.find({}).where("email").equals("sapana@arsteg.com");  
   
  if(userList)
  {
    for(var i = 0; i < userList.length; i++) {
     try {
      const timeLogs = await TimeLog.find({}).where('user').equals(userList[i].email).where('date').equals("2023-01-04");       
      for (const timeLog of timeLogs) {       
          timeLog.startTime = timeLog.startTime.getHours();        
          } 
       console.log(timeLogs);
       await sendEmailLog({
          email: userList[i].email,
          subject: 'Tracker Log',
        data: {
        name: userList[i].firstName+" "+userList[i].lastName,
        total: '0.00',
        logs:timeLogs,
        managerName:userList[i].firstName+" "+userList[i].lastName
        },
        htmlPath: "home.pug"
        }).then(() => {
        console.log('Email has been sent!');
        }).catch((error) => {
       console.log(error);
        })  
    } catch (err) {   
      return next(
        new AppError(
          'There was an error sending the email. Try again later.',
          500
        )
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
    return next(new AppError('Your current password is wrong.', 401));
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
  user.address= req.body.passwordConfirm;
  user.jobTitle=req.body.jobTitle;
  user.city=req.body.city;
  user.state=req.body.state;
  user.country=req.body.country;
  user.pincode=req.body.pincode;
  user.phone=req.body.phone;
  user.extraDetails=req.body.extraDetails;
  await user.save();
  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});


exports.addRole = catchAsync(async (req, res, next) => {
  
  
  const newRole = await Role.create({    
    Name:req.body.name,
    company:req.cookies.companyId,
    active:true,   
    createdOn: new Date(Date.now()),
    updatedOn: new Date(Date.now()) 
});  
res.status(200).json({
  status: 'success',
  data: {
    Role:newRole
  }
}); 
});

exports.deleteRole = catchAsync(async (req, res, next) => {  
  const document = await Role.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateRole = factory.updateOne(Role);

exports.getRole = catchAsync(async (req, res, next) => {       
  const role = await Role.find({}).where('_id').equals(req.params.id);   
  if (!role) {
    return next(new AppError('No role found', 403));
  }  
  res.status(200).json({
    status: 'success',
    data: role
  });  
 });

exports.getRoles = catchAsync(async (req, res, next) => {    
  const roles = await Role.find({});  
  if (!roles) {
    return next(new AppError('No role found', 403));
  }
  res.status(201).json({
    status: 'success',
    data: roles
  });   
 });
 
exports.addSubordinate = catchAsync(async (req, res, next) => {    
  
  const userSubordinates = await userSubordinate.find({}).where('userId').equals(req.body.userId).where('subordinateUserId').equals(req.body.subordinateUserId);  
  
  if (userSubordinates.length>0) {
    return next(new AppError('User subordinate already exists.', 403));
  }
  else{    
    const subordinate = await userSubordinate.create({
      userId:req.body.userId,
      subordinateUserId:req.body.subordinateUserId,
      modifiedOn : new Date(Date.now()),
      modifiedBy :  req.cookies.userId
    }); 

    res.status(201).json({
      status: 'success',
      data: subordinate
    });    
  }});

 exports.getSubordinates = catchAsync(async (req, res, next) => {  
  const ids = await userSubordinate.find({}).distinct("subordinateUserId").where('userId' ).equals(req.params.id);   
    res.status(201).json({
      status: 'success',
      data: ids
    });    
 });

 exports.deleteSubordinates = catchAsync(async (req, res, next) => {  
   userSubordinate.deleteOne({userId:req.params.userId,subordinateUserId:req.params.subordinateUserId}, function (err) {
    if(err) console.log(err);
    console.log("Successful deletion");
  });

    res.status(201).json({
      status: 'success',
      data: ''
    });    
 });
 //#region Role Permissions
 exports.getRolePermission = catchAsync(async (req, res, next) => {
  const rolePermission = await RolePermission.find({}).where('_id').equals(req.params.id);  
  
  if (!rolePermission) {
    return next(new AppError('No Role Permission found', 403));
  }  
  res.status(201).json({
    status: 'success',
    data: rolePermission
  });    
});

exports.getAllRolePermissions = catchAsync(async (req, res, next) => {
  console.log('getAllRolePermissions called');
  const rolePermissions = await RolePermission.find({});   
  res.status(201).json({
    status: 'success',
    data: rolePermissions
  });    
});

exports.createRolePermission = catchAsync(async (req, res, next) => {  
  console.log('createRolePermission called');
  const rolePermissionexists = await RolePermission.find({}).where('permissionId').equals(req.body.permissionId).where('roleId').equals(req.body.roleId);  
  
  if (rolePermissionexists.length>0) {
    return next(new AppError('Role Permission already exists.', 403));
  }
  else{    
    const rolePermission = await RolePermission.create({
      roleId:req.body.roleId,
      permissionId : req.body.permissionId,
      company : req.cookies.companyId
    });
    res.status(201).json({
      status: 'success',
      data: rolePermission
    }); 
  }
    
});

exports.updateRolePermission = catchAsync(async (req, res, next) => {
  const rolePermissionexists = await RolePermission.find({}).where('permissionId').equals(req.body.permissionId).where('roleId').equals(req.body.roleId);  
  
  if (rolePermissionexists.length>0) {
    return next(new AppError('Role Permission already exists.', 403));
  }
  else{ 
  const rolePermission = await RolePermission.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!rolePermission) {
    return next(new AppError('No Role Permission found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: rolePermission
  }); 
}   
});

exports.deleteRolePermission = catchAsync(async (req, res, next) => {  
  console.log(req.params.id);
  const rolePermission = await RolePermission.findByIdAndDelete(req.params.id);
  if (!rolePermission) {
    return next(new AppError('No Role Permission found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: rolePermission
  });    
});

 //#endregion