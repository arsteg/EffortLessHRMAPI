const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
     
module.exports = mongoose.model('PayrollAttendanceSummary', payrollAttendanceSummarySchema);