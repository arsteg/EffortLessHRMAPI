const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFVariablePaySchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
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
    type: String,
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
  collection: 'PayrollFNFVariablePay',
  validate: {
    validator: function () {
      return this.variableDeduction || this.variableAllowance;
    },
    message: 'Either variableDeduction or variableAllowance must be provided.',
  },
});
payrollFNFVariablePaySchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'variableAllowance',
      select: 'id label'
    });
    this.populate({
      path: 'variableDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('PayrollFNFVariablePay', payrollFNFVariablePaySchema);