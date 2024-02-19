var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveTemplateCategorySchema = new Schema({  
  leaveTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplate',
    required: true
  },
  leaveCategory: {
    type: String,
    required: true
  },
  limitNumberOfTimesApply: {
    type: Boolean,
    required: true
  },
  maximumNumbersEmployeeCanApply: {
    type: Number,
    required: true
  },
  maximumNumbersEmployeeCanApplyType: {
    type: String,
    required: false // No requirement specified for this field
  },
  dealWithNewlyJoinedEmployee: {
    type: String,
    required: true
  },
  daysToCompleteToBecomeEligibleForLeave: {
    type: Number,
    required: true
  },
  isEmployeeGetCreditedTheEntireAmount: {
    type: Boolean,
    required: true
  },
  extendLeaveCategory: {
    type: Boolean,
    required: true
  },
  extendMaximumDayNumber: {
    type: Number,
    required: true
  },
  extendFromCategory: {
    type: String,
    required: true
  },
  negativeBalanceCap: {
    type: Number,
    required: false // No requirement specified for this field
  },
  annualAccrualRatePerPeriod: {
    type: Number,
    required: true
  },
  categoryApplicable: {
    type: String,
    required: true
  }
}, { collection: 'LeaveTemplateCategory' });

module.exports = mongoose.model('LeaveTemplateCategory', leaveTemplateCategorySchema);
