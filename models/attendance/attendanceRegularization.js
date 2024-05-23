var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attendanceRegularizationSchema = new Schema({
  canEmpRegularizeOwnAttendance: {
    type: Boolean,
    required: true
  },
  canSupervisorsRegularizeSubordinatesAttendance: {
    type: Boolean,
    required: true
  },
  canAdminEditRegularizeAttendance: {
    type: Boolean,
    required: true
  },
  shouldWeeklyEmailNotificationToBeSent: {
    type: String,
    required: true
  },
  whoReceiveWeeklyEmailNotification: [{
    type: String
  }],
  isIPrestrictedEmployeeCheckInCheckOut: {
    type: Boolean,
    required: true
  },
  isRestrictLocationForCheckInCheckOutUsingMobile: {
    type: Boolean,
    required: true
  },
  howAssignLocationsForEachEmployee: {
    type: String,
  },
  enableLocationCaptureFromMobile: {
    type: Boolean
  },
  geoLocationAPIProvider: {
    type: String
  },
  googleAPIKey: {
    type: String
  },
  isFacialFingerprintRecognitionFromMobile: {
    type: Boolean,
    required: true
  },
  attendanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
    unique: true, 
    required: true
  },
  // Ensure unique entries for attendanceTemplate
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  AttendanceRegularizationRestrictedLocations: [],
  AttendanceRegularizationRestrictedIPDetails: []
}, { collection: 'AttendanceRegularization' });

module.exports = mongoose.model('AttendanceRegularization', attendanceRegularizationSchema);
