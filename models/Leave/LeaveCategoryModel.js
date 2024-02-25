const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveCategorySchema = new Schema({
  leaveType: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  abbreviation: {
    type: String,
    required: true
  },
  canEmployeeApply: {
    type: Boolean,
    required: true
  },
  isHalfDayTypeOfLeave: {
    type: Boolean,
    default: false
  },
  submitBefore: {
    type: Number,
    default: null
  },
  displayLeaveBalanceInPayslip: {
    type: Boolean,
    default: false
  },
  leaveAccrualPeriod: {
    type: String
  },
  isAnnualHolidayLeavePartOfNumberOfDaysTaken: {
    type: Boolean,
    default: false
  },
  isWeeklyOffLeavePartOfNumberOfDaysTaken: {
    type: Boolean,
    default: false
  },
  isEligibleForLeaveEncashmentDuringRollover: {
    type: Boolean,
    default: false
  },
  isDocumentRequired: {
    type: Boolean,
    default: false
  },
  isDocumentMandatory: {
    type: Boolean,
    default: false
  },
  isEligibleForEncashmentRecoveryDuringFNF: {
    type: Boolean,
    required: true
  },
  isWeeklyOffHolidayPartHalfDayIncludedDaTaken: {
    type: Boolean,
    default: false
  },
  policyWithRegardsToCarryoverLimits: {
    type: String,
    default: null
  },
  isEmployeesAllowedToNegativeLeaveBalance: {
    type: Boolean,
    default: false
  },
  isRoundOffLeaveAccrualNearestPointFiveUnit: {
    type: Boolean,
    default: false
  },
  isIntraCycleLapseApplicableForThisCategory: {
    type: Boolean,
    default: false
  },
  minimumNumberOfDaysAllowed: {
    type: Number,
    default: null
  },
  isProRateFirstMonthAccrualForNewJoinees: {
    type: String,
    default: null
  },
  maximumNumberConsecutiveLeaveDaysAllowed: {
    type: Number,
    default: null
  },
  isPaidLeave: {
    type: Boolean,
    default: false
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
}, { collection: 'LeaveCategory' });

module.exports = mongoose.model('LeaveCategory', leaveCategorySchema);
