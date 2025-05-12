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
    enum: ['Cleared', 'Partially Cleared'],
    default: 'Cleared',  // FNF clearance status: pending, cleared, partially cleared
  }
}, { collection: 'PayrollFNFLoanAdvance' });
payrollFNFLoanAdvanceSchema.pre(/^find/, async function(next) {
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
module.exports = mongoose.model('PayrollFNFLoanAdvance', payrollFNFLoanAdvanceSchema);
