const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollFNFLoanAdvanceSchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
    required: true,
  },
  loanAndAdvance: {
    type: mongoose.Schema.ObjectId,
    ref: 'EmployeeLoanAdvance',
    required: true,
  },
  LoanAdvanceAmount: {
    type: Number,
    required: true,
  },
  finalSettlementAmount: {
    type: Number, // The final amount to be deducted or adjusted in the FNF process
    default: 0,
  },
  fnfClearanceStatus: {
    type: String,
    enum: ['Pending', 'Cleared', 'Partially Cleared'],
    default: 'Pending',  // FNF clearance status: pending, cleared, partially cleared
  },
  fnfDate: {
    type: Date,  // Date when FNF settlement occurred
  },
}, { collection: 'PayrollFNFLoanAdvance' });

module.exports = mongoose.model('PayrollFNFLoanAdvance', payrollFNFLoanAdvanceSchema);
