const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceTemplateAssignmentsSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
  },
}, { collection: 'AttendanceTemplateAssignments' });

module.exports = mongoose.model('AttendanceTemplateAssignments', attendanceTemplateAssignmentsSchema);
