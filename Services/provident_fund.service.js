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
const getTotalPFEligibleAmount = async (req, salaryDetails) => {
  let total = 0;
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
 
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isProvidentFundAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ PF Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  const variableAllowances = await SalaryComponentVariableAllowance.find({ employeeSalaryDetails: salaryDetails._id });
 
  for (const item of variableAllowances) {
    const detail = await VariableAllowance.findById(item.variableAllowance);
    if (detail?.isProvidentFundAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ PF Variable Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total PF Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};

/**
 * Calculates employee and employer Provident Fund contributions based on eligible salary and ceiling limit.
 */
const calculatePFFromCeilingLmit = async (
  req,totalPfEligibleAmount,
   isEmployeePFCappedAtPFCeiling,
   isEmployerPFCappedAtPFCeiling,
   additionalPFContributionInPercentage,
   fixedAmountForYourProvidentFundWage
) => {
  const PF_CEILING = 15000;
  const MANDATORY_PF_RATE = 0.12;
  let employeeVPFRate = 0;
  if (additionalPFContributionInPercentage && additionalPFContributionInPercentage > 0) {
    employeeVPFRate = additionalPFContributionInPercentage / 100;
    websocketHandler.sendLog(req, `📊 Employee VPF rate updated to ${additionalPFContributionInPercentage}%`, constants.LOG_TYPES.INFO);
  }

  let employeePFWage = totalPfEligibleAmount;
  let employerPFWage = totalPfEligibleAmount;

  // 🧠 Use fixed amount for employee if provided and cap is false
  if (!isEmployeePFCappedAtPFCeiling && fixedAmountForYourProvidentFundWage > 0) {
    employeePFWage = fixedAmountForYourProvidentFundWage;
    websocketHandler.sendLog(req, `🔧 Employee PF wage set to fixed amount ₹${fixedAmountForYourProvidentFundWage}`, constants.LOG_TYPES.INFO);
  } else if (isEmployeePFCappedAtPFCeiling && totalPfEligibleAmount > PF_CEILING) {
    employeePFWage = PF_CEILING;
    websocketHandler.sendLog(req, `📏 Employee PF wage capped at ₹${PF_CEILING}`, constants.LOG_TYPES.INFO);
  }

  // 🧠 Use fixed amount for employer if provided and cap is false
  if (!isEmployerPFCappedAtPFCeiling && fixedAmountForYourProvidentFundWage > 0) {
    employerPFWage = fixedAmountForYourProvidentFundWage;
    websocketHandler.sendLog(req, `🔧 Employer PF wage set to fixed amount ₹${fixedAmountForYourProvidentFundWage}`, constants.LOG_TYPES.INFO);
  } else if (isEmployerPFCappedAtPFCeiling && totalPfEligibleAmount > PF_CEILING) {
    employerPFWage = PF_CEILING;
    websocketHandler.sendLog(req, `📏 Employer PF wage capped at ₹${PF_CEILING}`, constants.LOG_TYPES.INFO);
  }

  const employeeMandatoryPF = Math.round(employeePFWage * MANDATORY_PF_RATE);
  const employerMandatoryPF = Math.round(employerPFWage * MANDATORY_PF_RATE);
  const employeeVPF = employeeVPFRate > 0 ? Math.round(totalPfEligibleAmount * employeeVPFRate) : 0;

  const totalPFContribution = employeeMandatoryPF + employerMandatoryPF + employeeVPF;
 
  websocketHandler.sendLog(
    req,
    `👷 Employee Mandatory PF: ₹${employeeMandatoryPF} (Wage: ₹${employeePFWage}), Employer Mandatory PF: ₹${employerMandatoryPF} (Wage: ₹${employerPFWage}), Employee VPF: ₹${employeeVPF}`,
    constants.LOG_TYPES.INFO
  );

  return {
    employeeMandatoryPF,
    employerMandatoryPF,
    employeeVPF,
    totalPFContribution
  };
};

/**
 * Calculates the total Provident Fund (PF) eligible salary amount.
 * Includes basic salary and all PF-affected fixed and variable allowances.
 */
const getTotalPFAmount = async (req, user) => {
  try {
    const userId = new mongoose.Types.ObjectId(user); // ensure it's ObjectId
    websocketHandler.sendLog(req, `🔍 Starting PF total aggregation for user: ${user}`, constants.LOG_TYPES.INFO);

    const result = await PayrollStatutory.aggregate([
      {
        $lookup: {
          from: 'PayrollUsers',
          localField: 'payrollUser',
          foreignField: '_id',
          as: 'payrollUserDetails'
        }
      },
      { $unwind: '$payrollUserDetails' },
      {
        $match: {
          'payrollUserDetails.user': userId,
          StautoryName: 'Provident Fund'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const result1 = await PayrollStatutory.aggregate([
      {
        $lookup: {
          from: 'PayrollUsers',
          localField: 'payrollUser',
          foreignField: '_id',
          as: 'payrollUserDetails'
        }
      },
      { $unwind: '$payrollUserDetails' },
      {
        $match: {
          'payrollUserDetails.user': userId,
          StautoryName: 'Provident Fund'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    const result2 = await PayrollFNFStatutory.aggregate([
      {
        $lookup: {
          from: 'PayrollFNFUsers',
          localField: 'payrollFNFUser',
          foreignField: '_id',
          as: 'payrollUserDetails'
        }
      },
      { $unwind: '$payrollUserDetails' },
      {
        $match: {
          'payrollUserDetails.user': userId,
          StautoryName: 'Provident Fund'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    const total1 = result1[0]?.totalAmount || 0;
    const total2 = result2[0]?.totalAmount || 0;
    websocketHandler.sendLog(req, `✅ Total PF amount for user ${user}: ₹${total1}`, constants.LOG_TYPES.INFO);

    return total1+total2;
  } catch (err) {
    websocketHandler.sendLog(req, `❌ Error calculating total PF amount for user ${user}: ${err.message}`, constants.LOG_TYPES.ERROR);
    return 0;
  }
};

module.exports = {
  getTotalPFEligibleAmount,
  calculatePFFromCeilingLmit,
  getTotalPFAmount
};
