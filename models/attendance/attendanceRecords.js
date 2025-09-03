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
  attendanceShift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',
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
    type: mongoose.Schema.ObjectId,
    ref: 'company',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isOvertime: {
    type: Boolean,
    required: true
  }
}, { collection: 'AttendanceRecords' });

attendanceRecordsSchema.pre(/^find/, async function(next) {
  try {
    this.populate({
      path: 'user',
      select: '_id firstName lastName'
    });
  } catch (error) {
    console.error("Error populating user name:", error);
  }
  next();
});
module.exports = mongoose.model('AttendanceRecords', attendanceRecordsSchema);
