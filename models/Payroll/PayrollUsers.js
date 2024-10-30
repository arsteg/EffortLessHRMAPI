
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollUsersSchema = new Schema({
    payroll: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payroll',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    totalFixedAllowance: {
      type: Number
    },
    totalOtherBenefits: {
      type: Number
    },
    totalEmployeeStatutoryDeduction: {
      type: Number
    },
    totalEmployeeStatutoryContribution: {
      type: Number
    },
    totalFixedDeduction: {
      type: Number
    },
    totalVariableDeduction: {
      type: Number
    },
    totalLoan: {
      type: Number
    },
    totalAdvance: {
      type: Number
    },
    totalFlexiBenefits: {
      type: Number,
      required: true
    },
    totalCTC: {
      type: Number,
      required: true
    },
    totalGrossSalary: {
      type: Number,
      required: true
    },
    totalTakeHome: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'OnHold', 'Processed'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollUsers' });
   
module.exports = mongoose.model('PayrollUsers', payrollUsersSchema);