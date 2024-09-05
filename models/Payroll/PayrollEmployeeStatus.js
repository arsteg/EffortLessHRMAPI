var payrollEmployeeStatusSchema = new Schema({
    payroll: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payroll',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'OnHold', 'Processed'],
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    }
  }, { collection: 'PayrollEmployeeStatus' });
  