// 👉 Import reusable service methods from the LWF service module
const {
  getTotalLwfEligibleAmount,      // Calculates monthly LWF-eligible earnings (basic + allowances)
  isLwfApplicableThisMonth,       // Checks if LWF is applicable for the current month
  calculateLwfFromSlab          // Finds the correct LWF slab and calculates employee/employer contributions
} = require('../Services/lwf.service');
const {
  getTotalESICEligibleAmount,      // Calculates monthly LWF-eligible earnings (basic + allowances)
  isESICApplicable,       // Checks if LWF is applicable for the current month
  calculateESICContribution        // Finds the correct LWF slab and calculates employee/employer contributions
} = require('../Services/esic.service');

const {
  storeInPayrollStatutory,         // Stores the calculated LWF in the database, skipping duplicates
} = require('../Services/statutory.service');



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
      websocketHandler.sendLog(req, '❌ LWF not deducted, skipping LWF', constants.LOG_TYPES.WARN);
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
    if (!taxSettings?.isLWFDeduction) {
      websocketHandler.sendLog(req, '❌ LWF deduction disabled in settings', constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: 'LWF not applicable – LWF Deduction disabled in settings' });
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
    await storeInPayrollStatutory({
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

const calculateESIC = async (req, res) => {
  try {
    // 🔐 Get required user & company identifiers
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const payrollUser = req.payrollUser;
    const StautoryName = "ESIC";

    const startMsg = '🔄 Starting ESIC calculation';
    websocketHandler.sendLog(req, startMsg, constants.LOG_TYPES.INFO);

    // 1️⃣ Check if ESIC deduction is enabled for this employee
    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
    if (!statutoryDetails?.isESICDeductedFromSalary) {
      const msg = '❌ ESIC not deducted, skipping ESIC';
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: 'ESIC not applicable – not deducted from salary' });
    }

    // 2️⃣ Get current salary details of the employee
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    if (!salaryDetails) {
      const msg = '❌ EmployeeSalaryDetails not found';
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.ERROR);
      return res.status(404).json({ message: 'EmployeeSalaryDetails not found' });
    }
    const foundSalaryMsg = '✅ Found EmployeeSalaryDetails';
    websocketHandler.sendLog(req, foundSalaryMsg, constants.LOG_TYPES.DEBUG);

    // 3️⃣ Ensure ESIC deduction is also enabled in salary statutory settings
    const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
    if (!taxSettings?.isESICDeduction) {
      const msg = '❌ ESIC deduction disabled in settings';
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: 'ESIC not applicable – deduction disabled in settings' });
    }

    // 4️⃣ Calculate the total ESIC eligible monthly amount (basic + ESIC-affected allowances)
    const calcMsg = '📊 Calculating total ESIC eligible amount';
    websocketHandler.sendLog(req, calcMsg, constants.LOG_TYPES.INFO);

    const totalESICEligibleAmount = await getTotalESICEligibleAmount(req, salaryDetails);
    const eligibleMsg = `✅ ESIC eligible amount: ${totalESICEligibleAmount}`;
    websocketHandler.sendLog(req, eligibleMsg, constants.LOG_TYPES.DEBUG);

    // 5️⃣ Check whether ESIC deductions should happen in the current month
    const applicable = await isESICApplicable(req, companyId, totalESICEligibleAmount);
    if (!applicable.status || !applicable.flag) {
      const msg = `❌ ${applicable.message}`;
      websocketHandler.sendLog(req, msg, constants.LOG_TYPES.WARN);
      return res.status(200).json({ message: applicable.message });
    }

    // 6️⃣ Calculate employee/employer ESIC contributions
    const contribMsg = '📥 Calculating ESIC contributions';
    websocketHandler.sendLog(req, contribMsg, constants.LOG_TYPES.INFO);

    const { employeeESIC, employerESIC, config } = await calculateESICContribution(req, companyId, totalESICEligibleAmount);
    const resultMsg = `✅ Calculated - Employee: ₹${employeeESIC}, Employer: ₹${employerESIC}`;
    websocketHandler.sendLog(req, resultMsg, constants.LOG_TYPES.DEBUG);

    // 7️⃣ Save ESIC contributions to PayrollStatutory (skip if already exists)
    const storeMsg = '💾 Storing ESIC contributions';
    websocketHandler.sendLog(req, storeMsg, constants.LOG_TYPES.INFO);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentYear = currentDate.getFullYear();
    await storeInPayrollStatutory({
      req,
      payrollUser,
      companyId,
      employeeLWF: employeeESIC, // Consider renaming to employeeESIC if possible
      employerLWF: employerESIC,
      slabId: config._id,
      month: currentMonth,
      year: currentYear,
      StautoryName
    });

    const successMsg = '✅ ESIC contributions saved successfully';
    websocketHandler.sendLog(req, successMsg, constants.LOG_TYPES.INFO);

    // ✅ Return success response
    return res.status(200).json({
      message: 'ESIC calculated and saved',
      employeeESIC,
      employerESIC,
      totalESICEligibleAmount
    });

  } catch (err) {
    const errorMsg = `❌ ESIC calculation failed: ${err.message}`;
    websocketHandler.sendLog(req, errorMsg, constants.LOG_TYPES.ERROR);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


module.exports = {
  calculateLWF,
  calculateESIC,
  // Add more exports here if you build additional payroll stat functions
};
