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
  },
  enableLocationCaptureFromMobile: {
    type: String
  },
  geoLocationAPIProvider: {
    type: String
  },
  googleAPIKey: {
    type: String
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
    required: true
  },
  AttendanceRegularizationRestrictedLocations: [],
  AttendanceRegularizationRestrictedIPDetails: []
}, { collection: 'AttendanceRegularization' });

module.exports = mongoose.model('AttendanceRegularization', attendanceRegularizationSchema);
