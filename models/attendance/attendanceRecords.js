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
    type: Number
  },
  SSLHours: {
    type: Number
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
  },
  isOvertime: {
    type: Boolean,
    required: true
  }
}, { collection: 'AttendanceRecords' });

module.exports = mongoose.model('AttendanceRecords', attendanceRecordsSchema);
