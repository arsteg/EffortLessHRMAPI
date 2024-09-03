var payrollSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    totalHomeTake: {
      type: Number,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
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
      enum: ['Pending', 'Approved', 'Rejected'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'Payroll' });
  