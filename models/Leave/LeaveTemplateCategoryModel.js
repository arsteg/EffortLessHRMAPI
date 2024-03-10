var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveTemplateCategorySchema = new Schema({  
  leaveTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplate',
    required: true
  },
  leaveCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveCategory',
    required: true
  },
  limitNumberOfTimesApply: {
    type: Boolean,
    required: true,
    default: false
  },
  maximumNumbersEmployeeCanApply: {
    type: Number,
    required: true,
    default: '0'
  },
  maximumNumbersEmployeeCanApplyType: {
    type: String
  },
  dealWithNewlyJoinedEmployee: {
    type: String
  },
  daysToCompleteToBecomeEligibleForLeave: {
    type: Number
  },
  isEmployeeGetCreditedTheEntireAmount: {
    type: Boolean,
    default: false
  },
  extendLeaveCategory: {
    type: Boolean,
    default: false
  },
  extendMaximumDayNumber: {
    type: Number
  },
  extendFromCategory: {
    type: String
  },
  negativeBalanceCap: {
    type: Number
  },
  accrualRatePerPeriod: {
    type: Number,
    default:0
  },
  categoryApplicable: {
    type: String
  }
}, { collection: 'LeaveTemplateCategory' });

module.exports = mongoose.model('LeaveTemplateCategory', leaveTemplateCategorySchema);
