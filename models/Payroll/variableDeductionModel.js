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
    type: String,
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
 
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'VariableDeduction' });

module.exports = mongoose.model('VariableDeduction', variableDeductionSchema);
