const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variableAllowanceSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  allowanceRatePerDay: {
    type: Number,
    required: true
  },
  isPayrollEditable: {
    type: Boolean,
    required: true
  },
  isProvidentFundAffected: {
    type: Boolean,
    required: true
  },
  isESICAffected: {
    type: Boolean,
    required: true
  },
  isLWFAffected: {
    type: Boolean,
    required: true
  },
  isIncomeTaxAffected: {
    type: Boolean,
    required: true
  },
  deductIncomeTaxAllowance: {
    type: String,
    required: true
  },
  taxRegime: {
    type: String,
    required: true
  },
  isShowInCTCStructure: {
    type: Boolean,
    required: true
  },
  paidAllowanceFrequently: {
    type: String,
    required: true
  },
  allowanceEffectiveFromMonth: {
    type: String,
    required: true
  },
  allowanceEffectiveFromYear: {
    type: String,
    required: true
  },
  isEndingPeriod: {
    type: Boolean,
    required: true
  },
  allowanceStopMonth: {
    type: String
  },
  allowanceStopYear: {
    type: String
  },
  amountEnterForThisVariableAllowance: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number
  },
  isAttandanceToAffectEligibility: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'VariableAllowance' });

module.exports = mongoose.model('VariableAllowance', variableAllowanceSchema);
