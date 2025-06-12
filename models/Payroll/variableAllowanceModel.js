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
  isProfessionalTaxAffected: {
    type: Boolean,
    required: true
  },
  deductIncomeTaxAllowance: {
    type: String
  },
  taxRegime: {
    type: [String]
  },
  isShowInCTCStructure: {
    type: Boolean
  },
  paidAllowanceFrequently: {
    type: String
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
    type: String
  },
  amount: {
    type: Number
  },
  percentage: {
    type: Number
  },
  isAttandanceToAffectEligibility: {
    type: Boolean
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  variableAllowanceApplicableEmployees:[]
}, { collection: 'VariableAllowance' });

module.exports = mongoose.model('VariableAllowance', variableAllowanceSchema);
