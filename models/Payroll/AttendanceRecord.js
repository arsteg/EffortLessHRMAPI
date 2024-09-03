var attendanceRecordSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    checkin: {
      type: String,
      required: true
    },
    checkout: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    beforeProcessing: {
      type: String
    },
    afterProcessing: {
      type: String
    },
    earlyLateStatus: {
      type: String
    },
    deviationHours: {
      type: String
    },
    shiftTiming: {
      type: String,
      required: true
    },
    lateComingRemarks: {
      type: String
    },
    date: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'AttendanceRecord' });
  