const SalaryComponentFixedAllowance = require('../models/Employment/SalaryComponentFixedAllowanceModel');
const SalaryComponentVariableAllowance = require('../models/Employment/SalaryComponentVariableAllowance');
const FixedAllowance = require('../models/Payroll/fixedAllowancesModel');
const VariableAllowance = require('../models/Payroll/variableAllowanceModel');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const User = require("../models/permissions/userModel");
const EmployeeIncomeTaxDeclaration = require("../models/Employment/EmployeeIncomeTaxDeclaration");
const EmployeeIncomeTaxDeclarationComponent = require("../models/Employment/EmployeeIncomeTaxDeclarationComponent");
const EmployeeIncomeTaxDeclarationHRA = require("../models/Employment/EmployeeIncomeTaxDeclarationHRA");
const TaxSlab = require('../models/Company/TaxSlab');


/**
 * Calculates the total ESIC-eligible salary amount.
 * Includes basic salary and all ESIC-affected fixed and variable allowances.
 */
const getTotalTDSEligibleAmount = async (req, salaryDetails) => {
  let total = 0; 
 
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.isTDSAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ ESIC Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  const variableAllowances = await SalaryComponentVariableAllowance.find({ employeeSalaryDetails: salaryDetails._id });
 
  for (const item of variableAllowances) {
    const detail = await VariableAllowance.findById(item.variableAllowance);
    if (detail?.isIncomeTaxAffected) {
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ ESIC Variable Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total ESIC Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};
const getTotalMonthlyAllownaceAmount = async (req, salaryDetails) => {
  let total = 0; 
 
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });
  
  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);   
      total += item.monthlyAmount || 0;
      websocketHandler.sendLog(req, `➕ ESIC Fixed Allowance: ${item.monthlyAmount} from ${detail.label}`, constants.LOG_TYPES.TRACE);
   
  }
  websocketHandler.sendLog(req, `✅ Total ESIC Eligible Amount: ${total}`, constants.LOG_TYPES.INFO);
  return total;
};
/**
 * Calculates the total ESIC-eligible salary amount.
 * Includes basic salary and all ESIC-affected fixed and variable allowances.
 */
const getTotalHRAAmount = async (req, salaryDetails) => {
  let total = 0;
  // Fetch fixed allowances
  const fixedAllowances = await SalaryComponentFixedAllowance.find({ employeeSalaryDetails: salaryDetails._id });

  for (const item of fixedAllowances) {
    const detail = await FixedAllowance.findById(item.fixedAllowance);
    if (detail?.label === 'HRA') {
      total = item.monthlyAmount * 12 || 0; // Annualize the monthly HRA amount
      websocketHandler.sendLog(req, `➕ HRA Fixed Allowance: ₹${item.monthlyAmount} per month`, constants.LOG_TYPES.TRACE);
    }
  }

  websocketHandler.sendLog(req, `✅ Total HRA Amount: ₹${total}`, constants.LOG_TYPES.INFO);
  return total;
};

/**
 * Calculates total taxable deduction (including approved HRA and other tax components)
 */
const GetTDSAppicableAmountAfterDeclartion = async ({ req,userId, companyId, financialYear, totalTDSAppicableAmount, hraReceived }) => {
  try {
    // Step 1: Get Employee Income Tax Declaration ID
    const declaration = await EmployeeIncomeTaxDeclaration.findOne({
      user: userId,
      company: companyId,
      financialYear
    });

    if (!declaration) {
      console.warn("❌ No income tax declaration found for user.");
      return { hraExempt: 0, componentTotal: 0, totalDeduction: 0 };
    }

    const declarationId = declaration._id;

    // Step 2: Get all approved Income Tax Components for the declaration
    const approvedComponents = await EmployeeIncomeTaxDeclarationComponent.find({
      employeeIncomeTaxDeclaration: declarationId,
      approvalStatus: 'Approved'
    });

    let componentTotal = 0;
    approvedComponents.forEach(comp => {
      componentTotal += comp.approvedAmount;
    });

    // Step 3: Get HRA declarations and compute HRA Exemptions
    const hraDeclarations = await EmployeeIncomeTaxDeclarationHRA.find({
      employeeIncomeTaxDeclaration: declarationId,
      approvalStatus: 'Approved'
    });

    let hraExempt = 0;

    hraDeclarations.forEach(hra => {
      const rentPaid = hra.rentDeclared;
      const cityType = hra.cityType.toLowerCase();
      const salary = totalTDSAppicableAmount;

      const rentExcess = rentPaid - (0.1 * salary);
      const cityLimit = cityType === 'metro' ? (0.5 * salary) : (0.4 * salary);
      const hraExemption = Math.min(hraReceived, rentExcess, cityLimit);

      if (hraExemption > 0) {
        hraExempt += hraExemption;
      }
    });

    // Step 4: Final Result
    const totalDeduction = componentTotal + hraExempt;

    return {
      hraExempt,
      componentTotal,
      totalDeduction
    };

  } catch (err) {
    console.error("❌ Error calculating total deduction:", err);
    throw err;
  }
};

/**
 * Checks whether ESIC is applicable for the current month for a company.
 */

const calculateIncomeTax = async (req, companyId, taxableAmount, regime) => {
  try {
      // Fetch all slabs for the given company and regime
    const slabs = await TaxSlab.find({
      company: companyId,
      regime: regime
    }).sort({ minAmount: 1 }); // Ensure slabs are sorted

    if (!slabs || slabs.length === 0) {
      throw new Error(`No tax slabs found for regime: ${regime}`);
    }

    let tax = 0;
    // Apply slab-wise calculation
    for (const slab of slabs) {
      const { minAmount, maxAmount, taxPercentage } = slab;

      if (taxableAmount > minAmount) {
        const upperLimit = maxAmount === 0 ? taxableAmount : Math.min(taxableAmount, maxAmount);
        const taxableInSlab = upperLimit - minAmount;

        const slabTax = (taxableInSlab * taxPercentage) / 100;
        tax += slabTax;
     }
    }

    return tax;

  } catch (error) {
    console.error("❌ Error calculating tax:", error);
    throw error;
  }
};


module.exports = {
  getTotalTDSEligibleAmount,
  calculateIncomeTax,
  GetTDSAppicableAmountAfterDeclartion,
  getTotalHRAAmount,
  getTotalMonthlyAllownaceAmount
};