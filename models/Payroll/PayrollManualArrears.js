var payrollManualArrearsSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    manualArrears: {
      type: Number,
      required: true
    },
    arrearDays: {
      type: Number,
      required: true
    },
    lopReversalDays: {
      type: Number,
      required: true
    },
    salaryRevisionDays: {
      type: Number,
      required: true
    },
    lopReversalArrears: {
      type: Number,
      required: true
    },
    totalArrears: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollManualArrears' });
  