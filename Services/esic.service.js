const ESICContribution = require('../models/Payroll/esicContributionModel');
const CeilingAmount = require('../models/Payroll/esicCeilingAmountModel');
const SalaryComponentFixedAllowance = require('../models/Employment/SalaryComponentFixedAllowanceModel');
const SalaryComponentVariableAllowance = require('../models/Employment/SalaryComponentVariableAllowance');
const FixedAllowance = require('../models/Payroll/fixedAllowancesModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const User = require("../models/permissions/userModel");

/**
 * Calculates the total ESIC-eligible salary amount.
 * Includes basic salary and all ESIC-affected fixed and variable allowances.
 */
const getTotalESICEligibleAmount = async (req, salaryDetails) => {
  let total = salaryDetails?.BasicSalary / 12 || 0;
  
  websocketHandler.sendLog(req, `➡️ Basic Salary considered: ${salaryDetails?.BasicSalary}`, constants.LOG_TYPES.DEBUG);

  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isESICAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ ESIC Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  const variableAllowances = await SalaryComponentVariableAllowance.find({ employeeSalaryDetails: salaryDetails._id });
 
  for (const item of variableAllowances) {
    const detail = await VariableAllowance.findById(item.variableAllowance);
    if (detail?.isESICAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ ESIC Variable Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total ESIC Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};

/**
 * Checks whether ESIC is applicable for the current month for a company.
 */
const isESICApplicable = async (req, companyId, totalEligibleAmount) => {
  const ceilingAmount = await CeilingAmount.findOne({ company: companyId });

  if (!ceilingAmount) {
    const msg = '⚠️ ESIC ceiling amount not configured';
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
    return { status: false, flag: false, message: msg };
  }

  if (totalEligibleAmount < ceilingAmount.maxGrossAmount) {
    const msg = `❌ Total eligible amount (${totalEligibleAmount}) is below ESIC ceiling (${ceilingAmount.maxGrossAmount})`;
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.INFO);
    return { status: false, flag: false, message: msg };
  }
  const activeUserCount = await User.countDocuments({ company:  companyId, status: 'Active' });
 
  if (activeUserCount <= ceilingAmount.employeeCount) {
    const msg = `👥 Only ${activeUserCount} active users found. Minimum ${ceilingAmount.employeeCount + 1} required for ESIC.`;
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.INFO);
    return { status: false, flag: false, message: msg };
  }

  return { status: true, flag: true, message: '✅ ESIC is applicable' };
};

/**
 * Calculates ESIC contribution amounts based on the eligible salary.
 */
const calculateESICContribution = async (req, companyId, totalEligibleAmount) => {
   const esicConfig = await ESICContribution.findOne({ company: companyId });

  if (!esicConfig) {
    const msg = '❌ ESIC contribution rates not configured for this company';
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.ERROR);
    throw new Error(msg);
  }

  const { employeePercentage, employerPercentage } = esicConfig;
 
  const employeeESIC = (employeePercentage / 100) * totalEligibleAmount;
  const employerESIC = (employerPercentage / 100) * totalEligibleAmount;

  websocketHandler.sendLog(
    req,
    `📊 ESIC calculated: Employee (${employeePercentage}%): ₹${employeeESIC.toFixed(2)}, Employer (${employerPercentage}%): ₹${employerESIC.toFixed(2)}`,
    constants.LOG_TYPES.INFO
  );

  return {
    employeeESIC: Number(employeeESIC.toFixed(2)),
    employerESIC: Number(employerESIC.toFixed(2)),
    config: esicConfig
  };
};

module.exports = {
  getTotalESICEligibleAmount,
  isESICApplicable,
  calculateESICContribution
};
