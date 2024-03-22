const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceRegularizationRestrictedLocationSchema = new Schema({
  attendanceRegularization: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceRegularization', // Assuming reference to an AttendanceRegularization schema
    required: true
  },
  Location: {
    type: String,
    required: true
  },
  Latitude: {
    type: String,
    required: true
  },
  Longitude: {
    type: String,
    required: true
  },
  Radius: {
    type: String,
    required: true
  }
}, { collection: 'AttendanceRegularizationRestrictedLocation' });

module.exports = mongoose.model('AttendanceRegularizationRestrictedLocation', attendanceRegularizationRestrictedLocationSchema);
