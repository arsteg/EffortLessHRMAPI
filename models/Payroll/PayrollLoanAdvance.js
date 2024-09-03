var payrollLoanAdvanceSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    loanAndAdvance: {
      type: mongoose.Schema.ObjectId,
      ref: 'LoanAndAdvance',
      required: true
    },
    disbursementAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved'],
      required: true
    }
  }, { collection: 'PayrollLoanAdvance' });
  