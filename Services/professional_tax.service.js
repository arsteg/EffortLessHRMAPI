const PTSlab = require('../models/Payroll/ptSlabModel');
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
const getTotalProfessionalTaxEligibleAmount = async (req, salaryDetails) => {
  // Divide annual Basic Salary by 12 to get monthly value
  let total =  0;
 
  // Fetch and add fixed allowances that affect LWF
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isProfessionalTaxAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ LWF Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  // Fetch and add variable allowances that affect LWF
  const variableAllowances = await SalaryComponentVariableAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  for (const item of variableAllowances) {
    const detail = await VariableAllowance.findById(item.variableAllowance);
    if (detail?.isProfessionalTaxAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ LWF Variable Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total LWF Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};

/**
 * Checks whether PT is applicable for the current month for a company and returns the matching slab.
 */
const isProfessionalTaxApplicableThisMonth = async (req, companyId, salary, month = null, year = null) => {
    const now = new Date();
    const currentMonth = month !== null ? month : now.getMonth(); // 0 = Jan, 1 = Feb, etc.
    const currentYear = year !== null ? year : now.getFullYear();
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });  
 
    // Fetch all PT slabs for the company
    const ptSlabs = await PTSlab.find({ company: companyId });
  
    if (!ptSlabs || ptSlabs.length === 0) {
      const msg = '⚠️ No PT slabs configured for this company';
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
      return { status: false, message: msg };
    }
  
    // Filter slabs where PT is applicable for the current month based on frequency
    const applicableSlabs = ptSlabs.filter((slab) => {
      switch (slab.frequency) {
        case 'Monthly':
          return true;
        case 'Annually':
          return currentMonth === 2; // February
        case 'Quarterly':
          return [2, 5, 8, 11].includes(currentMonth); // Mar, Jun, Sep, Dec
        case 'Semi-Annually':
          return [2, 8].includes(currentMonth); // Mar, Sep
        case 'Bi-Monthly':
          return currentMonth % 2 === 0; // Even months
        default:
          return false;
      }
    });
  
  
    if (applicableSlabs.length === 0) {
      const msg = `📅 PT not applicable this month (${monthName})`;
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.DEBUG);
      return { status: false, message: msg };
    }
  
    const matchingSlab = getMatchingPTSlab(salary, applicableSlabs); // ✅ calling the function
        
    if (!matchingSlab) {
      const msg = `❌ No matching PT slab found for salary ₹${salary}`;
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
      return { status: false, message: msg };
    }
  
    const ptAmount = currentMonth === 2 ? matchingSlab.twelfthMonthAmount : matchingSlab.employeeAmount;
    const msg = `✅ PT applicable for ${monthName}: ₹${ptAmount}`;
    websocketHandler.sendLog(req, msg, constants.LOG_TYPES.INFO);
  
    return {
      status: true,
      slab: matchingSlab,
      ptAmount,
      frequency: matchingSlab.frequency,
      month: currentMonth,
      year: currentYear,
      message: msg
    };
  };
  
 // Match salary with slab range
 const getMatchingPTSlab = (salary, applicableSlabs) => {
    return applicableSlabs.find((slab) => {
      const fromAmt = slab.fromAmount || 0;
      let toAmt = slab.toAmount;
  
      if (toAmt === 'Above' || toAmt === '0' || toAmt === 0) {
        toAmt = Infinity;
      } else {
        toAmt = Number(toAmt);
      }
      return salary >= fromAmt && salary <= toAmt;
    });
  }; 



module.exports = {
  getTotalProfessionalTaxEligibleAmount,
  isProfessionalTaxApplicableThisMonth  
};
