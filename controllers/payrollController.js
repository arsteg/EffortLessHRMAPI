const GeneralSetting = require("../models/Payroll/PayrollGeneralSettingModel.js");
const RoundingRule = require("../models/Payroll/RoundingRulesModel");
const FixedAllowances = require("../models/Payroll/fixedAllowancesModel");
const FixedContribution = require("../models/Payroll/fixedContributionModel");
const catchAsync = require("../utils/catchAsync");
const LWFFixedContributionSlab = require("../models/Payroll/lwfFixedContributionSlabModel");
const LWFFixedDeductionMonth = require("../models/Payroll/lwfFixedDeductionMonthModel");
const PTEligibleStates = require("../models/Payroll/ptEligibleStatesModel");
const PTSlab = require("../models/Payroll/ptSlabModel");
const PTDeductionMonth = require("../models/Payroll/ptDeductionMonthModel");
const ESICCeilingAmount = require("../models/Payroll/esicCeilingAmountModel");
const ESICContribution = require("../models/Payroll/esicContributionModel");
const VariableAllowance = require("../models/Payroll/variableAllowanceModel");
const VariableAllowanceApplicableEmployee = require("../models/Payroll/variableAllowanceApplicableEmployeeModel");
const FixedDeduction = require("../models/Payroll/fixedDeductionModel");
const VariableDeduction = require("../models/Payroll/variableDeductionModel");
const VariableDeductionApplicableEmployee = require("../models/Payroll/variableDeductionApplicableEmployeeModel");
const LoanAdvancesCategory = require("../models/Payroll/loanAdvancesCategoryModel");
const FlexiBenefitsCategory = require("../models/Payroll/flexiBenefitsCategoryModel");
const PFCharge = require("../models/Payroll/pfChargeModel");
const CTCTemplate = require("../models/Payroll/ctcTemplateModel");
const AppError = require("../utils/appError.js");
const CTCTemplateFixedAllowance = require("../models/Payroll/ctcTemplateFixedAllowanceModel");
const CTCTemplateVariableDeduction = require("../models/Payroll/ctcTemplateVariableDeductionModel");
const CTCTemplateVariableAllowance = require("../models/Payroll/ctcTemplateVariableAllowanceModel");
const CTCTemplateFixedDeduction = require("../models/Payroll/ctcTemplateFixedDeductionModel");
const CTCTemplateEmployerContribution = require("../models/Payroll/ctcTemplateEmployerContributionModel");
const CTCTemplateEmployeeDeduction = require("../models/Payroll/ctcTemplateEmployeeDeductionModel");
const PTConfigureStates = require("../models/Payroll/ptConfigureStatesModel");
const PFTemplates = require("../models/Payroll/pfTemplateModel");
const Payroll = require('../models/Payroll/Payroll');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const PayrollUsers = require('../models/Payroll/PayrollUsers');
const PayrollAttendanceSummary = require('../models/Payroll/PayrollAttendanceSummary');
const PayrollFNFTerminationCompensation = require('../models/Payroll/PayrollFNFTerminationCompensation');
const EmployeeLoanAdvance = require("../models/Employment/EmployeeLoanAdvanceModel.js");
const PayrollVariablePay = require('../models/Payroll/PayrollVariablePay');
const PayrollFixedPay = require('../models/Payroll/PayrollFixedPay.js');
const PayrollFNFFixedPay = require('../models/Payroll/PayrollFNFFixedPay.js');
const PayrollManualArrears = require("../models/Payroll/PayrollManualArrears");
const PayrollLoanAdvance = require('../models/Payroll/PayrollLoanAdvance');
const PayrollIncomeTax = require('../models/Payroll/PayrollIncomeTax');
const PayrollFlexiBenefitsPFTax = require('../models/Payroll/PayrollFlexiBenefitsAndPFTax');
const PayrollOvertime = require('../models/Payroll/PayrollOvertime');
const PayrollFNF = require('../models/Payroll/PayrollFNF');
const PayrollFNFUsers = require('../models/Payroll/PayrollFNFUsers');
const PayrollFNFAttendanceSummary = require('../models/Payroll/PayrollFNFAttendanceSummary');
const PayrollFNFManualArrears = require("../models/Payroll/PayrollFNFManualArrears");
const PayrollFNFVariablePay = require('../models/Payroll/PayrollFNFVariablePay');
const constants = require('../constants');
const PayrollFNFLoanAdvance = require('../models/Payroll/PayrollFNFLoanAdvance');
const PayrollFNFStatutoryBenefits = require("../models/Payroll/PayrollFNFStatutoryBenefits");
const PayrollFNFStatutory = require("../models/Payroll/PayrollFNFStatutory");
const PayrollFNFFlexiBenefitsPFTax = require("../models/Payroll/PayrollFNFFlexiBenefitsAndPFTax");
const PayrollFNFIncomeTax = require('../models/Payroll/PayrollFNFIncomeTax');
const PayrollFNFOvertime = require('../models/Payroll/PayrollFNFOvertime');
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const SalaryComponentFixedAllowance = require("../models/Employment/SalaryComponentFixedAllowanceModel.js");
const SalaryComponentVariableAllowance = require("../models/Employment/SalaryComponentVariableAllowance.js");
const SalaryComponentFixedDeduction = require("../models/Employment/SalaryComponentFixedDeduction.js");
const SalaryComponentVariableDeduction = require("../models/Employment/SalaryComponentVariableDeduction.js");
const websocketHandler = require('../utils/websocketHandler');
const professionalTaxSlabs = require('../data/professionalTaxSlabs.json');
const PayrollStatutory = require('../models/Payroll/PayrollStatutory');
const payrollCalculationController = require('../controllers/payrollCalculationController');
const OvertimeInformation = require('../models/attendance/overtimeInformation');
const AttendanceRecords = require('../models/attendance/attendanceRecords');
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const scheduleController = require('../controllers/ScheduleController');
const { getFNFDateRange } = require('../Services/userDates.service');
const { getTotalPFAmount } = require('../Services/provident_fund.service');
const LOP = require('../models/attendance/lop.js');
const UserEmployment = require("../models/Employment/UserEmploymentModel");
const Appointment = require("../models/permissions/appointmentModel");
const moment = require("moment");
const AttendanceProcess = require('../models/attendance/AttendanceProcess');
const {
  calculateIncomeTax,       // Checks if LWF is applicable for the current month
  getTotalTDSEligibleAmount,
  getTotalMonthlyAllownaceAmount,       // Finds the correct LWF slab and calculates employee/employer contributions
  GetTDSAppicableAmountAfterDeclartion,
  getTotalHRAAmount
} = require('../Services/tds.service');
const ctcTemplateVariableDeductionModel = require("../models/Payroll/ctcTemplateVariableDeductionModel");

exports.createGeneralSetting = async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  try {
    const generalSetting = await GeneralSetting.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: generalSetting,
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      error: err.message,
    });
  }
};

exports.getGeneralSettingByCompanyId = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOne({
      companyId: req.cookies.companyId,
    });
    if (!generalSetting) {
      // return res.status(404).json({
      //   status: constants.APIResponseStatus.Failure,
      //   error: 'GeneralSetting not found'
      // });
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: [],
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: generalSetting,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      error: err.message,
    });
  }
};

exports.updateGeneralSetting = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOneAndUpdate(
      { companyId: req.cookies.companyId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!generalSetting) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        error: req.t('payroll.generalSettingNotFound'),
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: generalSetting,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      error: err.message,
    });
  }
};

exports.deleteGeneralSetting = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOneAndDelete({
      companyId: req.cookies.companyId,
    });
    if (!generalSetting) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        error: req.t('payroll.generalSettingNotFound'),
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      error: err.message,
    });
  }
};

exports.createRoundingRule = async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  // Validate generalSetting
  const generalSettingExists = await GeneralSetting.findById(
    req.body.generalSetting
  );
  if (!generalSettingExists) {
    return next(new AppErrorreq.t('payroll.invalidGeneralSetting'), 400);
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const roundingRule = await RoundingRule.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: roundingRule,
  });
};

exports.getRoundingRuleById = async (req, res, next) => {
  const roundingRule = await RoundingRule.findById(req.params.id);
  if (!roundingRule) {
    return next(new AppError(req.t('payroll.roundingRuleNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingRule,
  });
};

exports.updateRoundingRule = async (req, res, next) => {
  const roundingRule = await RoundingRule.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!roundingRule) {
    return next(new AppError(req.t('payroll.roundingRuleNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingRule,
  });
};

exports.deleteRoundingRule = async (req, res, next) => {
  const roundingRule = await RoundingRule.findByIdAndDelete(req.params.id);

  if (!roundingRule) {
    return next(new AppError(req.t('payroll.roundingRuleNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
};

exports.getAllRoundingRules = async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  const companyId = req.cookies.companyId;

  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const totalCount = await RoundingRule.countDocuments({ company: companyId });

  const roundingRules = await RoundingRule.find({ company: companyId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: roundingRules,
    total: totalCount,
  });
};

exports.createPFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: pfTemplate,
  });
});

/**
 * Controller to get a PF template by ID
 */
exports.getPFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findById(req.params.id);
  if (!pfTemplate) {
    return next(new AppError(req.t('payroll.pfTemplateNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: pfTemplate,
  });
});

/**
 * Controller to update a PF template by ID
 */
exports.updatePFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!pfTemplate) {
    return next(new AppError(req.t('payroll.pfTemplateNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: pfTemplate,
  });
});

/**
 * Controller to delete a PF template by ID
 */
exports.deletePFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findByIdAndDelete(req.params.id);

  if (!pfTemplate) {
    return next(new AppError(req.t('payroll.pfTemplateNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

/**
 * Controller to get all PF templates by company ID
 */
exports.getAllPFTemplatesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await PFTemplates.countDocuments({
    company: req.cookies.companyId,
  });

  const pfTemplates = await PFTemplates.find({})
    .where("company")
    .equals(req.cookies.companyId)
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: pfTemplates,
    total: totalCount,
  });
});

exports.createFixedAllowances = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const { label } = req.body;

  // Check if a template with the same label already exists for the company
  const existingFixedAllowances = await FixedAllowances.findOne({ label, company: companyId });
  if (existingFixedAllowances) {
    websocketHandler.sendLog(req, `Fixed Allowances with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_fixed_allowance_label_error'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const fixedAllowances = await FixedAllowances.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: fixedAllowances,
  });
});

exports.getFixedAllowancesById = catchAsync(async (req, res, next) => {
  const fixedAllowances = await FixedAllowances.findById(req.params.id);
  if (!fixedAllowances) {
    return next(new AppError(req.t('payroll.fixedAllowancesNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedAllowances,
  });
});

exports.updateFixedAllowances = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const { label } = req.body;
  const existingFixedAllowances = await FixedAllowances.findOne({ label, company: companyId, _id: { $ne: req.params.id }, });
  if (existingFixedAllowances) {
    websocketHandler.sendLog(req, `Fixed Allowances with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_fixed_allowance_label_error'), 400));
  }

  const fixedAllowances = await FixedAllowances.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!fixedAllowances) {
    return next(new AppError(req.t('payroll.fixedAllowancesNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedAllowances,
  });
});

exports.deleteFixedAllowances = catchAsync(async (req, res, next) => {
  // Step 1: Find the document first
  const fixedAllowance = await FixedAllowances.findById(req.params.id);

  // Step 2: If not found, return 404
  if (!fixedAllowance) {
    return next(new AppError(req.t('payroll.fixedAllowancesNotFound'), 404));
  }
  const isUsedInSalaryStructure = await SalaryComponentFixedAllowance.findOne({
    fixedAllowance: req.params.id
  });
  const isUsedInCTCTemplate = await CTCTemplateFixedAllowance.findOne({
    fixedAllowance: req.params.id
  });
  if (isUsedInSalaryStructure || isUsedInCTCTemplate) {
    return next(new AppError(req.t('payroll.fixedAllowancesAlreadyExistsinUse'), 404));
  }

  // Step 3: Check if deletion is allowed
  if (!fixedAllowance.isDelete) {
    return next(new AppError(req.t('payroll.deletionNotAllowed'), 400));
  }

  // Step 4: Proceed to delete
  await FixedAllowances.findByIdAndDelete(req.params.id);

  // Step 5: Return success response
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});


exports.getAllFixedAllowances = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;

  const totalCount = await FixedAllowances.countDocuments({
    company: req.cookies.companyId,
  });

  // If 'next' is null or not a number, fetch all
  const limit =
    req.body.next === null || req.body.next === undefined || isNaN(parseInt(req.body.next))
      ? totalCount
      : parseInt(req.body.next);

  const fixedAllowances = await FixedAllowances.find({ company: req.cookies.companyId })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedAllowances,
    total: totalCount,
  });
});


exports.createFixedContribution = catchAsync(async (req, res, next) => {
  const fixedContributions = await FixedContribution.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: fixedContributions,
  });
});

exports.getAllFixedContributions = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await FixedContribution.countDocuments({
    company: req.cookies.companyId,
  });

  const fixedContributions = await FixedContribution.find({
    company: req.cookies.companyId,
  })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedContributions,
    total: totalCount,
  });
});

exports.createFixedContributionSlab = async (req, res, next) => {
  try {
    // Extract companyId from req.cookies
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }

    // Add companyId to the request body
    req.body.company = companyId;

    const fixedContributionSlab = await LWFFixedContributionSlab.create(
      req.body
    );
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: fixedContributionSlab,
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab = await LWFFixedContributionSlab.findById(
      req.params.id
    );
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.fixedContributionSlabNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: fixedContributionSlab,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.updateFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab =
      await LWFFixedContributionSlab.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.fixedContributionSlabNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: fixedContributionSlab,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.deleteFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab =
      await LWFFixedContributionSlab.findByIdAndDelete(req.params.id);
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.fixedContributionSlabNotFound'),
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getAllFixedContributionSlabs = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LWFFixedContributionSlab.countDocuments({
      company: req.cookies.companyId,
    });

    const fixedContributionSlabs = await LWFFixedContributionSlab.find({})
      .where("company")
      .equals(req.cookies.companyId)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: fixedContributionSlabs,
      total: totalCount,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getAllFixedContributionSlabsByState = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LWFFixedContributionSlab.countDocuments({
      state: req.body.state,
    });

    const fixedContributionSlabs = await LWFFixedContributionSlab.find({})
      .where("state")
      .equals(req.body.state)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: fixedContributionSlabs,
      total: totalCount,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
// controllers/payrollController.js

exports.createLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }

    // Add companyId to the request body
    req.body.company = companyId;

    const lwfFixedDeductionMonth = await LWFFixedDeductionMonth.create(
      req.body
    );
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: lwfFixedDeductionMonth,
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonth = await LWFFixedDeductionMonth.findById(
      req.params.id
    );
    if (!lwfFixedDeductionMonth) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.lwfFixedDeductionMonthNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: lwfFixedDeductionMonth,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.saveLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const { months } = req.body;
    const companyId = req.cookies.companyId;

    if (!companyId) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }
    const updateOrInsertPromises = months.map(async (month) => {
      const existingRecord = await LWFFixedDeductionMonth.findOne({
        company: companyId,
        paymentMonth: month.paymentMonth
      });

      if (existingRecord) {
        // Update existing record
        await LWFFixedDeductionMonth.updateOne(
          { _id: existingRecord._id },
          { $set: { processMonth: month.processMonth } }
        );
      } else {
        // Create new record
        await LWFFixedDeductionMonth.create({
          company: companyId,
          paymentMonth: month.paymentMonth,
          processMonth: month.processMonth
        });
      }
    });

    await Promise.all(updateOrInsertPromises);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('payroll.LWFFixedDeductionMonthsUpdatedSuccessfully'),
    });
  } catch (error) {
    return next(new AppError(err.message, 400));
  }
};

exports.deleteLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonth =
      await LWFFixedDeductionMonth.findByIdAndDelete(req.params.id);
    if (!lwfFixedDeductionMonth) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.LWFFixedDeductionMonthNotFound'),
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getAllLWFFixedDeductionMonths = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonths = await LWFFixedDeductionMonth.find({})
      .where("company")
      .equals(req.cookies.companyId);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: lwfFixedDeductionMonths,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};
exports.getAllPTEligibleStates = async (req, res, next) => {
  try {
    const ptEligibleStates = await PTEligibleStates.find({})
      .where("company")
      .equals(req.cookies.companyId);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptEligibleStates,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.createPTConfigureState = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const ptConfigureState = await PTConfigureStates.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: ptConfigureState,
  });
});

exports.getPTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findById(req.params.id);
  if (!ptConfigureState) {
    return next(new AppError(req.t('payroll.ptConfigureStateNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ptConfigureState,
  });
});

exports.updatePTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ptConfigureState) {
    return next(new AppError(req.t('payroll.ptConfigureStateNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ptConfigureState,
  });
});

exports.deletePTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findByIdAndDelete(
    req.params.id
  );

  if (!ptConfigureState) {
    return next(new AppError(req.t('payroll.ptConfigureStateNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllPTConfigureStatesByCompany = catchAsync(
  async (req, res, next) => {
    const ptConfigureStates = await PTConfigureStates.find({
      company: req.cookies.companyId,
    });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptConfigureStates,
    });
  }
);

exports.addUpdatePTEligibleStates = async (req, res, next) => {
  const company = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Check if the request body contains the required fields
  if (!req.body.states) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const { states } = req.body;
  // Iterate over the states array and add/update each state
  const updatedStates = [];
  for (const stateObj of states) {
    const { state, isEligible } = stateObj;
    let ptEligibleState;
    // Find existing state or create a new one if not found
    const existingState = await PTEligibleStates.findOne({ company, state });
    if (existingState) {
      // Update existing state
      ptEligibleState = await PTEligibleStates.findByIdAndUpdate(
        existingState._id,
        { isEligible },
        { new: true }
      );
    } else {
      // Create new state
      ptEligibleState = await PTEligibleStates.create({
        company,
        state,
        isEligible,
      });
    }
    updatedStates.push(ptEligibleState);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedStates,
  });
};
exports.addPTSlab = async (req, res, next) => {
  try {
    const company = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!company) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }
    req.body.company = company;
    const ptSlab = await PTSlab.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: ptSlab,
    });
  } catch (error) {
    next(error);
  }
};

exports.getStateWisePTSlabs = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: professionalTaxSlabs
  });
});


exports.getAllPTSlabs = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await PTSlab.countDocuments({
      company: req.cookies.companyId,
    });

    const ptSlabs = await PTSlab.where("company")
      .equals(req.cookies.companyId)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptSlabs,
      total: totalCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePTSlab = async (req, res, next) => {
  try {
    const ptSlab = await PTSlab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ptSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptSlabNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptSlab,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPTSlabById = async (req, res, next) => {
  try {
    const ptSlab = await PTSlab.findById(req.params.id);
    if (!ptSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptSlabNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptSlab,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePTSlab = async (req, res, next) => {
  try {
    const ptSlab = await PTSlab.findByIdAndDelete(req.params.id);
    if (!ptSlab) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptSlabNotFound'),
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.addPTDeductionMonth = async (req, res, next) => {
  try {
    const company = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!company) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }
    req.body.company = company;

    const ptDeductionMonth = await PTDeductionMonth.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: ptDeductionMonth,
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getAllPTDeductionMonths = async (req, res, next) => {
  try {
    const ptDeductionMonths = await PTDeductionMonth.where("company").equals(
      req.cookies.companyId
    );
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptDeductionMonths,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.getPTDeductionMonthById = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findById(req.params.id);
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptDeductionMonthNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptDeductionMonth,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.updatePTDeductionMonth = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptDeductionMonthNotFound'),
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ptDeductionMonth,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};

exports.deletePTDeductionMonth = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findByIdAndDelete(
      req.params.id
    );
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.ptDeductionMonthNotFound'),
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
};
// Add a CeilingAmount
exports.createCeilingAmount = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  req.body.company = company;
  req.body.period = "Monthly";
  req.body.roundType = "Round Up";
  const ceilingAmount = await ESICCeilingAmount.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: ceilingAmount,
  });
});

// Get all CeilingAmounts by company
exports.getCeilingAmountsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await ESICCeilingAmount.countDocuments({
    company: req.cookies.companyId,
  });

  const ceilingAmounts = await ESICCeilingAmount.where("company")
    .equals(req.cookies.companyId)
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ceilingAmounts,
    total: totalCount,
  });
});

// Update a CeilingAmount by ID
exports.updateCeilingAmount = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ceilingAmount) {
    return next(new AppError(req.t('payroll.ceilingAmountNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ceilingAmount,
  });
});

// Get a CeilingAmount by ID
exports.getCeilingAmountById = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findById(req.params.id);

  if (!ceilingAmount) {
    return next(new AppError(req.t('payroll.ceilingAmountNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ceilingAmount,
  });
});

// Delete a CeilingAmount by ID
exports.deleteCeilingAmount = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findByIdAndDelete(
    req.params.id
  );

  if (!ceilingAmount) {
    return next(new AppError(req.t('payroll.ceilingAmountNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.addESICContribution = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const esicContribution = await ESICContribution.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: esicContribution,
  });
});

exports.getAllESICContributionsByCompany = catchAsync(
  async (req, res, next) => {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await ESICContribution.countDocuments({
      company: req.cookies.companyId,
    });

    const esicContributions = await ESICContribution.where("company")
      .equals(req.cookies.companyId)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: esicContributions,
      total: totalCount,
    });
  }
);

exports.updateESICContribution = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!esicContribution) {
    return next(new AppError(req.t('payroll.esicContributionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: esicContribution,
  });
});

exports.getESICContributionById = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findById(req.params.id);

  if (!esicContribution) {
    return next(new AppError(req.t('payroll.esicContributionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: esicContribution,
  });
});

exports.deleteESICContribution = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findByIdAndDelete(
    req.params.id
  );

  if (!esicContribution) {
    return next(new AppError(req.t('payroll.esicContributionNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Create a new VariableAllowance
exports.createVariableAllowance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const { label } = req.body;
  const existinVariableAllowance = await VariableAllowance.findOne({ label, company: companyId });
  if (existinVariableAllowance) {
    websocketHandler.sendLog(req, `Variable Allowance with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_variable_Allownace_label_error'), 400));
  }
  const variableAllowance = await VariableAllowance.create(req.body);
  if (
    req.body.variableAllowanceApplicableEmployee &&
    req.body.variableAllowanceApplicableEmployee.length > 0
  ) {
    const result = req.body.variableAllowanceApplicableEmployee.map((item) => ({
      variableAllowance: variableAllowance._id,
      employee: item.employee,
    }));
    variableAllowance.variableAllowanceApplicableEmployees =
      await VariableAllowanceApplicableEmployee.insertMany(result);
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: variableAllowance,
  });
});

// Get all VariableAllowances by company
exports.getAllVariableAllowancesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;

  const totalCount = await VariableAllowance.countDocuments({
    company: req.cookies.companyId,
  });

  // If 'next' is null/undefined/invalid, fetch all
  const limit =
    req.body.next === null || req.body.next === undefined || isNaN(parseInt(req.body.next))
      ? totalCount
      : parseInt(req.body.next);

  const variableAllowances = await VariableAllowance.find({ company: req.cookies.companyId })
    .skip(skip)
    .limit(limit);

  if (variableAllowances) {
    for (let i = 0; i < variableAllowances.length; i++) {
      const applicableEmployees = await VariableAllowanceApplicableEmployee.find({
        variableAllowance: variableAllowances[i]._id,
      });

      variableAllowances[i] = variableAllowances[i].toObject(); // Convert to plain object to assign new props
      variableAllowances[i].variableAllowanceApplicableEmployees =
        applicableEmployees || null;
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableAllowances,
    total: totalCount,
  });
});


// Get a VariableAllowance by ID
exports.getVariableAllowanceById = catchAsync(async (req, res, next) => {
  const variableAllowance = await VariableAllowance.findById(req.params.id);
  if (variableAllowance) {
    const variableAllowanceApplicableEmployees =
      await VariableAllowanceApplicableEmployee.find({})
        .where("variableAllowance")
        .equals(variableAllowance._id);
    if (variableAllowanceApplicableEmployees) {
      variableAllowance.variableAllowanceApplicableEmployees =
        variableAllowanceApplicableEmployees;
    } else {
      variableAllowance.variableAllowanceApplicableEmployees = null;
    }
  }
  if (!variableAllowance) {
    return next(new AppError(req.t('payroll.variableAllowanceNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableAllowance,
  });
});

// Update a VariableAllowance by ID
exports.updateVariableAllowance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const { label } = req.body;
  const existinVariableAllowance = await VariableAllowance.findOne({ label, company: companyId, _id: { $ne: req.params.id } });
  if (existinVariableAllowance) {
    websocketHandler.sendLog(req, `Variable Allowance with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_variable_Allownace_label_error'), 400));
  }
  const variableAllowance = await VariableAllowance.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (
    req.body.variableAllowanceApplicableEmployee &&
    req.body.variableAllowanceApplicableEmployee.length > 0
  ) {
    await VariableAllowanceApplicableEmployee.deleteMany({
      variableAllowance: variableAllowance._id,
    });
    const result = req.body.variableAllowanceApplicableEmployee.map((item) => ({
      variableAllowance: variableAllowance._id,
      employee: item.employee,
    }));
    variableAllowance.variableAllowanceApplicableEmployees =
      await VariableAllowanceApplicableEmployee.insertMany(result);
  }
  if (!variableAllowance) {
    return next(new AppError(req.t('payroll.variableAllowanceNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableAllowance,
  });
});

// Delete a VariableAllowance by ID
exports.deleteVariableAllowance = catchAsync(async (req, res, next) => {
  const variableAllowanceExists = await VariableAllowance.findById(req.params.id);

  // Step 2: If not found, return 404
  if (!variableAllowanceExists) {
    return next(new AppError(req.t('payroll.variableAllowanceNotFound'), 404));
  }
  const isUsedInSalaryStructure = await SalaryComponentVariableAllowance.findOne({
    variableAllowance: req.params.id
  });
  const isUsedInCTCTemplate = await CTCTemplateVariableAllowance.findOne({
    variableAllowance: req.params.id
  });
  if (isUsedInSalaryStructure || isUsedInCTCTemplate) {
    return next(new AppError(req.t('payroll.variableAllowancesAlreadyExistsinUse'), 404));
  }

  const variableAllowance = await VariableAllowance.findByIdAndDelete(
    req.params.id
  );
  if (!variableAllowance) {
    return next(new AppError(req.t('payroll.variableAllowanceNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Create Fixed Deduction
exports.createFixedDeduction = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const { label } = req.body;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const existingFixedDeduction = await FixedDeduction.findOne({ label, company: companyId });
  if (existingFixedDeduction) {
    websocketHandler.sendLog(req, `Fixed Deduction with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_fixed_Deduction_label_error'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const fixedDeduction = await FixedDeduction.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: fixedDeduction,
  });
});

// Get all Fixed Deductions by company
exports.getAllFixedDeductionsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;

  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const totalCount = await FixedDeduction.countDocuments({ company: companyId });

  // Use totalCount if 'next' is null/undefined/invalid
  const limit =
    req.body.next === null || req.body.next === undefined || isNaN(parseInt(req.body.next))
      ? totalCount
      : parseInt(req.body.next);

  const fixedDeductions = await FixedDeduction.find({ company: companyId })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedDeductions,
    total: totalCount,
  });
});

// Get Fixed Deduction by ID
exports.getFixedDeductionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const fixedDeduction = await FixedDeduction.findById(id);

  if (!fixedDeduction) {
    return next(new AppError(req.t('payroll.fixedDeductionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedDeduction,
  });
});

// Update Fixed Deduction
exports.updateFixedDeduction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const { label } = req.body;
  const existingeFixedDeduction = await FixedDeduction.findOne({ label, company: companyId, _id: { $ne: req.params.id } });
  if (existingeFixedDeduction) {
    websocketHandler.sendLog(req, `Fixed Deduction with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_fixed_Deduction_label_error'), 400));
  }
  const fixedDeduction = await FixedDeduction.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!fixedDeduction) {
    return next(new AppError(req.t('payroll.fixedDeductionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: fixedDeduction,
  });
});

// Delete Fixed Deduction
exports.deleteFixedDeduction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const isUsedInSalaryStructure = await SalaryComponentFixedDeduction.findOne({
    fixedDeduction: req.params.id
  });
  const isUsedInCTCTemplate = await SalaryComponentFixedDeduction.findOne({
    fixedDeduction: req.params.id
  });
  if (isUsedInSalaryStructure || isUsedInCTCTemplate) {
    return next(new AppError(req.t('payroll.fixedDeductionAlreadyExistsinUse'), 404));
  }
  const fixedDeduction = await FixedDeduction.findByIdAndDelete(id);

  if (!fixedDeduction) {
    return next(new AppError(req.t('payroll.fixedDeductionNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.createVariableDeduction = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const { label } = req.body;
  const existingVariableDeduction = await VariableDeduction.findOne({ label, company: companyId });
  if (existingVariableDeduction) {
    websocketHandler.sendLog(req, `Fixed Deduction with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_variable_Deduction_label_error'), 400));
  }
  const variableDeduction = await VariableDeduction.create(req.body);
  if (
    req.body.variableDeductionApplicableEmployee &&
    req.body.variableDeductionApplicableEmployee.length > 0
  ) {
    const result = req.body.variableDeductionApplicableEmployee.map((item) => ({
      variableDeduction: variableDeduction._id,
      employee: item.employee,
    }));
    variableDeduction.variableDeductionApplicableEmployees =
      await VariableDeductionApplicableEmployee.insertMany(result);
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: variableDeduction,
  });
});

exports.getAllVariableDeductions = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;

  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const totalCount = await VariableDeduction.countDocuments({ company });

  // Use totalCount if 'next' is null/undefined/invalid
  const limit =
    req.body.next === null || req.body.next === undefined || isNaN(parseInt(req.body.next))
      ? totalCount
      : parseInt(req.body.next);

  const variableDeductions = await VariableDeduction.find({ company })
    .skip(skip)
    .limit(limit);

  if (variableDeductions) {
    for (let i = 0; i < variableDeductions.length; i++) {
      const applicableEmployees = await VariableDeductionApplicableEmployee.find({
        variableDeduction: variableDeductions[i]._id,
      });

      variableDeductions[i].variableDeductionApplicableEmployees =
        applicableEmployees.length > 0 ? applicableEmployees : null;
    }
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableDeductions,
    total: totalCount,
  });
});


exports.getVariableDeductionById = catchAsync(async (req, res, next) => {
  const variableDeduction = await VariableDeduction.findById(req.params.id);
  if (!variableDeduction) {
    return next(new AppError(req.t('payroll.variableDeductionNotFound'), 404));
  }
  if (variableDeduction) {
    const variableDeductionApplicableEmployees =
      await VariableDeductionApplicableEmployee.find({})
        .where("variableDeduction")
        .equals(variableDeduction._id);
    if (variableDeductionApplicableEmployees) {
      variableDeduction.variableDeductionApplicableEmployees =
        variableDeductionApplicableEmployees;
    } else {
      variableDeduction.variableDeductionApplicableEmployees = null;
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableDeduction,
  });
});

exports.updateVariableDeduction = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const { label } = req.body;
  const existingVariableDeduction = await VariableDeduction.findOne({ label, company: companyId, _id: { $ne: req.params.id } });
  if (existingVariableDeduction) {
    websocketHandler.sendLog(req, `Fixed Deduction with label "${label}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_variable_Deduction_label_error'), 400));
  }
  const variableDeduction = await VariableDeduction.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (
    req.body.variableDeductionnApplicableEmployee &&
    req.body.variableDeductionApplicableEmployee.length > 0
  ) {
    await VariableDeductionApplicableEmployee.deleteMany({
      variableDeduction: variableDeduction._id,
    });
    const result = req.body.variableDeductionApplicableEmployee.map((item) => ({
      variableDeduction: variableDeduction._id,
      employee: item.employee,
    }));
    variableDeduction.variableDeductionApplicableEmployees =
      await VariableDeductionApplicableEmployee.insertMany(result);
  }
  if (!variableDeduction) {
    return next(new AppError(req.t('payroll.variableDeductionNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: variableDeduction,
  });
});

exports.deleteVariableDeduction = catchAsync(async (req, res, next) => {
  const variableDeductionExists = await VariableDeduction.findById(req.params.id);

  // Step 2: If not found, return 404
  if (!variableDeductionExists) {
    return next(new AppError(req.t('payroll.variableDeductionNotFound'), 404));
  }
  const isUsedInSalaryStructure = await SalaryComponentVariableDeduction.findOne({
    variableDeduction: req.params.id
  });
  const isUsedInCTCTemplate = await ctcTemplateVariableDeductionModel.findOne({
    variableDeduction: req.params.id
  });
  if (isUsedInSalaryStructure || isUsedInCTCTemplate) {
    return next(new AppError(req.t('payroll.variableDeductionAlreadyExistsinUse'), 404));
  }

  const variableDeduction = await VariableDeduction.findByIdAndDelete(
    req.params.id
  );
  if (!variableDeduction) {
    return next(new AppError(req.t('payroll.variableDeductionNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.addLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const existingCategory = await LoanAdvancesCategory.findOne({
    name: name,
    company: companyId,
  });
  if (existingCategory) {
    return next(new AppError(req.t('payroll.loanAdvancesCategoryExists'), 400));
  }
  req.body.company = companyId;
  const loanAdvancesCategory = await LoanAdvancesCategory.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: loanAdvancesCategory,
  });
});

exports.getAllLoanAdvancesCategoriesByCompany = catchAsync(
  async (req, res, next) => {
    const companyId = req.cookies.companyId;
    const skip = parseInt(req.body.skip) || 0;

    if (!companyId) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }

    const totalCount = await LoanAdvancesCategory.countDocuments({
      company: companyId,
    });

    // Return all if next is null, undefined, or 0
    const limit =
      req.body.next === null ||
        req.body.next === undefined ||
        parseInt(req.body.next) === 0
        ? totalCount
        : parseInt(req.body.next);

    const loanAdvancesCategories = await LoanAdvancesCategory.find({
      company: companyId,
    })
      .skip(skip)
      .limit(limit);

    if (!loanAdvancesCategories || loanAdvancesCategories.length === 0) {
      return next(
        new AppError(req.t('payroll.noLoanAdvancesCategoriesFound'), 404)
      );
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: loanAdvancesCategories,
      total: totalCount,
    });
  }
);


exports.getLoanAdvancesCategoryById = catchAsync(async (req, res, next) => {
  const loanAdvancesCategory = await LoanAdvancesCategory.findById(
    req.params.id
  );
  if (!loanAdvancesCategory) {
    return next(new AppError(req.t('payroll.loanAdvancesCategoryNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: loanAdvancesCategory,
  });
});

exports.updateLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const existingCategory = await LoanAdvancesCategory.findOne({
    name: name,
    company: companyId,
    _id: { $ne: req.params.id }
  });
  if (existingCategory) {
    return next(new AppError(req.t('payroll.loanAdvancesCategoryExists'), 400));
  }
  const loanAdvancesCategory = await LoanAdvancesCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!loanAdvancesCategory) {
    return next(new AppError(req.t('payroll.loanAdvancesCategoryNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: loanAdvancesCategory,
  });
});

exports.deleteLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const loanAdvancesCategory = await LoanAdvancesCategory.findByIdAndDelete(
    req.params.id
  );
  if (!loanAdvancesCategory) {
    return next(new AppError(req.t('payroll.loanAdvancesCategoryNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Create a new FlexiBenefitsCategory
exports.createFlexiBenefitsCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const existingCategory = await FlexiBenefitsCategory.findOne({
    name: name,
    company: companyId,
  });
  req.body.company = companyId;
  if (existingCategory) {
    return next(
      new AppError(req.t('payroll.flexiBenefitsCategoryExists'), 400)
    );
  }

  const flexiBenefitsCategory = await FlexiBenefitsCategory.create(req.body);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: flexiBenefitsCategory,
  });
});

// Get all FlexiBenefitsCategory by company
exports.getAllFlexiBenefitsCategoryByCompany = catchAsync(
  async (req, res, next) => {
    const companyId = req.cookies.companyId;
    const skip = parseInt(req.body.skip) || 0;

    if (!companyId) {
      return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
    }

    const totalCount = await FlexiBenefitsCategory.countDocuments({
      company: companyId,
    });

    // If 'next' is null, undefined, or 0, fetch all
    const limit =
      req.body.next === null ||
        req.body.next === undefined ||
        parseInt(req.body.next) === 0
        ? totalCount
        : parseInt(req.body.next);

    const flexiBenefitsCategories = await FlexiBenefitsCategory.find({
      company: companyId,
    })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: flexiBenefitsCategories,
      total: totalCount,
    });
  }
);

// Update a FlexiBenefitsCategory
exports.updateFlexiBenefitsCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const existingCategory = await FlexiBenefitsCategory.findOne({
    name: name,
    company: companyId,
    _id: { $ne: req.params.id }
  });
  if (existingCategory) {
    return next(new AppError(req.t('payroll.flexiBenefitsCategoryExists'), 400));
  }
  const updatedCategory = await FlexiBenefitsCategory.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCategory) {
    return next(new AppError(req.t('payroll.flexiBenefitsCategoryNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedCategory,
  });
});

// Get a FlexiBenefitsCategory by ID
exports.getFlexiBenefitsCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const flexiBenefitsCategory = await FlexiBenefitsCategory.findById(id);

  if (!flexiBenefitsCategory) {
    return next(new AppError(req.t('payroll.flexiBenefitsCategoryNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: flexiBenefitsCategory,
  });
});

// Delete a FlexiBenefitsCategory
exports.deleteFlexiBenefitsCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const flexiBenefitsCategory = await FlexiBenefitsCategory.findByIdAndDelete(
    id
  );

  if (!flexiBenefitsCategory) {
    return next(new AppError(req.t('payroll.flexiBenefitsCategoryNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.createPFCharge = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const pfCharge = await PFCharge.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: pfCharge,
  });
});

exports.getPFChargesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const totalCount = await PFCharge.countDocuments({
    company: req.cookies.companyId,
  });

  // Assuming PFCharge has a field 'company' to relate PF Charges to a specific company
  const pfCharges = await PFCharge.find({ company: companyId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: pfCharges,
    total: totalCount,
  });
});

exports.createCTCTemplate = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const {
    ctcTemplateFixedAllowance,
    ctcTemplateFixedDeduction,
    ctcTemplateVariableAllowance,
    ctcTemplateVariableDeduction,
    ctcTemplateEmployerContribution,
    ctcTemplateEmployeeDeduction,
    ...ctcTemplateData
  } = req.body;
  const existingCTCTemplate = await CTCTemplate.findOne({ name: ctcTemplateData.name, company: companyId });
  if (existingCTCTemplate) {
    websocketHandler.sendLog(req, `CTCTemplate Allowances with label "${ctcTemplateData.name}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_ctc_template_name_error'), 400));
  }

  ctcTemplateData.company = companyId;

  for (const allowance of ctcTemplateFixedAllowance) {
    const result = await FixedAllowances.findById(allowance.fixedAllowance);

    if (!result) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('payroll.invalidFixedAllowances'),
      });
    }
  }
  const ctcTemplate = await CTCTemplate.create(ctcTemplateData);
  ctcTemplate.ctcTemplateFixedAllowances = await updateOrCreateFixedAllowances(
    ctcTemplate._id,
    req.body.ctcTemplateFixedAllowance
  );

  if (ctcTemplateFixedDeduction.length > 0) {
    for (const deduction of ctcTemplateFixedDeduction) {
      const result = await FixedDeduction.findById(deduction.fixedDeduction);

      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidFixedDeduction')
        });
      }
    }
    ctcTemplate.ctcTemplateFixedDeductions = await updateOrCreateFixedDeduction(
      ctcTemplate._id,
      req.body.ctcTemplateFixedDeduction
    );
  }
  //

  if (ctcTemplateVariableAllowance.length > 0) {
    for (const allowance of ctcTemplateVariableAllowance) {
      const result = await VariableAllowance.findById(
        allowance.variableAllowance
      );

      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidVariableAllowance'),
        });
      }
    }
    ctcTemplate.ctcTemplateVariableAllowances =
      await updateOrCreateVariableAllownace(
        ctcTemplate._id,
        ctcTemplateVariableAllowance
      );
  }

  if (ctcTemplateVariableDeduction.length > 0) {
    for (const allowance of ctcTemplateVariableDeduction) {
      const result = await VariableDeduction.findById(
        allowance.variableDeduction
      );

      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidVariableDeduction'),
        });
      }
    }
    ctcTemplate.ctcTemplateVariableDeductions =
      await updateOrCreateVariableDeduction(
        ctcTemplate._id,
        ctcTemplateVariableDeduction
      );
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: ctcTemplate,
  });
});
exports.checkCTCTemplateDuplicateV1 = catchAsync(async (req, res, next) => {

  const { name, id } = req.body;

  let existingCTCTemplate;
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  if (!name) {
    return next(new AppError(req.t('payroll.template_name_required'), 400));
  }
  if (id) {
    // ✅ Edit mode: Exclude current ID
    existingCTCTemplate = await CTCTemplate.findOne({
      name,
      company: companyId,
      _id: { $ne: id } // Exclude current record
    });
  } else {
    // ✅ Create mode
    existingCTCTemplate = await CTCTemplate.findOne({ name, company: companyId });
  }

  if (existingCTCTemplate) {
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      isDuplicate: true,
      message: req.t('payroll.duplicate_ctc_template_name_error'),
    });
  }

  return res.status(200).json({
    status: constants.APIResponseStatus.Success,
    isDuplicate: false,
    message: req.t('payroll.template_name_available'),
  });
});

async function updateOrCreateVariableAllownace(ctcTemplateId, updatedCategories) {
  if (!updatedCategories || updatedCategories.length === 0) {
    console.log("Hii");
    await CTCTemplateVariableAllowance.deleteMany({ ctcTemplate: ctcTemplateId });
    return [];
  }
  const existingCategories = await CTCTemplateVariableAllowance.find({
    ctcTemplate: ctcTemplateId,
  });

  const operations = [];
  const matchedIds = new Set();

  for (const category of updatedCategories) {
    if (category._id) {
      const existing = existingCategories.find(
        (e) => e._id.toString() === category._id
      );

      if (existing) {
        matchedIds.add(existing._id.toString());
        Object.assign(existing, category);
        operations.push(existing.save());
        continue;
      }
    }

    // New category creation (no valid _id match)
    const newCategory = new CTCTemplateVariableAllowance({
      ctcTemplate: ctcTemplateId,
      ...category,
    });
    operations.push(newCategory.save());
  }

  // Remove any that are not in the new list
  const toRemove = existingCategories.filter(
    (e) => !matchedIds.has(e._id.toString())
  );

  for (const category of toRemove) {
    operations.push(CTCTemplateVariableAllowance.findByIdAndDelete(category._id));
  }

  await Promise.all(operations);

  return CTCTemplateVariableAllowance.find({ ctcTemplate: ctcTemplateId });
}


async function updateOrCreateVariableDeduction(ctcTemplateId, updatedCategories) {
  if (!updatedCategories || updatedCategories.length === 0) {
    await CTCTemplateVariableDeduction.deleteMany({ ctcTemplate: ctcTemplateId });
    return [];
  }
  const existingCategories = await CTCTemplateVariableDeduction.find({
    ctcTemplate: ctcTemplateId,
  });

  const operations = [];
  const matchedIds = new Set();

  for (const category of updatedCategories) {
    if (category._id) {
      const existing = existingCategories.find(
        (e) => e._id.toString() === category._id
      );

      if (existing) {
        matchedIds.add(existing._id.toString());
        Object.assign(existing, category);
        operations.push(existing.save());
        continue;
      }
    }

    // Create new entry
    const newCategory = new CTCTemplateVariableDeduction({
      ctcTemplate: ctcTemplateId,
      ...category,
    });
    operations.push(newCategory.save());
  }

  // Remove obsolete records
  const toRemove = existingCategories.filter(
    (e) => !matchedIds.has(e._id.toString())
  );

  for (const category of toRemove) {
    operations.push(CTCTemplateVariableDeduction.findByIdAndDelete(category._id));
  }

  await Promise.all(operations);

  return CTCTemplateVariableDeduction.find({ ctcTemplate: ctcTemplateId });
}

async function updateOrCreateFixedAllowances(ctcTemplateId, updatedCategories) {
  if (!updatedCategories || updatedCategories.length === 0) {
    await CTCTemplateFixedAllowance.deleteMany({ ctcTemplate: ctcTemplateId });
    return [];
  }
  const existingCategories = await CTCTemplateFixedAllowance.find({
    ctcTemplate: ctcTemplateId,
  });

  const operations = [];
  const matchedIds = new Set();

  for (const category of updatedCategories) {
    // If _id is present, attempt to update
    if (category._id) {
      const existing = existingCategories.find(
        (e) => e._id.toString() === category._id
      );

      if (existing) {
        matchedIds.add(existing._id.toString());
        Object.assign(existing, category);
        operations.push(existing.save());
        continue;
      }
    }

    // Else, create new
    const newCategory = new CTCTemplateFixedAllowance({
      ctcTemplate: ctcTemplateId,
      ...category,
    });
    operations.push(newCategory.save());
  }

  // Remove any existing not matched
  const toRemove = existingCategories.filter(
    (e) => !matchedIds.has(e._id.toString())
  );

  for (const category of toRemove) {
    operations.push(CTCTemplateFixedAllowance.findByIdAndDelete(category._id));
  }

  await Promise.all(operations);

  return CTCTemplateFixedAllowance.find({ ctcTemplate: ctcTemplateId });
}

async function updateOrCreateFixedDeduction(ctcTemplateId, updatedCategories) {
  if (!updatedCategories || updatedCategories.length === 0) {
    await CTCTemplateFixedDeduction.deleteMany({ ctcTemplate: ctcTemplateId });
    return [];
  }
  const existingCategories = await CTCTemplateFixedDeduction.find({
    ctcTemplate: ctcTemplateId,
  });

  const operations = [];
  const matchedIds = new Set();

  for (const category of updatedCategories) {
    // If _id is present, attempt to update the existing document
    if (category._id) {
      const existing = existingCategories.find(
        (e) => e._id.toString() === category._id
      );

      if (existing) {
        matchedIds.add(existing._id.toString());
        Object.assign(existing, category);
        operations.push(existing.save());
        continue;
      }
    }

    // Else, create a new document
    const newCategory = new CTCTemplateFixedDeduction({
      ctcTemplate: ctcTemplateId,
      ...category,
    });
    operations.push(newCategory.save());
  }

  // Remove any documents that were not included in the updated list
  const toRemove = existingCategories.filter(
    (e) => !matchedIds.has(e._id.toString())
  );

  for (const category of toRemove) {
    operations.push(CTCTemplateFixedDeduction.findByIdAndDelete(category._id));
  }

  await Promise.all(operations);

  // Return the final list after update/create/delete
  return CTCTemplateFixedDeduction.find({ ctcTemplate: ctcTemplateId });
}

async function updateOrCreateEmployerContribution(
  ctcTemplateId,
  updatedCategories
) {
  const existingCategories = await CTCTemplateEmployerContribution.find({
    ctcTemplate: ctcTemplateId,
  });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
    const existingCategory = existingCategories.find((existing) =>
      existing.fixedContribution.equals(category.fixedContribution)
    );

    if (existingCategory) {
      // Update existing category
      Object.assign(existingCategory, category);
      return existingCategory.save();
    } else {
      // Create new category
      const newCategory = new CTCTemplateEmployerContribution({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
  await Promise.all(updatedCategoriesPromises);
  // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) =>
      !updatedCategories.find(
        (updated) =>
          updated.fixedContribution === existing.fixedContribution.toString()
      )
  );

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateEmployerContribution.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateEmployerContribution.find({
    ctcTemplate: ctcTemplateId,
  });

  return finalCategories;
}

async function deleteCTCEmployerContribution(ctcTemplateId) {
  await CTCTemplateEmployerContribution.deleteMany({ ctcTemplate: ctcTemplateId });
}

async function updateOrCreateEmployeeDeduction(
  ctcTemplateId,
  updatedCategories
) {
  const existingCategories = await CTCTemplateEmployeeDeduction.find({
    ctcTemplate: ctcTemplateId,
  });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
    const existingCategory = existingCategories.find((existing) =>
      existing.employeeDeduction.equals(category.employeeDeduction)
    );
    if (!existingCategory) {
      const newCategory = new CTCTemplateEmployeeDeduction({
        ctcTemplate: ctcTemplateId,
        employeeDeduction: category.employeeDeduction,
        ...category,
      });
      return newCategory.save();
    } else {
      // Update the existing category if needed (example shown, customize as necessary)
      Object.assign(existingCategory, category);
      return existingCategory.save();
    }
  });

  // Wait for all updates and creations to finish
  await Promise.all(updatedCategoriesPromises);

  // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) =>
      !updatedCategories.find(
        (updated) =>
          updated.employeeDeduction === existing.employeeDeduction.toString()
      )
  );

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateEmployeeDeduction.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);

  // Fetch the final list of categories
  const finalCategories = await CTCTemplateEmployeeDeduction.find({
    ctcTemplate: ctcTemplateId,
  });
  return finalCategories;
}

exports.getAllCTCTemplatesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await CTCTemplate.countDocuments({
    company: req.cookies.companyId,
  });

  const ctcTemplates = await CTCTemplate.find({
    company: req.cookies.companyId,
  })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
  if (ctcTemplates) {
    for (var i = 0; i < ctcTemplates.length; i++) {
      const ctcTemplateFixedAllowances = await CTCTemplateFixedAllowance.find(
        {}
      )
        .where("ctcTemplate")
        .equals(ctcTemplates[i]._id);
      if (ctcTemplateFixedAllowances) {
        ctcTemplates[i].ctcTemplateFixedAllowances = ctcTemplateFixedAllowances;
      } else {
        ctcTemplates[i].ctcTemplateFixedAllowances = null;
      }
      const ctcTemplateFixedDeductions = await CTCTemplateFixedDeduction.find(
        {}
      )
        .where("ctcTemplate")
        .equals(ctcTemplates[i]._id);
      if (ctcTemplateFixedDeductions) {
        ctcTemplates[i].ctcTemplateFixedDeductions = ctcTemplateFixedDeductions;
      } else {
        ctcTemplates[i].ctcTemplateFixedDeductions = null;
      }

      const ctcTemplateEmployerContribution =
        await CTCTemplateEmployerContribution.find({})
          .where("ctcTemplate")
          .equals(ctcTemplates[i]._id);
      if (ctcTemplateEmployerContribution) {
        ctcTemplates[i].ctcTemplateEmployerContributions =
          ctcTemplateEmployerContribution;
      } else {
        ctcTemplates[i].ctcTemplateEmployerContributions = null;
      }
      const ctcTemplateEmployeeDeductions =
        await CTCTemplateEmployeeDeduction.find({})
          .where("ctcTemplate")
          .equals(ctcTemplates[i]._id);
      if (ctcTemplateEmployeeDeductions) {
        ctcTemplates[i].ctcTemplateEmployeeDeductions =
          ctcTemplateEmployeeDeductions;
      } else {
        ctcTemplates[i].ctcTemplateEmployeeDeductions = null;
      }

      //
      const ctcTemplateVariableAllowance =
        await CTCTemplateVariableAllowance.find({})
          .where("ctcTemplate")
          .equals(ctcTemplates[i]._id);
      if (ctcTemplateVariableAllowance) {
        ctcTemplates[i].ctcTemplateVariableAllowances =
          ctcTemplateVariableAllowance;
      } else {
        ctcTemplates[i].ctcTemplateVariableAllowances = null;
      }

      const ctcTemplateVariableDeduction =
        await CTCTemplateVariableDeduction.find({})
          .where("ctcTemplate")
          .equals(ctcTemplates[i]._id);
      if (ctcTemplateVariableDeduction) {
        ctcTemplates[i].ctcTemplateVariableDeductions =
          ctcTemplateVariableDeduction;
      } else {
        ctcTemplates[i].ctcTemplateVariableDeductions = null;
      }
      //
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ctcTemplates,
    total: totalCount,
  });
});

exports.getCTCTemplateById = catchAsync(async (req, res, next) => {
  const ctcTemplate = await CTCTemplate.findById(req.params.id);
  if (!ctcTemplate) {
    return next(new AppError(req.t('payroll.ctcTemplateNotFound'), 404));
  }
  const ctcTemplateFixedAllowances = await CTCTemplateFixedAllowance.find({})
    .where("ctcTemplate")
    .equals(req.params.id);
  ctcTemplate.ctcTemplateFixedAllowances = ctcTemplateFixedAllowances;
  const ctcTemplateFixedDeductions = await CTCTemplateFixedDeduction.find({})
    .where("ctcTemplate")
    .equals(req.params.id);
  ctcTemplate.ctcTemplateFixedDeductions = ctcTemplateFixedDeductions;
  const ctcTemplateEmployerContribution =
    await CTCTemplateEmployerContribution.find({})
      .where("ctcTemplate")
      .equals(req.params.id);
  ctcTemplate.ctcTemplateEmployerContributions =
    ctcTemplateEmployerContribution;

  const ctcTemplateEmployeeDeductions = await CTCTemplateEmployeeDeduction.find(
    {}
  )
    .where("ctcTemplate")
    .equals(req.params.id);
  if (ctcTemplateEmployeeDeductions) {
    ctcTemplate.ctcTemplateEmployeeDeductions = ctcTemplateEmployeeDeductions;
  } else {
    ctcTemplate.ctcTemplateEmployeeDeductions = null;
  }
  //
  const ctcTemplateVariableAllowance = await CTCTemplateVariableAllowance.find(
    {}
  )
    .where("ctcTemplate")
    .equals(req.params.id);
  if (ctcTemplateVariableAllowance) {
    ctcTemplate.ctcTemplateVariableAllowances = ctcTemplateVariableAllowance;
  } else {
    ctcTemplate.ctcTemplateVariableAllowances = null;
  }

  const ctcTemplateVariableDeduction = await CTCTemplateVariableDeduction.find(
    {}
  )
    .where("ctcTemplate")
    .equals(req.params.id);
  if (ctcTemplateVariableDeduction) {
    ctcTemplate.ctcTemplateVariableDeductions = ctcTemplateVariableDeduction;
  } else {
    ctcTemplate.ctcTemplateVariableDeductions = null;
  }
  ////
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ctcTemplate,
  });
});

exports.updateCTCTemplateById = catchAsync(async (req, res, next) => {
  const {
    ctcTemplateFixedAllowance,
    ctcTemplateFixedDeduction,
    ctcTemplateVariableAllowance,
    ctcTemplateVariableDeduction,
    ...ctcTemplateData
  } = req.body;

  // Check if policyLabel is provided
  if (!ctcTemplateData.name) {
    return next(new AppError(req.t('payroll.nameRequired'), 400));
  }

  // Check if policyLabel already exists
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const { name } = req.body;
  const existingCTCTemplate = await CTCTemplate.findOne({ name: ctcTemplateData.name, company: companyId, _id: { $ne: req.params.id }, });
  if (existingCTCTemplate) {
    websocketHandler.sendLog(req, `CTCTemplate Allowances with label "${name}" already exists`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.duplicate_ctc_template_name_error'), 400));
  }

  if (
    !Array.isArray(ctcTemplateFixedAllowance) ||
    ctcTemplateFixedAllowance.length === 0
  ) {
    return next(
      new AppError(req.t('payroll.ctcTemplateFixedAllowanceNotExists'), 400)
    );
  }
  const ctcTemplate = await CTCTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ctcTemplate) {
    return next(new AppError(req.t('payroll.ctcTemplateNotFound'), 404));
  }

  const ctcTemplateFixedAllowances = await updateOrCreateFixedAllowances(
    req.params.id,
    ctcTemplateFixedAllowance
  );
  ctcTemplate.ctcTemplateFixedAllowances = ctcTemplateFixedAllowances;
  if (ctcTemplateFixedDeduction.length > 0) {
    for (const deduction of ctcTemplateFixedDeduction) {
      const result = await FixedDeduction.findById(deduction.fixedDeduction);
      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidFixedDeduction'),
        });
      }
    }
  }
  ctcTemplate.ctcTemplateFixedDeductions = await updateOrCreateFixedDeduction(
    req.params.id,
    req.body.ctcTemplateFixedDeduction
  );

  if (ctcTemplateVariableAllowance.length > 0) {
    for (const allowance of ctcTemplateVariableAllowance) {
      const result = await VariableAllowance.findById(
        allowance.variableAllowance
      );

      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidVariableAllowance'),
        });
      }
    }
  }
  ctcTemplate.ctcTemplateVariableAllowances =
    await updateOrCreateVariableAllownace(
      req.params.id,
      ctcTemplateVariableAllowance
    );


  if (ctcTemplateVariableDeduction.length > 0) {
    for (const allowance of ctcTemplateVariableDeduction) {
      const result = await VariableDeduction.findById(
        allowance.variableDeduction
      );

      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('payroll.invalidVariableDeduction'),
        });
      }
    }
  }
  ctcTemplate.ctcTemplateVariableDeductions =
    await updateOrCreateVariableDeduction(
      req.params.id,
      ctcTemplateVariableDeduction
    );

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: ctcTemplate,
  });
});

exports.deleteCTCTemplateById = catchAsync(async (req, res, next) => {
  const ctcTemplate = await CTCTemplate.findByIdAndDelete(req.params.id);

  if (!ctcTemplate) {
    return next(new AppError(req.t('payroll.ctcTemplateNotFound'), 404));
  } else {
    await CTCTemplateFixedAllowance.deleteMany({ ctcTemplate: req.params.id });
    await CTCTemplateFixedDeduction.deleteMany({ ctcTemplate: req.params.id });
    await CTCTemplateEmployerContribution.deleteMany({
      ctcTemplate: req.params.id,
    });
    await CTCTemplateEmployeeDeduction.deleteMany({
      ctcTemplate: req.params.id,
    });
    await CTCTemplateVariableAllowance.deleteMany({
      ctcTemplate: req.params.id,
    });
    await CTCTemplateVariableDeduction.deleteMany({
      ctcTemplate: req.params.id,
    });
    await CTCTemplateFixedAllowance.deleteMany({ ctcTemplate: req.params.id });
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.addPayroll = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addPayroll process', constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId;
  websocketHandler.sendLog(req, `Extracted companyId: ${companyId}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const { month, year } = req.body;

  if (month === undefined || year === undefined) {
    websocketHandler.sendLog(req, 'Month or year not provided in request body', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.missingMonthOrYear'), 400));
  }

  // Check for existing payroll for the same month, year, and company
  const existingPayroll = await Payroll.findOne({ company: companyId, month, year });

  if (existingPayroll) {
    websocketHandler.sendLog(req, `Payroll already exists for ${month}/${year}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.alreadyExists'), 400));
  }

  req.body.company = companyId;
  req.body.status = constants.Payroll_Status.InProgress;
  websocketHandler.sendLog(req, 'Assigned companyId to request body', constants.LOG_TYPES.DEBUG);

  const payroll = await Payroll.create(req.body);
  websocketHandler.sendLog(req, `Payroll record created with ID: ${payroll._id}`, constants.LOG_TYPES.INFO);
  const yearStr = year.toString();

  const monthStr = constants.monthMap[month];

  if (!monthStr) {
    console.error(`❌ Invalid month name provided: ${month}`);
    return next(new AppError('Invalid month name', 400));
  }
  console.log('🔄 Starting AttendanceProcess update...');
  console.log(`📅 attendanceProcessPeriodYear: ${yearStr}`);
  console.log(`📅 attendanceProcessPeriodMonth: ${monthStr}`);
  console.log(`🏢 companyId: ${companyId}`);
  console.log(`🧾 isFNF: false`);
  console.log(`✅ Setting exportToPayroll: true`);

  const updatedAttendance = await AttendanceProcess.findOneAndUpdate(
    {
      attendanceProcessPeriodYear: yearStr,
      attendanceProcessPeriodMonth: monthStr,
      company: companyId,
      isFNF: false
    },
    { exportToPayroll: true },
    { new: true }
  );

  console.log(updatedAttendance);
  if (!updatedAttendance) {
    websocketHandler.sendLog(req, `No matching attendance process found for ${month}/${year} to update exportToPayroll`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Updated AttendanceProcess exportToPayroll for ${month}/${year}`, constants.LOG_TYPES.INFO);
  }

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payroll
  });
});


exports.getPayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id);
  if (!payroll) {
    return next(new AppError(req.t('payroll.payrollNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payroll
  });
});

exports.updatePayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  websocketHandler.sendLog(req, `Starting updatePayroll process for ID: ${id}`, constants.LOG_TYPES.INFO);

  try {
    const validStatuses = [
      constants.Payroll_Status.OnHold,
      constants.Payroll_Status.Closed,
      constants.Payroll_Status.InProgress
    ];

    if (!validStatuses.includes(status)) {
      websocketHandler.sendLog(req, `Invalid Payroll status received: ${status}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('payroll.invalidPayrollStatus'), 400));
    }

    websocketHandler.sendLog(req, `Updating payroll status to: ${status} for ID: ${id}`, constants.LOG_TYPES.TRACE);

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      id,
      { status, updatedDate: new Date() },
      { new: true }
    );

    if (!updatedPayroll) {
      websocketHandler.sendLog(req, `No payroll found with ID: ${id}`, constants.LOG_TYPES.WARN);
      return res.status(404).json({ message: req.t('payroll.payrollNotFound') });
    }

    websocketHandler.sendLog(req, `Successfully updated payroll ID: ${id} with status: ${status}`, constants.LOG_TYPES.INFO);

    res.status(200).json(updatedPayroll);
  } catch (error) {
    websocketHandler.sendLog(req, `Error updating payroll ID: ${id} - ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: error.message });
  }
});

exports.deletePayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting deletePayroll process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payroll = await Payroll.findByIdAndDelete(id);

  if (!payroll) {
    websocketHandler.sendLog(req, `No payroll found with ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted payroll ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


exports.getPayrollsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, `Starting getPayrollsByCompany process`, constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Pagination params - Skip: ${skip}, Limit: ${limit}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Fetching payrolls for companyId: ${companyId}`, constants.LOG_TYPES.TRACE);

  const totalCount = await Payroll.countDocuments({ company: companyId });
  const payrolls = await Payroll.find({ company: companyId })
    .skip(skip)
    .limit(limit);

  websocketHandler.sendLog(req, `Retrieved ${payrolls.length} payroll records out of total ${totalCount}`, constants.LOG_TYPES.DEBUG);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrolls,
    total: totalCount,
  });
});


exports.createPayrollUser = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Starting createPayrollUser process', constants.LOG_TYPES.INFO);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  req.body.company = companyId;
  req.body.status = 'Active';
  const existingPayrollUser = await PayrollUsers.findOne({
    user: req.body.user,
    payroll: req.body.payroll,
    company: companyId
  });

  if (existingPayrollUser) {
    websocketHandler.sendLog(req, 'PayrollUser already exists for this user and payroll', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.userAlreadyExists'), 400));
  }
  websocketHandler.sendLog(req, `Creating PayrollUser for companyId: ${companyId}`, constants.LOG_TYPES.TRACE);

  const payrollUser = await PayrollUsers.create(req.body);
  websocketHandler.sendLog(req, `Created PayrollUser with ID: ${payrollUser._id}`, constants.LOG_TYPES.INFO);

  req.user = payrollUser.user;
  req.payrollUser = payrollUser._id;
  req.isFNF = false;
  const payroll = await Payroll.findById(req.body.payroll);
  req.month = payroll.month; // 1-based month (1-12)
  req.year = payroll.year; // Current year (e.g., 2025)
  req.month = moment().month(payroll.month).month() + 1; // 1-based month
  websocketHandler.sendLog(req, 'Starting payroll calculations for new user', constants.LOG_TYPES.TRACE);

  try { await payrollCalculationController.StoreInPayrollVariableAllowances(req, res); }
  catch (err) { console.log('Error in StoreInPayrollVariableAllowances:', err.message); }

  try { await payrollCalculationController.StoreInPayrollVariableDeductions(req, res); }
  catch (err) { console.log('Error in StoreInPayrollVariableDeductions:', err.message); }

  try { await payrollCalculationController.CalculateOvertime(req, res); }
  catch (err) { console.log('Error in CalculateOvertime:', err.message); }

  try { await payrollCalculationController.StoreAttendanceSummary(req, res); }
  catch (err) { console.log('Error in StoreAttendanceSummary:', err.message); }

  try { await payrollCalculationController.calculateAndStoreIncomeTax(req, res); }
  catch (err) { console.log('Error in calculateAndStoreIncomeTax:', err.message); }



  try { await payrollCalculationController.calculateProfessionalTax(req, res); }
  catch (err) { console.log('Error in calculateProfessionalTax:', err.message); }

  try { await payrollCalculationController.calculateLWF(req, res); }
  catch (err) { console.log('Error in calculateLWF:', err.message); }

  try { await payrollCalculationController.calculatePF(req, res); }
  catch (err) { console.log('Error in calculatePF:', err.message); }

  try { await payrollCalculationController.calculateESIC(req, res); }
  catch (err) { console.log('Error in calculateESIC:', err.message); }


  websocketHandler.sendLog(req, 'Completed all payroll calculations and storage for new PayrollUser', constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollUser
  });
});
exports.getPayrollUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting getPayrollUser process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollUser = await PayrollUsers.findById(id);

  if (!payrollUser) {
    websocketHandler.sendLog(req, `PayrollUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved PayrollUser ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollUser
  });
});


// Update a PayrollUser by ID
exports.updatePayrollUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting updatePayrollUser process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollUser = await PayrollUsers.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollUser) {
    websocketHandler.sendLog(req, `PayrollUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully updated PayrollUser ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollUser
  });
});
exports.updatePayrollUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  websocketHandler.sendLog(req, `Starting updatePayrollUserStatus process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const validStatuses = [
    constants.Payroll_User_Status.OnHold,
    constants.Payroll_User_Status.Closed,
    constants.Payroll_User_Status.InProgress
  ];

  if (!validStatuses.includes(status)) {
    websocketHandler.sendLog(req, `Invalid PayrollUser status: ${status}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.invalidPayrollUserStatus'), 400));
  }

  const payrollUser = await PayrollUsers.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollUser) {
    websocketHandler.sendLog(req, `PayrollUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully updated PayrollUser status for ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollUser
  });
});

// Update a PayrollUser by ID
exports.getAllPayrollUsersByPayroll = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Starting getAllPayrollUsersByPayroll process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Pagination - Skip: ${skip}, Limit: ${limit}, Payroll: ${req.body.payroll}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Fetching payroll users for companyId: ${companyId}, payroll ID: ${req.body.payroll}`, constants.LOG_TYPES.TRACE);

  const totalCount = await PayrollUsers.countDocuments({ company: companyId, payroll: req.body.payroll });

  const payrolls = await PayrollUsers.find({ company: companyId, payroll: req.body.payroll })
    .skip(skip)
    .limit(limit);

  websocketHandler.sendLog(req, `Retrieved ${payrolls.length} payroll users out of total ${totalCount}`, constants.LOG_TYPES.DEBUG);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrolls,
    total: totalCount,
  });
});

// Delete a PayrollUser by ID
exports.deletePayrollUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting deletePayrollUser process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollUser = await PayrollUsers.findByIdAndDelete(id);

  if (!payrollUser) {
    websocketHandler.sendLog(req, `PayrollUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted PayrollUser ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


// Get all PayrollUsers by company
exports.getAllPayrollUsersByPayroll = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const totalCount = await PayrollUsers.countDocuments({ company: companyId, payroll: req.body.payroll });

  const payrolls = await PayrollUsers.find({ company: companyId, payroll: req.body.payroll })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrolls,
    total: totalCount,
  });
});


// Add PayrollAttendanceSummary
exports.addPayrollAttendanceSummary = catchAsync(async (req, res, next) => {
  const { payrollUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(payrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollAttendanceSummary = await PayrollAttendanceSummary.create(req.body);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollAttendanceSummary
  });
});

// Get PayrollAttendanceSummary by payrollUser
exports.getPayrollAttendanceSummaryByUser = catchAsync(async (req, res, next) => {
  const payrollAttendanceSummary = await PayrollAttendanceSummary.find({ payrollUser: req.params.payrollUser });

  if (!payrollAttendanceSummary) {
    return next(new AppError(req.t('payroll.payrollAttendanceSummaryNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollAttendanceSummary
  });
});

// Get PayrollAttendanceSummary by payrollUser
exports.getPayrollAttendanceSummaryByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollAttendanceSummaries = await PayrollAttendanceSummary.find({ payrollUser: { $in: payrollUserIds } });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollAttendanceSummaries
  });
});

// Update PayrollAttendanceSummary by payrollUser
exports.updatePayrollAttendanceSummary = catchAsync(async (req, res, next) => {
  const payrollAttendanceSummary = await PayrollAttendanceSummary.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!payrollAttendanceSummary) {
    return next(new AppError(req.t('payroll.payrollAttendanceSummaryNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollAttendanceSummary
  });
});

// Add Payroll Variable Pay Deduction
exports.addPayrollVariablePay = catchAsync(async (req, res, next) => {
  const { payrollUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(payrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const newVariablePay = await PayrollVariablePay.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: newVariablePay,
  });
});

// Get Payroll Variable Pay Deduction by payrollUser
exports.getPayrollVariablePayByPayrollUser = catchAsync(async (req, res, next) => {
  const payrollVariablePay = await PayrollVariablePay.find({ payrollUser: req.params.payrollUser });
  if (!payrollVariablePay) {
    return next(new AppError(req.t('payroll.payrollVariablePayNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollVariablePay,
  });
});

// Update Payroll Variable Pay Deduction
exports.updatePayrollVariablePay = catchAsync(async (req, res, next) => {
  const updatedPayrollVariablePay = await PayrollVariablePay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPayrollVariablePay) {
    return next(new AppError(req.t('payroll.payrollVariablePayNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedPayrollVariablePay,
  });
});

// Delete Payroll Variable Pay Deduction
exports.deletePayrollVariablePay = catchAsync(async (req, res, next) => {

  const payrollVariablePay = await PayrollVariablePay.findByIdAndDelete(req.params.id);
  if (!payrollVariablePay) {
    return next(new AppError(req.t('payroll.payrollVariablePayNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getPayrollVariablePayByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollVariablePayList = await PayrollVariablePay.find({ payrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollVariablePayList
  });
});

// Create Payroll Manual Arrears
exports.createPayrollManualArrears = catchAsync(async (req, res, next) => {
  const { payrollUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(payrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const payrollManualArrears = await PayrollManualArrears.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollManualArrears
  });
});

// Get Payroll Manual Arrears by ID
exports.getPayrollManualArrears = catchAsync(async (req, res, next) => {
  const payrollManualArrears = await PayrollManualArrears.findById(req.params.id);

  if (!payrollManualArrears) {
    return next(new AppError(req.t('payroll.payrollManualArrearsNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollManualArrears
  });
});

// Get all Payroll Manual Arrears
exports.getAllPayrollManualArrearsByPayrollUser = catchAsync(async (req, res, next) => {
  const payrollManualArrears = await PayrollManualArrears.find({ payrollUser: req.params.payrollUser });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollManualArrears
  });
});
exports.getAllPayrollManualArrearsByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollManualArrears = await PayrollManualArrears.find({ payrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollManualArrears
  });
});
// Update Payroll Manual Arrears by ID
exports.updatePayrollManualArrears = catchAsync(async (req, res, next) => {
  const payrollManualArrears = await PayrollManualArrears.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollManualArrears) {
    return next(new AppError(req.t('payroll.payrollManualArrearsNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollManualArrears
  });
});

// Delete Payroll Manual Arrears by ID
exports.deletePayrollManualArrears = catchAsync(async (req, res, next) => {
  const payrollManualArrears = await PayrollManualArrears.findByIdAndDelete(req.params.id);

  if (!payrollManualArrears) {
    return next(new AppError(req.t('payroll.payrollManualArrearsNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.addPayrollLoanAdvance = catchAsync(async (req, res, next) => {
  const { payrollUser, loanAndAdvance, type, amount } = req.body;

  // Step 1: Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(payrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }

  // Step 2: Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Step 3: Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Step 4: Add companyId to the request body
  req.body.company = companyId;

  // 🚫 Step 5: Check for duplicate Disbursement
  if (type === constants.Payroll_Loan_Advance_status.Disbursement) {
    const duplicate = await PayrollLoanAdvance.findOne({
      payrollUser,
      loanAndAdvance,
      type: constants.Payroll_Loan_Advance_status.Disbursement
    });

    if (duplicate) {
      return next(new AppError(req.t('payroll.duplicateDisbursementEntry'), 400));
    }
  }
  // Step 5: Create the PayrollLoanAdvance record
  const payrollLoanAdvance = await PayrollLoanAdvance.create(req.body);

  // Step 6: Fetch EmployeeLoanAdvance using loanAndAdvance ID
  const employeeLoan = await EmployeeLoanAdvance.findById(loanAndAdvance);
  if (!employeeLoan) {
    return next(new AppError(req.t('payroll.invalidLoanAdvanceId'), 400));
  }

  // Step 7: Handle Disbursement or Repayment based on the loan type
  if (payrollLoanAdvance.type === constants.Payroll_Loan_Advance_status.Disbursement) {
    // If it's a disbursement, mark the loan as disbursed
    employeeLoan.status = constants.Employee_Loan_Advance_status.Disbursed;
  } else if (payrollLoanAdvance.type === constants.Payroll_Loan_Advance_status.Repayment) {
    // If it's a repayment, decrement the remaining installments
    if (employeeLoan.remainingInstallment > 0) {
      employeeLoan.remainingInstallment -= 1;

      // Check if all installments are cleared
      if (employeeLoan.remainingInstallment === 0) {
        // All installments are paid, set the loan status to 'Cleared'
        employeeLoan.status = constants.Employee_Loan_Advance_status.Cleared;
      }
    } else {
      return next(new AppError(req.t('payroll.noRemainingInstallments'), 400));
    }
  }

  // Step 8: Save the updated EmployeeLoanAdvance record
  await employeeLoan.save();

  // Step 9: Send response back to the client
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollLoanAdvance
  });
});


// Get Payroll Loan/Advance by payrollUser
exports.getPayrollLoanAdvanceByPayrollUser = catchAsync(async (req, res, next) => {
  const payrollLoanAdvance = await PayrollLoanAdvance.find({ payrollUser: req.params.payrollUser });
  if (!payrollLoanAdvance) {
    return next(new AppError(req.t('payroll.payrollLoanAdvanceNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollLoanAdvance
  });
});
exports.getPayrollLoanAdvanceByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollLoanAdvanceList = await PayrollLoanAdvance.find({ payrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollLoanAdvanceList
  });
});

exports.deletePayrollLoanAdvance = catchAsync(async (req, res, next) => {
  // Step 1: Find the PayrollLoanAdvance by ID
  const payrollLoanAdvance = await PayrollLoanAdvance.findById(req.params.id);
  if (!payrollLoanAdvance) {
    return next(new AppError(req.t('payroll.payrollLoanAdvanceNotFound'), 404));
  }

  // Step 2: Fetch related EmployeeLoanAdvance
  const employeeLoan = await EmployeeLoanAdvance.findById(payrollLoanAdvance.loanAndAdvance);
  if (!employeeLoan) {
    return next(new AppError(req.t('payroll.invalidLoanAdvanceId'), 400));
  }
  // Step 3: Reverse the status and installment adjustments based on the type
  if (payrollLoanAdvance.type === constants.Payroll_Loan_Advance_status.Disbursement) {
    // If it was a disbursement, set the status back to Pending (or any previous state)
    employeeLoan.status = constants.Employee_Loan_Advance_status.Requested;
  } else if (payrollLoanAdvance.type === constants.Payroll_Loan_Advance_status.Repayment) {
    // If it was a repayment, increment remaining installments by 1
    employeeLoan.remainingInstallment += 1;

    // Check if the loan is fully cleared, if so, revert it back to Partially Cleared or Pending
    if (employeeLoan.remainingInstallment > 0 && employeeLoan.status === constants.Employee_Loan_Advance_status.Cleared) {
      employeeLoan.status = constants.Employee_Loan_Advance_status.Partially_Cleared;
    }
  }

  // Step 4: Save the reverted changes to EmployeeLoanAdvance
  await employeeLoan.save();

  // Step 5: Delete the PayrollLoanAdvance record
  await payrollLoanAdvance.delete();

  // Step 6: Send response back to the client
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Create Payroll Income Tax
exports.createPayrollIncomeTax = catchAsync(async (req, res, next) => {
  const { PayrollUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(PayrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollIncomeTax = await PayrollIncomeTax.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollIncomeTax
  });
});

// Get Payroll Income Tax by ID
exports.getPayrollIncomeTaxById = catchAsync(async (req, res, next) => {
  const payrollIncomeTax = await PayrollIncomeTax.findById(req.params.id);
  if (!payrollIncomeTax) {
    return next(new AppError(req.t('payroll.payrollIncomeTaxNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollIncomeTax
  });
});

// Get All Payroll Income Tax records
exports.getAllPayrollIncomeTaxByPayrollUser = catchAsync(async (req, res, next) => {
  const payrollIncomeTaxes = await PayrollIncomeTax.find({ PayrollUser: req.params.payrollUser });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollIncomeTaxes
  });
});

exports.getAllPayrollIncomeTaxByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollIncomeTaxList = await PayrollIncomeTax.find({ PayrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollIncomeTaxList
  });
});

// Update Payroll Income Tax by ID
exports.updatePayrollIncomeTax = catchAsync(async (req, res, next) => {
  const payrollIncomeTax = await PayrollIncomeTax.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!payrollIncomeTax) {
    return next(new AppError(req.t('payroll.payrollIncomeTaxNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollIncomeTax
  });
});

// Delete Payroll Income Tax by ID
exports.deletePayrollIncomeTax = catchAsync(async (req, res, next) => {
  const payrollIncomeTax = await PayrollIncomeTax.findByIdAndDelete(req.params.id);
  if (!payrollIncomeTax) {
    return next(new AppError(req.t('payroll.payrollIncomeTaxNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllGeneratedPayroll = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId; // Get companyId from cookies

  websocketHandler.sendLog(req, 'Starting getAllGeneratedPayroll process', constants.LOG_TYPES.INFO);

  // Validate companyId
  if (!companyId || !mongoose.isValidObjectId(companyId)) {
    websocketHandler.sendLog(req, `Invalid companyId: ${companyId}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payroll.companyIdNotFound')
    });
  }

  websocketHandler.sendLog(req, `Fetching payrolls for companyId: ${companyId}`, constants.LOG_TYPES.TRACE);

  // Step 1: Find all Payrolls for the given company
  const payrolls = await Payroll.find({ company: companyId });

  // Step 2: Find all PayrollUsers for the given payrolls and company
  const payrollUsers = await PayrollUsers.find({
    payroll: { $in: payrolls.map(p => p._id) },
    company: companyId // Filter by company
  })
    .populate({
      path: 'user',
      select: 'id firstName lastName email'
    })
    .populate({
      path: 'payroll',
      select: 'month year date status' // Adjust fields as needed
    })
    .populate({
      path: 'company',
      select: 'name' // Adjust fields as needed
    });

  if (!payrollUsers.length) {
    websocketHandler.sendLog(req, `No payroll users found for companyId: ${companyId}`, constants.LOG_TYPES.INFO);
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: []
    });
  }

  websocketHandler.sendLog(req, `Found ${payrollUsers.length} payroll users for companyId: ${companyId}`, constants.LOG_TYPES.INFO);

  // Step 3: Fetch related data and construct response
  const generatedPayrollList = await Promise.all(
    payrollUsers.map(async (payrollUser) => {
      websocketHandler.sendLog(req, `Fetching details for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Fetch statutory details, overtime, and income tax for this payrollUser
      const [statutoryDetails] = await Promise.all([
        PayrollStatutory.find({ payrollUser: payrollUser._id, company: companyId })
      ]);
      const userEmployment = await UserEmployment.findOne({ user: payrollUser.user });
      const appointmentDetails = await Appointment.findOne({ user: payrollUser.user });

      // Get latest PayrollOvertime and PayrollIncomeTax records
      const [latestOvertime, latestIncomeTax, latestAttendanceSummary, variablePays, fixedPays] = await Promise.all([
        PayrollOvertime.findOne({ payrollUser: payrollUser._id, company: companyId })
          .sort({ _id: -1 }), // sort by newest
        PayrollIncomeTax.findOne({ payrollUser: payrollUser._id, company: companyId })
          .sort({ _id: -1 }),  // sort by newest
        PayrollAttendanceSummary.findOne({ payrollUser: payrollUser._id })
          .sort({ _id: -1 }),  // sort by newest
        PayrollVariablePay.find({ payrollUser: payrollUser._id }),
        PayrollFixedPay.find({ payrollUser: payrollUser._id })
      ]);
      const [allLoanAdvances, flexiBenefits, manualArrears] = await Promise.all([
        PayrollLoanAdvance.find({ payrollUser: payrollUser._id }),
        PayrollFlexiBenefitsPFTax.find({ PayrollUser: payrollUser._id }).sort({ _id: -1 }),
        PayrollManualArrears.find({ payrollUser: payrollUser._id }).sort({ _id: -1 })
      ]);
      const fixedAllowancesList = fixedPays
        .filter(vp => vp.fixedAllowance)
        .map(vp => ({
          id: vp._id,
          fixedAllowance: {
            id: vp.fixedAllowance?._id,
            label: vp.fixedAllowance?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const fixedDeductionsList = fixedPays
        .filter(vp => vp.fixedDeduction)
        .map(vp => ({
          id: vp._id,
          fixedDeduction: {
            id: vp.fixedDeduction?._id,
            label: vp.fixedDeduction?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const variableAllowancesList = variablePays
        .filter(vp => vp.variableAllowance)
        .map(vp => ({
          id: vp._id,
          variableAllowance: {
            id: vp.variableAllowance?._id,
            label: vp.variableAllowance?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const variableDeductionsList = variablePays
        .filter(vp => vp.variableDeduction)
        .map(vp => ({
          id: vp._id,
          variableDeduction: {
            id: vp.variableDeduction?._id,
            label: vp.variableDeduction?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      // Extract required fields with fallback values
      const tdsCalculated = latestIncomeTax?.TDSCalculated || 0;
      // Calculate totals
      const totalFixedAllowance = fixedPays
        .filter(vp => vp.fixedAllowance) // Only include entries with variableAllowance
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalFixedDeduction = fixedPays
        .filter(vp => vp.fixedDeduction) // Only include entries with variableDeduction
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);
      const totalVariableAllowance = variablePays
        .filter(vp => vp.variableAllowance) // Only include entries with variableAllowance
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalVariableDeduction = variablePays
        .filter(vp => vp.variableDeduction) // Only include entries with variableDeduction
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);
      // Return the full PayrollUsers document with related data
      return {
        PayrollUser: payrollUser.toObject(), // Include the entire PayrollUsers document
        statutoryDetails,
        tdsCalculated,
        latestAttendanceSummary,
        totalVariableAllowance,
        totalVariableDeduction,
        totalFixedAllowance,
        totalFixedDeduction,
        fixedAllowancesList,
        fixedDeductionsList,
        variableAllowancesList,
        variableDeductionsList,
        userEmployment,
        appointmentDetails,
        allLoanAdvances, flexiBenefits, manualArrears, latestOvertime
      };
    })
  );

  const filteredPayrollList = generatedPayrollList.filter(Boolean);

  websocketHandler.sendLog(req, `Successfully retrieved ${filteredPayrollList.length} payroll records for companyId: ${companyId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredPayrollList
  });
});

exports.getGeneratedPayrollByUserId = catchAsync(async (req, res, next) => {
  const userId = req.params.userId; // Get user ID from URL (assuming 'user' as per previous versions)

  websocketHandler.sendLog(req, 'Starting getGeneratedPayrollByUserId process', constants.LOG_TYPES.INFO);

  // Validate userId
  if (!userId || !mongoose.isValidObjectId(userId)) {
    websocketHandler.sendLog(req, `Invalid userId: ${userId}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payroll.userIdNotFound')
    });
  }

  websocketHandler.sendLog(req, `Fetching payroll users for userId: ${userId}`, constants.LOG_TYPES.TRACE);

  // Step 1: Find all PayrollUsers for the given user
  const payrollUsers = await PayrollUsers.find({ user: userId })
    .populate({
      path: 'user',
      select: 'id firstName lastName email'
    })
    .populate({
      path: 'payroll',
      select: 'month year date status' // Adjust fields as needed
    })
    .populate({
      path: 'company',
      select: 'name' // Adjust fields as needed
    });
  if (!payrollUsers.length) {
    websocketHandler.sendLog(req, `No payroll users found for userId: ${userId}`, constants.LOG_TYPES.INFO);
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: []
    });
  }

  websocketHandler.sendLog(req, `Found ${payrollUsers.length} payroll users for userId: ${userId}`, constants.LOG_TYPES.INFO);
  const userEmployment = await UserEmployment.findOne({ user: userId });
  const appointmentDetails = await Appointment.findOne({ user: userId });
  // Step 2: Fetch related data and construct response
  const generatedPayrollList = await Promise.all(
    payrollUsers.map(async (payrollUser) => {
      websocketHandler.sendLog(req, `Fetching statutory details for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Fetch statutory details for this payrollUser
      const statutoryDetails = await PayrollStatutory.find({
        payrollUser: payrollUser._id,
        company: payrollUser.company
      });
      // Get latest PayrollOvertime and PayrollIncomeTax records
      const [latestOvertime, latestIncomeTax, latestAttendanceSummary, variablePays, fixedPays] = await Promise.all([
        PayrollOvertime.findOne({ payrollUser: payrollUser._id })
          .sort({ _id: -1 }), // sort by newest
        PayrollIncomeTax.findOne({ payrollUser: payrollUser._id })
          .sort({ _id: -1 }),  // sort by newest
        PayrollAttendanceSummary.findOne({ payrollUser: payrollUser._id })
          .sort({ _id: -1 }),  // sort by newest
        PayrollVariablePay.find({ payrollUser: payrollUser._id }),
        PayrollFixedPay.find({ payrollUser: payrollUser._id }),
      ]);
      const [allLoanAdvances, flexiBenefits, manualArrears] = await Promise.all([
        PayrollLoanAdvance.find({ payrollUser: payrollUser._id }),
        PayrollFlexiBenefitsPFTax.find({ PayrollUser: payrollUser._id }).sort({ _id: -1 }),
        PayrollManualArrears.find({ payrollUser: payrollUser._id }).sort({ _id: -1 })
      ]);
      // Extract required fields with fallback values
      const tdsCalculated = latestIncomeTax?.TDSCalculated || 0;
      console.log(fixedPays);
      const fixedAllowancesList = fixedPays
        .filter(vp => vp.fixedAllowance)
        .map(vp => ({
          id: vp._id,
          fixedAllowance: {
            id: vp.fixedAllowance?._id,
            label: vp.fixedAllowance?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const fixedDeductionsList = fixedPays
        .filter(vp => vp.fixedDeduction)
        .map(vp => ({
          id: vp._id,
          fixedDeduction: {
            id: vp.fixedDeduction?._id,
            label: vp.fixedDeduction?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const variableAllowancesList = variablePays
        .filter(vp => vp.variableAllowance)
        .map(vp => ({
          id: vp._id,
          variableAllowance: {
            id: vp.variableAllowance?._id,
            label: vp.variableAllowance?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));

      const variableDeductionsList = variablePays
        .filter(vp => vp.variableDeduction)
        .map(vp => ({
          id: vp._id,
          variableDeduction: {
            id: vp.variableDeduction?._id,
            label: vp.variableDeduction?.label
          },
          amount: vp.amount || 0,
          month: vp.month,
          year: vp.year,
          company: vp.company
        }));
      const totalFixedAllowance = fixedPays
        .filter(vp => vp.fixedAllowance) // Only include entries with variableAllowance
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalFixedDeduction = fixedPays
        .filter(vp => vp.fixedDeduction) // Only include entries with variableDeduction
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalVariableAllowance = variablePays
        .filter(vp => vp.variableAllowance) // Only include entries with variableAllowance
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalVariableDeduction = variablePays
        .filter(vp => vp.variableDeduction) // Only include entries with variableDeduction
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      PayrollAttendanceSummary.findOne({ payrollUser: payrollUser._id })
        .sort({ _id: -1 })  // sort by newest
      // Return the full PayrollUsers document with populated fields
      return {
        PayrollUser: payrollUser.toObject(), // Include the entire PayrollUsers document
        statutoryDetails,
        tdsCalculated,
        latestAttendanceSummary,
        fixedAllowancesList,
        fixedDeductionsList,
        variableAllowancesList,
        variableDeductionsList,
        totalFixedAllowance,
        totalFixedDeduction,
        totalVariableDeduction,
        totalVariableAllowance,
        userEmployment,
        appointmentDetails,
        allLoanAdvances, flexiBenefits, manualArrears, latestOvertime
      };
    })
  );

  const filteredPayrollList = generatedPayrollList.filter(Boolean);

  websocketHandler.sendLog(req, `Successfully retrieved ${filteredPayrollList.length} payroll records for userId: ${userId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredPayrollList
  });
});

exports.getAllGeneratedFNFPayroll = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId; // Get companyId from cookies

  websocketHandler.sendLog(req, `Starting getAllGeneratedFNFPayroll for companyId: ${companyId}`, constants.LOG_TYPES.INFO);

  // Validate companyId
  if (!companyId) {
    websocketHandler.sendLog(req, 'CompanyId not found in cookies', constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payroll.companyIdNotFound')
    });
  }

  // Step 1: Find all PayrollFNF records for the given company
  websocketHandler.sendLog(req, `Fetching PayrollFNF records for companyId: ${companyId}`, constants.LOG_TYPES.TRACE);
  const payrolls = await PayrollFNF.find({ company: companyId });
  websocketHandler.sendLog(req, `Found ${payrolls.length} PayrollFNF records`, constants.LOG_TYPES.INFO);

  // Step 2: Find all PayrollFNFUsers for the given payrolls and company
  websocketHandler.sendLog(req, `Fetching PayrollFNFUsers for ${payrolls.length} payrolls`, constants.LOG_TYPES.TRACE);
  const payrollUsers = await PayrollFNFUsers.find({
    payroll: { $in: payrolls.map(p => p._id) },
    company: companyId
  }).populate({
    path: 'user',
    select: 'id firstName lastName email'
  })
    ;
  websocketHandler.sendLog(req, `Found ${payrollUsers.length} PayrollFNFUsers`, constants.LOG_TYPES.INFO);

  if (!payrollUsers.length) {
    websocketHandler.sendLog(req, `No PayrollFNFUsers found for companyId: ${companyId}`, constants.LOG_TYPES.INFO);
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: []
    });
  }

  // Step 3: Get user IDs for salary details
  const userIds = payrollUsers.map(user => user?.user?._id).filter(Boolean);
  websocketHandler.sendLog(req, `Extracted ${userIds.length} user IDs for salary details`, constants.LOG_TYPES.TRACE);

  // Step 4: Fetch EmployeeSalaryDetails for users
  websocketHandler.sendLog(req, `Fetching EmployeeSalaryDetails for ${userIds.length} users`, constants.LOG_TYPES.TRACE);
  const salaryDetailsList = await EmployeeSalaryDetails.find({
    user: { $in: userIds },
    company: companyId
  })
    .sort({ createdAt: -1 })
    .populate({ path: 'user', select: 'firstName lastName email' });
  websocketHandler.sendLog(req, `Found ${salaryDetailsList.length} EmployeeSalaryDetails records`, constants.LOG_TYPES.INFO);

  // Step 5: Process each PayrollFNFUser
  websocketHandler.sendLog(req, `Processing ${payrollUsers.length} PayrollFNFUsers`, constants.LOG_TYPES.INFO);
  const generatedPayrollList = await Promise.all(
    payrollUsers.map(async (payrollUser) => {
      websocketHandler.sendLog(req, `Processing payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Find salary details for the user
      const userSalary = salaryDetailsList.find(salary => salary?.user?._id.equals(payrollUser?.user?._id));
      const userEmployment = await UserEmployment.findOne({ user: userIds });
      if (!userSalary) {
        websocketHandler.sendLog(
          req,
          `No salary details found for payrollUser: ${payrollUser._id}`,
          constants.LOG_TYPES.WARN
        );
        return null;
      }
      websocketHandler.sendLog(req, `Found salary details for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Fetch related data
      websocketHandler.sendLog(req, `Fetching related data for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);
      const [allLoanAdvances, flexiBenefits, latestOvertime, incomeTax, statutoryDetails, attendanceSummary, variablePays, fixedPays, manualArrears, compensation, statutoryBenefis] =
        await Promise.all([
          PayrollFNFLoanAdvance.find({
            payrollFNFUser: payrollUser._id,
            type: 'Repayment',
            company: companyId
          }),
          PayrollFNFFlexiBenefitsPFTax.findOne({
            PayrollFNFUser: payrollUser._id,
            company: companyId
          }).sort({ _id: -1 }),
          PayrollFNFOvertime.findOne({
            PayrollFNFUser: payrollUser._id,
            company: companyId
          }).sort({ _id: -1 }),
          PayrollFNFIncomeTax.findOne({
            payrollFNFUser: payrollUser._id,
            company: companyId
          }).sort({ _id: -1 }),
          PayrollFNFStatutory.find({
            payrollFNFUser: payrollUser._id,
            company: companyId
          }),
          PayrollFNFAttendanceSummary.findOne({
            payrollFNFUser: payrollUser._id,
            company: companyId
          }).sort({ _id: -1 }),
          PayrollFNFVariablePay.find({ payrollFNFUser: payrollUser._id }),
          PayrollFNFFixedPay.find({ payrollFNFUser: payrollUser._id }),
          PayrollFNFManualArrears.findOne({ payrollFNFUser: payrollUser._id }).sort({ _id: -1 }),
          PayrollFNFTerminationCompensation.findOne({ payrollFNFUser: payrollUser._id }).sort({ _id: -1 }),
          PayrollFNFStatutoryBenefits.findOne({ payrollFNFUser: payrollUser._id }).sort({ _id: -1 })
        ]);

      websocketHandler.sendLog(
        req,
        `Fetched data for payrollUser: ${payrollUser._id} - ` +
        `LoanAdvances: ${allLoanAdvances.length}, FlexiBenefits: ${flexiBenefits}, ` +
        `Overtime: ${latestOvertime}, IncomeTax: ${incomeTax}, ` +
        `StatutoryDetails: ${statutoryDetails}, AttendanceSummary: ${attendanceSummary}, ` +
        `VariablePays: ${variablePays.length}, FixedPays: ${fixedPays}`,
        constants.LOG_TYPES.INFO
      );

      // Calculate monthly and yearly salary
      let monthlySalary = 0;
      let yearlySalary = 0;
      if (userSalary?.enteringAmount === 'Monthly') {
        monthlySalary = userSalary.Amount;
        yearlySalary = monthlySalary * 12;
      } else if (userSalary?.enteringAmount === 'Yearly') {
        yearlySalary = userSalary.Amount;
        monthlySalary = yearlySalary / 12;
      }
      websocketHandler.sendLog(
        req,
        `Calculated salary for payrollUser: ${payrollUser._id} - Monthly: ${monthlySalary}, Yearly: ${yearlySalary}`,
        constants.LOG_TYPES.TRACE
      );
      console.log(incomeTax);
      // Create allowance and deduction lists
      websocketHandler.sendLog(req, `Creating lists for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);
      const fixedAllowancesList = fixedPays
        .filter(vp => vp.fixedAllowance)
        .map(vp => ({
          id: vp._id,
          fixedAllowance: {
            id: vp.fixedAllowance?._id,
            label: vp.fixedAllowance?.label || 'Unknown'
          },
          amount: vp.amount || 0,
          month: vp.month || 'Unknown',
          year: vp.year || 0,
          company: vp.company
        }));

      const fixedDeductionsList = fixedPays
        .filter(vp => vp.fixedDeduction)
        .map(vp => ({
          id: vp._id,
          fixedDeduction: {
            id: vp.fixedDeduction?._id,
            label: vp.fixedDeduction?.label || 'Unknown'
          },
          amount: vp.amount || 0,
          month: vp.month || 'Unknown',
          year: vp.year || 0,
          company: vp.company
        }));
      console.log(variablePays);
      const variableAllowancesList = variablePays
        .filter(vp => vp.variableAllowance)
        .map(vp => ({
          id: vp._id,
          variableAllowance: {
            id: vp.variableAllowance?._id,
            label: vp.variableAllowance?.label || 'Unknown'
          },
          amount: vp.amount || 0,
          month: vp.month || 'Unknown',
          year: vp.year || 0,
          company: vp.company
        }));

      const variableDeductionsList = variablePays
        .filter(vp => vp.variableDeduction)
        .map(vp => ({
          id: vp._id,
          variableDeduction: {
            id: vp.variableDeduction?._id,
            label: vp.variableDeduction?.label || 'Unknown'
          },
          amount: vp.amount || 0,
          month: vp.month || 'Unknown',
          year: vp.year || 0,
          company: vp.company
        }));

      // Calculate totals
      const totalFixedAllowance = fixedAllowancesList.reduce((sum, vp) => sum + (vp.amount || 0), 0);
      const totalFixedDeduction = fixedDeductionsList.reduce((sum, vp) => sum + (vp.amount || 0), 0);
      const totalVariableAllowance = variableAllowancesList.reduce((sum, vp) => sum + (vp.amount || 0), 0);
      const totalVariableDeduction = variableDeductionsList.reduce((sum, vp) => sum + (vp.amount || 0), 0);
      const userLoanAdvances = allLoanAdvances.reduce((sum, loan) => sum + (loan?.disbursementAmount || 0), 0);

      websocketHandler.sendLog(
        req,
        `Generated lists and totals for payrollUser: ${payrollUser._id} - ` +
        `Fixed Allowances: ${fixedAllowancesList.length}, Fixed Deductions: ${fixedDeductionsList.length}, ` +
        `Variable Allowances: ${variableAllowancesList.length}, Variable Deductions: ${variableDeductionsList.length}, ` +
        `Total Fixed Allowance: ${totalFixedAllowance}, Total Fixed Deduction: ${totalFixedDeduction}, ` +
        `Total Variable Allowance: ${totalVariableAllowance}, Total Variable Deduction: ${totalVariableDeduction}, ` +
        `Total Loan Advances: ${userLoanAdvances}`,
        constants.LOG_TYPES.INFO
      );
      // Return the processed data
      return {
        PayrollFNFUser: {
          id: payrollUser._id,
          user: {
            name: `${payrollUser?.user?.firstName} ${payrollUser?.user?.lastName}`,
            id: payrollUser?.user?._id
          }
        },
        attendanceSummary, latestOvertime,
        fixedAllowancesList,
        fixedDeductionsList,
        variableAllowancesList,
        variableDeductionsList,
        totalFixedAllowance,
        totalVariableAllowance,
        totalVariableDeduction,
        totalFixedDeduction,
        totalLoanAdvance: userLoanAdvances,
        yearlySalary: yearlySalary || 0,
        monthlySalary: monthlySalary || 0,
        payroll: payrolls.find(p => p._id.equals(payrollUser.payrollFNF)),
        manualArrears, compensation, statutoryBenefis,
        statutoryDetails,
        userEmployment,
        incomeTax
      };
    })
  );

  // Filter out null results
  const filteredPayrollList = generatedPayrollList.filter(Boolean);
  websocketHandler.sendLog(
    req,
    `Generated ${filteredPayrollList.length} payroll records for companyId: ${companyId}`,
    constants.LOG_TYPES.INFO
  );

  // Send response
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredPayrollList
  });
});

exports.getAllGeneratedFNFPayrollByFNFPayrollId = catchAsync(async (req, res, next) => {
  const payrollFNFId = req.params.payrollFNF; // Get payrollFNF ID from URL

  websocketHandler.sendLog(req, 'Starting getAllGeneratedFNFPayrollByFNFPayrollId process', constants.LOG_TYPES.INFO);

  // Validate payrollFNFId
  if (!payrollFNFId || !mongoose.isValidObjectId(payrollFNFId)) {
    websocketHandler.sendLog(req, `Invalid payrollFNFId: ${payrollFNFId}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payrollFNF.payrollFNFIdNotFound')
    });
  }

  websocketHandler.sendLog(req, `Fetching payrollFNF users for payrollFNFId: ${payrollFNFId}`, constants.LOG_TYPES.TRACE);

  // Step 1: Fetch PayrollFNFUsers for the given payrollFNF ID
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: payrollFNFId })
    .populate({
      path: 'user',
      select: 'id firstName lastName email'
    })
    .populate({
      path: 'payrollFNF',
      select: 'payrollPeriod' // Adjust fields as needed
    })
    .populate({
      path: 'company',
      select: 'name' // Adjust fields as needed
    });

  if (!payrollFNFUsers.length) {
    websocketHandler.sendLog(req, `No payrollFNF users found for payrollFNFId: ${payrollFNFId}`, constants.LOG_TYPES.INFO);
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: []
    });
  }

  websocketHandler.sendLog(req, `Found ${payrollFNFUsers.length} payrollFNF users for payrollFNFId: ${payrollFNFId}`, constants.LOG_TYPES.INFO);

  const userIds = payrollFNFUsers.map(user => user.user._id);
  websocketHandler.sendLog(req, `Fetching payrollFNF and salary details for ${userIds.length} users`, constants.LOG_TYPES.TRACE);

  const payrollFNF = await PayrollFNF.findById(payrollFNFId);
  if (!payrollFNF) {
    websocketHandler.sendLog(req, `No payrollFNF found with ID: ${payrollFNFId}`, constants.LOG_TYPES.WARN);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payrollFNF.payrollFNFNotFound')
    });
  }

  const salaryDetailsList = await EmployeeSalaryDetails.find({ user: { $in: userIds } })
    .sort({ createdAt: -1 }) // Sort by creation date for consistency
    .populate({ path: 'user', select: 'firstName lastName email' });

  // Step 2: Process each PayrollFNFUser and save calculated values
  const generatedPayrollList = await Promise.all(
    payrollFNFUsers.map(async (payrollFNFUser) => {
      websocketHandler.sendLog(req, `Processing payrollFNFUser: ${payrollFNFUser._id}`, constants.LOG_TYPES.TRACE);

      const userSalary = salaryDetailsList.find(salary => salary.user._id.equals(payrollFNFUser.user._id));

      if (!userSalary) {
        websocketHandler.sendLog(req, `No salary details found for payrollFNFUser: ${payrollFNFUser._id}`, constants.LOG_TYPES.WARN);
        return null; // Skip users with no salary details
      }

      // Calculate monthly and yearly salary
      let monthlySalary = 0;
      let yearlySalary = 0;
      websocketHandler.sendLog(req, `Fetching related data for payrollFNFUser: ${payrollFNFUser._id}`, constants.LOG_TYPES.TRACE);
      // Fetch related data
      const [fixedAllowances, fixedDeductions, variablePays, allLoanAdvances, flexiBenefits, overtime, incomeTax, statutoryDetails, attendanceSummary, manualArrears, compensation, statutoryBenefis] = await Promise.all([
        SalaryComponentFixedAllowance.find({ employeeSalaryDetails: userSalary._id }),
        SalaryComponentFixedDeduction.find({ employeeSalaryDetails: userSalary._id }),
        PayrollFNFVariablePay.find({ payrollFNFUser: payrollFNFUser._id }),
        PayrollFNFLoanAdvance.find({ payrollFNFUser: payrollFNFUser._id }),
        PayrollFNFFlexiBenefitsPFTax.findOne({ PayrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 }),
        PayrollFNFOvertime.findOne({ PayrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 }),
        PayrollFNFIncomeTax.findOne({ PayrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 }),
        PayrollFNFStatutory.find({ payrollFNFUser: payrollFNFUser._id }),
        PayrollFNFAttendanceSummary.findOne({ payrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 }),
        PayrollFNFManualArrears.findOne({ payrollFNFUser: payrollFNFUser._id }),
        PayrollFNFTerminationCompensation.findOne({ payrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 }),
        PayrollFNFStatutoryBenefits.findOne({ payrollFNFUser: payrollFNFUser._id }).sort({ _id: -1 })
      ]);
      const allowancePromises = fixedAllowances.map(async (allowance) => {
        return PayrollFNFFixedPay.findOneAndUpdate(
          {
            payrollFNFUser: payrollFNFUser._id,
            fixedAllowance: allowance.fixedAllowance?._id,
            company: payrollFNFUser.company
          },
          {
            $set: {
              amount: allowance.monthlyAmount || 0,
              company: payrollFNFUser.company
            }
          },
          { upsert: true, new: true }
        );
      });

      // Store fixed deductions in PayrollVariablePay
      const deductionPromises = fixedDeductions.map(async (deduction) => {
        return PayrollFNFFixedPay.findOneAndUpdate(
          {
            payrollFNFUser: payrollFNFUser._id,
            fixedDeduction: deduction.fixedDeduction?._id,
            company: payrollFNFUser.company
          },
          {
            $set: {
              amount: deduction.monthlyAmount || 0,
              company: payrollFNFUser.company
            }
          },
          { upsert: true, new: true }
        );
      });
      // Calculate totals
      await Promise.all([...allowancePromises, ...deductionPromises]);
      // Calculate totals
      const totalFixedAllowance = fixedAllowances.reduce((sum, fa) => sum + (Number(fa.monthlyAmount) || 0), 0);
      const totalFixedDeduction = fixedDeductions.reduce((sum, fd) => sum + (Number(fd.monthlyAmount) || 0), 0);
      const totalVariableAllowance = variablePays
        .filter(vp => vp.variableAllowance)
        .reduce((sum, vp) => sum + (Number(vp.amount) || 0), 0);
      const totalVariableDeduction = variablePays
        .filter(vp => vp.variableDeduction)
        .reduce((sum, vp) => sum + (Number(vp.amount) || 0), 0);
      monthlySalary = Number(totalFixedAllowance) + Number(totalVariableAllowance);

      yearlySalary = monthlySalary * 12;
      const totalEmployerStatutoryContribution = statutoryDetails
        .filter(item => item.ContributorType === 'Employer')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalEmployeeStatutoryDeduction = statutoryDetails
        .filter(item => item.ContributorType === 'Employee')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalLoanRepayment = allLoanAdvances
        .filter(loan => loan.type === 'Repayment')
        .reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);
      const totalFlexiBenefits = Number(flexiBenefits?.TotalFlexiBenefitAmount) || 0;
      const totalOvertime = overtime && overtime.OvertimeAmount ? Number(overtime.OvertimeAmount) : 0;
      const totalIncomeTax = incomeTax && incomeTax.TDSCalculated ? Number(incomeTax.TDSCalculated) : 0;
      const totalManualArrears = (manualArrears && manualArrears.totalArrears) ? Number(manualArrears.totalArrears) : 0;
      // Calculate total CTC, gross salary, and take-home
      const totalCTC = yearlySalary;
      const totalGrossSalary = Number(monthlySalary) + Number(totalOvertime) + Number(totalFlexiBenefits) + Number(totalManualArrears);
      const totalTakeHome = totalGrossSalary - (
        Number(totalFixedDeduction) +
        Number(totalVariableDeduction) +
        //Number(totalEmployerStatutoryContribution) + // Employer contribution is not deducted from take-home
        Number(totalEmployeeStatutoryDeduction) +
        Number(totalLoanRepayment) +
        Number(totalIncomeTax)
      );
      websocketHandler.sendLog(req, `Updating PayrollFNFUsers document for payrollFNFUser: ${payrollFNFUser._id}`, constants.LOG_TYPES.TRACE);

      await PayrollFNFUsers.updateOne(
        { _id: payrollFNFUser._id },
        {
          $set: {
            totalFixedAllowance,
            totalFixedDeduction,
            totalVariableDeduction,
            totalVariableAllowance,
            totalEmployerStatutoryContribution,
            totalEmployeeStatutoryDeduction,
            totalLoanRepayment,
            totalFlexiBenefits,
            totalManualArrears,
            totalCTC,
            totalGrossSalary,
            totalTakeHome
          }
        }
      );

      // Return the full PayrollFNFUsers document with related data
      return {
        PayrollFNFUser: payrollFNFUser.toObject(), // Include the entire PayrollFNFUsers document
        attendanceSummary,
        statutoryDetails,
        overtime,
        flexiBenefits,
        incomeTax,
        manualArrears,
        compensation,
        statutoryBenefis,
        totalFixedAllowance,
        totalFixedDeduction,
        totalEmployerStatutoryContribution,
        totalEmployeeStatutoryDeduction,
        totalLoanRepayment,
        totalFlexiBenefits,
        totalOvertime,
        totalIncomeTax,
        yearlySalary,
        monthlySalary,
        totalCTC,
        totalGrossSalary,
        totalTakeHome,
        payrollFNF,
        totalVariableAllowance,
        totalVariableDeduction
      };
    })
  );

  const filteredPayrollList = generatedPayrollList.filter(Boolean);

  websocketHandler.sendLog(req, `Successfully retrieved ${filteredPayrollList.length} payrollFNF records for payrollFNFId: ${payrollFNFId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredPayrollList
  });
});

exports.getAllGeneratedPayrollByPayrollId = catchAsync(async (req, res, next) => {
  const payrollId = req.params.payroll; // Get payroll ID from URL

  websocketHandler.sendLog(req, 'Starting getAllGeneratedPayrollByPayrollId process', constants.LOG_TYPES.INFO);
  console.log("hello3");
  // Validate payrollId
  if (!payrollId || !mongoose.isValidObjectId(payrollId)) {
    websocketHandler.sendLog(req, `Invalid payrollId: ${payrollId}`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payroll.payrollIdNotFound')
    });
  }

  websocketHandler.sendLog(req, `Fetching payroll users for payrollId: ${payrollId}`, constants.LOG_TYPES.TRACE);
  console.log("helllo2");
  // Step 1: Fetch PayrollUsers for the given payroll ID
  const payrollUsers = await PayrollUsers.find({ payroll: payrollId })
    .populate({
      path: 'user',
      select: 'id firstName lastName email'
    })
    .populate({
      path: 'payroll',
      select: 'payrollPeriod' // Adjust fields as needed
    })
    .populate({
      path: 'company',
      select: 'name' // Adjust fields as needed
    });

  if (!payrollUsers.length) {
    websocketHandler.sendLog(req, `No payroll users found for payrollId: ${payrollId}`, constants.LOG_TYPES.INFO);
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: []
    });
  }

  websocketHandler.sendLog(req, `Found ${payrollUsers.length} payroll users for payrollId: ${payrollId}`, constants.LOG_TYPES.INFO);

  const userIds = payrollUsers.map(user => user.user._id);
  websocketHandler.sendLog(req, `Fetching payroll and salary details for ${userIds.length} users`, constants.LOG_TYPES.TRACE);

  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    websocketHandler.sendLog(req, `No payroll found with ID: ${payrollId}`, constants.LOG_TYPES.WARN);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('payroll.payrollNotFound')
    });
  }

  const salaryDetailsList = await EmployeeSalaryDetails.find({ user: { $in: userIds } })
    .sort({ createdAt: -1 }) // Changed from length to createdAt for consistency
    .populate({ path: 'user', select: 'firstName lastName email' });
  // Step 2: Process each PayrollUser and save calculated values
  const generatedPayrollList = await Promise.all(
    payrollUsers.map(async (payrollUser) => {
      websocketHandler.sendLog(req, `Processing payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      const userSalary = salaryDetailsList.find(salary => salary.user._id.equals(payrollUser.user._id));

      if (!userSalary) {
        websocketHandler.sendLog(req, `No salary details found for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.WARN);
        return null; // Skip users with no salary details
      }

      // Calculate monthly and yearly salary


      websocketHandler.sendLog(req, `Fetching related data for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Fetch related data
      const [fixedAllowances, fixedDeductions, variablePays, allLoanAdvances, flexiBenefits, overtime, incomeTax, statutoryDetails, attendanceSummary, manualArrears] = await Promise.all([
        SalaryComponentFixedAllowance.find({ employeeSalaryDetails: userSalary._id }),
        SalaryComponentFixedDeduction.find({ employeeSalaryDetails: userSalary._id }),
        PayrollVariablePay.find({ payrollUser: payrollUser._id }),
        PayrollLoanAdvance.find({ payrollUser: payrollUser._id }),
        PayrollFlexiBenefitsPFTax.find({ PayrollUser: payrollUser._id }),
        PayrollOvertime.find({ PayrollUser: payrollUser._id }).sort({ _id: -1 }),
        PayrollIncomeTax.find({ PayrollUser: payrollUser._id }).sort({ _id: -1 }),
        PayrollStatutory.find({ payrollUser: payrollUser._id }),
        PayrollAttendanceSummary.find({ payrollUser: payrollUser._id }).sort({ _id: -1 }),
        PayrollManualArrears.find({ payrollUser: payrollUser._id })
      ]);
      // Store fixed allowances in PayrollVariablePay
      const allowancePromises = fixedAllowances.map(async (allowance) => {
        return PayrollFixedPay.findOneAndUpdate(
          {
            payrollUser: payrollUser._id,
            fixedAllowance: allowance.fixedAllowance?._id,
            company: payrollUser.company
          },
          {
            $set: {
              amount: allowance.monthlyAmount || 0,
              company: payrollUser.company
            }
          },
          { upsert: true, new: true }
        );
      });

      // Store fixed deductions in PayrollVariablePay
      const deductionPromises = fixedDeductions.map(async (deduction) => {
        return PayrollFixedPay.findOneAndUpdate(
          {
            payrollUser: payrollUser._id,
            fixedDeduction: deduction.fixedDeduction?._id,
            company: payrollUser.company
          },
          {
            $set: {
              amount: deduction.monthlyAmount || 0,
              company: payrollUser.company
            }
          },
          { upsert: true, new: true }
        );
      });

      // Execute all storage operations
      await Promise.all([...allowancePromises, ...deductionPromises]);
      // Calculate totals
      const totalFixedAllowance = fixedAllowances.reduce((sum, fa) => sum + (fa.monthlyAmount || 0), 0);
      const totalFixedDeduction = fixedDeductions.reduce((sum, fd) => sum + (fd.monthlyAmount || 0), 0);

      const totalVariableAllowance = variablePays
        .filter(vp => vp.variableAllowance)
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      const totalVariableDeduction = variablePays
        .filter(vp => vp.variableDeduction)
        .reduce((sum, vp) => sum + (vp.amount || 0), 0);

      monthlySalary = totalFixedAllowance + totalVariableAllowance;
      yearlySalary = monthlySalary * 12;
      const totalEmployerStatutoryContribution = statutoryDetails
        .filter(item => item.ContributorType === 'Employer')
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      const totalEmployeeStatutoryDeduction = statutoryDetails
        .filter(item => item.ContributorType === 'Employee')
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      const totalLoanDisbursed = allLoanAdvances
        .filter(loan => loan.type === 'Disbursement')
        .reduce((sum, loan) => sum + (loan.disbursementAmount || 0), 0);

      const totalLoanRepayment = allLoanAdvances
        .filter(loan => loan.type === 'Repayment')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0);

      const totalFlexiBenefits = flexiBenefits
        .reduce((sum, flexi) => sum + (flexi.TotalFlexiBenefitAmount || 0), 0);
      const totalManualArrears = manualArrears
        .reduce((sum, flexi) => sum + (flexi.totalArrears || 0), 0);
      //const totalOvertime = overtime && overtime.OvertimeAmount ? overtime.OvertimeAmount : 0;
      const totalOvertime = Array.isArray(overtime)
        ? overtime.reduce((sum, ot) => sum + (ot.OvertimeAmount || 0), 0)
        : 0;
      
      //const totalIncomeTax = incomeTax && incomeTax.TDSCalculated ? Number(incomeTax.TDSCalculated) : 0;
      const totalIncomeTax = Number(incomeTax?.[0]?.TDSCalculated || 0);
      // Calculate total CTC, gross salary, and take-home
      const totalCTC = (totalFixedAllowance) * 12;
      const totalGrossSalary = totalFixedAllowance;
      
      //LOP calculation can be added here
      const salaryPerDay = totalFixedAllowance / 30; //reference from overtime calculation per day salary
      const payrollAttendanceSummary = await PayrollAttendanceSummary.findOne({
        payrollUser: payrollUser._id
      });

      const totallopDaysAmount = payrollAttendanceSummary && payrollAttendanceSummary.lopDays
        ? Number((payrollAttendanceSummary.lopDays * salaryPerDay).toFixed(2))
        : 0;

      const totalTakeHome = (totalGrossSalary + totalLoanDisbursed + totalOvertime + totalVariableAllowance + totalFlexiBenefits + totalManualArrears) - (totalFixedDeduction + totalVariableDeduction + totalEmployeeStatutoryDeduction + totalLoanRepayment + totalIncomeTax + totallopDaysAmount);

      websocketHandler.sendLog(req, `Updating PayrollUsers document for payrollUser: ${payrollUser._id}`, constants.LOG_TYPES.TRACE);

      // Update PayrollUsers document with calculated values
      await PayrollUsers.updateOne(
        { _id: payrollUser._id },
        {
          $set: {
            totalFixedAllowance,
            totalVariableAllowance,
            totalFixedDeduction,
            totalVariableDeduction,
            totalEmployerStatutoryContribution,
            totalEmployeeStatutoryDeduction,
            totalLoanDisbursed,
            totalLoanRepayment,
            totalFlexiBenefits,
            totalCTC,
            totalGrossSalary,
            totalTakeHome,
            totallopDaysAmount
            // Add totalOvertime, totalPfTax, totalIncomeTax if in schema
          }
        }
      );

      // Return the full PayrollUsers document with related data
      return {
        PayrollUser: payrollUser.toObject(), // Include the entire PayrollUsers document
        attendanceSummary,
        statutoryDetails,
        overtime,
        flexiBenefits,
        incomeTax,
        totalFixedAllowance,
        totalFixedDeduction,
        totalEmployerStatutoryContribution,
        totalEmployeeStatutoryDeduction,
        totalLoanDisbursed,
        totalLoanRepayment,
        totalFlexiBenefits,
        totalManualArrears,
        totalOvertime,
        totalIncomeTax,
        yearlySalary,
        monthlySalary,
        totalCTC,
        totalGrossSalary,
        totalTakeHome,
        payroll,
        totalVariableAllowance,
        totalVariableDeduction,
        totallopDaysAmount
      };
    })
  );

  const filteredPayrollList = generatedPayrollList.filter(Boolean);

  websocketHandler.sendLog(req, `Successfully retrieved ${filteredPayrollList.length} payroll records for payrollId: ${payrollId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: filteredPayrollList
  });
});

exports.createFlexiBenefitsAndPFTax = async (req, res) => {

  try {
    const { PayrollUser, TotalFlexiBenefitAmount } = req.body;

    // Check if payrollUser exists in the PayrollUsers model
    const isValidUser = await PayrollUsers.findById(PayrollUser);
    if (!isValidUser) {
      return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
    }
    // Create a new record in the database
    const newRecord = await PayrollFlexiBenefitsPFTax.create({
      PayrollUser,
      TotalFlexiBenefitAmount
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: newRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

exports.getFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const record = await PayrollFlexiBenefitsPFTax.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.RecordNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get all Flexi Benefits and PF Tax records
exports.getAllFlexiBenefitsAndPFTaxByPyrollUser = async (req, res) => {
  try {
    const records = await PayrollFlexiBenefitsPFTax.find({ PayrollUser: req.params.payrollUser });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: records
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};
exports.getAllFlexiBenefitsAndPFTaxByPyroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFlexiBenefitsPFTaxList = await PayrollFlexiBenefitsPFTax.find({ PayrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFlexiBenefitsPFTaxList
  });
});
// Update Flexi Benefits and PF Tax record by ID
exports.updateFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const updatedRecord = await PayrollFlexiBenefitsPFTax.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.RecordNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: updatedRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Delete Flexi Benefits and PF Tax record by ID
exports.deleteFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const record = await PayrollFlexiBenefitsPFTax.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.RecordNotFound')
      });
    }

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('payroll.RecordSuccessfullyDeleted')
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Create Payroll Overtime record
exports.createPayrollOvertime = async (req, res) => {
  try {
    const { PayrollUser, LateComing, EarlyGoing, FinalOvertime, OvertimeAmount } = req.body;

    // Check if payrollUser exists in the PayrollUsers model
    const isValidUser = await PayrollUsers.findById(PayrollUser);
    if (!isValidUser) {
      return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
    }
    // Create a new Payroll Overtime entry in the database
    const newOvertime = await PayrollOvertime.create({
      PayrollUser,
      LateComing,
      EarlyGoing,
      FinalOvertime,
      OvertimeAmount
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: newOvertime
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get Payroll Overtime by ID
exports.getPayrollOvertime = async (req, res) => {
  try {
    const record = await PayrollOvertime.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollOvertimeNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Update Payroll Overtime by ID
exports.updatePayrollOvertime = async (req, res) => {
  try {
    const updatedRecord = await PayrollOvertime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollOvertimeNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: updatedRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Delete Payroll Overtime by ID
exports.deletePayrollOvertime = async (req, res) => {
  try {
    const record = await PayrollOvertime.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollOvertimeNotFound')
      });
    }

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('payroll.RecordSuccessfullyDeleted')
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get all Payroll Overtime records
exports.getAllPayrollOvertimeByPayrollUser = async (req, res) => {
  try {
    const records = await PayrollOvertime.find({ PayrollUser: req.params.payrollUser });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        records
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

exports.getAllPayrollOvertimeByPayroll = catchAsync(async (req, res, next) => {
  const payrollUsers = await PayrollUsers.find({ payroll: req.params.payroll });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollUserIds = payrollUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollOvertimeList = await PayrollOvertime.find({ PayrollUser: { $in: payrollUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollOvertimeList
  });
});

exports.createPayrollStatutory = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(req.body.payrollUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollStatutory = await PayrollStatutory.create(req.body);

  res.status(201).json({
    status: 'success',
    data: payrollStatutory
  });
});

exports.updatePayrollStatutory = catchAsync(async (req, res, next) => {
  const payrollStatutory = await PayrollStatutory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('payrollUser')
    .populate('fixedContribution')
    .populate('fixedDeduction')
    .populate('company');

  if (!payrollStatutory) {
    return next(new AppError(req.t('payroll.payrollStatutoryNotFound'), 404));
  }

  res.status(200).json({
    status: 'success',
    data: payrollStatutory
  });
});

exports.getAllPayrollStatutoryByCompany = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const payrollStatutories = await PayrollStatutory.find({
    company: mongoose.Types.ObjectId(companyId)
  })
    .populate('payrollUser')
    .populate('fixedContribution')
    .populate('fixedDeduction')
    .populate('company');

  res.status(200).json({
    status: 'success',
    data: payrollStatutories
  });
});

exports.getAllPayrollStatutoryByPayrollUser = catchAsync(async (req, res, next) => {
  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollUsers.findById(req.params.id);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollStatutories = await PayrollStatutory.find({
    payrollUser: mongoose.Types.ObjectId(req.params.id)
  })
    .populate('payrollUser')
    .populate('fixedContribution')
    .populate('fixedDeduction')
    .populate('company');

  res.status(200).json({
    status: 'success',
    data: payrollStatutories
  });
});

exports.getPayrollStatutoryById = catchAsync(async (req, res, next) => {
  const payrollStatutory = await PayrollStatutory.findById(req.params.id)
    .populate('payrollUser')
    .populate('fixedContribution')
    .populate('fixedDeduction')
    .populate('company');

  if (!payrollStatutory) {
    return next(new AppError(req.t('payroll.payrollStatutoryNotFound'), 404));
  }

  res.status(200).json({
    status: 'success',
    data: payrollStatutory
  });
});

exports.deletePayrollStatutory = catchAsync(async (req, res, next) => {
  const payrollStatutory = await PayrollStatutory.findByIdAndDelete(req.params.id);

  if (!payrollStatutory) {
    return next(new AppError(req.t('payroll.payrollStatutoryNotFound'), 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.addPayrollFNF = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }
  const { month, year } = req.body;

  if (month === undefined || year === undefined) {
    websocketHandler.sendLog(req, 'Month or year not provided in request body', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.missingMonthOrYear'), 400));
  }

  // Check for existing payroll for the same month, year, and company
  const existingPayroll = await PayrollFNF.findOne({ company: companyId, month, year });

  if (existingPayroll) {
    websocketHandler.sendLog(req, `Payroll FNF already exists for ${month}/${year}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.alreadyExists'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  req.body.status = constants.Payroll_FNF_Status.InProgress;
  const payrollFNF = await PayrollFNF.create(req.body);
  const yearStr = year.toString();

  const monthStr = constants.monthMap[month];

  if (!monthStr) {
    console.error(`❌ Invalid month name provided: ${month}`);
    return next(new AppError('Invalid month name', 400));
  }
  console.log('🔄 Starting AttendanceProcess update...');
  console.log(`📅 attendanceProcessPeriodYear: ${yearStr}`);
  console.log(`📅 attendanceProcessPeriodMonth: ${monthStr}`);
  console.log(`🏢 companyId: ${companyId}`);
  console.log(`🧾 isFNF: false`);
  console.log(`✅ Setting exportToPayroll: true`);

  const updatedAttendance = await AttendanceProcess.findOneAndUpdate(
    {
      attendanceProcessPeriodYear: yearStr,
      attendanceProcessPeriodMonth: monthStr,
      company: companyId,
      isFNF: true
    },
    { exportToPayroll: true },
    { new: true }
  );

  console.log(updatedAttendance);
  if (!updatedAttendance) {
    websocketHandler.sendLog(req, `No matching attendance process found for ${month}/${year} to update exportToPayroll`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Updated AttendanceProcess exportToPayroll for ${month}/${year}`, constants.LOG_TYPES.INFO);
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNF
  });
});

exports.getPayrollFNF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting getPayrollFNF process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollFNF = await PayrollFNF.findById(id);

  if (!payrollFNF) {
    websocketHandler.sendLog(req, `PayrollFNF not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully retrieved PayrollFNF ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNF
  });
});


exports.updatePayrollFNF = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  websocketHandler.sendLog(req, `Starting updatePayrollFNF process for ID: ${id}`, constants.LOG_TYPES.INFO);

  try {
    const validStatuses = [
      constants.Payroll_FNF_Status.OnHold,
      constants.Payroll_FNF_Status.Closed,
      constants.Payroll_FNF_Status.InProgress
    ];

    if (!validStatuses.includes(status)) {
      websocketHandler.sendLog(req, `Invalid PayrollFNF status: ${status}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('payroll.invalidPayrollFNFStatus'), 400));
    }

    websocketHandler.sendLog(req, `Updating PayrollFNF status to ${status} for ID: ${id}`, constants.LOG_TYPES.TRACE);

    const updatedPayroll = await PayrollFNF.findByIdAndUpdate(
      id,
      { status, updatedDate: new Date() },
      { new: true }
    );

    if (!updatedPayroll) {
      websocketHandler.sendLog(req, `PayrollFNF not found for ID: ${id}`, constants.LOG_TYPES.WARN);
      return res.status(404).json({ message: req.t('payroll.payrollNotFound') });
    }

    websocketHandler.sendLog(req, `Successfully updated PayrollFNF ID: ${id}`, constants.LOG_TYPES.INFO);

    res.status(200).json(updatedPayroll);
  } catch (error) {
    websocketHandler.sendLog(req, `Error updating PayrollFNF ID: ${id} - ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ message: error.message });
  }
});


exports.deletePayrollFNF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Starting deletePayrollFNF process for ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollfnf = await PayrollFNF.findByIdAndDelete(id);

  if (!payrollfnf) {
    websocketHandler.sendLog(req, `PayrollFNF not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted PayrollFNF ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


exports.getPayrollFNFByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Starting getPayrollFNFByCompany process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Pagination - Skip: ${skip}, Limit: ${limit}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const totalCount = await PayrollFNF.countDocuments({ company: companyId });

  const payrollFNF = await PayrollFNF.find({ company: companyId })
    .skip(skip)
    .limit(limit);

  websocketHandler.sendLog(req, `Retrieved ${payrollFNF.length} PayrollFNF records out of ${totalCount}`, constants.LOG_TYPES.DEBUG);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNF,
    total: totalCount,
  });
});
// Add a PayrollUser
exports.createPayrollFNFUser = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Starting createPayrollFNFUser process', constants.LOG_TYPES.INFO);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  req.body.company = companyId;
  req.body.status = constants.Payroll_User_FNF_Status.InProgress;

  const payrollFNFUsers = await PayrollFNFUsers.create(req.body);

  websocketHandler.sendLog(req, `Created PayrollFNFUser with ID: ${payrollFNFUsers._id}`, constants.LOG_TYPES.INFO);

  req.user = payrollFNFUsers.user;
  req.payrollFNFUser = payrollFNFUsers._id;
  req.isFNF = true;

  websocketHandler.sendLog(req, 'Starting calculations for new FNF user', constants.LOG_TYPES.TRACE);
  await payrollCalculationController.CalculateOvertime(req, res);
  await payrollCalculationController.StoreAttendanceSummary(req, res);
  await payrollCalculationController.calculateAndStoreIncomeTax(req, res);
  await payrollCalculationController.StoreInPayrollVariableAllowances(req, res);
  await payrollCalculationController.StoreInPayrollVariableDeductions(req, res);
  await payrollCalculationController.calculateProfessionalTax(req, res);
  await payrollCalculationController.calculateLWF(req, res);
  await payrollCalculationController.calculatePF(req, res);
  await payrollCalculationController.calculateESIC(req, res);

  websocketHandler.sendLog(req, 'Finished all calculations for PayrollFNFUser', constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers
  });
});


// Get a PayrollUser by ID
exports.getPayrollFNFUserByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  websocketHandler.sendLog(req, `Fetching PayrollFNFUsers by userId: ${userId}`, constants.LOG_TYPES.INFO);

  const payrollFNFUsers = await PayrollFNFUsers.find({ user: userId });

  if (!payrollFNFUsers) {
    websocketHandler.sendLog(req, `No PayrollFNFUsers found for userId: ${userId}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Found ${payrollFNFUsers.length} PayrollFNFUsers for userId: ${userId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers
  });
});

// Get a PayrollUser by ID
exports.getPayrollFNFUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Fetching PayrollFNFUser by ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollFNFUsers = await PayrollFNFUsers.findById(id);

  if (!payrollFNFUsers) {
    websocketHandler.sendLog(req, `PayrollFNFUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollUserNotFound'), 404));
  }

  websocketHandler.sendLog(req, `PayrollFNFUser found for ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers
  });
});


// Update a payrollFNFUsers by ID
exports.updatePayrollFNFUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Updating PayrollFNFUser ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollFNFUsers = await PayrollFNFUsers.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollFNFUsers) {
    websocketHandler.sendLog(req, `PayrollFNFUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollFNFUsersNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully updated PayrollFNFUser ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers
  });
});


// Update a payrollFNFUsers by ID
exports.updatePayrollFNFUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  websocketHandler.sendLog(req, `Updating status for PayrollFNFUser ID: ${id}`, constants.LOG_TYPES.INFO);

  const validStatuses = [
    constants.Payroll_User_FNF_Status.Finilized,
    constants.Payroll_User_FNF_Status.Rejected,
    constants.Payroll_User_FNF_Status.Paid,
    constants.Payroll_User_FNF_Status.Exit_Interview_Completed,
    constants.Payroll_User_FNF_Status.Cleared,
    constants.Payroll_User_FNF_Status.Approved,
    constants.Payroll_User_FNF_Status.OnHold,
    constants.Payroll_User_FNF_Status.Closed,
    constants.Payroll_User_FNF_Status.Pending,
    constants.Payroll_User_FNF_Status.InProgress
  ];

  if (!validStatuses.includes(status)) {
    websocketHandler.sendLog(req, `Invalid PayrollFNFUser status: ${status}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('payroll.invalidPayrollFNFUserStatus'), 400));
  }

  const payrollFNFUsers = await PayrollFNFUsers.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollFNFUsers) {
    websocketHandler.sendLog(req, `PayrollFNFUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollFNFUsersNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Status updated for PayrollFNFUser ID: ${id} to ${status}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers
  });
});

// Delete a payrollFNFUsers by ID
exports.deletePayrollFNFUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  websocketHandler.sendLog(req, `Deleting PayrollFNFUser ID: ${id}`, constants.LOG_TYPES.INFO);

  const payrollFNFUsers = await PayrollFNFUsers.findByIdAndDelete(id);

  if (!payrollFNFUsers) {
    websocketHandler.sendLog(req, `PayrollFNFUser not found for ID: ${id}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.payrollFNFUsersNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Successfully deleted PayrollFNFUser ID: ${id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Get all PayrollUsers by company
exports.getAllPayrollFNFUsersByPayrollFNF = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Starting getAllPayrollFNFUsersByPayrollFNF process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Pagination: Skip ${skip}, Limit ${limit}, PayrollFNF: ${req.body.payrollFNF}`, constants.LOG_TYPES.TRACE);

  if (!companyId) {
    websocketHandler.sendLog(req, 'companyId not found in cookies', constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  const totalCount = await PayrollFNFUsers.countDocuments({ company: companyId, payrollFNF: req.body.payrollFNF });

  const payrollFNFUsers = await PayrollFNFUsers.find({ company: companyId, payrollFNF: req.body.payrollFNF })
    .skip(skip)
    .limit(limit);
  websocketHandler.sendLog(req, `Retrieved ${payrollFNFUsers.length} FNF users out of ${totalCount} total`, constants.LOG_TYPES.DEBUG);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFUsers,
    total: totalCount
  });
});

// Fetch related records of user for attendance summary
exports.getPayrollFNFUserAttendanceSummaryRecords = catchAsync(async (req, res, next) => {
  const { payrollFNFUser, payrollFNF: payrollFNFId } = req.body;

  // Fetch PayrollFNFUser and populate user details
  const payrollFNFUsers = await PayrollFNFUsers.findById(payrollFNFUser).populate('user');
  if (!payrollFNFUsers || !payrollFNFUsers.user) {
    return next(new AppError('PayrollFNFUser or associated user not found', 404));
  }
  const userId = payrollFNFUsers.user._id;
  // Get PayrollFNF details
  const payrollFNF = await PayrollFNF.findById(payrollFNFId);
  if (!payrollFNF) {
    return next(new AppError('PayrollFNF not found', 404));
  }

  // Check user status
  const validStatuses = ['Terminated', 'Settled'];
  if (!validStatuses.includes(payrollFNFUsers.user.status)) {
    return res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: 'User status is not valid for overtime records',
      data: [],
      OverTimeHours: 0,
    });
  }
  const { startDate, endDate } = await getFNFDateRange(req, userId);
  const diffTime = Math.abs(endDate - startDate);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Fetch overtime records between last payroll and termination
  const overtimeRecords = await OvertimeInformation.find({
    User: userId,
    CheckInDate: {
      $gte: startDate,
      $lte: endDate
    }
  });

  // Calculate total overtime hours
  const totalOvertimeHours = overtimeRecords.reduce((sum, record) => {
    const overtimeStr = record.OverTime || '0';
    const hours = parseInt(overtimeStr, 10);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

  // Add logic for LOP days calculations
  const lopRecords = await LOP.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });

  const lopDaysCount = lopRecords.length;

  const attendanceRecords = await AttendanceRecords.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });

  const payableDays = attendanceRecords.length;
  const cycle = await scheduleController.createFiscalCycle();
  const leaveBalances = await LeaveAssigned.find({
    cycle: cycle,
    employee: userId
  });

  let leaveRemaining = 0;

  if (leaveBalances.length > 0) {
    // Assuming you want the `leaveRemaining` from the first record
    leaveRemaining = leaveBalances[0].leaveRemaining || 0;
  }

  // Return result
  const result = {
    OvertimeHours: totalOvertimeHours / 60,
    TotalDays: totalDays,
    lopDays: lopDaysCount,
    payableDays: payableDays,
    leaveBalance: leaveRemaining
  };
  return res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: result,
  });
});

// Add a PayrollFNFAttendanceSummary
exports.addPayrollFNFAttendanceSummary = catchAsync(async (req, res, next) => {
  const { payrollFNFUser } = req.body;
  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollFNFUsers.findById(payrollFNFUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollFNFAttendanceSummary = await PayrollFNFAttendanceSummary.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFAttendanceSummary,
  });
});

// Get a PayrollFNFAttendanceSummary by payrollFNFUser
exports.getPayrollFNFAttendanceSummaryByUser = catchAsync(async (req, res, next) => {
  const payrollFNFAttendanceSummary = await PayrollFNFAttendanceSummary.find({
    payrollFNFUser: req.params.payrollFNFUser,
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFAttendanceSummary,
  });
});
// Get PayrollAttendanceSummary by payrollUser
exports.getPayrollFNFAttendanceSummaryByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFAttendanceSummaries = await PayrollFNFAttendanceSummary.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFAttendanceSummaries
  });
});
// Update a PayrollFNFAttendanceSummary
exports.updatePayrollFNFAttendanceSummary = catchAsync(async (req, res, next) => {
  const payrollFNFAttendanceSummary = await PayrollFNFAttendanceSummary.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!payrollFNFAttendanceSummary) {
    return next(new AppError(req.t('payroll.payrollFNFAttendanceSummaryNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFAttendanceSummary,
  });
});

// Delete a PayrollFNFAttendanceSummary
exports.deletePayrollFNFAttendanceSummary = catchAsync(async (req, res, next) => {
  const payrollFNFAttendanceSummary = await PayrollFNFAttendanceSummary.findByIdAndDelete(req.params.id);

  if (!payrollFNFAttendanceSummary) {
    return next(new AppError(req.t('payroll.payrollFNFAttendanceSummaryNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

// Add Payroll Variable Pay Deduction
exports.addPayrollFNFVariablePay = catchAsync(async (req, res, next) => {
  const { payrollFNFUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollFNFUsers.findById(payrollFNFUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const newVariablePay = await PayrollFNFVariablePay.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: newVariablePay,
  });
});

// Get Payroll Variable Pay Deduction by payrollUser
exports.getPayrollFNFVariablePayByPayrollFNFUser = catchAsync(async (req, res, next) => {
  const payrollFNFVariablePay = await PayrollFNFVariablePay.find({ payrollUser: req.params.payrollFNFUser });
  if (!payrollFNFVariablePay) {
    return next(new AppError(req.t('payroll.payrollFNFVariablePayNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFVariablePay,
  });
});

// Update Payroll Variable Pay Deduction
exports.updatePayrollFNFVariablePay = catchAsync(async (req, res, next) => {
  const updatedPayrollFNFVariablePay = await PayrollFNFVariablePay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPayrollFNFVariablePay) {
    return next(new AppError(req.t('payroll.payrollFNFVariablePayNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedPayrollFNFVariablePay,
  });
});

// Delete Payroll Variable Pay Deduction
exports.deletePayrollFNFVariablePay = catchAsync(async (req, res, next) => {

  const payrollFNFVariablePay = await PayrollFNFVariablePay.findByIdAndDelete(req.params.id);
  if (!payrollFNFVariablePay) {
    return next(new AppError(req.t('payroll.payrollFNFVariablePayNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getPayrollFNFVariablePayByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFVariablePayList = await PayrollFNFVariablePay.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFVariablePayList
  });
});


// Create Payroll Manual Arrears
exports.createPayrollFNFManualArrears = catchAsync(async (req, res, next) => {
  const { payrollFNFUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollFNFUsers.findById(payrollFNFUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('payroll.companyIdNotFound'), 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const payrollFNFManualArrears = await PayrollFNFManualArrears.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFManualArrears
  });
});

// Get Payroll Manual Arrears by ID
exports.getPayrollFNFManualArrears = catchAsync(async (req, res, next) => {
  const payrollFNFManualArrears = await PayrollFNFManualArrears.findById(req.params.id);

  if (!payrollFNFManualArrears) {
    return next(new AppError(req.t('payroll.payrollFNFManualArrearsNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFManualArrears
  });
});

// Get all Payroll Manual Arrears
exports.getAllPayrollFNFManualArrearsByPayrollFNFUser = catchAsync(async (req, res, next) => {
  const payrollFNFManualArrears = await PayrollFNFManualArrears.find({ payrollFNFUser: req.params.payrollFNFUser });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFManualArrears
  });
});
exports.getAllPayrollFNFManualArrearsByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFManualArrears = await PayrollFNFManualArrears.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFManualArrears
  });
});
// Update Payroll Manual Arrears by ID
exports.updatePayrollFNFManualArrears = catchAsync(async (req, res, next) => {
  const payrollFNFManualArrears = await PayrollFNFManualArrears.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!payrollFNFManualArrears) {
    return next(new AppError(req.t('payroll.payrollFNFManualArrearsNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFManualArrears
  });
});

// Delete Payroll Manual Arrears by ID
exports.deletePayrollFNFManualArrears = catchAsync(async (req, res, next) => {
  const payrollFNFManualArrears = await PayrollFNFManualArrears.findByIdAndDelete(req.params.id);

  if (!payrollFNFManualArrears) {
    return next(new AppError(req.t('payroll.payrollFNFManualArrearsNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

/**
 * Add a new Payroll FNF Termination Compensation
 */
exports.addPayrollFNFTerminationCompensation = catchAsync(async (req, res, next) => {
  const payrollFNFCompensation = await PayrollFNFTerminationCompensation.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFCompensation
  });
});

/**
 * Get Payroll FNF Termination Compensation by payrollFNFUser
 */
exports.getPayrollFNFTerminationCompensationByUser = catchAsync(async (req, res, next) => {
  const payrollFNFCompensation = await PayrollFNFTerminationCompensation.find({ payrollFNFUser: req.params.payrollFNFUser });
  if (!payrollFNFCompensation || payrollFNFCompensation.length === 0) {
    return next(new AppError(req.t('payroll.payrollFNFTerminationCompensationNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFCompensation
  });
});

/**
 * Get Payroll FNF Termination Compensation by ID
 */
exports.getPayrollFNFTerminationCompensationById = catchAsync(async (req, res, next) => {
  const payrollFNFCompensation = await PayrollFNFTerminationCompensation.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFCompensation
  });
});

/**
 * Update Payroll FNF Termination Compensation
 */
exports.updatePayrollFNFTerminationCompensation = catchAsync(async (req, res, next) => {
  const payrollFNFCompensation = await PayrollFNFTerminationCompensation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!payrollFNFCompensation) {
    return next(new AppError(req.t('payroll.payrollFNFTerminationCompensationNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFCompensation
  });
});

/**
 * Delete Payroll FNF Termination Compensation
 */
exports.deletePayrollFNFTerminationCompensation = catchAsync(async (req, res, next) => {
  const payrollFNFCompensation = await PayrollFNFTerminationCompensation.findByIdAndDelete(req.params.id);
  if (!payrollFNFCompensation) {
    return next(new AppError(req.t('payroll.payrollFNFTerminationCompensationNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllPayrollFNFTerminationCompensationByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFTerminationCompensation = await PayrollFNFTerminationCompensation.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFTerminationCompensation
  });
});

// Add a Payroll FNF Loan Advance
exports.addPayrollFNFLoanAdvance = catchAsync(async (req, res, next) => {
  const { payrollFNFUser, loanAndAdvance, LoanAdvanceAmount } = req.body;

  // Step 1: Validate FNF User
  const fnfUser = await PayrollFNFUsers.findById(payrollFNFUser);
  if (!fnfUser) {
    return next(new AppError(req.t('payroll.invalidFNFUser'), 400));
  }

  // Step 2: Fetch EmployeeLoanAdvance
  const employeeLoan = await EmployeeLoanAdvance.findById(loanAndAdvance);
  if (!employeeLoan) {
    return next(new AppError(req.t('payroll.invalidLoanAdvanceId'), 400));
  }

  // Step 3: Validate remaining installment
  if (employeeLoan.remainingInstallment <= 0 || employeeLoan.status === constants.Employee_Loan_Advance_status.Cleared) {
    return next(new AppError(req.t('payroll.noRemainingInstallments'), 400));
  }
  if (employeeLoan.remainingInstallment <= 0) {
    return next(new AppError(req.t('payroll.noRemainingInstallments'), 400));
  }

  // Step 4: Create FNF Loan Advance record (you can save before or after status update)
  const fnfLoanAdvance = await PayrollFNFLoanAdvance.create(req.body);

  // Step 5: Calculate total paid so far
  const totalPreviousRepayment = await PayrollLoanAdvance.aggregate([
    {
      $match: {
        loanAndAdvance: employeeLoan._id,
        type: constants.Payroll_Loan_Advance_status.Repayment
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  // Step 5: Calculate total paid so far
  const totalFNFPreviousRepayment = await PayrollFNFLoanAdvance.aggregate([
    {
      $match: {
        loanAndAdvance: employeeLoan._id,
        type: constants.Payroll_FNF_Loan_Advance_status.Partially_Cleared
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const totalPaid = (totalPreviousRepayment[0]?.totalPaid || 0) + (totalFNFPreviousRepayment[0]?.totalPaid || 0) + LoanAdvanceAmount;

  // Step 6: Compare and update loan status
  if (totalPaid >= employeeLoan.amount) {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Cleared;
    employeeLoan.remainingInstallment = 0;
  } else {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Partially_Cleared; // or 'In Progress'
    employeeLoan.remainingInstallment -= 1;
  }

  await employeeLoan.save();

  // Step 7: Respond
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: fnfLoanAdvance
  });
});

// Get Payroll FNF Loan Advance by payrollFNFUser
exports.getPayrollFNFLoanAdvanceByUser = catchAsync(async (req, res, next) => {
  const payrollFNFLoanAdvance = await PayrollFNFLoanAdvance.findOne({ payrollFNFUser: req.params.payrollFNFUser });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFLoanAdvance
  });
});

// Get Payroll FNF Loan Advance by Loan and Advance ID
exports.getPayrollFNFLoanAdvanceByLoan = catchAsync(async (req, res, next) => {
  const payrollFNFLoanAdvance = await PayrollFNFLoanAdvance.findOne({ loanAndAdvance: req.params.loanAndAdvance });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFLoanAdvance
  });
});

// Get Payroll FNF Loan Advance by Loan and Advance ID
exports.getPayrollFNFLoanAdvanceByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFLoanAdvance = await PayrollFNFLoanAdvance.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFLoanAdvance
  });
});
exports.updatePayrollFNFLoanAdvance = catchAsync(async (req, res, next) => {
  const { payrollFNFUser, loanAndAdvance, amount } = req.body;

  // Step 1: Validate FNF User
  const fnfUser = await PayrollFNFUsers.findById(payrollFNFUser);
  if (!fnfUser) {
    return next(new AppError(req.t('payroll.invalidFNFUser'), 400));
  }

  // Step 2: Validate Employee Loan Advance
  const employeeLoan = await EmployeeLoanAdvance.findById(loanAndAdvance);
  if (!employeeLoan) {
    return next(new AppError(req.t('payroll.invalidLoanAdvanceId'), 400));
  }

  // Step 3: Validate Remaining Installments
  if (employeeLoan.remainingInstallment <= 0) {
    return next(new AppError(req.t('payroll.noRemainingInstallments'), 400));
  }

  // Step 4: Fetch the old FNF record to adjust the total repayment correctly
  const existingFNFLoan = await PayrollFNFLoanAdvance.findById(req.params.id);
  if (!existingFNFLoan) {
    return next(new AppError(req.t('payroll.payrollFNFLoanAdvanceNotFound'), 404));
  }

  // Step 5: Update the record
  const updatedFNFLoanAdvance = await PayrollFNFLoanAdvance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Step 6: Recalculate total repayments (adjusting for old amount)
  const totalPreviousRepayment = await PayrollLoanAdvance.aggregate([
    {
      $match: {
        loanAndAdvance: employeeLoan._id,
        type: constants.Payroll_Loan_Advance_status.Repayment
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const previousFNFAmount = existingFNFLoan.amount || 0;
  const adjustedTotalPaid =
    (totalPreviousRepayment[0]?.totalPaid || 0) - previousFNFAmount + amount;

  // Step 7: Update Employee Loan status
  if (adjustedTotalPaid >= employeeLoan.amount) {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Cleared;
    employeeLoan.remainingInstallment = 0;
  } else {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Partially_Cleared;
    employeeLoan.remainingInstallment = Math.max(employeeLoan.remainingInstallment - 1, 0);
  }

  await employeeLoan.save();

  // Step 8: Respond
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedFNFLoanAdvance
  });
});


exports.deletePayrollFNFLoanAdvance = catchAsync(async (req, res, next) => {
  // Step 1: Find and delete the FNF Loan Advance
  const payrollFNFLoanAdvance = await PayrollFNFLoanAdvance.findByIdAndDelete(req.params.id);

  if (!payrollFNFLoanAdvance) {
    return next(new AppError(req.t('payroll.payrollFNFLoanAdvanceNotFound'), 404));
  }

  const { loanAndAdvance, amount } = payrollFNFLoanAdvance;

  // Step 2: Fetch the related EmployeeLoanAdvance
  const employeeLoan = await EmployeeLoanAdvance.findById(loanAndAdvance);
  if (!employeeLoan) {
    return next(new AppError(req.t('payroll.invalidLoanAdvanceId'), 400));
  }

  // Step 3: Recalculate total repayments (excluding deleted one)
  const totalPreviousRepayment = await PayrollLoanAdvance.aggregate([
    {
      $match: {
        loanAndAdvance: employeeLoan._id,
        type: constants.Payroll_Loan_Advance_status.Repayment
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  // Only include remaining repayments from PayrollLoanAdvance
  const totalPaidAfterDelete =
    (totalPreviousRepayment[0]?.totalPaid || 0); // Deleted amount is already removed

  // Step 4: Update EmployeeLoanAdvance status accordingly
  if (totalPaidAfterDelete >= employeeLoan.amount) {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Cleared;
    employeeLoan.remainingInstallment = 0;
  } else if (totalPaidAfterDelete > 0) {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Partially_Cleared;
    employeeLoan.remainingInstallment = Math.max(employeeLoan.remainingInstallment + 1, 1);
  } else {
    employeeLoan.status = constants.Employee_Loan_Advance_status.Disbursed;
    employeeLoan.remainingInstallment = employeeLoan.noOfInstallment;
  }

  await employeeLoan.save();

  // Step 5: Respond with no content
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


// Add PayrollFNFStatutoryBenefits
exports.createPayrollFNFStatutoryBenefits = catchAsync(async (req, res, next) => {
  const statutoryBenefits = await PayrollFNFStatutoryBenefits.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: statutoryBenefits
  });
});

// Get PayrollFNFStatutoryBenefits by payrollFNFUser
exports.getPayrollFNFStatutoryBenefitsByUser = catchAsync(async (req, res, next) => {
  const statutoryBenefits = await PayrollFNFStatutoryBenefits.findOne({
    payrollFNFUser: req.params.payrollFNFUserId
  }).populate('payrollFNFUser');


  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: statutoryBenefits
  });
});

// Get PayrollFNFStatutoryBenefits by payrollFNF
exports.getPayrollFNFStatutoryBenefitsByPayrollFNF = catchAsync(async (req, res, next) => {

  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const statutoryBenefits = await PayrollFNFStatutoryBenefits.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: statutoryBenefits
  });
});

// Update PayrollFNFStatutoryBenefits
exports.updatePayrollFNFStatutoryBenefits = catchAsync(async (req, res, next) => {
  const statutoryBenefits = await PayrollFNFStatutoryBenefits.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: statutoryBenefits
  });
});

// Delete PayrollFNFStatutoryBenefits
exports.deletePayrollFNFStatutoryBenefits = catchAsync(async (req, res, next) => {
  const statutoryBenefits = await PayrollFNFStatutoryBenefits.findByIdAndDelete(req.params.id);

  if (!statutoryBenefits) {
    return next(new AppError(req.t('payroll.payrollFNFStatutoryBenefitsNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Create Flexi Benefits and PF Tax record
exports.createPayrollFNFFlexiBenefitsAndPFTax = async (req, res) => {

  try {
    const { PayrollFNFUser, TotalFlexiBenefitAmount } = req.body;

    // Check if payrollUser exists in the PayrollUsers model
    const isValidUser = await PayrollFNFUsers.findById(PayrollFNFUser);
    if (!isValidUser) {
      return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
    }
    // Create a new record in the database
    const newRecord = await PayrollFNFFlexiBenefitsPFTax.create({
      PayrollFNFUser,
      TotalFlexiBenefitAmount
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: newRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get Flexi Benefits and PF Tax record by ID
exports.getPayrollFNFFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const record = await PayrollFNFFlexiBenefitsPFTax.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.recordNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get all Flexi Benefits and PF Tax records
exports.getAllPayrollFNFFlexiBenefitsAndPFTaxByPyrollFNFUser = async (req, res) => {
  try {
    const records = await PayrollFNFFlexiBenefitsPFTax.find({ payrollFNFUser: req.params.payrollFNFUser });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        records
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};
exports.getAllPayrollFNFFlexiBenefitsAndPFTaxByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFFlexiBenefitsPFTaxList = await PayrollFNFFlexiBenefitsPFTax.find({ payrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFFlexiBenefitsPFTaxList
  });
});
// Update Flexi Benefits and PF Tax record by ID
exports.updatePayrollFNFFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const updatedRecord = await PayrollFNFFlexiBenefitsPFTax.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.recordNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: updatedRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Delete Flexi Benefits and PF Tax record by ID
exports.deletePayrollFNFFlexiBenefitsAndPFTax = async (req, res) => {
  try {
    const record = await PayrollFNFFlexiBenefitsPFTax.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.recordNotFound')
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('payroll.RecordSuccessfullyDeleted')
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};
// Create Payroll Income Tax
exports.createPayrollFNFIncomeTax = catchAsync(async (req, res, next) => {
  const { PayrollFNFUser } = req.body;

  // Check if payrollUser exists in the PayrollUsers model
  const isValidUser = await PayrollFNFUsers.findById(PayrollFNFUser);
  if (!isValidUser) {
    return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
  }
  const payrollFNFIncomeTax = await PayrollFNFIncomeTax.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFIncomeTax
  });
});

// Get Payroll Income Tax by ID
exports.getPayrollFNFIncomeTaxById = catchAsync(async (req, res, next) => {
  const payrollFNFIncomeTax = await PayrollFNFIncomeTax.findById(req.params.id);
  if (!payrollFNFIncomeTax) {
    return next(new AppError(req.t('payroll.payrollIncomeTaxNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFIncomeTax
  });
});

// Get all Payroll Income Tax records by fnf user
exports.getAllPayrollFNFIncomeTaxByPayrollFNFUser = async (req, res) => {
  try {
    const records = await PayrollFNFIncomeTax.find({ PayrollFNFUser: req.params.payrollFNFUser });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        records
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};


exports.getAllPayrollFNFIncomeTaxByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFIncomeTaxList = await PayrollFNFIncomeTax.find({ PayrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFIncomeTaxList
  });
});
// Update Payroll Income Tax by ID
exports.updatePayrollFNFIncomeTax = catchAsync(async (req, res, next) => {
  const payrollFNFIncomeTax = await PayrollFNFIncomeTax.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!payrollFNFIncomeTax) {
    return next(new AppError(req.t('payroll.payrollFNFIncomeTaxNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFIncomeTax
  });
});

// Delete Payroll Income Tax by ID
exports.deletePayrollFNFIncomeTax = catchAsync(async (req, res, next) => {
  const payrollFNFIncomeTax = await PayrollFNFIncomeTax.findByIdAndDelete(req.params.id);
  if (!payrollFNFIncomeTax) {
    return next(new AppError(req.t('payroll.payrollFNFIncomeTaxNotFound'), 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


// Create Payroll Overtime record
exports.createPayrollFNFOvertime = async (req, res) => {
  try {
    const { PayrollFNFUser, OverTime, LateComing, EarlyGoing, FinalOvertime } = req.body;

    // Check if PayrollFNFUser exists in the PayrollUsers model
    const isValidUser = await PayrollFNFUsers.findById(PayrollFNFUser);
    if (!isValidUser) {
      return next(new AppError(req.t('payroll.invalidPayrollUser'), 400));
    }
    // Create a new Payroll Overtime entry in the database
    const newOvertime = await PayrollFNFOvertime.create({
      PayrollFNFUser,
      LateComing,
      EarlyGoing,
      FinalOvertime
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: newOvertime
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get Payroll Overtime by ID
exports.getPayrollFNFOvertime = async (req, res) => {
  try {
    const record = await PayrollFNFOvertime.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollFNFOvertimeNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Update Payroll Overtime by ID
exports.updatePayrollFNFOvertime = async (req, res) => {
  try {
    const updatedRecord = await PayrollFNFOvertime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollFNFOvertimeNotFound')
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        record: updatedRecord
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Delete Payroll Overtime by ID
exports.deletePayrollFNFOvertime = async (req, res) => {
  try {
    const record = await PayrollFNFOvertime.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('payroll.payrollFNFOvertimeNotFound')
      });
    }

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('payroll.OvertimeRecordSuccessfullyDeleted')
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

// Get all Payroll Overtime records
exports.getAllPayrollFNFOvertimeByPayrollFNFUser = async (req, res) => {
  try {
    const records = await PayrollFNFOvertime.find({ PayrollFNFUser: req.params.payrollFNFUser });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        records
      }
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: err.message
    });
  }
};

exports.getAllPayrollFNFOvertimeByPayrollFNF = catchAsync(async (req, res, next) => {
  const payrollFNFUsers = await PayrollFNFUsers.find({ payrollFNF: req.params.payrollFNF });
  // Extract _id values from payrollUsers payrollUserIds
  const payrollFNFUserIds = payrollFNFUsers.map(user => user._id);
  // Use the array of IDs to fetch related PayrollAttendanceSummary records
  const payrollFNFOvertimeList = await PayrollFNFOvertime.find({ PayrollFNFUser: { $in: payrollFNFUserIds } });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: payrollFNFOvertimeList
  });
});


// Update Resignation only if status is "pending"
// ✅ Get total PF amount for a user
exports.getTotalPFAmountByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    websocketHandler.sendLog(req, '❌ PF: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }

  websocketHandler.sendLog(req, `🔄 Fetching total PF amount for user: ${userId}`, constants.LOG_TYPES.INFO);

  const total = await getTotalPFAmount(req, userId);

  websocketHandler.sendLog(req, `✅ PF total amount retrieved: ₹${total}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: 'success',
    data: total
  });
});

// ✅ Get total Gratuity amount for a user
exports.getTotalGratuityAmountByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    websocketHandler.sendLog(req, '❌ Gratuity: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }
  websocketHandler.sendLog(req, `🔄 Starting Gratuity calculation for user: ${userId}`, constants.LOG_TYPES.INFO);

  req.user = userId; // Attach user ID to request object for downstream logic
  const total = await payrollCalculationController.calculateGratuity(req);

  websocketHandler.sendLog(req, `✅ Gratuity calculated for user: ₹${total}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: 'success',
    data: total
  });
});
// ✅ Get total Gratuity amount for a user
exports.getTDSAmountByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    websocketHandler.sendLog(req, '❌ Gratuity: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }

  websocketHandler.sendLog(req, `🔄 Starting Gratuity calculation for user: ${userId}`, constants.LOG_TYPES.INFO);

  req.user = userId; // Attach user ID to request object for downstream logic
  const total = await payrollCalculationController.calculateTDS(req);

  websocketHandler.sendLog(req, `✅ Gratuity calculated for user: ₹${total}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: 'success',
    data: total
  });
});

// ✅ Get total TDS amount for a user including FNF days tax
exports.getFNFTDSAmountByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    websocketHandler.sendLog(req, '❌ TDS: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }

  websocketHandler.sendLog(req, `🔄 Starting TDS calculation for user: ${userId}`, constants.LOG_TYPES.INFO);

  req.user = userId; // Attach user ID to request object

  // 1. Get full year TDS (existing logic)
  const data = await payrollCalculationController.calculateTDS(req);
  websocketHandler.sendLog(req, `📊 Yearly TDS calculated: ₹${data}`, constants.LOG_TYPES.INFO);

  // 2. Get FNF date range
  const { startDate, endDate } = await getFNFDateRange(req, userId);
  websocketHandler.sendLog(req, `📅 FNF Date Range: ${startDate.toDateString()} to ${endDate.toDateString()}`, constants.LOG_TYPES.DEBUG);
  // 3. Calculate number of FNF days
  const fnfDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))); // +1 day to include the end date
  websocketHandler.sendLog(req, `📆 Total FNF days: ${fnfDays}`, constants.LOG_TYPES.DEBUG);
  // 4. Calculate FNF days TDS (basic formula, can be adjusted as per logic)
  const dailyTDS = data.contributionData / data.days;
  const fnfDaysTDS = parseFloat((dailyTDS * fnfDays).toFixed(2));
  websocketHandler.sendLog(req, `💸 FNF Days TDS calculated: ₹${fnfDaysTDS}`, constants.LOG_TYPES.INFO);

  // 5. Final response
  res.status(200).json({
    status: 'success',
    data: {
      yearlyTDS: data.contributionData,
      fnfDaysTDS,
      regime: data.regime
    }
  });
});

// ✅ Get total TDS amount for a user including FNF days tax
exports.getTotalTaxableAmountFromSalaryStructureByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) {
    websocketHandler.sendLog(req, '❌ TDS: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }

  websocketHandler.sendLog(req, `🔄 Starting TDS calculation for user: ${userId}`, constants.LOG_TYPES.INFO);

  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });

  // 4️⃣ Calculate eligible salary amount
  let totalTDSAppicablearlyAmount = await getTotalTDSEligibleAmount(req, salaryDetails);

  // 5. Final response
  res.status(200).json({
    status: 'success',
    data: totalTDSAppicablearlyAmount
  });
});


