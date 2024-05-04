var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attendanceRecordsSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  ODHours: {
    type: Number,
    required: true
  },
  SSLHours: {
    type: Number,
    required: true
  },
  beforeProcessing: {
    type: String,
    required: true
  },
  afterProcessing: {
    type: String,
    required: true
  },
  earlyLateStatus: {
    type: String,
    required: true
  },
  deviationHour: {
    type: String,
    required: true
  },
  shiftTiming: {
    type: String,
    required: true
  },
  lateComingRemarks: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  }
}, { collection: 'AttendanceRecords' });

module.exports = mongoose.model('AttendanceRecords', attendanceRecordsSchema);
