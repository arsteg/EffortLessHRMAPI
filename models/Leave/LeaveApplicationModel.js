var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveApplicationSchema = new Schema({
  employee: {
    type: String,
    required: true
  },
  leaveCategory: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isHalfDayOption: {
    type: Boolean,
    default: false
  },
  comment: {
    type: String
  },
  addedBy: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true
  },
  level1Reason: {
    type: String
  },
  level2Reason: {
    type: String
  },
  company: {
    type: String,
    required: true
  }
}, { collection: 'LeaveApplication' });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
