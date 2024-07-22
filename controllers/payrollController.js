const GeneralSetting = require("../models/Payroll/payrollGeneralSettingModel");
const RoundingRule = require("../models/Payroll/roundingRulesModel");
const FixedAllowances = require('../models/Payroll/fixedAllowancesModel');
const FixedContribution = require('../models/Payroll/fixedContributionModel');
const catchAsync = require('../utils/catchAsync');
const LWFFixedContributionSlab = require("../models/Payroll/lwfFixedContributionSlabModel");
const LWFFixedContributionMonth = require("../models/Payroll/lwfFixedContributionMonthModel");
const PTEligibleStates = require('../models/Payroll/ptEligibleStatesModel');
const PTSlab = require("../models/Payroll/ptSlabModel");
const PTDeductionMonth = require('../models/Payroll/ptDeductionMonthModel');
const ESICCeilingAmount = require('../models/Payroll/esicCeilingAmountModel');
const ESICContribution = require('../models/Payroll/esicContributionModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const VariableAllowanceApplicableEmployee= require('../models/Payroll/variableAllowanceApplicableEmployeeModel');
const FixedDeduction = require('../models/Payroll/fixedDeductionModel');
const VariableDeduction = require('../models/Payroll/variableDeductionModel');
const VariableDeductionApplicableEmployee= require('../models/Payroll/variableDeductionApplicableEmployeeModel');
const OtherBenefits = require('../models/Payroll/otherBenefitsModels');
const LoanAdvancesCategory = require('../models/Payroll/loanAdvancesCategoryModel');
const FlexiBenefitsCategory = require("../models/Payroll/flexiBenefitsCategoryModel");
const PFCharge = require('../models/Payroll/pfChargeModel');
const CTCTemplate = require("../models/Payroll/ctcTemplateModel");
const AppError = require('../utils/appError.js');
const CTCTemplateFixedAllowance = require("../models/Payroll/ctcTemplateFixedAllowanceModel");
const CTCTemplateFixedDeduction = require("../models/Payroll/ctcTemplateFixedDeductionModel");
const CTCTemplateEmployerContribution = require("../models/Payroll/ctcTemplateEmployerContributionModel");
const CTCTemplateOtherBenefitAllowance = require("../models/Payroll/ctcTemplateOtherBenefitAllowanceModel");
const CTCTemplateEmployeeDeduction = require("../models/Payroll/ctcTemplateEmployeeDeductionModel");
const PTConfigureStates = require('../models/Payroll/ptConfigureStatesModel');
const PFTemplates = require('../models/Payroll/pfTemplateModel');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.createGeneralSetting = async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  
  try {
    const generalSetting = await GeneralSetting.create(req.body);
    res.status(201).json({
      status: 'success',
      data: generalSetting
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      error: err.message
    });
  }
};

exports.getGeneralSettingByCompanyId = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOne({ companyId: req.cookies.companyId });
    if (!generalSetting) {
      return res.status(404).json({
        status: 'failure',
        error: 'GeneralSetting not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: generalSetting
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      error: err.message
    });
  }
};

exports.updateGeneralSetting = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOneAndUpdate({ companyId: req.cookies.companyId }, req.body, {
      new: true,
      runValidators: true
    });

    if (!generalSetting) {
      return res.status(404).json({
        status: 'failure',
        error: 'GeneralSetting not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: generalSetting
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      error: err.message
    });
  }
};

exports.deleteGeneralSetting = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSetting.findOneAndDelete({ companyId: req.cookies.companyId });
    if (!generalSetting) {
      return res.status(404).json({
        status: 'failure',
        error: 'GeneralSetting not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      error: err.message
    });
  }
};

exports.createRoundingRule = async (req, res, next) => {
  console.log("hii");
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;

   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
   console.log(companyId);
   // Validate generalSetting
   const generalSettingExists = await GeneralSetting.findById(req.body.generalSetting);
   if (!generalSettingExists) {
     return next(new AppError('Invalid general setting', 400));
   }
   // Add companyId to the request body
   console.log("hii2");
   req.body.company = companyId;
   console.log(req.body.company);
  const roundingRule = await RoundingRule.create(req.body);
  res.status(201).json({
    status: 'success',
    data: roundingRule
  });
};

exports.getRoundingRuleById = async (req, res, next) => {
  const roundingRule = await RoundingRule.findById(req.params.id);
  if (!roundingRule) {
    return next(new AppError('Rounding rule not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: roundingRule
  });
};

exports.updateRoundingRule = async (req, res, next) => {
  const roundingRule = await RoundingRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!roundingRule) {
    return next(new AppError('Rounding rule not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: roundingRule
  });
};

exports.deleteRoundingRule = async (req, res, next) => {
  const roundingRule = await RoundingRule.findByIdAndDelete(req.params.id);

  if (!roundingRule) {
    return next(new AppError('Rounding rule not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
};

exports.getAllRoundingRules = async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const companyId = req.cookies.companyId;

  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const totalCount = await RoundingRule.countDocuments({company: companyId });  
 
  const roundingRules = await RoundingRule.find({ company: companyId })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: roundingRules,
    total: totalCount
  });
};


exports.createPFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.create(req.body);
  res.status(201).json({
    status: 'success',
    data: pfTemplate
  });
});

/**
 * Controller to get a PF template by ID
 */
exports.getPFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findById(req.params.id);
  if (!pfTemplate) {
    return next(new AppError('PF template not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: pfTemplate
  });
});

/**
 * Controller to update a PF template by ID
 */
exports.updatePFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!pfTemplate) {
    return next(new AppError('PF template not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: pfTemplate
  });
});

/**
 * Controller to delete a PF template by ID
 */
exports.deletePFTemplate = catchAsync(async (req, res, next) => {
  const pfTemplate = await PFTemplates.findByIdAndDelete(req.params.id);
  
  if (!pfTemplate) {
    return next(new AppError('PF template not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Controller to get all PF templates by company ID
 */
exports.getAllPFTemplatesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await PFTemplates.countDocuments({ company: req.cookies.companyId });
 
  const pfTemplates = await PFTemplates.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip)).limit(parseInt(limit));
   
  res.status(200).json({
    status: 'success',
    data: pfTemplates,
    total: totalCount
  });
});


exports.createFixedAllowances = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const fixedAllowances = await FixedAllowances.create(req.body);
  res.status(201).json({
    status: 'success',
    data: fixedAllowances
  });
});

exports.getFixedAllowancesById = catchAsync(async (req, res, next) => {
  const fixedAllowances = await FixedAllowances.findById(req.params.id);
  if (!fixedAllowances) {
    return next(new AppError('FixedAllowances not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: fixedAllowances
  });
});

exports.updateFixedAllowances = catchAsync(async (req, res, next) => {
  const fixedAllowances = await FixedAllowances.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!fixedAllowances) {
    return next(new AppError('FixedAllowances not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: fixedAllowances
  });
});

exports.deleteFixedAllowances = catchAsync(async (req, res, next) => {
  const fixedAllowances = await FixedAllowances.findByIdAndDelete(req.params.id);
  if (!fixedAllowances) {
    return next(new AppError('FixedAllowances not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllFixedAllowances = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await FixedAllowances.countDocuments({company: req.cookies.companyId });  
 
  const fixedAllowances = await FixedAllowances.find({}).where('company').equals(req.cookies.companyId)
  .skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: fixedAllowances,
    total: totalCount
  });
});

exports.createFixedContribution = catchAsync(async (req, res, next) => {
 
  const fixedContributions = await FixedContribution.create(req.body);
  res.status(201).json({
    status: 'success',
    data: fixedContributions
  });
});

exports.getAllFixedContributions = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await FixedContribution.countDocuments({ company: req.cookies.companyId });  
 
  const fixedContributions = await FixedContribution.find({company: req.cookies.companyId}).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: fixedContributions,
    total: totalCount
  });
});

exports.createFixedContributionSlab = async (req, res, next) => {
  try {
      // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

    const fixedContributionSlab = await LWFFixedContributionSlab.create(req.body);
    res.status(201).json({
      status: 'success',
      data: fixedContributionSlab
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab = await LWFFixedContributionSlab.findById(req.params.id);
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: 'failure',
        message: 'Fixed Contribution Slab not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: fixedContributionSlab
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.updateFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab = await LWFFixedContributionSlab.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: 'failure',
        message: 'Fixed Contribution Slab not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: fixedContributionSlab
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.deleteFixedContributionSlab = async (req, res, next) => {
  try {
    const fixedContributionSlab = await LWFFixedContributionSlab.findByIdAndDelete(req.params.id);
    if (!fixedContributionSlab) {
      return res.status(404).json({
        status: 'failure',
        message: 'Fixed Contribution Slab not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getAllFixedContributionSlabs = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LWFFixedContributionSlab.countDocuments({company: req.cookies.companyId  });  
 
    const fixedContributionSlabs = await LWFFixedContributionSlab.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip)).limit(parseInt(limit));
    res.status(200).json({
      status: 'success',
      data: fixedContributionSlabs,
      total: totalCount
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getAllFixedContributionSlabsByState = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await LWFFixedContributionSlab.countDocuments({state: req.body.state  });  
 
    const fixedContributionSlabs = await LWFFixedContributionSlab.find({}).where('state').equals(req.body.state).skip(parseInt(skip)).limit(parseInt(limit));
    res.status(200).json({
      status: 'success',
      data: fixedContributionSlabs,
      total: totalCount
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};
// controllers/payrollController.js


exports.createLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
  
    // Add companyId to the request body
    req.body.company = companyId;

    const lwfFixedDeductionMonth = await LWFFixedDeductionMonth.create(req.body);
    res.status(201).json({
      status: 'success',
      data: lwfFixedDeductionMonth
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonth = await LWFFixedDeductionMonth.findById(req.params.id);
    if (!lwfFixedDeductionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'LWFFixedContributionMonth not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: lwfFixedDeductionMonth
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.updateLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const { months } = req.body;
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
  

    // Update records based on companyId and paymentMonth
    const updatePromises = months.map(async (month) => {
      await LWFFixedDeductionMonth.updateMany(
        { company: companyId, paymentMonth: month.paymentMonth },
        { $set: { processMonth: month.processMonth } }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ status: 'success', message: 'LWFFixedDeductionMonths updated successfully' });
  } catch (error) {
    console.error('Error updating LWFFixedDeductionMonths:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.deleteLWFFixedDeductionMonth = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonth = await LWFFixedDeductionMonth.findByIdAndDelete(req.params.id);
    if (!lwfFixedDeductionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'LWFFixedDeductionMonth not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getAllLWFFixedDeductionMonths = async (req, res, next) => {
  try {
    const lwfFixedDeductionMonths = await LWFFixedDeductionMonth.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: lwfFixedDeductionMonths
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};
exports.getAllPTEligibleStates = async (req, res, next) => {
  try {
    const ptEligibleStates = await PTEligibleStates.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: ptEligibleStates
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.createPTConfigureState = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
  
    // Add companyId to the request body
    req.body.company = companyId;

  const ptConfigureState = await PTConfigureStates.create(req.body);
  res.status(201).json({
    status: 'success',
    data: ptConfigureState
  });
});

exports.getPTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findById(req.params.id);
  if (!ptConfigureState) {
    return next(new AppError('PTConfigureState not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: ptConfigureState
  });
});

exports.updatePTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!ptConfigureState) {
    return next(new AppError('PTConfigureState not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: ptConfigureState
  });
});

exports.deletePTConfigureState = catchAsync(async (req, res, next) => {
  const ptConfigureState = await PTConfigureStates.findByIdAndDelete(req.params.id);

  if (!ptConfigureState) {
    return next(new AppError('PTConfigureState not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllPTConfigureStatesByCompany = catchAsync(async (req, res, next) => {
  const ptConfigureStates = await PTConfigureStates.find({ company: req.cookies.companyId });

  res.status(200).json({
    status: 'success',
    data: ptConfigureStates
  });
});

exports.addUpdatePTEligibleStates = async (req, res, next) => {
  const company = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Check if the request body contains the required fields
  if (!req.body.states) {
    return next(new AppError('Company ID and states array are required.', 400));
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
      ptEligibleState = await PTEligibleStates.findByIdAndUpdate(existingState._id, { isEligible }, { new: true });
    } else {
      // Create new state
      ptEligibleState = await PTEligibleStates.create({ company, state, isEligible });
    }
    updatedStates.push(ptEligibleState);
  }

  res.status(200).json({
    status: 'success',
    data: updatedStates
  });
};
exports.addPTSlab = async (req, res, next) => {
  try {
    const company = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!company) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    req.body.company=company;
    const ptSlab = await PTSlab.create(req.body);
    res.status(201).json({
      status: "success",
      data: ptSlab,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPTSlabs = async (req, res, next) => {
  try {
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const totalCount = await PTSlab.countDocuments({ company: req.cookies.companyId });  
 
    const ptSlabs = await PTSlab.where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
    res.status(200).json({
      status: "success",
      data: ptSlabs,
      total: totalCount
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
        status: "failure",
        message: "PTSlab not found",
      });
    }
    res.status(200).json({
      status: "success",
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
        status: "failure",
        message: "PTSlab not found",
      });
    }
    res.status(200).json({
      status: "success",
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
        status: "failure",
        message: "PTSlab not found",
      });
    }
    res.status(204).json({
      status: "success",
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
      return next(new AppError('Company ID not found in cookies', 400));
    }
    req.body.company = company;

    const ptDeductionMonth = await PTDeductionMonth.create(req.body);
    res.status(201).json({
      status: 'success',
      data: ptDeductionMonth
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getAllPTDeductionMonths = async (req, res, next) => {
  try {
    const ptDeductionMonths = await PTDeductionMonth.where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: ptDeductionMonths
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getPTDeductionMonthById = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findById(req.params.id);
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'PT Deduction Month not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: ptDeductionMonth
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.updatePTDeductionMonth = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'PT Deduction Month not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: ptDeductionMonth
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.deletePTDeductionMonth = async (req, res, next) => {
  try {
    const ptDeductionMonth = await PTDeductionMonth.findByIdAndDelete(req.params.id);
    if (!ptDeductionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'PT Deduction Month not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};
// Add a CeilingAmount
exports.createCeilingAmount = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  req.body.company = company;
  req.body.period = "Monthly";
  req.body.roundType = "Round Up";
  const ceilingAmount = await ESICCeilingAmount.create(req.body);
  res.status(201).json({
    status: 'success',
    data: ceilingAmount
  });
});

// Get all CeilingAmounts by company
exports.getCeilingAmountsByCompany = catchAsync(async (req, res, next) => {

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await ESICCeilingAmount.countDocuments({ company: req.cookies.companyId  });  
 
  const ceilingAmounts = await ESICCeilingAmount.where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: ceilingAmounts,
    total: totalCount
  });
});

// Update a CeilingAmount by ID
exports.updateCeilingAmount = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!ceilingAmount) {
    return next(new AppError('CeilingAmount not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: ceilingAmount
  });
});

// Get a CeilingAmount by ID
exports.getCeilingAmountById = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findById(req.params.id);

  if (!ceilingAmount) {
    return next(new AppError('CeilingAmount not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: ceilingAmount
  });
});

// Delete a CeilingAmount by ID
exports.deleteCeilingAmount = catchAsync(async (req, res, next) => {
  const ceilingAmount = await ESICCeilingAmount.findByIdAndDelete(req.params.id);

  if (!ceilingAmount) {
    return next(new AppError('CeilingAmount not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.addESICContribution = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const esicContribution = await ESICContribution.create(req.body);
  res.status(201).json({
    status: 'success',
    data: esicContribution
  });
});

exports.getAllESICContributionsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await ESICContribution.countDocuments({ company: req.cookies.companyId  });  
 
  const esicContributions = await ESICContribution.where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: esicContributions,
    total: totalCount
  });
});

exports.updateESICContribution = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!esicContribution) {
    return next(new AppError('ESIC contribution not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: esicContribution
  });
});

exports.getESICContributionById = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findById(req.params.id);

  if (!esicContribution) {
    return next(new AppError('ESIC contribution not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: esicContribution
  });
});

exports.deleteESICContribution = catchAsync(async (req, res, next) => {
  const esicContribution = await ESICContribution.findByIdAndDelete(req.params.id);

  if (!esicContribution) {
    return next(new AppError('ESIC contribution not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});


// Create a new VariableAllowance
exports.createVariableAllowance = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const variableAllowance = await VariableAllowance.create(req.body);
  if (req.body.variableAllowanceApplicableEmployee && req.body.variableAllowanceApplicableEmployee.length > 0) {
  
    const result = req.body.variableAllowanceApplicableEmployee.map(item => ({
      variableAllowance: variableAllowance._id,
      employee: item.employee
    }));
    console.log(result);
    variableAllowance.variableAllowanceApplicableEmployees = await VariableAllowanceApplicableEmployee.insertMany(result);
    
  }
  res.status(201).json({
    status: 'success',
    data: variableAllowance
  });
});

// Get all VariableAllowances by company
exports.getAllVariableAllowancesByCompany = catchAsync(async (req, res, next) => {  
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await VariableAllowance.countDocuments({ company: req.cookies.companyId  });  
 
  const variableAllowances = await VariableAllowance.where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  if(variableAllowances) 
  {
    
      for(var i = 0; i < variableAllowances.length; i++) {     
        const variableAllowanceApplicableEmployees = await VariableAllowanceApplicableEmployee.find({}).where('variableAllowance').equals(variableAllowances[i]._id);  
        if(variableAllowanceApplicableEmployees) 
          {
            variableAllowances[i].variableAllowanceApplicableEmployees = variableAllowanceApplicableEmployees;
          }
          else{
            variableAllowances[i].variableAllowanceApplicableEmployees=null;
          }
        }
  }
  res.status(200).json({
    status: 'success',
    data: variableAllowances,
    total: totalCount
  });
});

// Get a VariableAllowance by ID
exports.getVariableAllowanceById = catchAsync(async (req, res, next) => {
  const variableAllowance = await VariableAllowance.findById(req.params.id);
  if(variableAllowance) 
  {
    
        const variableAllowanceApplicableEmployees = await VariableAllowanceApplicableEmployee.find({}).where('variableAllowance').equals(variableAllowance._id);  
        if(variableAllowanceApplicableEmployees) 
          {
            variableAllowance.variableAllowanceApplicableEmployees = variableAllowanceApplicableEmployees;
          }
          else{
            variableAllowance.variableAllowanceApplicableEmployees = null;
          }
        
  }
  if (!variableAllowance) {
    return next(new AppError('Variable allowance not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: variableAllowance
  });
});

// Update a VariableAllowance by ID
exports.updateVariableAllowance = catchAsync(async (req, res, next) => {
  const variableAllowance = await VariableAllowance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (req.body.variableAllowanceApplicableEmployee && req.body.variableAllowanceApplicableEmployee.length > 0) {
    await VariableAllowanceApplicableEmployee.deleteMany({ variableAllowance: variableAllowance._id });
    const result = req.body.variableAllowanceApplicableEmployee.map(item => ({
      variableAllowance: variableAllowance._id,
      employee: item.employee
    }));
    console.log(result);
    variableAllowance.variableAllowanceApplicableEmployees = await VariableAllowanceApplicableEmployee.insertMany(result);    
  }
  if (!variableAllowance) {
    return next(new AppError('Variable allowance not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: variableAllowance
  });
});

// Delete a VariableAllowance by ID
exports.deleteVariableAllowance = catchAsync(async (req, res, next) => {
  const variableAllowance = await VariableAllowance.findByIdAndDelete(req.params.id);
  if (!variableAllowance) {
    return next(new AppError('Variable allowance not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});


// Create Fixed Deduction
exports.createFixedDeduction = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

    const fixedDeduction = await FixedDeduction.create(req.body);
    res.status(201).json({
        status: 'success',
        data: fixedDeduction
    });
});

// Get all Fixed Deductions by company
exports.getAllFixedDeductionsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;

  
    const companyId  = req.cookies.companyId;
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    const totalCount = await FixedDeduction.countDocuments({ company: req.cookies.companyId });  
 
    const fixedDeductions = await FixedDeduction.find({ company: companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        data: fixedDeductions,
        total: totalCount
    });
});

// Get Fixed Deduction by ID
exports.getFixedDeductionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const fixedDeduction = await FixedDeduction.findById(id);

    if (!fixedDeduction) {
        return next(new AppError('Fixed Deduction not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: fixedDeduction
    });
});

// Update Fixed Deduction
exports.updateFixedDeduction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const fixedDeduction = await FixedDeduction.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!fixedDeduction) {
        return next(new AppError('Fixed Deduction not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: fixedDeduction
    });
});

// Delete Fixed Deduction
exports.deleteFixedDeduction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const fixedDeduction = await FixedDeduction.findByIdAndDelete(id);

    if (!fixedDeduction) {
        return next(new AppError('Fixed Deduction not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createVariableDeduction = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;

  const variableDeduction = await VariableDeduction.create(req.body);
  if (req.body.variableDeductionApplicableEmployee && req.body.variableDeductionApplicableEmployee.length > 0) {
  
    const result = req.body.variableDeductionApplicableEmployee.map(item => ({
      variableDeduction: variableDeduction._id,
      employee: item.employee
    }));
    console.log(result);
    variableDeduction.variableDeductionApplicableEmployees = await VariableDeductionApplicableEmployee.insertMany(result);
    
  }
  res.status(201).json({
    status: 'success',
    data: variableDeduction
  });
});

exports.getAllVariableDeductions = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
    // Check if companyId exists in cookies
    if (!company) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    const totalCount = await VariableDeduction.countDocuments({ company: req.cookies.companyId });  
 
  const variableDeductions = await VariableDeduction.find({ company: company }).skip(parseInt(skip))
  .limit(parseInt(limit));
  if(variableDeductions) 
  {
    
      for(var i = 0; i < variableDeductions.length; i++) {     
        const variableDeductionApplicableEmployees = await VariableDeductionApplicableEmployee.find({}).where('variableDeduction').equals(variableDeductions[i]._id);  
        if(variableDeductionApplicableEmployees) 
          {
            variableDeductions[i].variableDeductionApplicableEmployees = variableDeductionApplicableEmployees;
          }
          else{
            variableDeductions[i].variableDeductionApplicableEmployees = null;
          }
        }
  }
  res.status(200).json({
    status: 'success',
    data: variableDeductions,
    total: totalCount
  });
});

exports.getVariableDeductionById = catchAsync(async (req, res, next) => {
  const variableDeduction = await VariableDeduction.findById(req.params.id);
  if (!variableDeduction) {
    return next(new AppError('Variable deduction not found', 404));
  }
  if(variableDeduction) 
  {
    
        const variableDeductionApplicableEmployees = await VariableDeductionApplicableEmployee.find({}).where('variableDeduction').equals(variableDeduction._id);  
        if(variableDeductionApplicableEmployees) 
          {
            variableDeduction.variableDeductionApplicableEmployees = variableDeductionApplicableEmployees;
          }
          else{
            variableDeduction.variableDeductionApplicableEmployees = null;
          }
        
  }
  res.status(200).json({
    status: 'success',
    data: variableDeduction
  });
});

exports.updateVariableDeduction = catchAsync(async (req, res, next) => {
  const variableDeduction = await VariableDeduction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (req.body.variableDeductionnApplicableEmployee && req.body.variableDeductionApplicableEmployee.length > 0) {
    await VariableDeductionApplicableEmployee.deleteMany({ variableDeduction: variableDeduction._id });
    const result = req.body.variableDeductionApplicableEmployee.map(item => ({
      variableDeduction: variableDeduction._id,
      employee: item.employee
    }));
    console.log(result);
    variableDeduction.variableDeductionApplicableEmployees = await VariableDeductionApplicableEmployee.insertMany(result);    
  }
  if (!variableDeduction) {
    return next(new AppError('Variable deduction not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: variableDeduction
  });
});

exports.deleteVariableDeduction = catchAsync(async (req, res, next) => {
  const variableDeduction = await VariableDeduction.findByIdAndDelete(req.params.id);
  if (!variableDeduction) {
    return next(new AppError('Variable deduction not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add OtherBenefits
exports.createOtherBenefits = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const otherBenefits = await OtherBenefits.create(req.body);
  res.status(201).json({
    status: 'success',
    data: otherBenefits
  });
});

// Get All OtherBenefits by Company
exports.getAllOtherBenefitsByCompany = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await OtherBenefits.countDocuments({company: req.cookies.companyId });  
 
  const otherBenefits = await OtherBenefits.find({ company: companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: otherBenefits,
    total: totalCount
  });
});

// Update OtherBenefits
exports.updateOtherBenefits = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const otherBenefits = await OtherBenefits.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!otherBenefits) {
    return next(new AppError('OtherBenefits not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: otherBenefits
  });
});

// Get OtherBenefits by ID
exports.getOtherBenefitsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const otherBenefits = await OtherBenefits.findById(id);

  if (!otherBenefits) {
    return next(new AppError('OtherBenefits not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: otherBenefits
  });
});

// Delete OtherBenefits
exports.deleteOtherBenefits = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const otherBenefits = await OtherBenefits.findByIdAndDelete(id);

  if (!otherBenefits) {
    return next(new AppError('OtherBenefits not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.addLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const existingCategory = await LoanAdvancesCategory.findOne({ name: name, company: companyId });;
  console.log(existingCategory);
  if (existingCategory) {
    return next(new AppError('Loan Advances Category already exists', 400));
  } 
  req.body.company = companyId;
  const loanAdvancesCategory = await LoanAdvancesCategory.create(req.body);
  res.status(201).json({
    status: 'success',
    data: loanAdvancesCategory
  });
});

exports.getAllLoanAdvancesCategoriesByCompany = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await LoanAdvancesCategory.countDocuments({ company: req.cookies.companyId });  
 
  const loanAdvancesCategories = await LoanAdvancesCategory.find({ company: companyId }).skip(parseInt(skip))
    .limit(parseInt(limit));
  if (!loanAdvancesCategories) {
    return next(new AppError('No Loan Advances Categories found for the specified company', 404));
  }
  res.status(200).json({
    status: 'success',
    data: loanAdvancesCategories,
    total: totalCount
  });
});

exports.getLoanAdvancesCategoryById = catchAsync(async (req, res, next) => {
  const loanAdvancesCategory = await LoanAdvancesCategory.findById(req.params.id);
  if (!loanAdvancesCategory) {
    return next(new AppError('Loan Advances Category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: loanAdvancesCategory
  });
});

exports.updateLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const loanAdvancesCategory = await LoanAdvancesCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!loanAdvancesCategory) {
    return next(new AppError('Loan Advances Category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: loanAdvancesCategory
  });
});

exports.deleteLoanAdvancesCategory = catchAsync(async (req, res, next) => {
  const loanAdvancesCategory = await LoanAdvancesCategory.findByIdAndDelete(req.params.id);
  if (!loanAdvancesCategory) {
    return next(new AppError('Loan Advances Category not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Create a new FlexiBenefitsCategory
exports.createFlexiBenefitsCategory = catchAsync(async (req, res, next) => {

  const { name } = req.body;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const existingCategory = await FlexiBenefitsCategory.findOne({ name: name, company: companyId });;
  console.log(existingCategory);
  req.body.company = companyId;
  if (existingCategory) {  
    return next(new AppError('FlexiBenefitsCategory already exists for this company', 400));
  }

  const flexiBenefitsCategory = await FlexiBenefitsCategory.create( req.body);

  res.status(201).json({
    status: 'success',
    data: flexiBenefitsCategory
  });
});

// Get all FlexiBenefitsCategory by company
exports.getAllFlexiBenefitsCategoryByCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.cookies.companyId;
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await FlexiBenefitsCategory.countDocuments({ company: companyId });  

  const flexiBenefitsCategories = await FlexiBenefitsCategory.find({ company: companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: flexiBenefitsCategories,
    total: totalCount
  });
});

// Update a FlexiBenefitsCategory
exports.updateFlexiBenefitsCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedCategory = await FlexiBenefitsCategory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedCategory) {
    return next(new AppError('FlexiBenefitsCategory not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedCategory
  });
});

// Get a FlexiBenefitsCategory by ID
exports.getFlexiBenefitsCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const flexiBenefitsCategory = await FlexiBenefitsCategory.findById(id);

  if (!flexiBenefitsCategory) {
    return next(new AppError('FlexiBenefitsCategory not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: flexiBenefitsCategory
  });
});

// Delete a FlexiBenefitsCategory
exports.deleteFlexiBenefitsCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const flexiBenefitsCategory = await FlexiBenefitsCategory.findByIdAndDelete(id);

  if (!flexiBenefitsCategory) {
    return next(new AppError('FlexiBenefitsCategory not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.createPFCharge = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const pfCharge = await PFCharge.create(req.body);
  res.status(201).json({
    status: 'success',
    data: pfCharge
  });
});

exports.getPFChargesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;

  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const totalCount = await PFCharge.countDocuments({ company: req.cookies.companyId });  
 
  // Assuming PFCharge has a field 'company' to relate PF Charges to a specific company
  const pfCharges = await PFCharge.find({ company: companyId }).skip(parseInt(skip))
  .limit(parseInt(limit));  

  res.status(200).json({
    status: 'success',
    data: pfCharges,
    total: totalCount
  });
});


exports.createCTCTemplate = catchAsync(async (req, res, next) => {
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
  const { ctcTemplateFixedAllowance,ctcTemplateFixedDeduction,ctcTemplateEmployerContribution,ctcTemplateOtherBenefitAllowance,ctcTemplateEmployeeDeduction,...ctcTemplateData } = req.body;
  ctcTemplateData.company = companyId;

  for (const allowance of ctcTemplateFixedAllowance) {
 
    const result = await FixedAllowances.findById(allowance.fixedAllowance);
   
     if (!result) {
      return res.status(400).json({
        status: 'failure',
        message: 'Invalid Fixed Allowances',
      });
    }
  }
  const ctcTemplate = await CTCTemplate.create(ctcTemplateData);
  ctcTemplate.ctcTemplateFixedAllowances = await updateOrCreateFixedAllowances(ctcTemplate._id, req.body.ctcTemplateFixedAllowance);
 
  if(ctcTemplateFixedDeduction.length > 0)
  {
    for (const deduction of ctcTemplateFixedDeduction) {
  
      const result = await FixedDeduction.findById(deduction.fixedDeduction);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateFixedDeductions = await updateOrCreateFixedDeduction(ctcTemplate._id, req.body.ctcTemplateFixedDeduction);
  }

  if(ctcTemplateEmployerContribution.length > 0)
  {
    for (const contirbution of ctcTemplateEmployerContribution) {
  
      const result = await FixedContribution.findById(contirbution.fixedContribution);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Contribution',
        });
      }
    }
    ctcTemplate.ctcTemplateEmployerContributions = await updateOrCreateEmployerContribution(ctcTemplate._id, req.body.ctcTemplateEmployerContribution);
  }
  if(ctcTemplateOtherBenefitAllowance.length > 0)
  {
    for (const item of ctcTemplateOtherBenefitAllowance) {
  
      const result = await OtherBenefits.findById(item.otherBenefit);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Other benefits',
        });
      }
    }
    ctcTemplate.ctcTemplateOtherBenefitAllowances = await updateOrOtherBenefitsAllowance(ctcTemplate._id, req.body.ctcTemplateOtherBenefitAllowance);
  } 
  if(ctcTemplateEmployeeDeduction.length > 0)
  {
    for (const contirbution of ctcTemplateEmployeeDeduction) {
  
      const result = await FixedContribution.findById(contirbution.employeeDeduction);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Employee Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateEmployeeDeductions = await updateOrCreateEmployeeDeduction(ctcTemplate._id, req.body.ctcTemplateEmployeeDeduction);
  } 
  res.status(201).json({
    status: 'success',
    data: ctcTemplate
  });
});

async function updateOrCreateFixedAllowances(ctcTemplateId, updatedCategories) {

  const existingCategories = await CTCTemplateFixedAllowance.find({ ctcTemplate: ctcTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.fixedAllowance.equals(category.fixedAllowance)
    );

    if (!existingCategory) {
     // Create new category
     console.log(ctcTemplateId);
     console.log(category);
      const newCategory = new CTCTemplateFixedAllowance({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.fixedAllowance === existing.fixedAllowance.toString())
  );

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateFixedAllowance.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateFixedAllowance.find({ ctcTemplate: ctcTemplateId });
  console.log(finalCategories);
  return finalCategories;
}

async function updateOrCreateFixedDeduction(ctcTemplateId, updatedCategories) {

  const existingCategories = await CTCTemplateFixedDeduction.find({ ctcTemplate: ctcTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.fixedDeduction.equals(category.fixedDeduction)
    );

    if (!existingCategory) {  
      const newCategory = new CTCTemplateFixedDeduction({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.fixedDeduction === existing.fixedDeduction.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateFixedDeduction.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateFixedDeduction.find({ ctcTemplate: ctcTemplateId });
console.log(finalCategories);
  return finalCategories;
}
async function deleteCTCFixedDeduction(ctcTemplateId) {
  await CTCTemplateFixedDeduction.findByIdAndDelete(ctcTemplateId);  
}
async function updateOrCreateEmployerContribution(ctcTemplateId, updatedCategories) {

  const existingCategories = await CTCTemplateEmployerContribution.find({ ctcTemplate: ctcTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.fixedContribution.equals(category.fixedContribution)
    );

    if (!existingCategory) {  
      const newCategory = new CTCTemplateEmployerContribution({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.fixedContribution === existing.fixedContribution.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateEmployerContribution.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateEmployerContribution.find({ ctcTemplate: ctcTemplateId });

  return finalCategories;
}

async function updateOrOtherBenefitsAllowance(ctcTemplateId, updatedCategories) {

  const existingCategories = await CTCTemplateOtherBenefitAllowance.find({ ctcTemplate: ctcTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.otherBenefit.equals(category.otherBenefit)
    );

    if (!existingCategory) {  
      const newCategory = new CTCTemplateOtherBenefitAllowance({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.otherBenefit === existing.otherBenefit.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateOtherBenefitAllowance.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateOtherBenefitAllowance.find({ ctcTemplate: ctcTemplateId });

  return finalCategories;
}

async function updateOrCreateEmployeeDeduction(ctcTemplateId, updatedCategories) {

  const existingCategories = await CTCTemplateEmployeeDeduction.find({ ctcTemplate: ctcTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.employeeDeduction.equals(category.employeeDeduction)
    );

    if (!existingCategory) {  
      const newCategory = new CTCTemplateEmployeeDeduction({
        ctcTemplate: ctcTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.employeeDeduction === existing.employeeDeduction.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return CTCTemplateEmployeeDeduction.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await CTCTemplateEmployeeDeduction.find({ ctcTemplate: ctcTemplateId });

  return finalCategories;
}

exports.getAllCTCTemplatesByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const totalCount = await CTCTemplate.countDocuments({ company: req.cookies.companyId });  
 
  const ctcTemplates = await CTCTemplate.find({ company: req.cookies.companyId }).skip(parseInt(skip)).limit(parseInt(limit));
  if(ctcTemplates)
  {
   for(var i = 0; i < ctcTemplates.length; i++)
   {     
    const ctcTemplateFixedAllowances = await CTCTemplateFixedAllowance.find({}).where('ctcTemplate').equals(ctcTemplates[i]._id);
    if(ctcTemplateFixedAllowances) 
      {
        ctcTemplates[i].ctcTemplateFixedAllowances=ctcTemplateFixedAllowances;
      }
      else{
        ctcTemplates[i].ctcTemplateFixedAllowances=null;
      }
      const ctcTemplateFixedDeductions = await CTCTemplateFixedDeduction.find({}).where('ctcTemplate').equals(ctcTemplates[i]._id);
    if(ctcTemplateFixedDeductions) 
      {
        ctcTemplates[i].ctcTemplateFixedDeductions=ctcTemplateFixedDeductions;
      }
      else{
        ctcTemplates[i].ctcTemplateFixedDeductions=null;
      }
      const ctcTemplateEmployerContribution = await CTCTemplateEmployerContribution.find({}).where('ctcTemplate').equals(ctcTemplates[i]._id);
      if(ctcTemplateEmployerContribution) 
         {
           ctcTemplates[i].ctcTemplateEmployerContributions=ctcTemplateEmployerContribution;
         }
         else{
           ctcTemplates[i].ctcTemplateEmployerContributions=null;
         } 
       const ctcTemplateOtherBenefitAllowances = await CTCTemplateOtherBenefitAllowance.find({}).where('ctcTemplate').equals(ctcTemplates[i]._id);
       if(ctcTemplateOtherBenefitAllowances) 
         {
           ctcTemplates[i].ctcTemplateOtherBenefitAllowances=ctcTemplateOtherBenefitAllowances;
         }
       else
         {
           ctcTemplates[i].ctcTemplateOtherBenefitAllowances=null;
         }   
      
       const ctcTemplateEmployeeDeductions = await CTCTemplateEmployeeDeduction.find({}).where('ctcTemplate').equals(ctcTemplates[i]._id);
       if(ctcTemplateEmployeeDeductions) 
         {
           ctcTemplates[i].ctcTemplateEmployeeDeductions=ctcTemplateEmployeeDeductions;
         }
       else
         {
           ctcTemplates[i].ctcTemplateEmployeeDeductions=null;
         }       
    }
  }
  res.status(200).json({
    status: 'success',
    data: ctcTemplates,
    total: totalCount
  });
});

exports.getCTCTemplateById = catchAsync(async (req, res, next) => {
  const ctcTemplate = await CTCTemplate.findById(req.params.id);
  if (!ctcTemplate) {
    return next(new AppError('CTCTemplate not found', 404));
  }
  const ctcTemplateFixedAllowances = await CTCTemplateFixedAllowance.find({}).where('ctcTemplate').equals(req.params.id);
  ctcTemplate.ctcTemplateFixedAllowances = ctcTemplateFixedAllowances;
  const ctcTemplateFixedDeductions = await CTCTemplateFixedDeduction.find({}).where('ctcTemplate').equals(req.params.id);
  ctcTemplate.ctcTemplateFixedDeductions = ctcTemplateFixedDeductions;
  const ctcTemplateEmployerContribution = await CTCTemplateEmployerContribution.find({}).where('ctcTemplate').equals(req.params.id);
  ctcTemplate.ctcTemplateEmployerContributions = ctcTemplateEmployerContribution;
  const ctcTemplateOtherBenefitAllowances = await CTCTemplateOtherBenefitAllowance.find({}).where('ctcTemplate').equals(req.params.id);
  if(ctcTemplateOtherBenefitAllowances) 
    {
      ctcTemplate.ctcTemplateOtherBenefitAllowances = ctcTemplateOtherBenefitAllowances;
    }
  else
    {
      ctcTemplate.ctcTemplateOtherBenefitAllowances = null;
    }   
 
  const ctcTemplateEmployeeDeductions = await CTCTemplateEmployeeDeduction.find({}).where('ctcTemplate').equals(req.params.id);
  if(ctcTemplateEmployeeDeductions) 
    {
      ctcTemplate.ctcTemplateEmployeeDeductions = ctcTemplateEmployeeDeductions;
    }
  else
    {
      ctcTemplate.ctcTemplateEmployeeDeductions = null;
    }       
  res.status(200).json({
    status: 'success',
    data: ctcTemplate
  });
});

exports.updateCTCTemplateById = catchAsync(async (req, res, next) => {
  const { ctcTemplateFixedAllowance,ctcTemplateFixedDeduction,ctcTemplateEmployerContribution,ctcTemplateEmployeeDeduction,ctcTemplateOtherBenefitAllowance, ...ctcTemplateData } = req.body;

  // Check if policyLabel is provided
  if (!ctcTemplateData.name) {
    return next(new AppError('Name is required', 400));
  }

  // Check if policyLabel already exists
  const existingTemplate = await CTCTemplate.findOne({ 'name': ctcTemplateData.name ,_id: { $ne: req.params.id }});

  if (existingTemplate) {
    return res.status(400).json({
      status: 'failure',
      message: 'Name already exists',
    });
  }

  if (!Array.isArray(ctcTemplateFixedAllowance) || ctcTemplateFixedAllowance.length === 0) {
    return next(new AppError('CTC Template Fixed Allowance Not Exists in Request', 400));
  }
  const ctcTemplate = await CTCTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!ctcTemplate) {
    return next(new AppError('CTCTemplate not found', 404));
  }

  const ctcTemplateFixedAllowances = await updateOrCreateFixedAllowances(req.params.id, ctcTemplateFixedAllowance);
  ctcTemplate.ctcTemplateFixedAllowances=ctcTemplateFixedAllowances;
  if(ctcTemplateFixedDeduction.length > 0)
  {
    for (const deduction of ctcTemplateFixedDeduction) {
  
      const result = await FixedDeduction.findById(deduction.fixedDeduction);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateFixedDeductions = await updateOrCreateFixedDeduction(req.params.id, req.body.ctcTemplateFixedDeduction);
  }
  else
  {
    const ctcTemplateObjectId = new ObjectId(req.params.id);
    console.log(ctcTemplateObjectId);
    await deleteCTCFixedDeduction(req.params.id);
  }
  if(ctcTemplateEmployerContribution.length > 0)
  {
    for (const contirbution of ctcTemplateEmployerContribution) {
  
      const result = await FixedContribution.findById(contirbution.fixedContribution);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateEmployerContributions = await updateOrCreateEmployerContribution(req.params.id, req.body.ctcTemplateEmployerContribution);
  } 
  if(ctcTemplateOtherBenefitAllowance.length > 0)
  {
    for (const otherBenefit of ctcTemplateOtherBenefitAllowance) {
  
      const result = await OtherBenefits.findById(otherBenefit.otherBenefit);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateOtherBenefitAllowances = await updateOrOtherBenefitsAllowance(req.params.id, req.body.ctcTemplateOtherBenefitAllowance);
  } 
  if(ctcTemplateEmployeeDeduction.length > 0)
  {
    for (const contirbution of ctcTemplateEmployeeDeduction) {
  
      const result = await FixedContribution.findById(contirbution.fixedContribution);
    
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Fixed Deduction',
        });
      }
    }
    ctcTemplate.ctcTemplateEmployeeDeductions = await updateOrCreateEmployeeDeduction(req.params.id, req.body.ctcTemplateEmployeeDeduction);
  } 
  res.status(200).json({
    status: 'success',
    data: ctcTemplate
  });
});

exports.deleteCTCTemplateById = catchAsync(async (req, res, next) => {
  const ctcTemplate = await CTCTemplate.findByIdAndDelete(req.params.id);
  
  if (!ctcTemplate) {
    return next(new AppError('CTCTemplate not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
