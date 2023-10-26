const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceModeSchema = new Schema({
  mode: {
    type: String,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
}, { collection: 'AttendanceMode' });

module.exports = mongoose.model('AttendanceMode', attendanceModeSchema);
