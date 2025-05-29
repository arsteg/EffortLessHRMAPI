
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFUsersSchema = new Schema({
    payrollFNF: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNF',
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
    totalLoanRepayment: {
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
      enum: ['InProgress','Pending', 'OnHold', 'Processed','Approved','Paid','Cleared','Rejected','Finilized','Exit Interview Completed'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollFNFUsers' });
   
module.exports = mongoose.model('PayrollFNFUsers', payrollFNFUsersSchema);