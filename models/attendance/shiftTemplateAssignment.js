const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftTemplateAssignmentSchema = new Schema({
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  startDate: {
    type: Date,
    required: true,
  },
}, { collection: 'ShiftTemplateAssignment' });

module.exports = mongoose.model('ShiftTemplateAssignment', shiftTemplateAssignmentSchema);
