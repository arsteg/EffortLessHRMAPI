const GeneralSetting = require("../models/Payroll/payrollGeneralSettingModel");
const RoundingRule = require("../models/Payroll/roundingRulesModel");
const FixedAllowances = require('../models/Payroll/fixedAllowancesModel');
const FixedContribution = require('../models/Payroll/fixedContributionModel');
const catchAsync = require('../utils/catchAsync');
const LWFFixedContributionSlab = require("../models/Payroll/lwfFixedContributionSlabModel");
// controllers/payrollController.js

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
