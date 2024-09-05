var payrollAttendanceSummarySchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    },
    lopDays: {
      type: Number,
      required: true
    },
    payableDays: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollAttendanceSummary' });
  