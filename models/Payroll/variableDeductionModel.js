var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var variableDeductionSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  isShowINCTCStructure: {
    type: Boolean,
    required: true
  },
  paidDeductionFrequently: {
    type: Boolean,
    required: true
  },
  deductionEffectiveFromMonth: {
    type: String,
    required: true
  },
  deductionEffectiveFromYear: {
    type: String,
    required: true
  },
  isEndingPeriod: {
    type: Boolean,
    required: true
  },
  deductionStopMonth: {
    type: String
  },
  deductionStopYear: {
    type: String
  },
  amountEnterForThisVariableDeduction: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  isAttendanceToAffectEligibility: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  variableDeductionApplicableEmployees:[]
}, { collection: 'VariableDeduction' });

module.exports = mongoose.model('VariableDeduction', variableDeductionSchema);
