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
    enum: ['Level 1 Approval Pending','Level 2 Approval Pending','Approved', 'Cancelled', 'Rejected'],
    default: 'Level 1 Approval Pending'
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
  },    
  documentLink: {
    type: String
  },
  halfDays:[]
}, { collection: 'LeaveApplication' });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
