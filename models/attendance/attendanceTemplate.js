const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceTemplateSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  attendanceMode: {
    type: [String],
    required: true,
    enum: ['Tracker', 'Manually Upload', 'Web Check-In'] 
  },
  missingCheckInCheckoutHandlingMode: {
    type: String,
    required: true
  },
  missingCheckinCheckoutAttendanceProcessMode: {
    type: String,
    required: true
  },
  minimumHoursRequiredPerWeek: {
    type: Number,
    required: true
  },
  minimumMinutesRequiredPerWeek: {
    type: Number,
    required: true
  },
  notifyEmployeeMinHours: {
    type: Boolean,
    default: true
  },
  isShortTimeLeaveDeductible: {
    type: Boolean,
    default: true
  },
  weeklyOfDays: {
    type: [String],
    required: true
  },
  weklyofHalfDay: {
    type: [String],
    required: true
  },
  alternateWeekOffRoutine: {
    type: String,
    required: true
  },
  daysForAlternateWeekOffRoutine: {
    type: [String],
    required: true
  },
  isNotificationToSupervisors: {
    type: Boolean,
    required: true
  },
  isCommentMandatoryForRegularisation: {
    type: Boolean,
    required: true
  },
  departmentDesignations: {
    type: String,
    required: true
  },
  approversType: {
    type: String,
    required: true
  },
  approvalLevel: {
    type: String,
    required: true
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  leveCategoryHierarchyForAbsentHalfDay: {
    type: [String], // Assuming LeaveCategory is a string
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  }
}, { collection: 'AttendanceTemplate' });

module.exports = mongoose.model('AttendanceTemplate', attendanceTemplateSchema);
