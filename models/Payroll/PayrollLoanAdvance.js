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
    status: {
      type: String,
      enum: ['Pending', 'Approved']
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollLoanAdvance' });

payrollLoanAdvanceSchema.pre(/^find/, async function(next) {
  try {
    this.populate({
      path: 'loanAndAdvance',
      select: '_id'
    });
  } catch (error) {
    console.error("Error populating loan and advance:", error);
  }
  next();
});

module.exports = mongoose.model('PayrollLoanAdvance', payrollLoanAdvanceSchema);