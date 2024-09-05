const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollGeneralSettingSchema = new Schema({
  dayOfMonthToRunPayroll: {
    type: Number,
    required: true
  },
  payrollApprovar: {
    type: String,
    required: true
  },
  attendanceCycle:
  {
    type: String,
    required: true
  },
  dayOfMonthToStartAttendanceCycle: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isPasswordForSalaryRegister: {
    type: Boolean,
    required: true
  },
  isGraduityEligible: {
    type: Boolean,
    required: true
  },
  percentageForGraduity: {
    type: String,
    required: true
  },
  graduityComponentsGraduitycalculation:{
    type: [String],
    required: true
  },
  leaveEncashment: {
    type: [String],
    required: true
  },
  denominatorForCalculatingTheEncashment: {
    type: String,
    required: true
  },
  payoutRolloverLeaveEncashmentForEmployees: {
    type: [String],
    required: true
  },
  calculateLeaveRecovery: {
    type: [String],
    required: true
  },
  denominatorForCalculatingTheLeaveRecovery: {
    type: [String],
    required: true
  },
  recoverOutstandingIncomeTaxOfEmployees: {
    type: [String],
    required: true
  },
  isNoticePeriodRecoveryApplicable: {
    type: Boolean,
    required: true
  },
  denominatorForCalculatingTheNoticeRecovery: {
    type: String,
    required: true
  },
  isAllowTDSFromEffortlessHRM: {
    type: Boolean,
    required: true
  },
  isAllowNcpDaysApplicableInPF: {
    type: Boolean,
    required: true
  },
  isAllowToCalculateOvertime: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'PayrollGeneralSetting' });

module.exports = mongoose.model('PayrollGeneralSetting', payrollGeneralSettingSchema);
