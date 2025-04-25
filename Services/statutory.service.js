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
  StautoryName
}) => {

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
    websocketHandler.sendLog(req, `⚠️ Skipped inserting Employee Statutory - already exists`, constants.LOG_TYPES.WARN);
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

  // Insert new records if any
  if (data.length > 0) {
    await PayrollStatutory.insertMany(data);
    websocketHandler.sendLog(req, `📌 Stored ${data.length} Statutory record(s) in PayrollStatutory`, constants.LOG_TYPES.SUCCESS);
  }
};

module.exports = {
   storeInPayrollStatutory
};
