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
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollUsers' });
  