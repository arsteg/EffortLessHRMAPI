const GeneralSetting = require("../models/Payroll/PayrollGeneralSettingModel");
const RoundingRule = require("../models/Payroll/RoundingRulesModel");
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
  const roundingRules = await RoundingRule.find();
  res.status(200).json({
    status: 'success',
    data: roundingRules
  });
};
