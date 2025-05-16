const SalaryComponentVariableAllowance = require('../models/Employment/SalaryComponentVariableAllowance');
const SalaryComponentVariableDeduction = require("../models/Employment/SalaryComponentVariableDeduction");
const PayrollVariablePay = require('../models/Payroll/PayrollVariablePay');
const PayrollFNFVariablePay = require('../models/Payroll/PayrollFNFVariablePay');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const VariableAllowance = require("../models/Payroll/variableAllowanceModel");
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const VariableDeduction = require("../models/Payroll/variableDeductionModel");
const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const storeInPayrollVariableAllowances = async ({
  req,
  userId,
  companyId,
  payrollUserId,
  isFNF = false,
  fnfStartDate,
  fnfEndDate,
  payrollFNFUserId
}) => {
  // Fetch the variable allowances for the user
  websocketHandler.sendLog(req, `🔍 Fetching salary details for user: ${userId}`, constants.LOG_TYPES.DEBUG);
  
  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId }).select('_id');
  if (!salaryDetails) {
    websocketHandler.sendLog(req, `❌ No salary details found for user: ${userId}`, constants.LOG_TYPES.ERROR);
    return []; // or handle as needed
  }

  websocketHandler.sendLog(req, `✅ Salary details found for user: ${userId}`, constants.LOG_TYPES.SUCCESS);

  const allowances = await SalaryComponentVariableAllowance.find({
    employeeSalaryDetails: salaryDetails._id
  })
    .populate({
      path: 'employeeSalaryDetails',
      select: '_id user'
    })
    .populate({
      path: 'variableAllowance',
      select: '_id'
    })
    .lean();

  if (!allowances.length) {
    websocketHandler.sendLog(req, `ℹ️ No variable allowances found for user: ${userId}`, constants.LOG_TYPES.INFO);
  }

  const variablePayRecords = [];

  // Process each allowance item
  for (const item of allowances) {
    if (!item.employeeSalaryDetails || !item.variableAllowance) continue;

    const variableAllowance = await VariableAllowance.findOne({ _id: item.variableAllowance._id });
    const { allowanceEffectiveFromMonth, allowanceEffectiveFromYear, isEndingPeriod, allowanceStopMonth, allowanceStopYear } = variableAllowance;
    const startYear = parseInt(allowanceEffectiveFromYear);
    const startMonthIndex = monthOrder.indexOf(allowanceEffectiveFromMonth);
    const stopYear = parseInt(allowanceStopYear || new Date().getFullYear());
    const stopMonthIndex = isEndingPeriod ? monthOrder.indexOf(allowanceStopMonth) : 11;

    // Determine the start and end dates for the loop based on FNF status
    const loopStart = isFNF ? new Date(fnfStartDate) : new Date();
    const loopEnd = isFNF ? new Date(fnfEndDate) : new Date();

    // Loop through each year and month between start and end
    for (let year = loopStart.getFullYear(); year <= loopEnd.getFullYear(); year++) {
      const monthStart = year === loopStart.getFullYear() ? loopStart.getMonth() : 0;
      const monthEnd = year === loopEnd.getFullYear() ? loopEnd.getMonth() : 11;

      for (let m = monthStart; m <= monthEnd; m++) {
        const isEligible =
          (year > startYear || (year === startYear && m >= startMonthIndex)) &&
          (year < stopYear || (year === stopYear && m <= stopMonthIndex));

        // If eligible, add to variablePayRecords
        if (isEligible) {
          const recordMonthStart = new Date(year, m, 1);
          const recordMonthEnd = new Date(year, m + 1, 0); // last day of the month

          let proratedAmount = item.monthlyAmount;

          // Check if current iteration is the last FNF month
          const isLastFNFMonth = isFNF &&
            year === loopEnd.getFullYear() &&
            m === loopEnd.getMonth();

          if (isLastFNFMonth) {
            const totalDaysInMonth = recordMonthEnd.getDate();
            const workedDays = fnfEndDate.getDate(); // e.g. 15th April => 15 days
            const fraction = workedDays / totalDaysInMonth;

            proratedAmount = parseFloat((item.monthlyAmount * fraction).toFixed(2));
            websocketHandler.sendLog(req, `⚖️ Pro-rating allowance for last FNF month: ${monthOrder[m]} ${year} - ₹${proratedAmount}`, constants.LOG_TYPES.DEBUG);
          }

          const record = {
            payrollUser: payrollUserId,
            payrollFNFUser: payrollFNFUserId,
            variableAllowance: item.variableAllowance._id,
            amount: proratedAmount,
            month: monthOrder[m],
            year,
            company: companyId
          };

          if (isFNF) {
            // Insert into PayrollFNFVariablePay collection for FNF payroll
            const fnfRecord = new PayrollFNFVariablePay(record);
            variablePayRecords.push(fnfRecord);
          } else {
            // Insert into PayrollVariablePay collection for regular payroll
            const payrollRecord = new PayrollVariablePay(record);
            variablePayRecords.push(payrollRecord);
          }
        }
      }
    }
  }

  // Insert the records into the appropriate collection
  if (variablePayRecords.length > 0) {
    if (isFNF) {
      await PayrollFNFVariablePay.insertMany(variablePayRecords);
      websocketHandler.sendLog(req, `✅ Inserted ${variablePayRecords.length} PayrollFNFVariablePay records`, constants.LOG_TYPES.SUCCESS);
    } else {
      await PayrollVariablePay.insertMany(variablePayRecords);
      websocketHandler.sendLog(req, `✅ Inserted ${variablePayRecords.length} PayrollVariablePay records`, constants.LOG_TYPES.SUCCESS);
    }
  } else {
    websocketHandler.sendLog(req, "ℹ️ No eligible variable allowances to insert", constants.LOG_TYPES.INFO);
  }
};
  
const storeInPayrollVariableDeductions = async ({
  req,
  userId,
  companyId,
  payrollUserId,
  isFNF = false,
  fnfStartDate,
  fnfEndDate,
  payrollFNFUserId
}) => {
  // Fetch the variable deductions for the user
  websocketHandler.sendLog(req, `🔍 Fetching salary details for user: ${userId}`, constants.LOG_TYPES.DEBUG);

  const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId }).select('_id');
  if (!salaryDetails) {
    websocketHandler.sendLog(req, `❌ No salary details found for user: ${userId}`, constants.LOG_TYPES.ERROR);
    return []; // or handle as needed
  }

  websocketHandler.sendLog(req, `✅ Salary details found for user: ${userId}`, constants.LOG_TYPES.SUCCESS);

  const deductions = await SalaryComponentVariableDeduction.find({
    employeeSalaryDetails: salaryDetails._id
  })
    .populate({
      path: 'employeeSalaryDetails',
      select: '_id user'
    })
    .populate({
      path: 'variableDeduction',
      select: '_id'
    })
    .lean();

  if (!deductions.length) {
    websocketHandler.sendLog(req, `ℹ️ No variable deductions found for user: ${userId}`, constants.LOG_TYPES.INFO);
  }

  const variablePayRecords = [];

  // Process each deduction item
  for (const item of deductions) {
    if (!item.employeeSalaryDetails || !item.variableDeduction) continue;

    const variableDeduction = await VariableDeduction.findOne({ _id: item.variableDeduction._id });
    const { deductionEffectiveFromMonth, deductionEffectiveFromYear, isEndingPeriod, deductionStopMonth, deductionStopYear } = variableDeduction;
    const startYear = parseInt(deductionEffectiveFromYear);
    const startMonthIndex = monthOrder.indexOf(deductionEffectiveFromMonth);
    const stopYear = parseInt(deductionStopYear || new Date().getFullYear());
    const stopMonthIndex = isEndingPeriod ? monthOrder.indexOf(deductionStopMonth) : 11;

    // Determine the start and end dates for the loop based on FNF status
    const loopStart = isFNF ? new Date(fnfStartDate) : new Date();
    const loopEnd = isFNF ? new Date(fnfEndDate) : new Date();

    // Loop through each year and month between start and end
    for (let year = loopStart.getFullYear(); year <= loopEnd.getFullYear(); year++) {
      const monthStart = year === loopStart.getFullYear() ? loopStart.getMonth() : 0;
      const monthEnd = year === loopEnd.getFullYear() ? loopEnd.getMonth() : 11;

      for (let m = monthStart; m <= monthEnd; m++) {
        const isEligible =
          (year > startYear || (year === startYear && m >= startMonthIndex)) &&
          (year < stopYear || (year === stopYear && m <= stopMonthIndex));

        // If eligible, add to variablePayRecords
        if (isEligible) {
          const recordMonthStart = new Date(year, m, 1);
          const recordMonthEnd = new Date(year, m + 1, 0); // last day of the month

          let proratedAmount = item.monthlyAmount;

          // Check if current iteration is the last FNF month
          const isLastFNFMonth = isFNF &&
            year === loopEnd.getFullYear() &&
            m === loopEnd.getMonth();

          if (isLastFNFMonth) {
            const totalDaysInMonth = recordMonthEnd.getDate();
            const workedDays = fnfEndDate.getDate(); // e.g. 15th April => 15 days
            const fraction = workedDays / totalDaysInMonth;

            proratedAmount = parseFloat((item.monthlyAmount * fraction).toFixed(2));
            websocketHandler.sendLog(req, `⚖️ Pro-rating deduction for last FNF month: ${monthOrder[m]} ${year} - ₹${proratedAmount}`, constants.LOG_TYPES.DEBUG);
          }

          const record = {
            payrollUser: payrollUserId,
            payrollFNFUser: payrollFNFUserId,
            variableDeduction: item.variableDeduction._id,
            amount: proratedAmount,
            month: monthOrder[m],
            year,
            company: companyId
          };

          if (isFNF) {
            // Insert into PayrollFNFVariablePay collection for FNF payroll
            const fnfRecord = new PayrollFNFVariablePay(record);
            variablePayRecords.push(fnfRecord);
          } else {
            // Insert into PayrollVariablePay collection for regular payroll
            const payrollRecord = new PayrollVariablePay(record);
            variablePayRecords.push(payrollRecord);
          }
        }
      }
    }
  }

  // Insert the records into the appropriate collection
  if (variablePayRecords.length > 0) {
    if (isFNF) {
      await PayrollFNFVariablePay.insertMany(variablePayRecords);
      websocketHandler.sendLog(req, `✅ Inserted ${variablePayRecords.length} PayrollFNFVariablePay records`, constants.LOG_TYPES.SUCCESS);
    } else {
      await PayrollVariablePay.insertMany(variablePayRecords);
      websocketHandler.sendLog(req, `✅ Inserted ${variablePayRecords.length} PayrollVariablePay records`, constants.LOG_TYPES.SUCCESS);
    }
  } else {
    websocketHandler.sendLog(req, "ℹ️ No eligible variable deductions to insert", constants.LOG_TYPES.INFO);
  }
};

module.exports = {
  storeInPayrollVariableAllowances,
  storeInPayrollVariableDeductions

};
