const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftTemplateAssignmentSchema = new Schema({
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'ShiftTemplateAssignment' });

module.exports = mongoose.model('ShiftTemplateAssignment', shiftTemplateAssignmentSchema);
