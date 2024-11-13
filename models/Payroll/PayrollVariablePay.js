
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollVariablePaySchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    variableDeduction: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableDeduction'
    },
    variableAllowance: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableAllowance'
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
    
  }, { 
    collection: 'PayrollVariablePay',
    validate: {
      validator: function() {
        return this.variableDeduction || this.variableAllowance;
      },
      message: 'Either variableDeduction or variableAllowance must be provided.',
    },});
     
module.exports = mongoose.model('PayrollVariablePay', payrollVariablePaySchema);