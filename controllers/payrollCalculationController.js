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
  getTotalPFEligibleAmount,       // Checks if LWF is applicable for the current month
  calculatePFFromCeilingLmit        // Finds the correct LWF slab and calculates employee/employer contributions
} = require('../Services/provident_fund.service');

const {
  storeInPayrollStatutory,
  storeInPayrollFNFStatutory
         // Stores the calculated LWF in the database, skipping duplicates
} = require('../Services/statutory.service');
const {        
  calculateIncomeTax,       // Checks if LWF is applicable for the current month
  getTotalTDSEligibleAmount,        // Finds the correct LWF slab and calculates employee/employer contributions
  GetTDSAppicableAmountAfterDeclartion,
  getTotalHRAAmount
} = require('../Services/tds.service');
const LOP = require('../models/attendance/lop.js');
const { storeInPayrollVariableAllowances,storeInPayrollVariableDeductions } = require('../Services/variable_pay.service');
const PayrollIncomeTax = require('../models/Payroll/PayrollIncomeTax');
const PayrollFNFIncomeTax = require('../models/Payroll/PayrollFNFIncomeTax.js');
const { getFNFDateRange  } = require('../Services/userDates.service');
const { getTotalGratuityEligibleAmount , calculateGratuityFund  } = require('../Services/gratuity.service');
// 👉 Import reusable service methods from the LWF service module
const {
  getTotalProfessionalTaxEligibleAmount,      // Calculates monthly LWF-eligible earnings (basic + allowances)
  isProfessionalTaxApplicableThisMonth       // Checks if LWF is applicable for the current month
} = require('../Services/professional_tax.service');
const {
  calculateAndStoreOvertime,calculateAndStoreOvertimeForFNF
} = require('../Services/overtime.service.js');
// 👉 Required models for fetching employee and salary-related data
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const EmployeeSalaryTaxAndStatutorySetting = require("../models/Employment/EmployeeSalaryTaxAndStatutorySettingModel.js");
const PayrollAttendanceSummary = require('../models/Payroll/PayrollAttendanceSummary');
const PayrollFNFAttendanceSummary = require('../models/Payroll/PayrollFNFAttendanceSummary.js');
const UserEmployment = require("../models/Employment/UserEmploymentModel");
const User = require('../models/permissions/userModel');
// 👉 Utilities and constants
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');
const isLwfEnabledForUser = async (userId, req) => {
  // Check if statutory settings allow LWF deduction from payslip
  const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
  if (!statutoryDetails?.isLWFDeductedFromPlayslip) {
    websocketHandler.sendLog(req, `ℹ️ LWF is not enabled in statutory settings for user`, constants.LOG_TYPES.INFO);
    return false;
  }

  // Check if salary details exist
  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
  if (!salaryDetails) {
    websocketHandler.sendLog(req, `❌ Employee salary details not found`, constants.LOG_TYPES.ERROR);
    return false;
  }

  // Check if LWF deduction is enabled in tax settings
  const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
  if (!taxSettings?.isLWFDeduction) {
    websocketHandler.sendLog(req, `ℹ️ LWF deduction is disabled in tax settings`, constants.LOG_TYPES.INFO);
    return false;
  }

  websocketHandler.sendLog(req, `✅ LWF deduction is enabled for user`, constants.LOG_TYPES.INFO);
  return true;
};

const processLwfForMonth = async ({ req, companyId, userId, amount, month, year, model, modelData }) => {
 // Check if LWF is applicable for the given month/year
  const applicable = await isLwfApplicableThisMonth(req, companyId, month, year);
  if (!applicable.status) {
    websocketHandler.sendLog(req, `⚠️ LWF not applicable for ${month + 1}/${year}`, constants.LOG_TYPES.INFO);
    return;
  }

  // Calculate LWF values from slab
  const { employeeLWF, employerLWF, slab } = await calculateLwfFromSlab(req, companyId, amount);
  websocketHandler.sendLog(req, `📊 LWF amounts: Employee ₹${employeeLWF}, Employer ₹${employerLWF}`, constants.LOG_TYPES.INFO);

  // Store in payroll model
  await model({
    req,
    ...modelData,
    companyId,
    employeeLWF,
    employerLWF,
    slabId: slab._id,
    month,
    year,
    StautoryName: "LWF"
  });

  websocketHandler.sendLog(req, `✅ LWF processed for ${month + 1}/${year}`, constants.LOG_TYPES.INFO);
};

const calculateLWF = async (req, res, next) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;

    websocketHandler.sendLog(req, '🔄 Starting LWF calculation...', constants.LOG_TYPES.INFO);
  
    // Step 1: Check if LWF is enabled for user
    const enabled = await isLwfEnabledForUser(userId, req);
    if (!enabled) {
      websocketHandler.sendLog(req, `🚫 LWF is not enabled for user`, constants.LOG_TYPES.INFO);
      return;
    }

    // Step 2: Fetch salary details
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
   
    const totalLwfEligibleAmount = await getTotalLwfEligibleAmount(req, salaryDetails);
 
    // Step 3: Handle FNF case (multiple months)
    if (isFNF) {
      websocketHandler.sendLog(req, `📆 Processing LWF for FNF range`, constants.LOG_TYPES.INFO);
   
      const { startDate, endDate } = await getFNFDateRange(req, userId);
   
      const startMonth = startDate.getMonth(), startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth(), endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        const fromMonth = year === startYear ? startMonth : 0;
        const toMonth = year === endYear ? endMonth : 11;

        for (let m = fromMonth; m <= toMonth; m++) {
          try {
            await processLwfForMonth({
              req,
              companyId,
              userId,
              amount: totalLwfEligibleAmount,
              month: m,
              year,
              model: storeInPayrollFNFStatutory,
              modelData: { payrollFNFUser: req.payrollFNFUser }
            });
          } catch (err) {
            const errorMsg = `❌ Failed to process LWF for month ${m + 1}/${year}: ${err.message}`;
            console.log(errorMsg);
            websocketHandler.sendLog(req, errorMsg, constants.LOG_TYPES.ERROR);
          }
        }
      }
    } else {
      // Step 4: Handle regular payroll LWF
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      websocketHandler.sendLog(req, `📆 Processing LWF for current month`, constants.LOG_TYPES.INFO);
 
      await processLwfForMonth({
        req,
        companyId,
        userId,
        amount: totalLwfEligibleAmount,
        month: currentMonth,
        year: currentYear,
        model: storeInPayrollStatutory,
        modelData: { payrollUser: req.payrollUser }
      });
    }

    websocketHandler.sendLog(req, `✅ LWF calculation completed successfully`, constants.LOG_TYPES.SUCCESS);

  } catch (err) {
    const errorMessage = `❌ LWF calculation failed: ${err.message}`;
    websocketHandler.sendLog(req, errorMessage, constants.LOG_TYPES.ERROR);
   }
};

const isESICEnabledForUser = async (userId, req) => {
  // Step 1: Check if ESIC deduction is enabled in statutory settings
  const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
  if (!statutoryDetails?.isESICDeductedFromSalary) {
    websocketHandler.sendLog(req, `ℹ️ ESIC not enabled in statutory settings`, constants.LOG_TYPES.INFO);
    return false;
  }

  // Step 2: Ensure employee salary details exist
  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
  if (!salaryDetails) {
    websocketHandler.sendLog(req, `❌ Employee salary details not found`, constants.LOG_TYPES.WARN);
    return false;
  }

  // Step 3: Confirm ESIC deduction is enabled in tax settings
  const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
  const enabled = !!taxSettings?.isESICDeduction;
  websocketHandler.sendLog(req, enabled ? `✅ ESIC enabled for user` : `ℹ️ ESIC deduction is off in tax settings`, constants.LOG_TYPES.INFO);
  return enabled;
};

const processESICForMonth = async ({
  req, userId, companyId, payrollModel, modelData,
  month, year, totalESICEligibleAmount
}) => {
  // Check if ESIC is applicable based on slab and threshold logic
  const applicable = await isESICApplicable(req, companyId, totalESICEligibleAmount);
  if (!applicable.status || !applicable.flag) {
    websocketHandler.sendLog(req, `❌ ESIC not applicable for ${month + 1}/${year}: ${applicable.message}`, constants.LOG_TYPES.WARN);
    return;
  }

  // Calculate ESIC contributions
  const { employeeESIC, employerESIC, config } = await calculateESICContribution(req, companyId, totalESICEligibleAmount);
  websocketHandler.sendLog(req, `📊 Calculated ESIC – Employee: ₹${employeeESIC}, Employer: ₹${employerESIC}`, constants.LOG_TYPES.DEBUG);

  // Save to payrollStatutory or payrollFNFStatutory
  await payrollModel({
    req,
    ...modelData,
    companyId,
    employeeLWF: employeeESIC, // Consider renaming field in schema to employeeESIC for clarity
    employerLWF: employerESIC,
    slabId: config._id,
    month: month + 1, // Adjusted to 1-based month
    year,
    StautoryName: "ESIC"
  });

  websocketHandler.sendLog(req, `✅ ESIC stored for ${month + 1}/${year}`, constants.LOG_TYPES.INFO);
};

const calculateESIC = async (req, res, next) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;

    websocketHandler.sendLog(req, '🔄 Starting ESIC calculation...', constants.LOG_TYPES.INFO);

    // 1️⃣ Check if ESIC is enabled
    const enabled = await isESICEnabledForUser(userId, req);
    if (!enabled) {
      websocketHandler.sendLog(req, '🚫 ESIC not applicable for this user', constants.LOG_TYPES.WARN);    
      return;
    }

    // 2️⃣ Get total eligible amount for ESIC contribution
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    const totalESICEligibleAmount = await getTotalESICEligibleAmount(req, salaryDetails);
    websocketHandler.sendLog(req, `💰 ESIC eligible salary: ₹${totalESICEligibleAmount}`, constants.LOG_TYPES.DEBUG);

    // 3️⃣ Handle FNF (full and final settlement) ESIC calculation
    if (isFNF) {
      websocketHandler.sendLog(req, `📆 Calculating ESIC for FNF months`, constants.LOG_TYPES.INFO);

      const { startDate, endDate } = await getFNFDateRange(req,userId);
      const startMonth = startDate.getMonth(), startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth(), endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        const fromMonth = year === startYear ? startMonth : 0;
        const toMonth = year === endYear ? endMonth : 11;

        for (let m = fromMonth; m <= toMonth; m++) {
          await processESICForMonth({
            req,
            userId,
            companyId,
            payrollModel: storeInPayrollFNFStatutory,
            modelData: { payrollFNFUser: req.payrollFNFUser },
            month: m,
            year,
            totalESICEligibleAmount
          });
        }
      }
    } else {
      // 4️⃣ Handle regular monthly ESIC
      const now = new Date();
      websocketHandler.sendLog(req, `📆 Calculating ESIC for current month`, constants.LOG_TYPES.INFO);

      await processESICForMonth({
        req,
        userId,
        companyId,
        payrollModel: storeInPayrollStatutory,
        modelData: { payrollUser: req.payrollUser },
        month: now.getMonth(),
        year: now.getFullYear(),
        totalESICEligibleAmount
      });
    }

    websocketHandler.sendLog(req, `✅ ESIC calculation complete`, constants.LOG_TYPES.SUCCESS);

  } catch (err) {
    const errorMsg = `❌ ESIC calculation failed: ${err.message}`;
    websocketHandler.sendLog(req, errorMsg, constants.LOG_TYPES.ERROR);
  }
};


// 1️⃣ Check eligibility for PF deduction from statutory config
const getPFEligibilityDetails = async (req, userId) => {
  const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
  if (!statutoryDetails?.isEmployeeEligibleForPFDeduction) {
    websocketHandler.sendLog(req, '❌ PF not deducted for this employee', constants.LOG_TYPES.WARN);
    return null;
  }
  websocketHandler.sendLog(req, '✅ PF eligibility confirmed from statutory details', constants.LOG_TYPES.DEBUG);
  return statutoryDetails;
};

// 2️⃣ Fetch Employee Salary Details
const getSalaryDetails = async (req, userId) => {
  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
  if (!salaryDetails) {
    websocketHandler.sendLog(req, '❌ Salary details not found', constants.LOG_TYPES.ERROR);
    return null;
  }
  websocketHandler.sendLog(req, '✅ Found EmployeeSalaryDetails', constants.LOG_TYPES.DEBUG);
  return salaryDetails;
};

// 3️⃣ Fetch PF-related tax/statutory settings
const getPFTaxSettings = async (req, salaryDetailsId) => {
  const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetailsId });
  if (!taxSettings?.isPFDeduction) {
    websocketHandler.sendLog(req, '❌ PF deduction disabled in salary tax settings', constants.LOG_TYPES.WARN);
    return null;
  }
  websocketHandler.sendLog(req, '✅ PF deduction enabled in tax settings', constants.LOG_TYPES.DEBUG);
  return taxSettings;
};

// 4️⃣ Perform PF contribution logic using caps, VPF, ceiling limits
const calculatePFContributions = async (req, amount, statutoryDetails, taxSettings) => {
  const isEmployeeCapped = taxSettings.isEmployeePFCappedAtPFCeiling && statutoryDetails.isEmployeePFCappedAtPFCeiling;
  const isEmployerCapped = taxSettings.isEmployerPFCappedAtPFCeiling && statutoryDetails.isEmployerPFCappedAtPFCeiling;
  const additional = statutoryDetails.additionalPFContributionInPercentage;
  const fixedAmount = statutoryDetails.fixedAmountForYourProvidentFundWage;

  websocketHandler.sendLog(req, `⚙️ Calculating PF: employee capped = ${isEmployeeCapped}, employer capped = ${isEmployerCapped}`, constants.LOG_TYPES.DEBUG);

  return await calculatePFFromCeilingLmit(req, amount, isEmployeeCapped, isEmployerCapped, additional, fixedAmount);
};

// 5️⃣ Save monthly PF contribution to payrollStatutory
const storeRegularPFContribution = async (req, companyId, contributionData, StautoryName) => {
  const currentDate = new Date();

  await storeInPayrollStatutory({
    req,
    payrollUser: req.payrollUser,
    companyId,
    employeeLWF: contributionData.employeeMandatoryPF,
    employerLWF: contributionData.employerMandatoryPF,
    slabId: null,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    StautoryName,
    employeeVPF: contributionData.employeeVPF
  });

  websocketHandler.sendLog(req, '📦 Stored regular PF contribution in payrollStatutory', constants.LOG_TYPES.INFO);
};

// 6️⃣ FNF-specific PF storage logic (with pro-rating)
const processFNFProvidentFund = async (req, userId, companyId, contributionData, StautoryName) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const { startDate, endDate } = await getFNFDateRange(req,userId);
  const workingDays = calculateDaysBetween(startDate, endDate);
  const totalDaysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
  const proportion = workingDays / totalDaysInMonth;

  websocketHandler.sendLog(req, `📆 Pro-rating PF for ${workingDays}/${totalDaysInMonth} days`, constants.LOG_TYPES.DEBUG);

  const proratedEmployeePF = +(contributionData.employeeMandatoryPF * proportion).toFixed(2);
  const proratedEmployerPF = +(contributionData.employerMandatoryPF * proportion).toFixed(2);
  const proratedEmployeeVPF = +(contributionData.employeeVPF * proportion).toFixed(2);

  await storeInPayrollFNFStatutory({
    req,
    payrollFNFUser: req.payrollFNFUser,
    companyId,
    employeeLWF: proratedEmployeePF,
    employerLWF: proratedEmployerPF,
    slabId: null,
    month: endDate.getMonth() + 1,
    year: endDate.getFullYear(),
    StautoryName,
    employeeVPF: proratedEmployeeVPF
  });

  websocketHandler.sendLog(req, `📦 Stored FNF PF contribution for ${endDate.getMonth() + 1}/${endDate.getFullYear()}`, constants.LOG_TYPES.INFO);
};

// Utility: Get number of days between two dates (inclusive)
const calculateDaysBetween = (startDate, endDate) => {
  const diff = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

// 🔄 Entry point for full PF calculation
const calculatePF = async (req, res) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;
    const StautoryName = "Provident Fund";

    websocketHandler.sendLog(req, '🔄 Starting Provident Fund calculation...', constants.LOG_TYPES.INFO);

    // 1️⃣ PF eligibility check
    const statutoryDetails = await getPFEligibilityDetails(req, userId);
    if (!statutoryDetails) return;

    // 2️⃣ Salary check
    const salaryDetails = await getSalaryDetails(req, userId);
    if (!salaryDetails) return;

    // 3️⃣ Tax & statutory check
    const taxSettings = await getPFTaxSettings(req, salaryDetails._id);
    if (!taxSettings) return;

    // 4️⃣ Get eligible salary amount
    const totalPfEligibleAmount = await getTotalPFEligibleAmount(req, salaryDetails);
    websocketHandler.sendLog(req, `✅ PF eligible amount: ₹${totalPfEligibleAmount}`, constants.LOG_TYPES.DEBUG);

    // 5️⃣ Calculate actual PF contributions
    const contributionData = await calculatePFContributions(req, totalPfEligibleAmount, statutoryDetails, taxSettings);

    // 6️⃣ Store data – either for FNF or current payroll
    if (isFNF) {
      await processFNFProvidentFund(req, userId, companyId, contributionData, StautoryName);
    } else {
      await storeRegularPFContribution(req, companyId, contributionData, StautoryName);
    }

    websocketHandler.sendLog(req, '✅ Provident Fund contributions saved successfully', constants.LOG_TYPES.SUCCESS);

  } catch (err) {
    websocketHandler.sendLog(req, `❌ PF calculation failed: ${err.message}`, constants.LOG_TYPES.ERROR);
  }
};

const StoreInPayrollVariableAllowances = async (req, res) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;

    websocketHandler.sendLog(req, '🔄 Starting Variable Allowance processing', constants.LOG_TYPES.INFO);

    if (isFNF) {
      const payrollFNFUserId = req.payrollFNFUser;
      const { startDate, endDate } = await getFNFDateRange(req,userId);
      websocketHandler.sendLog(req, `📆 FNF mode: Processing allowances for range ${startDate.toDateString()} to ${endDate.toDateString()}`, constants.LOG_TYPES.DEBUG);

      await storeInPayrollVariableAllowances({
        req,
        userId,
        payrollFNFUserId,
        companyId,
        isFNF: true,
        fnfStartDate: startDate,
        fnfEndDate: endDate
      });

      websocketHandler.sendLog(req, '✅ FNF Variable Allowance stored', constants.LOG_TYPES.INFO);

    } else {
      const payrollUserId = req.payrollUser;
      websocketHandler.sendLog(req, '📅 Regular payroll mode: Storing variable allowance for current cycle', constants.LOG_TYPES.DEBUG);

      await storeInPayrollVariableAllowances({
        req,
        userId,
        payrollUserId,
        companyId
      });

      websocketHandler.sendLog(req, '✅ Regular Variable Allowance stored', constants.LOG_TYPES.INFO);
    }

  } catch (err) {
    console.error("❌ Error storing variable allowances:", err.message);
    websocketHandler.sendLog(req, `❌ Variable Allowance storage failed: ${err.message}`, constants.LOG_TYPES.ERROR);
  }
};

const StoreInPayrollVariableDeductions = async (req, res) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;

    websocketHandler.sendLog(req, '🔄 Starting Variable Deduction processing', constants.LOG_TYPES.INFO);

    if (isFNF) {
      const payrollFNFUserId = req.payrollFNFUser;
      const { startDate, endDate } = await getFNFDateRange(req,userId);
      websocketHandler.sendLog(req, `📆 FNF mode: Processing deductions for range ${startDate.toDateString()} to ${endDate.toDateString()}`, constants.LOG_TYPES.DEBUG);

      await storeInPayrollVariableDeductions({
        req,
        userId,
        payrollFNFUserId,
        companyId,
        isFNF: true,
        fnfStartDate: startDate,
        fnfEndDate: endDate
      });

      websocketHandler.sendLog(req, '✅ FNF Variable Deduction stored', constants.LOG_TYPES.INFO);

    } else {
      const payrollUserId = req.payrollUser;
      websocketHandler.sendLog(req, '📅 Regular payroll mode: Storing variable deduction for current cycle', constants.LOG_TYPES.DEBUG);

      await storeInPayrollVariableDeductions({
        req,
        userId,
        payrollUserId,
        companyId
      });

      websocketHandler.sendLog(req, '✅ Regular Variable Deduction stored', constants.LOG_TYPES.INFO);
    }

  } catch (err) {
    console.error("❌ Error storing variable deductions:", err.message);
    websocketHandler.sendLog(req, `❌ Variable Deduction storage failed: ${err.message}`, constants.LOG_TYPES.ERROR);
  }
};


const isGratuityEnabledForUser = async (userId) => {
  const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
  if (!statutoryDetails?.isGratuityEligible) return false;

  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
  if (!salaryDetails) throw new Error('Employee salary details not found');

  const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
  return !!taxSettings?.isGratuityApplicable;
};

const calculateGratuity = async (req, res, next) => {
  try {
    const userId = req.user;
    websocketHandler.sendLog(req, '🔄 Starting Gratuity calculation', constants.LOG_TYPES.INFO);

    const enabled = await isGratuityEnabledForUser(userId);
    if (!enabled) {
      websocketHandler.sendLog(req, '❌ Gratuity not applicable – deduction not enabled', constants.LOG_TYPES.WARN);
      return 0;
    }

    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    const totalGratuityEligibleAmount = await getTotalGratuityEligibleAmount(req, salaryDetails);

    // ⚙️ Replace static value if years should be calculated dynamically
    const years = 6; 
    websocketHandler.sendLog(req, `📊 Eligible amount: ₹${totalGratuityEligibleAmount} | Years: ${years}`, constants.LOG_TYPES.DEBUG);

    const totalAmount = await calculateGratuityFund(totalGratuityEligibleAmount, years);

    websocketHandler.sendLog(req, `✅ Gratuity calculated: ₹${totalAmount}`, constants.LOG_TYPES.INFO);
    return totalAmount;

  } catch (err) {
    websocketHandler.sendLog(req, `❌ Gratuity calculation failed: ${err.message}`, constants.LOG_TYPES.ERROR);
    return 0;
  }
};

const isProfessionalTaxEnabledForUser = async (userId, req) => {
 
  const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
   if (!statutoryDetails?.isEmployeeEligibleForPFDeduction) {
    websocketHandler.sendLog(req, `ℹ️ PT is not enabled in statutory settings for user`, constants.LOG_TYPES.INFO);
    return false;
  }

  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
   if (!salaryDetails) {
    websocketHandler.sendLog(req, `❌ Employee salary details not found`, constants.LOG_TYPES.ERROR);
    return false;
  }

  const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
  if (!taxSettings?.isPTDeduction) {
    websocketHandler.sendLog(req, `ℹ️ PT deduction is disabled in tax settings`, constants.LOG_TYPES.INFO);
    return false;
  }

  websocketHandler.sendLog(req, `✅ PT deduction is enabled for user`, constants.LOG_TYPES.INFO);
  return true;
};

const processProfessionalTaxForMonth = async ({ req, userId,companyId, salaryDetails, model, modelData,month,year }) => {
  
  const totalEligibleAmount = await getTotalProfessionalTaxEligibleAmount(req, salaryDetails);
 
  const applicable = await isProfessionalTaxApplicableThisMonth(req, companyId, totalEligibleAmount, month, year);
 
  if (!applicable.status) {
    websocketHandler.sendLog(req, `⚠️ PT not applicable for ${month + 1}/${year}`, constants.LOG_TYPES.INFO);
    return;
  }
  try {
      await model({
      req,
      ...modelData,
      companyId,
      employeeLWF: applicable.slab.employeeAmount,
      employerLWF: 0,
      slabId: applicable.slab._id,
      month,
      year,
      StautoryName: "Professional Tax"
    });
   } catch (error) {
    websocketHandler.sendLog(req, `❌ Failed to save Professional Tax: ${error.message}`, constants.LOG_TYPES.ERROR);
  }
  
  websocketHandler.sendLog(req, `✅ PT processed for ${month + 1}/${year}`, constants.LOG_TYPES.INFO);
};

const calculateProfessionalTax = async (req, res, next) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    const isFNF = req.isFNF;
    
    websocketHandler.sendLog(req, '🔄 Starting Professional Tax calculation...', constants.LOG_TYPES.INFO);
    const enabled = await isProfessionalTaxEnabledForUser(userId, req);
    if (!enabled) {
      websocketHandler.sendLog(req, '🚫 PT not applicable for this user', constants.LOG_TYPES.WARN);
      return;
    }

    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    if (!salaryDetails) {
      websocketHandler.sendLog(req, '❌ Salary details not found', constants.LOG_TYPES.ERROR);
      return;
    }

    if (isFNF) {
      websocketHandler.sendLog(req, `📆 Calculating PT for FNF months`, constants.LOG_TYPES.INFO);
      const { startDate, endDate } = await getFNFDateRange(req, userId);
       const startMonth = startDate.getMonth(), startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth(), endYear = endDate.getFullYear();
   
      for (let year = startYear; year <= endYear; year++) {
        const fromMonth = year === startYear ? startMonth : 0;
        const toMonth = year === endYear ? endMonth : 11;
   
        for (let m = fromMonth; m <= toMonth; m++) {
          await processProfessionalTaxForMonth({
            req,
            userId,
            companyId,
            salaryDetails,
            model: storeInPayrollFNFStatutory,
            modelData: { payrollFNFUser: req.payrollFNFUser },
            month: m,
            year
          });
        }
      }
    } else {
      const now = new Date();
      websocketHandler.sendLog(req, `📆 Calculating PT for current month`, constants.LOG_TYPES.INFO);
 
      await processProfessionalTaxForMonth({
        req,
        userId,
        companyId,
        salaryDetails,
        model: storeInPayrollStatutory,
        modelData: { payrollUser: req.payrollUser },
        month: now.getMonth(),
        year: now.getFullYear()
      });
    }

     websocketHandler.sendLog(req, `✅ PT calculation complete`, constants.LOG_TYPES.SUCCESS);
  } catch (err) {
    const errorMsg = `❌ PT calculation failed: ${err.message}`;
    websocketHandler.sendLog(req, errorMsg, constants.LOG_TYPES.ERROR);
  }
};


// 🔄 Entry point for full PF calculation
const calculateTDS = async (req, res) => {
  try {
    const userId = req.user;
    const companyId = req.cookies.companyId;
    // 1️⃣ Check statutory eligibility
    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId });
    if (!statutoryDetails?.isIncomeTaxDeducted) {
      return;
    }

    // 2️⃣ Check salary details
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId });
    if (!salaryDetails) {
      return { contributionData: 0, regime: '', days: 0 };

    }

    // 3️⃣ Check tax settings
    const taxSettings = await EmployeeSalaryTaxAndStatutorySetting.findOne({ employeeSalaryDetails: salaryDetails._id });
    if (!taxSettings?.isIncomeTaxDeduction) {
      return { contributionData: 0, regime: '', days: 0 };
    }

    // 4️⃣ Calculate eligible salary amount
    let totalTDSAppicablearlyAmount = await getTotalTDSEligibleAmount(req, salaryDetails);
    const userEmployment = await UserEmployment.findOne({ user: userId });
    if (!userEmployment) {
      return { contributionData: 0, regime: '', days: 0 };
    }

    let totalTDSAppicableAmount = calculateTDSAmount(userEmployment, salaryDetails, totalTDSAppicablearlyAmount);
 
    // 5️⃣ Calculate applicable amount after declaration if old regime
    if(statutoryDetails?.taxRegime === 'Old Regime') {
      const financialYear = generateFinancialYearString();
      const hraReceived = await getTotalHRAAmount(req, salaryDetails);
      const totalDeclaredAmount = await GetTDSAppicableAmountAfterDeclartion(
        req,
        userId,
        companyId,
        financialYear,
        totalTDSAppicableAmount,
        hraReceived
      );
     totalTDSAppicableAmount -= totalDeclaredAmount.totalDeduction;
    }

    // 6️⃣ Calculate final TDS using slab
    const contributionData = await calculateIncomeTax(
      req,
      companyId,
      totalTDSAppicableAmount,
      statutoryDetails?.taxRegime
    );
    let daysinPayrollCycle = calculateDaysinPayroll(userEmployment, salaryDetails, totalTDSAppicablearlyAmount);
    return { contributionData: contributionData.toFixed(0), regime: statutoryDetails?.taxRegime, days: daysinPayrollCycle };

  } catch (err) {
    const errorMsg = `❌ Error in calculateTDS: ${err.message}`;
    console.error(errorMsg);
  }
};

const calculateAndStoreIncomeTax = async (req, res) => {
  try {
    console.log('📥 Starting calculateAndStoreIncomeTax...');
    console.log('🔢 Input:', {
      year: req.year,
      month: req.month,
      isFNF: req.isFNF,
      user: req.user,
      payrollUser: req.payrollUser,
      payrollFNFUser: req.payrollFNFUser
    });

    // Calculate TDS
    const tdsResult = await calculateTDS(req);
    console.log('📊 TDS Result:', tdsResult);

    // Validate TDS result
    const taxAmount = parseFloat(tdsResult.contributionData);
    if (isNaN(taxAmount) || taxAmount < 0) {
      throw new Error('Invalid tax calculation result');
    }
    if (!tdsResult.regime || typeof tdsResult.regime !== 'string') {
      throw new Error('Invalid tax regime');
    }

    let totalDays = new Date(req.year, req.month, 0).getDate();
    
    // Initialize date range
    let startDate = new Date(req.year, req.month - 1, 1); // 1st of the month
    let endDate = new Date(req.year, req.month, 1); // 1st of next month
   
    if (req.isFNF) {
      websocketHandler.sendLog(req, `📆 Processing Income Tax for FNF range`, constants.LOG_TYPES.INFO);
      
      ({ startDate, endDate } = await getFNFDateRange(req, req.user));
    
      const oneDayInMs = 24 * 60 * 60 * 1000;
      totalDays = Math.round((endDate - startDate) / oneDayInMs) + 1;
    
      const payrollIncomeTaxData = {
        PayrollFNFUser: req.payrollFNFUser,
        TaxCalculatedMethod: tdsResult.regime,
        TaxCalculated: taxAmount,
        TDSCalculated: (taxAmount / 365 * totalDays).toFixed(2)
      };
      const payrollIncomeTax = new PayrollFNFIncomeTax(payrollIncomeTaxData);
      await payrollIncomeTax.save();
      } else {
      // Non-FNF Payroll
      const payrollIncomeTaxData = {
        PayrollUser: req.payrollUser,
        TaxCalculatedMethod: tdsResult.regime,
        TaxCalculated: taxAmount,
        TDSCalculated: (taxAmount / 12).toFixed(2)
      };
      const payrollIncomeTax = new PayrollIncomeTax(payrollIncomeTaxData);
      await payrollIncomeTax.save();
    }

  } catch (error) {
    console.error('❌ Error in calculateAndStoreIncomeTax:', error.message);
    throw error;
  }
};


function getCurrentFinancialYearStart() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 3, 1); // April 1st
}

function calculateTDSAmount(userEmployment, salaryDetails, totalTDSApplicableAmount) {
  const effectiveFrom = new Date(userEmployment.effectiveFrom);
  const payrollEffectiveFrom = new Date(salaryDetails.payrollEffectiveFrom);
  const financialYearStart = getCurrentFinancialYearStart();

  // Case 1: Full year TDS if FY start falls between effective and payroll dates
  if (effectiveFrom <= financialYearStart && payrollEffectiveFrom <= financialYearStart) {
    const annualTDS = totalTDSApplicableAmount * 12;
    return annualTDS;
  }

  // Case 2: Prorated TDS calculation
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.floor((payrollEffectiveFrom - effectiveFrom) / msPerDay) + 1;

  const dailyTDS = totalTDSApplicableAmount / 30; // Assuming average 30-day month
  const proratedTDS = dailyTDS * days;
  return proratedTDS;
}

function calculateDaysinPayroll(userEmployment, salaryDetails, totalTDSApplicableAmount) {
  const effectiveFrom = new Date(userEmployment.effectiveFrom);
  const payrollEffectiveFrom = new Date(salaryDetails.payrollEffectiveFrom);
  const financialYearStart = getCurrentFinancialYearStart();

  // Case 1: Full year TDS if FY start falls between effective and payroll dates
  if (effectiveFrom <= financialYearStart && payrollEffectiveFrom <= financialYearStart) {   
    return 365;
  }
  const msPerDay = 1000 * 60 * 60 * 24;
  // Case 2: Prorated TDS calculation 
  const days = Math.floor((payrollEffectiveFrom - effectiveFrom) / msPerDay) + 1;
  return days;
}
function generateFinancialYearString(date = new Date()) {
  const d = new Date(date); // Ensures 'date' is a Date object
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = Jan, 3 = April

  if (month >= 3) {
    // From April to December — Financial year starts this year
    return `${year}-${year + 1}`;
  } else {
    // From January to March — Financial year started last year
    return `${year - 1}-${year}`;
  }
}

const CalculateOvertime = async (req, res) => {
 
  try {       
    if (req.isFNF) {
      websocketHandler.sendLog(req, `📆 Processing LWF for FNF range`, constants.LOG_TYPES.INFO);
   
      const { startDate, endDate } = await getFNFDateRange(req, req.user);
      await calculateAndStoreOvertimeForFNF(req,req.user, startDate,endDate,req.payrollFNFUser);

    } else {
       await calculateAndStoreOvertime(req,req.user, req.month, req.year, req.payrollUser, req.isFNF);
    }
  } catch (error) {
    console.error('Error in /calculate-overtime:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const StoreAttendanceSummary = async (req, res) => {

  try {
    // Calculate total days in the month
    let totalDays = new Date(req.year, req.month, 0).getDate();
  
    // Fetch LOP days
     // Ensure month is 1-based and convert to 0-based for JavaScript Date
  let startDate = new Date(req.year, req.month - 1, 1); // Start of the month
  let endDate = new Date(req.year, req.month, 1); // Start of the next month
  if (req.isFNF) {
    websocketHandler.sendLog(req, `📆 Processing LWF for FNF range`, constants.LOG_TYPES.INFO);
 
    ({ startDate, endDate } = await getFNFDateRange(req, req.user));
    const oneDayInMs = 24 * 60 * 60 * 1000;
    totalDays = Math.round((endDate - startDate) / oneDayInMs) + 1;
  }
  // Fetch records from the database
 
  
      const lopList = await LOP.find({
        date: {
          $gte: startDate,
          $lt: endDate
        },
        user:req.user
      });
     //let lopDays=lopList.length;
     let lopDays = lopList.reduce((total, lop) => {
        return total + (lop.isHalfDay ? 0.5 : 1);
      }, 0);
    //if (!Number.isInteger(lopDays) || lopDays < 0 || lopDays > totalDays) {
    if (lopDays < 0 || lopDays > totalDays) {
      throw new Error('Invalid LOP days returned');    }
    // Calculate payable days
    const payableDays = totalDays - lopDays;
    if (req.isFNF) {
      const payrollAttendanceSummaryData = {
        payrollFNFUser: req.payrollFNFUser,
        totalDays,
        lopDays,
        payableDays
      };
     
      const payrollAttendanceSummary = new PayrollFNFAttendanceSummary(payrollAttendanceSummaryData);
      await payrollAttendanceSummary.save();   
    }
    else
    {
     // Prepare and save PayrollAttendanceSummary data
    const payrollAttendanceSummaryData = {
      payrollUser: req.payrollUser,
      totalDays,
      lopDays,
      payableDays
    };
   
    const payrollAttendanceSummary = new PayrollAttendanceSummary(payrollAttendanceSummaryData);
    await payrollAttendanceSummary.save();   
  }
  } catch (error) {
    console.error('Error in calculateAndStoreAttendanceSummary:', error.message);
    throw error;
  }
}

module.exports = {
  calculateLWF,
  calculateESIC,
  calculatePF,
  calculateGratuity,
  StoreInPayrollVariableAllowances,
  StoreInPayrollVariableDeductions,
  calculateProfessionalTax,
  calculateTDS,
  CalculateOvertime,
  StoreAttendanceSummary,
  calculateAndStoreIncomeTax
  // Add more exports here if you build additional payroll stat functions
};
