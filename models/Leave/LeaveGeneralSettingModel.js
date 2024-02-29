var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveGeneralSettingSchema = new Schema({  
  leaveCycleStart: {
    type: String,
    required: true
  },
  isAdminAccessLeaveApproveReject: {
    type: Boolean,
    required: true
  },
  canSupervisorAddLeaveAdjustment: {
    type: Boolean,
    required: true
  },
  isDailyLeaveAccrualsRun: {
    type: Boolean,
    required: true
  },
  initialBalanceSetDate: {
    type: Date,
    required: true
  },
  isFreezeInitialBalancesOnceFirstAccrualRun: {
    type: Boolean,
    required: true
  },
  shortLeaveApplicationLimit: {
    type: Number,
    required: true
  },
  maxDurationForShortLeaveApplicationInMin: {
    type: Number
  },
  band: {
    type: String
  },
  fullDayMinHour: {
    type: Number
  },
  halfDayMinHour: {
    type: Number
  },
  fullDayMinMinutes: {
    type: Number
  },
  halfDayMinMinutes: {
    type: Number
  },
  company: {
    type: String,
    required: true
  }
}, { collection: 'LeaveGeneralSetting' });

module.exports = mongoose.model('LeaveGeneralSetting', leaveGeneralSettingSchema);
