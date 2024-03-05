var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveGrantSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee', // Assuming the reference is to an Employee schema
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  comment: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  appliedOn: {
    type: Date,
    required: true
  },
  appliedFor: {
    type: String
  },
  usedOn: {
    type: Date
  },
  level1Reason: {
    type: String
  },
  level2Reason: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'LeaveGrant' });

module.exports = mongoose.model('LeaveGrant', leaveGrantSchema);
