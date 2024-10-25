const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var attendanceProcessSchema = new Schema({
    attendanceProcessPeriodYear: {
      type: String,
      required: true
    },
    attendanceProcessPeriodMonth: {
      type: String,
      required: true
    },
    runDate: {
      type: Date,
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
    }  
  }, { collection: 'AttendanceProcess' });
  module.exports = mongoose.model('AttendanceProcess', attendanceProcessSchema);
