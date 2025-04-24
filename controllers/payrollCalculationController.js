// 👉 Import reusable service methods from the LWF service module
const {
  getTotalLwfEligibleAmount,      // Calculates monthly LWF-eligible earnings (basic + allowances)
  isLwfApplicableThisMonth,       // Checks if LWF is applicable for the current month
  calculateLwfFromSlab,           // Finds the correct LWF slab and calculates employee/employer contributions
  storeLwfInPayrollStatutory      // Stores the calculated LWF in the database, skipping duplicates
} = require('../Services/lwf.service');

// 👉 Required models for fetching employee and salary-related data
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const EmployeeSalaryTaxAndStatutorySetting = require("../models/Employment/EmployeeSalaryTaxAndStatutorySettingModel.js");

// 👉 Utilities and constants
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

/**
 * Main controller to calculate LWF contributions for an employee and store them if applicable.
 */
const calculateLWF = async (req, res) => {
  try {
    // 🔐 Get required user & company identifiers
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const payrollUser = req.payrollUser;
    const StautoryName = "LWF";

    websocketHandler.sendLog(req, '🔄 Starting LWF calculation', constants.LOG_TYPES.INFO);

    // 1️⃣ Check if LWF deduction is enabled for this employee
    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });

    if (!statutoryDetails?.isLWFDeductedFromPlayslip) {
      websocketHandler.sendLog(req, '❌ ESIC not deducted, skipping LWF', constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: 'LWF not applicable – ESIC not deducted' });
    }

    // 2️⃣ Get current salary details of the employee
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    if (!salaryDetails) {
      websocketHandler.sendLog(req, '❌ EmployeeSalaryDetails not found', constants.LOG_TYPES.ERROR);
      return res.status(404).json({ message: 'EmployeeSalaryDetails not found' });
    }
    websocketHandler.sendLog(req, '✅ Found EmployeeSalaryDetails', constants.LOG_TYPES.DEBUG);

    // 3️⃣ Ensure ESIC deduction is also enabled in salary statutory settings
    const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
    if (!taxSettings?.isESICDeduction) {
      websocketHandler.sendLog(req, '❌ ESIC deduction disabled in settings', constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: 'LWF not applicable – ESIC Deduction disabled in settings' });
    }

    // 4️⃣ Calculate the total LWF eligible monthly amount (basic + LWF-affected allowances)
    websocketHandler.sendLog(req, '📊 Calculating total LWF eligible amount', constants.LOG_TYPES.INFO);
    const totalLwfEligibleAmount = await getTotalLwfEligibleAmount(req, salaryDetails);
    websocketHandler.sendLog(req, `✅ LWF eligible amount: ${totalLwfEligibleAmount}`, constants.LOG_TYPES.DEBUG);

    // 5️⃣ Check whether LWF deductions should happen in the current month
    const applicable = await isLwfApplicableThisMonth(req, companyId);
    if (!applicable.status) {
      websocketHandler.sendLog(req, `❌ ${applicable.message}`, constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: applicable.message });
    }

    // 6️⃣ Determine the applicable LWF slab and calculate employee/employer contributions
    websocketHandler.sendLog(req, '📥 Fetching active LWF slab and calculating contributions', constants.LOG_TYPES.INFO);
    const { employeeLWF, employerLWF, slab } = await calculateLwfFromSlab(req, companyId, totalLwfEligibleAmount);
    websocketHandler.sendLog(req, `✅ Calculated - Employee: ${employeeLWF}, Employer: ${employerLWF}`, constants.LOG_TYPES.DEBUG);

    // 7️⃣ Save LWF contributions to PayrollStatutory (skip if already exists)
    websocketHandler.sendLog(req, '💾 Storing LWF contributions', constants.LOG_TYPES.INFO);
    await storeLwfInPayrollStatutory({
      req,
      payrollUser,
      companyId,
      employeeLWF,
      employerLWF,
      slabId: slab._id,
      month: applicable.month,
      year: applicable.year,
      StautoryName
    });

    websocketHandler.sendLog(req, '✅ LWF contributions saved successfully', constants.LOG_TYPES.INFO);

    // ✅ Return success response
    return res.status(200).json({
      message: 'LWF calculated and saved',
      employeeLWF,
      employerLWF,
      totalLwfEligibleAmount
    });

  } catch (err) {
    // ❌ Handle errors and send back an internal server error response
    websocketHandler.sendLog(req, `❌ LWF calculation failed: ${err.message}`, constants.LOG_TYPES.ERROR);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

module.exports = {
  calculateLWF,
  // Add more exports here if you build additional payroll stat functions
};
