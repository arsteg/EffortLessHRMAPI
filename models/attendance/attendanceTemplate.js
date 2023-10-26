const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceTemplateSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  attendanceMode: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceMode',
    required: true,
  },
  missingCheckInCheckoutHandlingMode: {
    type: String,
    required: true,
  },
  missingCheckinCheckoutAttendanceProcessMode: {
    type: String,
    required: true,
  },
  minimumHoursRequiredPerWeek: {
    type: Number,
    required: true,
  },
  notifyEmployeeMinHours: {
    type: Boolean,
    required: true,
  },
  isShortTimeLeaveDeductible: {
    type: Boolean,
    required: true,
  },
  weeklyoffDays: {
    weekOffIsHalfDay: {
      type: Boolean,
    },
    alternateWeekOffRoutine: {
      sendNotificationToSupervisors: {
        type: Boolean,
        required: true,
      },
    },
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'AttendanceTemplate' });

module.exports = mongoose.model('AttendanceTemplate', attendanceTemplateSchema);
