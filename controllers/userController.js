const User = require('../models/permissions/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const APIFeatures = require('../utils/apiFeatures');
const userSubordinate = require('../models/userSubordinateModel');
const ProjectUsers = require('../models/projectUserModel');
const TaskUsers = require('../models/taskUserModel');
const Projects = require('../models/projectModel');
const timeLog = require('../models/timeLog');
const BrowserHistory= require('../models/appsWebsites/browserHistory');
const Productivity = require('./../models/productivityModel');
const AppWebsite = require('./../models/commons/appWebsiteModel');
const ManualTimeRequest = require('../models/manualTime/manualTimeRequestModel');
const UserEmployment = require('../models/Employment/UserEmploymentModel');
const EmployeeSalaryDetails = require('../models/Employment/EmployeeSalaryDetailsModel');
const EmployeeTaxAndSalutaorySetting = require('../models/Employment/EmployeeSalaryTaxAndStatutorySettingModel.js');
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const IncomeTaxComponant = require("../models/Employment/IncomeTaxComponant");
const SalaryComponentFixedAllowance = require("../models/Employment/SalaryComponentFixedAllowanceModel");
const SalaryComponentOtherBenefits =  require("../models/Employment/SalaryComponentOtherBenefits");
const SalaryComponentEmployerContribution =  require("../models/Employment/SalaryComponentEmployerContribution");
const SalaryComponentFixedDeduction =  require("../models/Employment/SalaryComponentFixedDeduction");
const SalaryComponentVariableDeduction =  require("../models/Employment/SalaryComponentVariableDeduction");
const SalaryComponentPFCharge =  require("../models/Employment/SalaryComponentPFCharge");
const SalaryComponentVariableAllowance =  require("../models/Employment/SalaryComponentVariableAllowance");

const FixedAllowance = require('../models/Payroll/fixedAllowancesModel');
const OtherBenefits= require('../models/Payroll/otherBenefitsModels');
const FixedContribution = require('../models/Payroll/fixedContributionModel');
const FixedDeduction = require('../models/Payroll/fixedDeductionModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const VariableDeduction = require('../models/Payroll/variableDeductionModel');

const PFCharge = require('../models/Payroll/pfChargeModel');
const EmployeeLoanAdvance = require("../models/Employment/EmployeeLoanAdvanceModel.js");

const LoanAdvancesCategory = require("../models/Employment/EmployeeLoanAdvanceModel.js");

var mongoose = require('mongoose');
exports.getAllUsers = catchAsync(async (req, res, next) => {
    // To allow for nested GET revicews on tour (hack)
    let filter = { status: 'Active', company : req.cookies.companyId };
    // Thanks to merging params in routers      
    // Generate query based on request params
    const features = new APIFeatures(User.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // Run created query
    // .explain() to return more information
    // const document = await features.query.explain();
    const document = await features.query;  
    res.status(201).json({
      status: 'success',
      results: document.length,
      data: {
        data: document
      }
    });
  });

exports.deleteUser = catchAsync(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, { status: 'Deleted' });
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: document
    });
  });

exports.updateUser =  catchAsync(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // If not found - add new
      runValidators: true // Validate data
    });
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.getUser = catchAsync(async (req, res, next) => {       
  const users = await User.findById(req.body.id).where('status').equals('Active')
  res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  });  
});

exports.getUsersByCompany = catchAsync(async (req, res, next) => {    
  const users = await User.find({
    'status': { $ne: 'Deleted' },
    'company': req.params.companyId
  });
   res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  });  
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Loop through every property in an object
  Object.keys(obj).forEach(el => {
    // If property is inside allowed fields array
    // add copy current property to new object
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'You cannot update password using this route. Please use /updateMyPassword'
      )
    );

  // 2) Filter out unwanted body properties
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Reutrn updated object instead of old one
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { status: 'Deleted' });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
});

exports.getMe = (req, res, next) => {  
  req.params.id = req.user.id;
  req.query.status = 'Active'; 
  next();
};

exports.getUsers = catchAsync(async (req, res, next) => {
  var users = await User.find({'_id': {$in: req.body.userId }, 'status': { $ne: 'Deleted' }});  
  res.status(200).json({
    status: 'success',
    data: users
  });
});

exports.getUserManagers = catchAsync(async (req, res, next) => {    
  let managers =[]; 
  let list = await userSubordinate.distinct('userId').find({'subordinateUserId': {$in: req.params.id}});  
  for(let i=0;i<list.length;i++){
      let manager =  await User.findOne({'_id': {$in: list[i].userId}, 'status': { $ne: 'Deleted' }});  
      if(manager){
        managers.push({id:manager.id, name:`${manager?.firstName} ${manager?.lastName}`});
    }
  }
  res.status(200).json({
    status: 'success',
    data: managers
  });
});

exports.getUserProjects = catchAsync(async (req, res, next) => {
  let projects =[];
  let projectUsers = await ProjectUsers.find({}).where('user').equals(req.params.id);  
  for(let i =0; i<projectUsers.length;i++ ){  
    let user =  await User.findOne({'_id': {$in: projectUsers[i].user}, 'status': { $ne: 'Deleted' }});  
    if(user){    
       projects.push(projectUsers[i].project);
    }
  }
  res.status(200).json({
    status: 'success',
    data: projects
  });
});

exports.createUserEmployment = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  
  req.body.company = companyId;
  const userEmployment = await UserEmployment.create(req.body);
  res.status(201).json({
    status: 'success',
    data: userEmployment
  });
});

exports.getUserEmploymentByUser = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.find({}).where('user').equals(req.params.userId);
  if (!userEmployment) {
    return next(new AppError('UserEmployment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: userEmployment
  });
});

exports.getUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findById(req.params.id);
  if (!userEmployment) {
    return next(new AppError('UserEmployment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: userEmployment
  });
});

exports.updateUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!userEmployment) {
    return next(new AppError('UserEmployment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: userEmployment
  });
});

exports.deleteUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findByIdAndDelete(req.params.id);

  if (!userEmployment) {
    return next(new AppError('UserEmployment not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
async function checkUserExistence(criterion) {
  try {
    const user = await User.findOne(criterion);
    return user ? true : false;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
}

// controllers/employeeSalaryDetailsController.js
exports.createEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const criterion = { _id: req.body.user }; // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
     return res.status(400).json({ error: `${req.body.user} Invalid ObjectId` });
  }
  checkUserExistence(criterion)
    .then(userExists => {
      if (userExists) {
        console.log('User exists');
      } else {
        console.log('User does not exist');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  const fixedAllowances = await FixedAllowance.find({ company: companyId }).select('_id').exec();
  const validAllowances = fixedAllowances.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      return res.status(400).json({ error: `${item.fixedAllowance} is not a valid fixed allowance` });
    }
  }

  const otherBenefits = await OtherBenefits.find({ company: companyId }).select('_id').exec();
  const validBenefits = otherBenefits.map(fa => fa._id.toString());
  for (const item of req.body.salaryComponentOtherBenefits) {
    if (!validBenefits.includes(item.otherBenefits)) {
      return res.status(400).json({ error: `${item.otherBenefits} is not a valid Other Benefits` });
    }
  }

  const fixedContribution = await FixedContribution.find({ company: companyId }).select('_id').exec();
  const validEmployeeContribution = fixedContribution.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentEmployerContribution) {
    if (!validEmployeeContribution.includes(item.employerContribution)) {
      return res.status(400).json({ error: `${item.employerContribution} is not a valid Fixed Contribution` });
    }
  }

  const variableAllowance = await VariableAllowance.find({ company: companyId }).select('_id').exec();
  const validVariableAllowance = variableAllowance.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentVariableAllowance) {
    if (!validVariableAllowance.includes(item.variableAllowance)) {
      return res.status(400).json({ error: `${item.variableAllowance} is not a valid Variable Allowance` });
    }
  }

  
  const fixedDeduction = await FixedDeduction.find({ company: companyId }).select('_id').exec();
  const validFixedDeduction = fixedDeduction.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      return res.status(400).json({ error: `${item.fixedDeduction} is not a valid Fixed Deduction` });
    }
  }

  const variableDeduction = await VariableDeduction.find({ company: companyId }).select('_id').exec();
  const validVariableDeduction = variableDeduction.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentVariableDeduction) {
    if (!validVariableDeduction.includes(item.variableDeduction)) {
      return res.status(400).json({ error: `${item.variableDeduction} is not a valid Variable Deduction` });
    }
  }

  const pfCharge = await PFCharge.find({ company: companyId }).select('_id').exec();
  const validPFCharge = pfCharge.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      return res.status(400).json({ error: `${item.pfCharge} is not a valid PF Charge` });
    }
  }

  req.body.company = companyId;

  const employeeSalaryDetails = await EmployeeSalaryDetails.create(req.body);

  const employeeSalaryTaxAndStatutorySetting = req.body.employeeSalaryTaxAndStatutorySetting.map((item) => {
    return { ...item, company: companyId,employeeSalaryDetails:employeeSalaryDetails._id };
  });

  const employeeTaxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.create(employeeSalaryTaxAndStatutorySetting);
  employeeSalaryDetails.taxAndSalutaorySetting = employeeTaxAndSalutaorySetting;
  

  const employeesalaryComponentFixedAllowance = req.body.salaryComponentFixedAllowance.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  

  const salaryComponentFixedAllowance = await SalaryComponentFixedAllowance.create(employeesalaryComponentFixedAllowance);
  employeeSalaryDetails.fixedAllowanceList=salaryComponentFixedAllowance;

  const employeeSalaryComponentFixedAllowance = req.body.salaryComponentOtherBenefits.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentOtherBenefits = await SalaryComponentOtherBenefits.create(employeeSalaryComponentFixedAllowance);
  employeeSalaryDetails.otherBenefitList=salaryComponentOtherBenefits;
  
  const employeeSalaryComponentEmployerContribution = req.body.salaryComponentEmployerContribution.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentEmployerContribution = await SalaryComponentEmployerContribution.create(employeeSalaryComponentEmployerContribution);
  employeeSalaryDetails.employerContributionList=salaryComponentEmployerContribution;
  

  const employeesalaryComponentFixedDeduction = req.body.salaryComponentFixedDeduction.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentFixedDeduction = await SalaryComponentFixedDeduction.create(employeesalaryComponentFixedDeduction);
  employeeSalaryDetails.fixedDeductionList=salaryComponentFixedDeduction; 
  
  const employeeSalaryComponentVariableDeduction = req.body.salaryComponentVariableDeduction.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentVariableDeduction = await SalaryComponentVariableDeduction.create(employeeSalaryComponentVariableDeduction);
  employeeSalaryDetails.variableDeductionList=salaryComponentVariableDeduction; 

  const employeeSalaryComponentPFCharge = req.body.salaryComponentPFCharge.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentPFCharge = await SalaryComponentPFCharge.create(employeeSalaryComponentPFCharge);
  employeeSalaryDetails.pfChargeList=salaryComponentPFCharge; 

  const employeeSalaryComponentVariableAllowance = req.body.salaryComponentVariableAllowance.map((item) => {
    return { ...item, employeeSalaryDetails:employeeSalaryDetails._id };
  });  
  const salaryComponentVariableAllowance = await SalaryComponentVariableAllowance.create(employeeSalaryComponentVariableAllowance);
  employeeSalaryDetails.variableAllowanceList=salaryComponentVariableAllowance; 

  res.status(201).json({
    status: 'success',
    data: employeeSalaryDetails
  });
});

exports.getEmployeeSalaryDetailsByUser = catchAsync(async (req, res, next) => {
  const employeeSalaryDetails = await EmployeeSalaryDetails.find({}).where('user').equals(req.params.userId);
  console.log(req.params.userId);
  if (!employeeSalaryDetails) {
    return next(new AppError('Employee Salary Details not found', 404));
  }

  for(let i=0;i<employeeSalaryDetails.length;i++){
    
  employeeSalaryDetails[i].taxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].fixedAllowanceList = await SalaryComponentFixedAllowance.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].otherBenefitList = await SalaryComponentOtherBenefits.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].employerContributionList = await SalaryComponentEmployerContribution.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].fixedDeductionList = await SalaryComponentFixedDeduction.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].variableDeductionList = await SalaryComponentVariableDeduction.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].pfChargeList = await SalaryComponentPFCharge.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  employeeSalaryDetails[i].variableAllowanceList = await SalaryComponentVariableAllowance.find({}).where('employeeSalaryDetails').equals(employeeSalaryDetails[i]._id);
  
  }
 
  res.status(200).json({
    status: 'success',
    data: employeeSalaryDetails
  });
});
// controllers/employeeSalaryDetailsController.js
exports.getEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(req.params.id);
  employeeSalaryDetails.taxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList = await SalaryComponentFixedAllowance.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.otherBenefitList = await SalaryComponentOtherBenefits.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.employerContributionList = await SalaryComponentEmployerContribution.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.fixedDeductionList = await SalaryComponentFixedDeduction.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.variableDeductionList = await SalaryComponentVariableDeduction.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.pfChargeList = await SalaryComponentPFCharge.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.variableAllowanceList = await SalaryComponentVariableAllowance.find({}).where('employeeSalaryDetails').equals(req.params.id);

  if (!employeeSalaryDetails) {
    return next(new AppError('Employee Salary Details not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeSalaryDetails
  });
});

// controllers/employeeSalaryDetailsController.js
exports.updateEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  
  const employeeSalaryDetailsId = req.params.id;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
 
  const employeeSalaryDetailsExists = await EmployeeSalaryDetails.findById(req.params.id);
 
  if (!employeeSalaryDetailsExists) {
    return next(new AppError('Employee Salary Details not found', 404));
  }
  
  const fixedAllowances = await FixedAllowance.find({ company: companyId }).select('_id').exec();
  const validAllowances = fixedAllowances.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      return res.status(400).json({ error: `${item.fixedAllowance} is not a valid fixed allowance` });
    }
  }

  const otherBenefits = await OtherBenefits.find({ company: companyId }).select('_id').exec();
  const validBenefits = otherBenefits.map(fa => fa._id.toString());
  for (const item of req.body.salaryComponentOtherBenefits) {
    if (!validBenefits.includes(item.otherBenefits)) {
      return res.status(400).json({ error: `${item.otherBenefits} is not a valid Other Benefits` });
    }
  }

  const fixedContribution = await FixedContribution.find({ company: companyId }).select('_id').exec();
  const validEmployeeContribution = fixedContribution.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentEmployerContribution) {
    if (!validEmployeeContribution.includes(item.employerContribution)) {
      return res.status(400).json({ error: `${item.employerContribution} is not a valid Fixed Contribution` });
    }
  }

  const variableAllowance = await VariableAllowance.find({ company: companyId }).select('_id').exec();
  const validVariableAllowance = variableAllowance.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentVariableAllowance) {
    if (!validVariableAllowance.includes(item.variableAllowance)) {
      return res.status(400).json({ error: `${item.variableAllowance} is not a valid Variable Allowance` });
    }
  }

  
  const fixedDeduction = await FixedDeduction.find({ company: companyId }).select('_id').exec();
  const validFixedDeduction = fixedDeduction.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      return res.status(400).json({ error: `${item.fixedDeduction} is not a valid Fixed Deduction` });
    }
  }

  const variableDeduction = await VariableDeduction.find({ company: companyId }).select('_id').exec();
  const validVariableDeduction = variableDeduction.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentVariableDeduction) {
    if (!validVariableDeduction.includes(item.variableDeduction)) {
      return res.status(400).json({ error: `${item.variableDeduction} is not a valid Variable Deduction` });
    }
  }

  const pfCharge = await PFCharge.find({ company: companyId }).select('_id').exec();
  const validPFCharge = pfCharge.map(fa => fa._id.toString());
  
  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      return res.status(400).json({ error: `${item.pfCharge} is not a valid PF Charge` });
    }
  }
  
  const updateOrCreateRecords = async (model, requestData, idField) => {
    const requestIds = requestData
      .filter(item => item._id) // Ensure only existing IDs are considered
      .map(item => item._id.toString());

    const existingRecords = await model.find({ employeeSalaryDetails: employeeSalaryDetailsId }).select('_id').exec();
    const existingIds = existingRecords.map(record => record._id.toString());

    // Update or create records
    for (const item of requestData) {
      if (item._id && existingIds.includes(item._id.toString())) {
        await model.findByIdAndUpdate(item._id, item, { new: true, runValidators: true });
      } else {
        await model.create({ ...item, employeeSalaryDetails: employeeSalaryDetailsId });
      }
    }

    // Delete records not in the request
    for (const id of existingIds) {
      if (!requestIds.includes(id)) {
        await model.findByIdAndDelete(id);
      }
    }
  };
console.log("hello");
  // Handle SalaryComponentPFCharge
  if(req.body.salaryComponentFixedAllowance.length > 0)
    {console.log("hello12");
  await updateOrCreateRecords(SalaryComponentFixedAllowance, req.body.salaryComponentFixedAllowance, 'fixedAllowance');
    }

  if(req.body.salaryComponentPFCharge.length > 0)
    {console.log("hello12");
  await updateOrCreateRecords(SalaryComponentPFCharge, req.body.salaryComponentPFCharge, 'pfCharge');
    }

  // Handle other components similarly
  if(req.body.salaryComponentOtherBenefits.length > 0)
    {
  await updateOrCreateRecords(SalaryComponentOtherBenefits, req.body.salaryComponentOtherBenefits, 'otherBenefits');
    }
    if(req.body.salaryComponentEmployerContribution.length > 0)
      {
  await updateOrCreateRecords(SalaryComponentEmployerContribution, req.body.salaryComponentEmployerContribution, 'employerContribution');
       }
       if(req.body.salaryComponentFixedDeduction.length > 0)
        {
        await updateOrCreateRecords(SalaryComponentFixedDeduction, req.body.salaryComponentFixedDeduction, 'fixedDeduction');
        }
        if(req.body.salaryComponentVariableDeduction.length > 0)
          {
            await updateOrCreateRecords(SalaryComponentVariableDeduction, req.body.salaryComponentVariableDeduction, 'variableDeduction');
          }
          if(req.body.salaryComponentVariableAllowance.length > 0)
            {
              await updateOrCreateRecords(SalaryComponentVariableAllowance, req.body.salaryComponentVariableAllowance, 'variableAllowance');
            }
          console.log("hello1");
  const employeeSalaryDetails = await EmployeeSalaryDetails.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!employeeSalaryDetails) {
    return next(new AppError('Employee Salary Details not found', 404));
  }
  employeeSalaryDetails.taxAndSalutaorySetting = await EmployeeTaxAndSalutaorySetting.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList = await SalaryComponentFixedAllowance.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.otherBenefitList = await SalaryComponentOtherBenefits.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.employerContributionList = await SalaryComponentEmployerContribution.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.fixedDeductionList = await SalaryComponentFixedDeduction.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.variableDeductionList = await SalaryComponentVariableDeduction.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.pfChargeList = await SalaryComponentPFCharge.find({}).where('employeeSalaryDetails').equals(req.params.id);
  employeeSalaryDetails.variableAllowanceList = await SalaryComponentVariableAllowance.find({}).where('employeeSalaryDetails').equals(req.params.id);

  res.status(200).json({
    status: 'success',
    data: employeeSalaryDetails
  });
});

// controllers/employeeSalaryDetailsController.js
exports.deleteEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const employeeSalaryDetailsId = req.params.id;
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(employeeSalaryDetailsId);

  if (!employeeSalaryDetails) {
    return res.status(404).json({ message: 'Employee Salary Details not found' });
  }

  // Delete related records from different collections
  await EmployeeTaxAndSalutaorySetting.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentFixedAllowance.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentOtherBenefits.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentEmployerContribution.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentFixedDeduction.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentVariableDeduction.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentPFCharge.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });
  await SalaryComponentVariableAllowance.deleteMany({ employeeSalaryDetails: employeeSalaryDetailsId });

  // Finally, delete the EmployeeSalaryDetails record itself
  await EmployeeSalaryDetails.findByIdAndDelete(employeeSalaryDetailsId);
  //const employeeSalaryDetails = await EmployeeSalaryDetails.findByIdAndDelete(req.params.id);
  
 
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Create Employee Salary, Tax, and Salutaory Setting
 */
exports.createEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  
  req.body.company = companyId;
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.create(req.body);
  res.status(201).json({
    status: 'success',
    data: employeeSettings
  });
});

/**
 * Get Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.getEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findById(req.params.id);
  if (!employeeSettings) {
    return next(new AppError('Employee settings not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeSettings
  });
});

/**
 * Update Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.updateEmployeeTaxAndSalutaorySetting = catchAsync(async (req, res, next) => {
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!employeeSettings) {
    return next(new AppError('Employee settings not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: employeeSettings
  });
});

/**
 * Delete Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.deleteEmployeeTaxAndSalutaorySetting= catchAsync(async (req, res, next) => {
  const employeeSettings = await EmployeeTaxAndSalutaorySetting.findByIdAndDelete(req.params.id);

  if (!employeeSettings) {
    return next(new AppError('Employee settings not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  
  req.body.company = companyId;
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.create(req.body);
  res.status(201).json({
    status: 'success',
    data: employeeSalutatoryDetails
  });
});

exports.getEmployeeSalutatoryDetailsByUser = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.find({ user: req.params.userId });
  
  res.status(200).json({
    status: 'success',
    data: employeeSalutatoryDetails
  });
});
exports.getEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findById(req.params.id);
  if (!employeeSalutatoryDetails) {
    return next(new AppError('Employee Salutatory Details not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeSalutatoryDetails
  });
});

exports.updateEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!employeeSalutatoryDetails) {
    return next(new AppError('Employee Salutatory Details not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: employeeSalutatoryDetails
  });
});

exports.deleteEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findByIdAndDelete(req.params.id);
  
  if (!employeeSalutatoryDetails) {
    return next(new AppError('Employee Salutatory Details not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.createIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.create(req.body);
  res.status(201).json({
    status: 'success',
    data: incomeTaxComponant
  });
});

exports.getIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findById(req.params.id);
  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: incomeTaxComponant
  });
});

exports.updateIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: incomeTaxComponant
  });
});

exports.deleteIncomeTaxComponant = catchAsync(async (req, res, next) => {
  const incomeTaxComponant = await IncomeTaxComponant.findByIdAndDelete(req.params.id);
  
  if (!incomeTaxComponant) {
    return next(new AppError('Income Tax Componant not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getIncomeTaxComponantsByCompany = catchAsync(async (req, res, next) => {
  const incomeTaxComponants = await IncomeTaxComponant.find({ company: req.params.companyId });

  if (!incomeTaxComponants || incomeTaxComponants.length === 0) {
    return next(new AppError('Income Tax Componants not found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: incomeTaxComponants
  });
});



exports.createEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  
  req.body.company = companyId;
 
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
     return res.status(400).json({ error: `${req.body.user} Invalid ObjectId` });
  }
  const criterion = await User.exists({ _id: req.body.user });
  checkUserExistence(criterion)
    .then(userExists => {
      if (userExists) {
        console.log('User exists');
      } else {
        console.log('User does not exist');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
    
    const criterionCategory =await LoanAdvancesCategory.exists({ _id: req.body.loanAdvancesCategory }); // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
     return res.status(400).json({ error: `${req.body.loanAdvancesCategory} Invalid ObjectId` });
  }
  checkUserExistence(criterionCategory)
    .then(categoryExists => {
      if (categoryExists) {
        console.log('loanAdvancesCategory exists');
      } else {
        console.log('loanAdvancesCategory does not exist');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });

   const employeeLoanAdvances = await EmployeeLoanAdvance.create(req.body);
  res.status(201).json({
    status: 'success',
    data: employeeLoanAdvances
  });
});

exports.getEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const employeeLoanAdvances = await EmployeeLoanAdvance.findById(req.params.id);
  if (!employeeLoanAdvances) {
    return next(new AppError('Employee Loan Advance not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeLoanAdvances
  });
});

exports.updateEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const criterionCategory =  await LoanAdvancesCategory.exists({ _id: req.body.loanAdvancesCategory }); // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
     return res.status(400).json({ error: `${req.body.loanAdvancesCategory} Invalid ObjectId` });
  }
  checkUserExistence(criterionCategory)
    .then(categoryExists => {
      if (categoryExists) {
        console.log('loanAdvancesCategory exists');
      } else {
        console.log('loanAdvancesCategory does not exist');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });

  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!employeeLoanAdvances) {
    return next(new AppError('Employee Loan Advance not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeLoanAdvances
  });
});

exports.deleteEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndDelete(req.params.id);
  if (!employeeLoanAdvances) {
    return next(new AppError('Employee Loan Advance not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllEmployeeLoanAdvancesByCompany = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  cosnole.log(companyId);
  const totalCount = await EmployeeLoanAdvance.countDocuments({ company: companyId });  
 
  const employeeLoanAdvances = await EmployeeLoanAdvance.find({ company: companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));
 
  res.status(200).json({
    status: 'success',
    data: employeeLoanAdvances,
    total: totalCount
  });
});
exports.getAllEmployeeLoanAdvancesByUser= catchAsync(async (req, res, next) => {

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  console.log(req.params.userId);
  const totalCount = await EmployeeLoanAdvance.countDocuments({ user: req.params.userId });  
 
  const employeeLoanAdvances = await EmployeeLoanAdvance.find({ user: req.params.userId }).skip(parseInt(skip))
  .limit(parseInt(limit));
 
  res.status(200).json({
    status: 'success',
    data: employeeLoanAdvances,
    total: totalCount
  });
});
