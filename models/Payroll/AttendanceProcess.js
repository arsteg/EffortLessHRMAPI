var attendanceProcessSchema = new Schema({
    attendanceProcessPeriod: {
      type: String,
      required: true
    },
    runDate: {
      type: Date,
      required: true
    },
    unprocessedEmployees: {
      type: Number,
      required: true
    },
    processedEmployees: {
      type: Number,
      required: true
    },
    exportToPayroll: {
      type: Boolean,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  }, { collection: 'AttendanceProcess' });
  