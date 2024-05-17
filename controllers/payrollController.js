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
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;

   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
 
   // Add companyId to the request body
   req.body.company = companyId;
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
  const roundingRules = await RoundingRule.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: roundingRules
  });
};

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
  const fixedAllowances = await FixedAllowances.find({}).where('company').equals(req.cookies.companyId);;
  res.status(200).json({
    status: 'success',
    data: fixedAllowances
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
  const fixedContributions = await FixedContribution.find({});
  res.status(200).json({
    status: 'success',
    data: fixedContributions
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
    const fixedContributionSlabs = await LWFFixedContributionSlab.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: fixedContributionSlabs
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

// controllers/payrollController.js


exports.createLWFFixedContributionMonth = async (req, res, next) => {
  try {
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
  
    // Add companyId to the request body
    req.body.company = companyId;

    const lwfFixedContributionMonth = await LWFFixedContributionMonth.create(req.body);
    res.status(201).json({
      status: 'success',
      data: lwfFixedContributionMonth
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.getLWFFixedContributionMonth = async (req, res, next) => {
  try {
    const lwfFixedContributionMonth = await LWFFixedContributionMonth.findById(req.params.id);
    if (!lwfFixedContributionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'LWFFixedContributionMonth not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: lwfFixedContributionMonth
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

exports.updateLWFFixedContributionMonth = async (req, res, next) => {
  try {
    const { months } = req.body;
    const companyId = req.cookies.companyId;

    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
  

    // Update records based on companyId and paymentMonth
    const updatePromises = months.map(async (month) => {
      await LWFFixedContributionMonth.updateMany(
        { company: companyId, paymentMonth: month.paymentMonth },
        { $set: { processMonth: month.processMonth } }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ status: 'success', message: 'LWFFixedContributionMonths updated successfully' });
  } catch (error) {
    console.error('Error updating LWFFixedContributionMonths:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.deleteLWFFixedContributionMonth = async (req, res, next) => {
  try {
    const lwfFixedContributionMonth = await LWFFixedContributionMonth.findByIdAndDelete(req.params.id);
    if (!lwfFixedContributionMonth) {
      return res.status(404).json({
        status: 'failure',
        message: 'LWFFixedContributionMonth not found'
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

exports.getAllLWFFixedContributionMonths = async (req, res, next) => {
  try {
    const lwfFixedContributionMonths = await LWFFixedContributionMonth.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: lwfFixedContributionMonths
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
  console.log("hi");
  // Iterate over the states array and add/update each state
  const updatedStates = [];
  for (const stateObj of states) {
    const { state, isEligible } = stateObj;
    let ptEligibleState;
    console.log("hi1");
    // Find existing state or create a new one if not found
    const existingState = await PTEligibleStates.findOne({ company, state });
    if (existingState) {
      console.log("hi2");
      // Update existing state
      ptEligibleState = await PTEligibleStates.findByIdAndUpdate(existingState._id, { isEligible }, { new: true });
    } else {
      // Create new state
      console.log("hi3");
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
    const ptSlabs = await PTSlab.where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: "success",
      data: ptSlabs,
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
    const ptDeductionMonths = await PTDeductionMonth.where('company').equals(req.cookies.companyId);;
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