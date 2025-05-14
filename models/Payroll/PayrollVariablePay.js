
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
  collection: 'PayrollVariablePay',
  validate: {
    validator: function () {
      return this.variableDeduction || this.variableAllowance;
    },
    message: 'Either variableDeduction or variableAllowance must be provided.',
  },
});

payrollVariablePaySchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'variableAllowance',
      select: '_id label'
    }),
    this.populate({
      path: 'variableDeduction',
      select: '_id label'
    });
  } catch (error) {
    console.error("Error populating loan and advance:", error);
  }
  next();
});

module.exports = mongoose.model('PayrollVariablePay', payrollVariablePaySchema);