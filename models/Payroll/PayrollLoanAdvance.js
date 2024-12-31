const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollLoanAdvanceSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    loanAndAdvance: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmployeeLoanAdvance',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    disbursementAmount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Disbursement',    // Loan/advance given to the employee
        'Repayment'
      ],
    },
    remainingEMI: {
      type: Number
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollLoanAdvance' });
  module.exports = mongoose.model('PayrollLoanAdvance', payrollLoanAdvanceSchema);