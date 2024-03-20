const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceRegularizationRestrictedIPSchema = new Schema({
  attendanceRegularization: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceRegularization', // Assuming reference to an AttendanceRegularization schema
    required: true
  },
  IP: {
    type: String,
    required: true
  }
}, { collection: 'AttendanceRegularizationRestrictedIP' });

module.exports = mongoose.model('AttendanceRegularizationRestrictedIP', attendanceRegularizationRestrictedIPSchema);
