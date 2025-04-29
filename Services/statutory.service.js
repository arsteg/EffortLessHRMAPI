const PayrollStatutory = require('../models/Payroll/PayrollStatutory');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');

/**
 * Inserts Statutory contribution data into PayrollStatutory collection.
 * Prevents duplicate entries for the same user, month, year, and contributor type.
 */
const storeInPayrollStatutory = async ({
  req,
  payrollUser,
  companyId,
  employeeLWF,
  employerLWF,
  slabId,
  month,
  year,
  StautoryName,
  employeeVPF // Optional, can be null or a value
}) => {

  
  const existingEmployee = await PayrollStatutory.findOne({
    payrollUser,
    fixedContribution: slabId,
    ContributorType: 'Employee',
    StautoryName: StautoryName,
    month,
    year
  });

  const existingEmployer = await PayrollStatutory.findOne({
    payrollUser,
    fixedContribution: slabId,
    ContributorType: 'Employer',
    StautoryName: StautoryName,
    month,
    year
  });

  const data = [];

  // If employee VPF is provided, insert both Employee VPF and Employee LWF records
  if (employeeVPF && employeeVPF > 0) {
    data.push({
      payrollUser,
      fixedContribution: slabId,
      ContributorType: 'Employee',
      StautoryName: 'Voluntary Provident Fund', // VPF Statutory Name
      amount: employeeVPF,
      month,
      year,
      company: companyId
    });
    websocketHandler.sendLog(req, `📌 Inserting Employee VPF Statutory record: ₹${employeeVPF}`, constants.LOG_TYPES.INFO);

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
      websocketHandler.sendLog(req, `⚠️ Skipped inserting Employee Statutory (LWF) - already exists`, constants.LOG_TYPES.WARN);
    }

  } else if (!existingEmployee) {
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
      websocketHandler.sendLog(req, `⚠️ Skipped inserting Employee Statutory (LWF) - already exists`, constants.LOG_TYPES.WARN);
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
     websocketHandler.sendLog(req, `⚠️ Skipped inserting Employer Statutory - already exists`, constants.LOG_TYPES.WARN);
  }
  if (data.length > 0) {
    await PayrollStatutory.insertMany(data);
    websocketHandler.sendLog(req, `📌 Stored ${data.length} Statutory record(s) in PayrollStatutory`, constants.LOG_TYPES.SUCCESS);
  } else {
    console.log(`ℹ️ No new statutory records to insert`);
  }
};

module.exports = {
  storeInPayrollStatutory
};
