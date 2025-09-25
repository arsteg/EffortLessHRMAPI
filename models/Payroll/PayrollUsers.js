
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
    totalVariableAllowance: {
      type: Number
    },
    totalEmployeeStatutoryDeduction: {
      type: Number
    },
    totalEmployerStatutoryContribution: {
      type: Number
    },
    totalFixedDeduction: {
      type: Number
    },
    totalVariableDeduction: {
      type: Number
    },
    totalLoanDisbursed: {
      type: Number
    },
    totalLoanRepayment: {
      type: Number
    },
    totalFlexiBenefits: {
      type: Number,
      required: true,
      default: 0
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
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['OnHold', 'InProgress', 'Closed'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollUsers' });
   
module.exports = mongoose.model('PayrollUsers', payrollUsersSchema);