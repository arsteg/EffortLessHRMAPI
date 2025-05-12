const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceTemplateAssignmentsSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  attendanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  effectiveFrom: {
    type: Date
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'AttendanceTemplateAssignments' });

module.exports = mongoose.model('AttendanceTemplateAssignments', attendanceTemplateAssignmentsSchema);
