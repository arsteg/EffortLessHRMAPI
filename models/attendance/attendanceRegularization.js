var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attendanceRegularizationSchema = new Schema({
  canEmpRegularizeOwnAttendance: {
    type: String,
    required: true
  },
  canSupervisorsRegularizeSubordinatesAttendance: {
    type: String,
    required: true
  },
  canAdminEditRegularizeAttendance: {
    type: String,
    required: true
  },
  shouldWeeklyEmailNotificationToBeSent: {
    type: String,
    required: true
  },
  whoReceiveWeeklyEmailNotification: [{
    type: String
  }],
  isRestrictLocationForCheckInCheckOutUsingMobile: {
    type: String,
    required: true
  },
  howAssignLocationsForEachEmployee: {
    type: String,
    required: true
  },
  enableLocationCaptureFromMobile: {
    type: String,
    required: true
  },
  geoLocationAPIProvider: {
    type: String,
    required: true
  },
  googleAPIKey: {
    type: String,
    required: true
  },
  isFacialFingerprintRecognitionFromMobile: {
    type: String,
    required: true
  },
  attendanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
  AttendanceRegularizationRestrictedLocations: [],
  AttendanceRegularizationRestrictedIPDetails: []
}, { collection: 'AttendanceRegularization' });

module.exports = mongoose.model('AttendanceRegularization', attendanceRegularizationSchema);
