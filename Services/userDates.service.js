const PayrollUsers = require('../models/Payroll/PayrollUsers.js');
const Resignation = require("../models/Separation/Resignation");
const Termination = require('../models/Separation/Termination.js');
const User = require('../models/permissions/userModel');
const AttendanceRecords = require('../models/attendance/attendanceRecords');
const getLastPayrollDate = async (req, userId, next) => {
  let startDate = null;
  websocketHandler.sendLog(req, `🔍 Fetching last payroll date for user: ${userId}`, constants.LOG_TYPES.DEBUG);

  const payrollUser = await PayrollUsers.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate({ path: 'payroll', select: 'date' });

  if (!payrollUser.length || !payrollUser[0].payroll || !payrollUser[0].payroll.date) {
    websocketHandler.sendLog(req, `⚠️ No payroll record found. Falling back to first attendance date.`, constants.LOG_TYPES.WARN);
    const firstAttendance = await AttendanceRecords.find({ user: userId })
      .sort({ date: 1 })
      .limit(1)
      .select('date')
      .lean();

    if (!firstAttendance || !firstAttendance[0].date) {
      websocketHandler.sendLog(req, `❌ No attendance record found for user: ${userId}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('user.NoPayrollOrAttendanceRecord'), 404));
    }

    startDate = new Date(firstAttendance[0].date);
  } else {
    startDate = new Date(payrollUser[0].payroll.date);
  }

  websocketHandler.sendLog(req, `✅ Start date determined: ${startDate.toISOString()}`, constants.LOG_TYPES.INFO);
  return startDate;
};

const getTerminationDate = async (req, userId, next) => {
  websocketHandler.sendLog(req, `🔍 Fetching termination date for user: ${userId}`, constants.LOG_TYPES.DEBUG);

  const terminationRecord = await Termination.findOne({ user: userId });
  if (!terminationRecord || !terminationRecord.termination_date) {
    websocketHandler.sendLog(req, `❌ Termination date not found for user: ${userId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.TerminationDateNotFound'), 404));
  }

  const terminationDate = new Date(terminationRecord.termination_date);
  websocketHandler.sendLog(req, `✅ Termination date found: ${terminationDate.toISOString()}`, constants.LOG_TYPES.INFO);
  return terminationDate;
};

const getLastWorkingDate = async (req, userId, next) => {
  websocketHandler.sendLog(req, `🔍 Fetching last working date for user: ${userId}`, constants.LOG_TYPES.DEBUG);

  const resignationRecord = await Resignation.findOne({
    user: userId,
    resignation_status: { $ne: 'Deleted' }
  }).sort({ createdAt: -1 });

  if (!resignationRecord || !resignationRecord.last_working_day) {
    websocketHandler.sendLog(req, `⚠️ No last working day found in resignation for user: ${userId}`, constants.LOG_TYPES.WARN);
    return null;
  }

  const lastWorkingDate = new Date(resignationRecord.last_working_day);
  websocketHandler.sendLog(req, `✅ Last working date found: ${lastWorkingDate.toISOString()}`, constants.LOG_TYPES.INFO);
  return lastWorkingDate;
};

const getFNFDateRange = async (req, userId, next) => {
  websocketHandler.sendLog(req, `🧮 Calculating FNF date range for user: ${userId}`, constants.LOG_TYPES.INFO);

  const startDate = await getLastPayrollDate(req, userId, next);
  const user = await User.findById(userId);
  if (!user) {
    websocketHandler.sendLog(req, `❌ User not found: ${userId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.UserNotFound'), 404));
  }

  let endDate;
  try {
    endDate = await getLastWorkingDate(req, userId, next);
    if (!endDate) {
      websocketHandler.sendLog(req, `ℹ️ Falling back to termination date for end date`, constants.LOG_TYPES.WARN);
      endDate = await getTerminationDate(req, userId, next);
    }
  } catch (err) {
    websocketHandler.sendLog(req, `⚠️ Error retrieving last working date: ${err.message}`, constants.LOG_TYPES.WARN);
    endDate = await getTerminationDate(req, userId, next);
  }

  websocketHandler.sendLog(req, `✅ FNF Date Range: Start - ${startDate.toISOString()}, End - ${endDate.toISOString()}`, constants.LOG_TYPES.INFO);
  return { startDate, endDate };
};


  module.exports = {
    getLastPayrollDate,
    getTerminationDate,
    getLastWorkingDate,
    getFNFDateRange
  };