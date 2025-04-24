const PayrollStatutory = require('../models/Payroll/PayrollStatutory');
const LWFFixedContributionSlab = require('../models/Payroll/lwfFixedContributionSlabModel');
const LWFFixedDeductionMonth = require('../models/Payroll/lwfFixedDeductionMonthModel');
const SalaryComponentFixedAllowance = require('../models/Employment/SalaryComponentFixedAllowanceModel');
const SalaryComponentVariableAllowance = require('../models/Employment/SalaryComponentVariableAllowance');
const FixedAllowance = require('../models/Payroll/fixedAllowancesModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');

/**
 * Calculates the total LWF-eligible salary amount.
 * Includes basic salary and all LWF-affected fixed and variable allowances.
 */
const getTotalLwfEligibleAmount = async (req, salaryDetails) => {
  // Divide annual Basic Salary by 12 to get monthly value
  let total = salaryDetails?.BasicSalary / 12 || 0;
  websocketHandler.sendLog(req, `➡️ Basic Salary considered: ${salaryDetails?.BasicSalary}`, constants.LOG_TYPES.DEBUG);

  // Fetch and add fixed allowances that affect LWF
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isLWFAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ LWF Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  // Fetch and add variable allowances that affect LWF
  const variableAllowances = await SalaryComponentVariableAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  for (const item of variableAllowances) {
    const detail = await VariableAllowance.findById(item.variableAllowance);
    if (detail?.isLWFAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ LWF Variable Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total LWF Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  console.log(`✅ Total LWF Eligible Amount: ${total}`);
  return total;
};

/**
 * Checks whether LWF is applicable for the current month for a company.
 */
const isLwfApplicableThisMonth = async (req, companyId) => {
  const deductionMonth = await LWFFixedDeductionMonth.findOne({ company: companyId });

  if (!deductionMonth) {
    const msg = '⚠️ LWF deduction month not configured';
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
    return { status: false, message: msg };
  }

  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = January
  const currentYear = now.getFullYear();
  const applicableMonth = deductionMonth.processMonth ? deductionMonth.month : currentMonth;
  const monthName = now.toLocaleString('default', { month: 'long' });

  if (applicableMonth !== currentMonth) {
    const msg = `📅 LWF not applicable this month (${monthName})`;
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.DEBUG);
    return { status: false, message: msg };
  }

  const msg = `📅 LWF applicable for this month: ${monthName}`;
  websocketHandler.sendLog(req, msg, constants.LOG_TYPES.INFO);
  return { status: true, month: monthName, year: currentYear };
};

/**
 * Finds a matching LWF slab and calculates employee/employer contributions based on eligible amount.
 */
const calculateLwfFromSlab = async (req, companyId, totalEligibleAmount) => {
  const slabs = await LWFFixedContributionSlab.find({ company: companyId, isActive: true });

  if (!slabs || slabs.length === 0) {
    const msg = '❌ No active LWF slabs found';
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.ERROR);
    throw new Error(msg);
  }

  websocketHandler.sendLog(req, `📥 Loaded ${slabs.length} LWF slab(s)`, constants.LOG_TYPES.DEBUG);

  // Match slab based on totalEligibleAmount falling within min/max range
  const matchedSlab = slabs.find(slab => {
    const { minAmount = 0, maxAmount = 0 } = slab;

    if (minAmount === 0 && maxAmount === 0) return true; // universal match
    if (minAmount > 0 && maxAmount === 0) return totalEligibleAmount >= minAmount;
    if (minAmount === 0 && maxAmount > 0) return totalEligibleAmount <= maxAmount;
    return totalEligibleAmount >= minAmount && totalEligibleAmount <= maxAmount;
  });

  if (!matchedSlab) {
    const msg = `❌ No LWF slab matched for eligible amount: ${totalEligibleAmount}`;
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
    throw new Error(msg);
  }

  websocketHandler.sendLog(req, `✅ Matching LWF Slab: ${JSON.stringify(matchedSlab)}`, constants.LOG_TYPES.INFO);

  const {
    minAmount,
    maxAmount,
    employeeAmount,
    employerAmount,
    employeePercentage,
    employerPercentage,
    maxContribution
  } = matchedSlab;

  let employeeLWF = 0;
  let employerLWF = 0;

  // Use fixed amounts if available
  if (employeeAmount > 0 && employerAmount > 0) {
    employeeLWF = employeeAmount;
    employerLWF = employerAmount;
    websocketHandler.sendLog(req, `💵 Using fixed employee: ${employeeLWF}, employer: ${employerLWF}`, constants.LOG_TYPES.INFO);
  } else {
    // Otherwise, calculate percentage-based LWF
    employeeLWF = (employeePercentage / 100) * totalEligibleAmount;
    employerLWF = (employerPercentage / 100) * totalEligibleAmount;

    // Apply max contribution limits if defined
    const noLimits = minAmount === 0 && maxAmount === 0;
    if (!noLimits && maxContribution > 0) {
      employeeLWF = Math.min(employeeLWF, maxContribution);
      employerLWF = Math.min(employerLWF, maxContribution);
    }

    websocketHandler.sendLog(req, `📊 Calculated LWF - Employee: ${employeeLWF}, Employer: ${employerLWF}`, constants.LOG_TYPES.INFO);
  }

  return { employeeLWF, employerLWF, slab: matchedSlab };
};

/**
 * Inserts LWF contribution data into PayrollStatutory collection.
 * Prevents duplicate entries for the same user, month, year, and contributor type.
 */
const storeLwfInPayrollStatutory = async ({
  req,
  payrollUser,
  companyId,
  employeeLWF,
  employerLWF,
  slabId,
  month,
  year,
  StautoryName
}) => {
  console.log(`🧾 Checking for existing LWF entries for user: ${payrollUser}, month: ${month}, year: ${year}`);

  // Prevent duplicate entries by checking both contributor types
  const existingEmployee = await PayrollStatutory.findOne({
    payrollUser,
    fixedContribution: slabId,
    ContributorType: 'Employee',
    month,
    year
  });

  const existingEmployer = await PayrollStatutory.findOne({
    payrollUser,
    fixedContribution: slabId,
    ContributorType: 'Employer',
    month,
    year
  });

  const data = [];

  if (!existingEmployee) {
    data.push({
      payrollUser,
      fixedContribution: slabId,
      ContributorType: 'Employee',
      StautoryName,
      amount: employeeLWF,
      month,
      year,
      company: companyId
    });
  } else {
    websocketHandler.sendLog(req, `⚠️ Skipped inserting Employee LWF - already exists`, constants.LOG_TYPES.WARN);
  }

  if (!existingEmployer) {
    data.push({
      payrollUser,
      fixedContribution: slabId,
      ContributorType: 'Employer',
      StautoryName,
      amount: employerLWF,
      month,
      year,
      company: companyId
    });
  } else {
    websocketHandler.sendLog(req, `⚠️ Skipped inserting Employer LWF - already exists`, constants.LOG_TYPES.WARN);
  }

  // Insert new records if any
  if (data.length > 0) {
    await PayrollStatutory.insertMany(data);
    websocketHandler.sendLog(req, `📌 Stored ${data.length} LWF record(s) in PayrollStatutory`, constants.LOG_TYPES.SUCCESS);
  }
};

module.exports = {
  getTotalLwfEligibleAmount,
  isLwfApplicableThisMonth,
  calculateLwfFromSlab,
  storeLwfInPayrollStatutory
};
