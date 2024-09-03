var attendanceProcessLOPUploadSchema = new Schema({
    attendanceProcess: {
      type: mongoose.Schema.ObjectId,
      ref: 'AttendanceProcess',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    lopDays: {
      type: Number,
      required: true
    }
  }, { collection: 'AttendanceProcessLOPUpload' });
  