
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollVariablePayDeductionSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    variableDeduction: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableDeduction',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollVariablePayDeduction' });
     
module.exports = mongoose.model('PayrollVariablePayDeduction', payrollVariablePayDeductionSchema);