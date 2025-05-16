const SalaryComponentFixedAllowance = require('../models/Employment/SalaryComponentFixedAllowanceModel');
const SalaryComponentVariableAllowance = require('../models/Employment/SalaryComponentVariableAllowance');
const FixedAllowance = require('../models/Payroll/fixedAllowancesModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');

var mongoose = require('mongoose');
const PayrollFNFStatutory = require('../models/Payroll/PayrollFNFStatutory');
const PayrollStatutory = require('../models/Payroll/PayrollStatutory');
/**
 * Calculates the total Provident Fund (PF) eligible salary amount.
 * Includes basic salary and all PF-affected fixed and variable allowances.
 */
const getTotalGratuityEligibleAmount = async (req, salaryDetails) => {
  let total = salaryDetails?.BasicSalary / 12 || 0;
  websocketHandler.sendLog(req, `➡️ Basic Salary considered: ${salaryDetails?.BasicSalary}`, constants.LOG_TYPES.DEBUG);

  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
 
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isGratuityFundAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ PF Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }  
  websocketHandler.sendLog(req, `✅ Total PF Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};

/**
 * Calculates employee and employer Provident Fund contributions based on eligible salary and ceiling limit.
 */
const calculateGratuityFund = async (req, totalLwfEligibleAmount, years) => {
  // 🚫 Gratuity not applicable if missing data or less than 5 years
  if (!totalLwfEligibleAmount || years < 5) {
    websocketHandler.sendLog(req, `❌ Gratuity not applicable – amount: ${totalLwfEligibleAmount}, years: ${years}`, constants.LOG_TYPES.WARN);
    return 0;
  }

  websocketHandler.sendLog(req, `🔄 Starting gratuity calculation – amount: ${totalLwfEligibleAmount}, years: ${years}`, constants.LOG_TYPES.INFO);

  // ➕ Calculate if extra days in service can round up the years
  const totalServiceDays = req.totalServiceDays || 0;
  const fullYears = Math.floor(years);
  const extraDays = (years - fullYears) * 365;

  websocketHandler.sendLog(req, `📆 Full years: ${fullYears}, Extra days: ${extraDays}`, constants.LOG_TYPES.DEBUG);

  const adjustedYears = extraDays >= 183 ? fullYears + 1 : fullYears;

  if (adjustedYears !== fullYears) {
    websocketHandler.sendLog(req, `📈 Adjusted service years rounded up due to >6 months extra: ${adjustedYears}`, constants.LOG_TYPES.INFO);
  }

  // 🧮 Gratuity formula: (Last drawn salary * 15 * years of service) / 26
  const gratuityAmount = (totalLwfEligibleAmount * 15 * adjustedYears) / 26;
  const roundedAmount = Math.round(gratuityAmount);

  websocketHandler.sendLog(req, `✅ Gratuity calculated: ₹${roundedAmount} for ${adjustedYears} years`, constants.LOG_TYPES.INFO);

  return roundedAmount;
};


module.exports = {
  getTotalGratuityEligibleAmount,
  calculateGratuityFund
};
