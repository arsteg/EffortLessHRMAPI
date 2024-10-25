
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollVariablePayAllowanceSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    variableAllowance: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableAllowance',
      required: true
    },
    Month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    amount: {
      type: Number
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollVariablePayAllowance' });
     
module.exports = mongoose.model('PayrollVariablePayAllowance', payrollVariablePayAllowanceSchema);
  