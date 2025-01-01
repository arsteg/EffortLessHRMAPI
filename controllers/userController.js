const User = require("../models/permissions/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError.js");
const APIFeatures = require("../utils/apiFeatures");
const userSubordinate = require("../models/userSubordinateModel");
const ProjectUsers = require("../models/projectUserModel");
const Subscription = require("../models/pricing/subscriptionModel");
const TaskUsers = require("../models/taskUserModel");
const Projects = require("../models/projectModel");
const timeLog = require("../models/timeLog");
const BrowserHistory = require("../models/appsWebsites/browserHistory");
const Productivity = require("./../models/productivityModel");
const AppWebsite = require("./../models/commons/appWebsiteModel");
const ManualTimeRequest = require("../models/manualTime/manualTimeRequestModel");
const UserEmployment = require("../models/Employment/UserEmploymentModel");
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel");
const EmployeeTaxAndSalutaorySetting = require("../models/Employment/EmployeeSalaryTaxAndStatutorySettingModel.js");
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const IncomeTaxComponant = require("../models/commons/IncomeTaxComponant");
const SalaryComponentFixedAllowance = require("../models/Employment/SalaryComponentFixedAllowanceModel");
const SalaryComponentOtherBenefits = require("../models/Employment/SalaryComponentOtherBenefits");
const SalaryComponentEmployerContribution = require("../models/Employment/SalaryComponentEmployerContribution");
const SalaryComponentFixedDeduction = require("../models/Employment/SalaryComponentFixedDeduction");
const SalaryComponentVariableDeduction = require("../models/Employment/SalaryComponentVariableDeduction");
const SalaryComponentPFCharge = require("../models/Employment/SalaryComponentPFCharge");
const SalaryComponentVariableAllowance = require("../models/Employment/SalaryComponentVariableAllowance");
const FixedAllowance = require("../models/Payroll/fixedAllowancesModel");
const OtherBenefits = require("../models/Payroll/otherBenefitsModels");
const FixedContribution = require("../models/Payroll/fixedContributionModel");
const FixedDeduction = require("../models/Payroll/fixedDeductionModel");
const VariableAllowance = require("../models/Payroll/variableAllowanceModel");
const VariableDeduction = require("../models/Payroll/variableDeductionModel");
const PFCharge = require("../models/Payroll/pfChargeModel");
const EmployeeLoanAdvance = require("../models/Employment/EmployeeLoanAdvanceModel.js");
const LoanAdvancesCategory = require("../models/Employment/EmployeeLoanAdvanceModel.js");
const EmployeeIncomeTaxDeclaration = require("../models/Employment/EmployeeIncomeTaxDeclaration");
const EmployeeIncomeTaxDeclarationComponent = require("../models/Employment/EmployeeIncomeTaxDeclarationComponent");
const EmployeeIncomeTaxDeclarationHRA = require("../models/Employment/EmployeeIncomeTaxDeclarationHRA");
const { v1: uuidv1 } = require("uuid");
const EmailTemplate = require('../models/commons/emailTemplateModel');
var mongoose = require("mongoose");
const constants = require('../constants');
const { BlobServiceClient } = require("@azure/storage-blob");
const OTP = require("../models/commons/otp");
const sendEmail = require('../utils/email');
// AZURE STORAGE CONNECTION DETAILS
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.CONTAINER_NAME
);

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // To allow for nested GET revicews on tour (hack)
  let filter = { status: "Active", company: req.cookies.companyId };
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
    status: "success",
    results: document.length,
    data: {
      data: document,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(req.params.id, {
    status: "Deleted",
  });
  if (!document) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: document,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const users = await User.findById(req.body.id)
    .where("status")
    .equals("Active");
  let companySubscription = {status: 'new'};
  if(users){
    companySubscription = await Subscription.findOne({
      companyId: users.company.id,
      "razorpaySubscription.status": {$nin: ["cancelled"]}
    })
    .populate("currentPlanId");
  }
  res.status(200).json({
    status: "success",
    data: {
      users: users,
      companySubscription: companySubscription,
    },
  });
});
exports.getUsersByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;

  // Validate that status is one of the valid statuses in User_Status
  if (!Object.values(constants.User_Status).includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
  }

  // Find users based on companyId and status, excluding 'Deleted' status
  const users = await User.find({
      status: { $ne: constants.User_Status.Deleted },  // Exclude 'Deleted' users
      company: req.cookies.companyId,                            // Match users by companyId
      status: status                                 // Match users by provided status
  });

  res.status(200).json({
      status: "success",
      data: {
          users: users,
      },
  });
});
exports.getUsersByCompany = catchAsync(async (req, res, next) => {
  const users = await User.find({
    status: { $ne: constants.User_Status.Deleted },
    company: req.params.companyId,
  });
  res.status(200).json({
    status: "success",
    data: {
      users: users,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
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
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "You cannot update password using this route. Please use /updateMyPassword"
      )
    );

  // 2) Filter out unwanted body properties
  const filteredBody = filterObj(req.body, "name", "email");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Reutrn updated object instead of old one
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { status: "Deleted" });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  req.query.status = "Active";
  next();
};

exports.getUsers = catchAsync(async (req, res, next) => {
  var users = await User.find({
    _id: { $in: req.body.userId },
    status: { $ne: constants.User_Status.Deleted },
  });
  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.getUserManagers = catchAsync(async (req, res, next) => {
  let managers = [];
  let list = await userSubordinate
    .distinct("userId")
    .find({ subordinateUserId: { $in: req.params.id } });
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
    }
  }
  res.status(200).json({
    status: "success",
    data: managers,
  });
});

exports.getUserProjects = catchAsync(async (req, res, next) => {
  let projects = [];
  let projectUsers = await ProjectUsers.find({})
    .where("user")
    .equals(req.params.id);
  for (let i = 0; i < projectUsers.length; i++) {
    let user = await User.findOne({
      _id: { $in: projectUsers[i].user },
      status: { $ne: "Deleted" },
    });
    if (user) {
      projects.push(projectUsers[i].project);
    }
  }
  res.status(200).json({
    status: "success",
    data: projects,
  });
});

exports.createUserEmployment = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError("Company ID not found in cookies", 400));
  }

  req.body.company = companyId;
  const userEmployment = await UserEmployment.create(req.body);
  res.status(201).json({
    status: "success",
    data: userEmployment,
  });
});

exports.getUserEmploymentByUser = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.find({})
    .where("user")
    .equals(req.params.userId);
  if (!userEmployment) {
    return next(new AppError("UserEmployment not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: userEmployment,
  });
});

exports.getUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findById(req.params.id);
  if (!userEmployment) {
    return next(new AppError("UserEmployment not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: userEmployment,
  });
});

exports.updateUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!userEmployment) {
    return next(new AppError("UserEmployment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: userEmployment,
  });
});

exports.deleteUserEmployment = catchAsync(async (req, res, next) => {
  const userEmployment = await UserEmployment.findByIdAndDelete(req.params.id);

  if (!userEmployment) {
    return next(new AppError("UserEmployment not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
async function checkUserExistence(criterion) {
  try {
    const user = await User.findOne(criterion);
    return user ? true : false;
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
}

// controllers/employeeSalaryDetailsController.js
exports.createEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError("Company ID not found in cookies", 400));
  }
  const criterion = { _id: req.body.user }; // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    return res.status(400).json({ error: `${req.body.user} Invalid ObjectId` });
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
      console.error("Error:", error);
    });
  const fixedAllowances = await FixedAllowance.find({ company: companyId })
    .select("_id")
    .exec();
  const validAllowances = fixedAllowances.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      return res.status(400).json({
        error: `${item.fixedAllowance} is not a valid fixed allowance`,
      });
    }
  }

  const otherBenefits = await OtherBenefits.find({ company: companyId })
    .select("_id")
    .exec();
  const validBenefits = otherBenefits.map((fa) => fa._id.toString());
  for (const item of req.body.salaryComponentOtherBenefits) {
    if (!validBenefits.includes(item.otherBenefits)) {
      return res
        .status(400)
        .json({ error: `${item.otherBenefits} is not a valid Other Benefits` });
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
      return res.status(400).json({
        error: `${item.employerContribution} is not a valid Fixed Contribution`,
      });
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
      return res.status(400).json({
        error: `${item.variableAllowance} is not a valid Variable Allowance`,
      });
    }
  }

  const fixedDeduction = await FixedDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validFixedDeduction = fixedDeduction.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      return res.status(400).json({
        error: `${item.fixedDeduction} is not a valid Fixed Deduction`,
      });
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
      return res.status(400).json({
        error: `${item.variableDeduction} is not a valid Variable Deduction`,
      });
    }
  }

  const pfCharge = await PFCharge.find({ company: companyId })
    .select("_id")
    .exec();
  const validPFCharge = pfCharge.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      return res
        .status(400)
        .json({ error: `${item.pfCharge} is not a valid PF Charge` });
    }
  }

  req.body.company = companyId;

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

  const employeeSalaryComponentFixedAllowance =
    req.body.salaryComponentOtherBenefits.map((item) => {
      return { ...item, employeeSalaryDetails: employeeSalaryDetails._id };
    });
  const salaryComponentOtherBenefits =
    await SalaryComponentOtherBenefits.create(
      employeeSalaryComponentFixedAllowance
    );
  employeeSalaryDetails.otherBenefitList = salaryComponentOtherBenefits;

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
    status: "success",
    data: employeeSalaryDetails,
  });
});

exports.getEmployeeSalaryDetailsByUser = catchAsync(async (req, res, next) => {
  const employeeSalaryDetails = await EmployeeSalaryDetails.find({})
    .where("user")
    .equals(req.params.userId);
  console.log(req.params.userId);
  if (!employeeSalaryDetails) {
    return next(new AppError("Employee Salary Details not found", 404));
  }

  for (let i = 0; i < employeeSalaryDetails.length; i++) {
    employeeSalaryDetails[i].taxAndSalutaorySetting =
      await EmployeeTaxAndSalutaorySetting.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].fixedAllowanceList =
      await SalaryComponentFixedAllowance.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].otherBenefitList =
      await SalaryComponentOtherBenefits.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].employerContributionList =
      await SalaryComponentEmployerContribution.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].fixedDeductionList =
      await SalaryComponentFixedDeduction.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].variableDeductionList =
      await SalaryComponentVariableDeduction.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].pfChargeList = await SalaryComponentPFCharge.find(
      {}
    )
      .where("employeeSalaryDetails")
      .equals(employeeSalaryDetails[i]._id);
    employeeSalaryDetails[i].variableAllowanceList =
      await SalaryComponentVariableAllowance.find({})
        .where("employeeSalaryDetails")
        .equals(employeeSalaryDetails[i]._id);
  }

  res.status(200).json({
    status: "success",
    data: employeeSalaryDetails,
  });
});
// controllers/employeeSalaryDetailsController.js
exports.getEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(
    req.params.id
  );
  employeeSalaryDetails.taxAndSalutaorySetting =
    await EmployeeTaxAndSalutaorySetting.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList =
    await SalaryComponentFixedAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.otherBenefitList =
    await SalaryComponentOtherBenefits.find({})
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

  if (!employeeSalaryDetails) {
    return next(new AppError("Employee Salary Details not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: employeeSalaryDetails,
  });
});

// controllers/employeeSalaryDetailsController.js
exports.updateEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const employeeSalaryDetailsId = req.params.id;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError("Company ID not found in cookies", 400));
  }

  const employeeSalaryDetailsExists = await EmployeeSalaryDetails.findById(
    req.params.id
  );

  if (!employeeSalaryDetailsExists) {
    return next(new AppError("Employee Salary Details not found", 404));
  }

  const fixedAllowances = await FixedAllowance.find({ company: companyId })
    .select("_id")
    .exec();
  const validAllowances = fixedAllowances.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedAllowance) {
    if (!validAllowances.includes(item.fixedAllowance)) {
      return res.status(400).json({
        error: `${item.fixedAllowance} is not a valid fixed allowance`,
      });
    }
  }

  const otherBenefits = await OtherBenefits.find({ company: companyId })
    .select("_id")
    .exec();
  const validBenefits = otherBenefits.map((fa) => fa._id.toString());
  for (const item of req.body.salaryComponentOtherBenefits) {
    if (!validBenefits.includes(item.otherBenefits)) {
      return res
        .status(400)
        .json({ error: `${item.otherBenefits} is not a valid Other Benefits` });
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
      return res.status(400).json({
        error: `${item.employerContribution} is not a valid Fixed Contribution`,
      });
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
      return res.status(400).json({
        error: `${item.variableAllowance} is not a valid Variable Allowance`,
      });
    }
  }

  const fixedDeduction = await FixedDeduction.find({ company: companyId })
    .select("_id")
    .exec();
  const validFixedDeduction = fixedDeduction.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentFixedDeduction) {
    if (!validFixedDeduction.includes(item.fixedDeduction)) {
      return res.status(400).json({
        error: `${item.fixedDeduction} is not a valid Fixed Deduction`,
      });
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
      return res.status(400).json({
        error: `${item.variableDeduction} is not a valid Variable Deduction`,
      });
    }
  }

  const pfCharge = await PFCharge.find({ company: companyId })
    .select("_id")
    .exec();
  const validPFCharge = pfCharge.map((fa) => fa._id.toString());

  for (const item of req.body.salaryComponentPFCharge) {
    if (!validPFCharge.includes(item.pfCharge)) {
      return res
        .status(400)
        .json({ error: `${item.pfCharge} is not a valid PF Charge` });
    }
  }

  const updateOrCreateRecords = async (model, requestData, idField) => {
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

  console.log("hello");
  // Handle SalaryComponentPFCharge
  if (req.body.salaryComponentFixedAllowance.length > 0) {
    console.log("hello12");
    await updateOrCreateRecords(
      SalaryComponentFixedAllowance,
      req.body.salaryComponentFixedAllowance,
      "fixedAllowance"
    );
  }

  if (req.body.salaryComponentPFCharge.length > 0) {
    console.log("hello12");
    await updateOrCreateRecords(
      SalaryComponentPFCharge,
      req.body.salaryComponentPFCharge,
      "pfCharge"
    );
  }

  // Handle other components similarly
  if (req.body.salaryComponentOtherBenefits.length > 0) {
    await updateOrCreateRecords(
      SalaryComponentOtherBenefits,
      req.body.salaryComponentOtherBenefits,
      "otherBenefits"
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
  console.log("hello1");
  const employeeSalaryDetails = await EmployeeSalaryDetails.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employeeSalaryDetails) {
    return next(new AppError("Employee Salary Details not found", 404));
  }
  employeeSalaryDetails.taxAndSalutaorySetting =
    await EmployeeTaxAndSalutaorySetting.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.fixedAllowanceList =
    await SalaryComponentFixedAllowance.find({})
      .where("employeeSalaryDetails")
      .equals(req.params.id);
  employeeSalaryDetails.otherBenefitList =
    await SalaryComponentOtherBenefits.find({})
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
    status: "success",
    data: employeeSalaryDetails,
  });
});

// controllers/employeeSalaryDetailsController.js
exports.deleteEmployeeSalaryDetails = catchAsync(async (req, res, next) => {
  const employeeSalaryDetailsId = req.params.id;
  const employeeSalaryDetails = await EmployeeSalaryDetails.findById(
    employeeSalaryDetailsId
  );

  if (!employeeSalaryDetails) {
    return res
      .status(404)
      .json({ message: "Employee Salary Details not found" });
  }

  // Delete related records from different collections
  await EmployeeTaxAndSalutaorySetting.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentFixedAllowance.deleteMany({
    employeeSalaryDetails: employeeSalaryDetailsId,
  });
  await SalaryComponentOtherBenefits.deleteMany({
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
  //const employeeSalaryDetails = await EmployeeSalaryDetails.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * Create Employee Salary, Tax, and Salutaory Setting
 */
exports.createEmployeeTaxAndSalutaorySetting = catchAsync(
  async (req, res, next) => {
    const companyId = req.cookies.companyId;
    if (!companyId) {
      return next(new AppError("Company ID not found in cookies", 400));
    }

    req.body.company = companyId;
    const employeeSettings = await EmployeeTaxAndSalutaorySetting.create(
      req.body
    );
    res.status(201).json({
      status: "success",
      data: employeeSettings,
    });
  }
);

/**
 * Get Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.getEmployeeTaxAndSalutaorySetting = catchAsync(
  async (req, res, next) => {
    const employeeSettings = await EmployeeTaxAndSalutaorySetting.findById(
      req.params.id
    );
    if (!employeeSettings) {
      return next(new AppError("Employee settings not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: employeeSettings,
    });
  }
);

/**
 * Update Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.updateEmployeeTaxAndSalutaorySetting = catchAsync(
  async (req, res, next) => {
    const employeeSettings =
      await EmployeeTaxAndSalutaorySetting.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!employeeSettings) {
      return next(new AppError("Employee settings not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: employeeSettings,
    });
  }
);

/**
 * Delete Employee Salary, Tax, and Salutaory Setting by ID
 */
exports.deleteEmployeeTaxAndSalutaorySetting = catchAsync(
  async (req, res, next) => {
    const employeeSettings =
      await EmployeeTaxAndSalutaorySetting.findByIdAndDelete(req.params.id);

    if (!employeeSettings) {
      return next(new AppError("Employee settings not found", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

exports.createEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError("Company ID not found in cookies", 400));
  }

  req.body.company = companyId;
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.create(
    req.body
  );
  res.status(201).json({
    status: "success",
    data: employeeSalutatoryDetails,
  });
});

exports.getEmployeeSalutatoryDetailsByUser = catchAsync(
  async (req, res, next) => {
    const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.find({
      user: req.params.userId,
    });

    res.status(200).json({
      status: "success",
      data: employeeSalutatoryDetails,
    });
  }
);
exports.getEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails = await EmployeeSalutatoryDetails.findById(
    req.params.id
  );
  if (!employeeSalutatoryDetails) {
    return next(new AppError("Employee Salutatory Details not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: employeeSalutatoryDetails,
  });
});

exports.updateEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails =
    await EmployeeSalutatoryDetails.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

  if (!employeeSalutatoryDetails) {
    return next(new AppError("Employee Salutatory Details not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: employeeSalutatoryDetails,
  });
});

exports.deleteEmployeeSalutatoryDetails = catchAsync(async (req, res, next) => {
  const employeeSalutatoryDetails =
    await EmployeeSalutatoryDetails.findByIdAndDelete(req.params.id);

  if (!employeeSalutatoryDetails) {
    return next(new AppError("Employee Salutatory Details not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError("Company ID not found in cookies", 400));
  }

  req.body.company = companyId;

  if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
    return res.status(400).json({ error: `${req.body.user} Invalid ObjectId` });
  }
  const criterion = await User.exists({ _id: req.body.user });
  checkUserExistence(criterion)
    .then((userExists) => {
      if (userExists) {
        console.log("User exists");
      } else {
        console.log("User does not exist");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const criterionCategory = await LoanAdvancesCategory.exists({
    _id: req.body.loanAdvancesCategory,
  }); // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
    return res
      .status(400)
      .json({ error: `${req.body.loanAdvancesCategory} Invalid ObjectId` });
  }
  checkUserExistence(criterionCategory)
    .then((categoryExists) => {
      if (categoryExists) {
        console.log("loanAdvancesCategory exists");
      } else {
        console.log("loanAdvancesCategory does not exist");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const employeeLoanAdvances = await EmployeeLoanAdvance.create(req.body);
  const user = await User.findById(req.body.user);  
               
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.LoanAdvance_Disbursement_Notification).where('company').equals(companyId); 
  if(emailTemplate)
  {
   const template = emailTemplate.contentData;
   const message = template
   .replace("{firstName}", user.firstName)
   .replace("{company}",  req.cookies.companyName)
   .replace("{company}", req.cookies.companyName)
   .replace("{lastName}", user.lastName); 
 console.log(user.email);
 console.log(emailTemplate.subject);
      try {
       await sendEmail({
         email: user.email,
         subject: emailTemplate.subject,
         message
       });
      
     } catch (err) {   
      console.log(err);
       return next(
         new AppError(
           'There was an error sending the email. Try again later.',
           500
         )
     );
   }
}
  res.status(201).json({
    status: "success",
    data: employeeLoanAdvances,
  });
});

exports.getEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const employeeLoanAdvances = await EmployeeLoanAdvance.findById(
    req.params.id
  );
  if (!employeeLoanAdvances) {
    return next(new AppError("Employee Loan Advance not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: employeeLoanAdvances,
  });
});

exports.updateEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const criterionCategory = await LoanAdvancesCategory.exists({
    _id: req.body.loanAdvancesCategory,
  }); // You can also use { email: 'example@example.com' }
  if (!mongoose.Types.ObjectId.isValid(req.body.loanAdvancesCategory)) {
    return res
      .status(400)
      .json({ error: `${req.body.loanAdvancesCategory} Invalid ObjectId` });
  }
  checkUserExistence(criterionCategory)
    .then((categoryExists) => {
      if (categoryExists) {
        console.log("loanAdvancesCategory exists");
      } else {
        console.log("loanAdvancesCategory does not exist");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!employeeLoanAdvances) {
    return next(new AppError("Employee Loan Advance not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: employeeLoanAdvances,
  });
});

exports.deleteEmployeeLoanAdvance = catchAsync(async (req, res, next) => {
  const employeeLoanAdvances = await EmployeeLoanAdvance.findByIdAndDelete(
    req.params.id
  );
  if (!employeeLoanAdvances) {
    return next(new AppError("Employee Loan Advance not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllEmployeeLoanAdvancesByCompany = catchAsync(
  async (req, res, next) => {
    const companyId = req.cookies.companyId;
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await EmployeeLoanAdvance.countDocuments({
      company: companyId,
    });

    const employeeLoanAdvances = await EmployeeLoanAdvance.find({
      company: companyId,
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      status: "success",
      data: employeeLoanAdvances,
      total: totalCount,
    });
  }
);

exports.getAllEmployeeLoanAdvancesByUser = catchAsync(
  async (req, res, next) => {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    console.log(req.params.userId);
    const totalCount = await EmployeeLoanAdvance.countDocuments({
      user: req.params.userId,
    });

    const employeeLoanAdvances = await EmployeeLoanAdvance.find({
      user: req.params.userId,
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      status: "success",
      data: employeeLoanAdvances,
      total: totalCount,
    });
  }
);

// Add Employee Income Tax Declaration
exports.createEmployeeIncomeTaxDeclaration = catchAsync(
  async (req, res, next) => {
    const companyId = req.cookies.companyId;
    if (!companyId) {
      return next(new AppError("Company ID not found in cookies", 400));
    }
    req.body.company = companyId;

    const incomeTaxComponants = await IncomeTaxComponant.find()
      .select("_id")
      .exec();
    const validIncomeTaxComponant = incomeTaxComponants.map((fa) =>
      fa._id.toString()
    );

    for (const item of req.body.employeeIncomeTaxDeclarationComponent) {
      if (!validIncomeTaxComponant.includes(item.incomeTaxComponent)) {
        return res.status(400).json({
          error: `${item.incomeTaxComponent} is not a valid fixed allowance`,
        });
      }
    }

    const employeeIncomeTaxDeclaration =
      await EmployeeIncomeTaxDeclaration.create(req.body);

    const employeeIncomeTaxDeclarationComponent = await Promise.all(
      req.body.employeeIncomeTaxDeclarationComponent.map(async (item) => {
        // Initialize an array to store links
        const documentLinks = [];

        if (item.employeeIncomeTaxDeclarationAttachments != null) {
          for (
            let i = 0;
            i < item.employeeIncomeTaxDeclarationAttachments.length;
            i++
          ) {
            const attachment = item.employeeIncomeTaxDeclarationAttachments[i];

        if (
          !attachment.attachmentType || !attachment.attachmentName || 
          !attachment.attachmentSize || !attachment.extention || 
          !attachment.file || attachment.attachmentType === null || 
          attachment.attachmentName === null || attachment.attachmentSize === null || 
          attachment.extention === null || attachment.file === null
        ) {
          return res.status(400).json({ error: 'All attachment properties must be provided' });
        }

        const blobName = `${attachment.attachmentName}_${uuidv1()}${attachment.extention}`;
        
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        const buffer = Buffer.from(attachment.file, 'base64');
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);

        // Generate the document link
        const documentLink = `${process.env.CONTAINER_URL_BASE_URL}${process.env.CONTAINER_NAME}/${blobName}`;

        console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);

        // Add the document link to the array
        item.documentLink=documentLink;
      }
    }

    // Return the item with added properties
    return {
      ...item,
      employeeIncomeTaxDeclaration: employeeIncomeTaxDeclaration._id
    };
  }));
  
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclarationComponent.create(employeeIncomeTaxDeclarationComponent);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent = employeeIncomeTaxDeclarations;

  const employeeIncomeTaxDeclarationHRA = await Promise.all(
    req.body.employeeIncomeTaxDeclarationHRA.map(async (item) => {
    // Initialize an array to store links
    if (item.employeeIncomeTaxDeclarationHRAAttachments != null) {
      for (let i = 0; i < item.employeeIncomeTaxDeclarationHRAAttachments.length; i++) {
        const attachment = item.employeeIncomeTaxDeclarationHRAAttachments[i];

        if (
          !attachment.attachmentType || !attachment.attachmentName || 
          !attachment.attachmentSize || !attachment.extention || 
          !attachment.file || attachment.attachmentType === null || 
          attachment.attachmentName === null || attachment.attachmentSize === null || 
          attachment.extention === null || attachment.file === null
        ) {
          return res.status(400).json({ error: 'All attachment properties must be provided' });
        }

        const blobName = `${attachment.attachmentName}_${uuidv1()}${attachment.extention}`;
        
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        const buffer = Buffer.from(attachment.file, 'base64');
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);

        // Generate the document link
        const documentLink = `${process.env.CONTAINER_URL_BASE_URL}${process.env.CONTAINER_NAME}/${blobName}`;

        console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);

        // Add the document link to the array
        item.documentLink=documentLink;
      }
    }

    // Return the item with added properties
    return {
      ...item,
      employeeIncomeTaxDeclaration: employeeIncomeTaxDeclaration._id
    };
  }));



  const employeeHRA = await EmployeeIncomeTaxDeclarationHRA.create(employeeIncomeTaxDeclarationHRA);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA = employeeHRA;
  const user = await User.findById(req.body.user);  
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(constants.Email_template_constant.Employee_Tax_Declaration_Submission_Notification_For_Employee).where('company').equals(companyId); 
  if(emailTemplate)
  {
   const template = emailTemplate.contentData;
   const message = template
   .replace("{firstName}", user.firstName)
   .replace("{company}",  req.cookies.companyName)
   .replace("{company}", req.cookies.companyName)
   .replace("{lastName}", user.lastName); 
 console.log(user.email);
 console.log(emailTemplate.subject);
      try {
       await sendEmail({
         email: user.email,
         subject: emailTemplate.subject,
         message
       });
      
     } catch (err) {   
      console.log(err);
       return next(
         new AppError(
           'There was an error sending the email. Try again later.',
           500
         )
     );
    }
  }
  res.status(201).json({
    status: 'success',
    data: employeeIncomeTaxDeclaration
  });
});

// Get All Employee Income Tax Declarations by Company
exports.getAllEmployeeIncomeTaxDeclarationsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await EmployeeIncomeTaxDeclaration.countDocuments({ company: req.cookies.companyId });  
 
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclaration.find({ company: req.cookies.companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));
  for(let i=0;i<employeeIncomeTaxDeclarations.length;i++){  
      
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({}).where('employeeIncomeTaxDeclaration').equals(employeeIncomeTaxDeclarations[i]._id);
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({}).where('employeeIncomeTaxDeclaration').equals(employeeIncomeTaxDeclarations[i]._id);
  }
  if (!employeeIncomeTaxDeclarations) {
    return next(new AppError('No declarations found for this company', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeIncomeTaxDeclarations,
    total: totalCount
  });
});

// Get All Employee Income Tax Declarations by Company
exports.getAllEmployeeIncomeTaxDeclarationsByUser = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await EmployeeIncomeTaxDeclaration.countDocuments({ user: req.params.userId });  
 
  const employeeIncomeTaxDeclarations = await EmployeeIncomeTaxDeclaration.find({ user: req.params.userId }).skip(parseInt(skip))
  .limit(parseInt(limit));

  for(let i=0;i<employeeIncomeTaxDeclarations.length;i++){  
      
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({}).where('employeeIncomeTaxDeclaration').equals(employeeIncomeTaxDeclarations[i]._id);
    
    if(employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent.length > 0)
    { 
      for(let j=0;j<employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent.length;j++){  
      const incomeTaxComponant = await IncomeTaxComponant.findById(employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent[j].incomeTaxComponent);
      employeeIncomeTaxDeclarations[i].incomeTaxDeclarationComponent[j].section=incomeTaxComponant.section;
       }
      }
    employeeIncomeTaxDeclarations[i].incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({}).where('employeeIncomeTaxDeclaration').equals(employeeIncomeTaxDeclarations[i]._id);
  }
  if (!employeeIncomeTaxDeclarations) {
    return next(new AppError('No declarations found for this company', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeIncomeTaxDeclarations,
    total: totalCount
  });
});

// Update Employee Income Tax Declaration
exports.updateEmployeeIncomeTaxDeclaration = catchAsync(async (req, res, next) => {

  const employeeIncomeTaxDeclarationId = req.params.id;

  const employeeIncomeTaxDeclaration = await EmployeeIncomeTaxDeclaration.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!employeeIncomeTaxDeclaration) {
    return next(new AppError('Employee income tax declaration not found', 404));
  }
  const updateOrCreateRecords = async (model, requestData, idField) => {
    const requestIds = requestData
      .filter(item => item._id) // Ensure only existing IDs are considered
      .map(item => item._id.toString());

    const existingRecords = await model.find({ employeeIncomeTaxDeclaration: employeeIncomeTaxDeclarationId }).select('_id').exec();
    const existingIds = existingRecords.map(record => record._id.toString());

    // Update or create records
    for (const item of requestData) {
      if (item._id && existingIds.includes(item._id.toString())) {
        await model.findByIdAndUpdate(item._id, item, { new: true, runValidators: true });
      } else {
        await model.create({ ...item, employeeIncomeTaxDeclaration: employeeIncomeTaxDeclarationId });
      }
    }

    // Delete records not in the request
    for (const id of existingIds) {
      if (!requestIds.includes(id)) {
        await model.findByIdAndDelete(id);
      }
    }
  };

  if(req.body.employeeIncomeTaxDeclarationHRA.length > 0)
    {
      for (let j = 0; j < req.body.employeeIncomeTaxDeclarationHRA.length; j++) {  
     
      if (req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments != null) {
        for (let i = 0; i < req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments.length; i++) {

          const attachment = req.body.employeeIncomeTaxDeclarationHRA[j].employeeIncomeTaxDeclarationHRAAttachments[i];
  
          if (
            !attachment.attachmentType || !attachment.attachmentName || 
            !attachment.attachmentSize || !attachment.extention || 
            !attachment.file || attachment.attachmentType === null || 
            attachment.attachmentName === null || attachment.attachmentSize === null || 
            attachment.extention === null || attachment.file === null
          ) {
            return res.status(400).json({ error: 'All attachment properties must be provided' });
          }
  
          const blobName = `${attachment.attachmentName}_${uuidv1()}${attachment.extention}`;
          
          // Get a block blob client
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
          // Upload data to the blob
          const buffer = Buffer.from(attachment.file, 'base64');
          const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
  
          // Generate the document link
          const documentLink = `${process.env.CONTAINER_URL_BASE_URL}${process.env.CONTAINER_NAME}/${blobName}`;
  
          console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);
  
          // Add the document link to the array
          req.body.employeeIncomeTaxDeclarationHRA[j].documentLink=documentLink;
        }
      }
    }
    console.log(req.body.employeeIncomeTaxDeclarationHRA);
    await updateOrCreateRecords(EmployeeIncomeTaxDeclarationHRA, req.body.employeeIncomeTaxDeclarationHRA, 'incomeTaxDeclarationHRA');
    }
    else
    {
        const taxDeclarationHRAs = await EmployeeIncomeTaxDeclarationHRA.find({ _id: req.params.id }); 
        if(taxDeclarationHRAs)
        { 
            console.log(taxDeclarationHRAs.length);
            for(var i = 0; i <taxDeclarationHRAs.length; i++) {
            if(taxDeclarationHRAs[i].documentLink)
              {
                  var url = taxDeclarationHRAs[i].documentLink;     
                  containerClient.getBlockBlobClient(url).deleteIfExists();
                  const blockBlobClient = containerClient.getBlockBlobClient(url);
                  await blockBlobClient.deleteIfExists();
                  console.log("deleted HRA");
              }
          }
          await EmployeeIncomeTaxDeclarationHRA.deleteMany({ employeeIncomeTaxDeclaration: req.params.id });
         }       
    }

  employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent = await EmployeeIncomeTaxDeclarationComponent.find({}).where('employeeIncomeTaxDeclaration').equals(req.params.id);
  employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA = await EmployeeIncomeTaxDeclarationHRA.find({}).where('employeeIncomeTaxDeclaration').equals(req.params.id);

    res.status(200).json({
      status: "success",
      data: employeeIncomeTaxDeclaration,
    });
  }
);

// Get Employee Income Tax Declaration by ID
exports.getEmployeeIncomeTaxDeclarationById = catchAsync(
  async (req, res, next) => {
    const employeeIncomeTaxDeclaration =
      await EmployeeIncomeTaxDeclaration.findById(req.params.id);

    if (!employeeIncomeTaxDeclaration) {
      return next(
        new AppError("Employee income tax declaration not found", 404)
      );
    }
    employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent =
      await EmployeeIncomeTaxDeclarationComponent.find({})
        .where("employeeIncomeTaxDeclaration")
        .equals(req.params.id);
    employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA =
      await EmployeeIncomeTaxDeclarationHRA.find({})
        .where("employeeIncomeTaxDeclaration")
        .equals(req.params.id);

    res.status(200).json({
      status: "success",
      data: employeeIncomeTaxDeclaration,
    });
  }
);

// Delete Employee Income Tax Declaration
exports.deleteEmployeeIncomeTaxDeclaration = catchAsync(
  async (req, res, next) => {
    const employeeIncomeTaxDeclaration =
      await EmployeeIncomeTaxDeclaration.findByIdAndDelete(req.params.id);
    if (!employeeIncomeTaxDeclaration) {
      return next(
        new AppError("Employee income tax declaration not found", 404)
      );
    }
    const taxDeclarationComponants =
      await EmployeeIncomeTaxDeclarationComponent.find({ _id: req.params.id });
    if (taxDeclarationComponants) {
      console.log(taxDeclarationComponants.length);
      for (var i = 0; i < taxDeclarationComponants.length; i++) {
        if (taxDeclarationComponants[i].documentLink) {
          var url = taxDeclarationComponants[i].documentLink;
          containerClient.getBlockBlobClient(url).deleteIfExists();
          const blockBlobClient = containerClient.getBlockBlobClient(url);
          await blockBlobClient.deleteIfExists();
          console.log("deleted componant");
        }
      }
      await EmployeeIncomeTaxDeclarationComponent.deleteMany({
        employeeIncomeTaxDeclaration: req.params.id,
      });
    }

    const taxDeclarationHRAs = await EmployeeIncomeTaxDeclarationHRA.find({
      _id: req.para.id,
    });
    if (taxDeclarationHRAs) {
      console.log(taxDeclarationHRAs.length);
      for (var i = 0; i < taxDeclarationHRAs.length; i++) {
        if (taxDeclarationHRAs[i].documentLink) {
          var url = taxDeclarationHRAs[i].documentLink;
          containerClient.getBlockBlobClient(url).deleteIfExists();
          const blockBlobClient = containerClient.getBlockBlobClient(url);
          await blockBlobClient.deleteIfExists();
          console.log("deleted HRA");
        }
      }
      await EmployeeIncomeTaxDeclarationHRA.deleteMany({
        employeeIncomeTaxDeclaration: req.params.id,
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// Update Employee Income Tax Declaration componant
// Update or create Employee Income Tax Declaration component
exports.updateEmployeeIncomeTaxDeclarationComponant = catchAsync(
  async (req, res, next) => {
    // Validate income tax component
    const incomeTaxComponants = await IncomeTaxComponant.find()
      .select("_id")
      .exec();
    const validIncomeTaxComponant = incomeTaxComponants.map((fa) =>
      fa._id.toString()
    );

    if (!validIncomeTaxComponant.includes(req.body.incomeTaxComponent)) {
      return res.status(400).json({
        error: `${req.body.incomeTaxComponent} is not a valid income tax component`,
      });
    }

    // Process attachments if they are present
    if (req.body.employeeIncomeTaxDeclarationAttachments) {
      for (
        let i = 0;
        i < req.body.employeeIncomeTaxDeclarationAttachments.length;
        i++
      ) {
        const attachment = req.body.employeeIncomeTaxDeclarationAttachments[i];

        if (
          !attachment.attachmentType ||
          !attachment.attachmentName ||
          !attachment.attachmentSize ||
          !attachment.extention ||
          !attachment.file
        ) {
          return res
            .status(400)
            .json({ error: "All attachment properties must be provided" });
        }

        const blobName = `${attachment.attachmentName}_${uuidv1()}${
          attachment.extention
        }`;

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        const buffer = Buffer.from(attachment.file, "base64");
        const uploadBlobResponse = await blockBlobClient.upload(
          buffer,
          buffer.length
        );

        // Generate the document link
        const documentLink = `${process.env.CONTAINER_URL_BASE_URL}${process.env.CONTAINER_NAME}/${blobName}`;

        console.log(
          "Blob was uploaded successfully. requestId: ",
          uploadBlobResponse.requestId
        );

        // Add the document link to the array
        req.body.documentLink = documentLink;
      }
    }

    // Use findOneAndUpdate with upsert option
    const employeeIncomeTaxDeclarationComponent =
      await EmployeeIncomeTaxDeclarationComponent.findOneAndUpdate(
        {
          employeeIncomeTaxDeclaration: req.body.employeeIncomeTaxDeclaration,
          incomeTaxComponent: req.body.incomeTaxComponent,
        },
        req.body,
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if no match is found
          runValidators: true, // Ensure validation rules are applied
        }
      );

    res.status(200).json({
      status: "success",
      data: employeeIncomeTaxDeclarationComponent,
    });
  }
);

// Update or create Employee Income Tax Declaration HRA
exports.updateEmployeeIncomeTaxDeclarationHRA = catchAsync(
  async (req, res, next) => {
    // Process attachments if any
    if (req.body.employeeIncomeTaxDeclarationAttachments != null) {
      for (
        let i = 0;
        i < req.body.employeeIncomeTaxDeclarationAttachments.length;
        i++
      ) {
        const attachment = req.body.employeeIncomeTaxDeclarationAttachments[i];

        // Validate attachment fields
        if (
          !attachment.attachmentType ||
          !attachment.attachmentName ||
          !attachment.attachmentSize ||
          !attachment.extention ||
          !attachment.file ||
          attachment.attachmentType === null ||
          attachment.attachmentName === null ||
          attachment.attachmentSize === null ||
          attachment.extention === null ||
          attachment.file === null
        ) {
          return res
            .status(400)
            .json({ error: "All attachment properties must be provided" });
        }

        const blobName = `${attachment.attachmentName}_${uuidv1()}${
          attachment.extention
        }`;

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload data to the blob
        const buffer = Buffer.from(attachment.file, "base64");
        const uploadBlobResponse = await blockBlobClient.upload(
          buffer,
          buffer.length
        );

        // Generate the document link
        const documentLink = `${process.env.CONTAINER_URL_BASE_URL}${process.env.CONTAINER_NAME}/${blobName}`;

        console.log(
          "Blob was uploaded successfully. requestId: ",
          uploadBlobResponse.requestId
        );

        // Add the document link to the array
        req.body.documentLink = documentLink;
      }
    }

    // Find an existing record or create a new one
    const existingRecord = await EmployeeIncomeTaxDeclarationHRA.findOne({
      employeeIncomeTaxDeclaration: req.body.employeeIncomeTaxDeclaration,
      month: req.body.month,
    });

    let employeeIncomeTaxDeclarationHRA;

    if (existingRecord) {
      // Update existing record
      employeeIncomeTaxDeclarationHRA =
        await EmployeeIncomeTaxDeclarationHRA.findByIdAndUpdate(
          existingRecord._id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );
    } else {
      // Create new record
      employeeIncomeTaxDeclarationHRA =
        await EmployeeIncomeTaxDeclarationHRA.create(req.body);
    }

    res.status(200).json({
      status: "success",
      data: employeeIncomeTaxDeclarationHRA,
    });
  }
);

exports.generateOTP = catchAsync(
  async (req, res, next) => {
  try {
      // Generate a random 4-digit pincode
      const otp = Math.floor(1000 + Math.random() * 9000);

      // Create a new pincode document
      const newOTP = new OTP({
          otp: otp,
          email: req.body.email,
          createdAt: new Date(),
          status: 'active'
      });
console.log(newOTP);
      // Save the pincode in the database
      const message=`Your OTP is ${otp}`;
      await newOTP.save();
      console.log(message);
      console.log("hello1");
      try {
        await sendEmail({
          email: req.body.email,
          subject:'OTP',
          message
        });
       
      } catch (err) {   
       console.log(err);
        return next(
          new AppError(
            'There was an error sending the email. Try again later.',
            500
          )
      );
    }
      // Send the pincode via email
     

      res.status(200).json({ message: 'OTP generated and emailed successfully.' });
  } catch (error) {
      res.status(500).json({ message: 'Error generating OTP'+error });
  }
});

exports.verifyOTP = catchAsync(
  async (req, res, next) => {
  try {
      const { email, otp } = req.body;
      const existingOTP = await OTP.findOne({ email, otp });

      if (!existingOTP || existingOTP.status !== 'active') {
          return res.status(400).json({ message: 'Invalid or expired OTP.' });
      }

      // Update pincode status to verified
      existingOTP.status = 'verified';
      await existingOTP.save();

      res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP' });
  }
});

exports.cancelOTP = catchAsync(
  async (req, res, next) => {
  try {
      const { email, otp } = req.body;
      const existingOTP = await OTP.findOne({ email, otp });

      if (!existingOTP) {
          return res.status(400).json({ message: 'OTP not found.' });
      }

      // Update pincode status to cancelled
      existingOTP.status = 'cancelled';
      await existingOTP.save();

      res.status(200).json({ message: 'OTP cancelled successfully.' });
  } catch (error) {
      res.status(500).json({ message: 'Error cancelling OTP' });
  }
});