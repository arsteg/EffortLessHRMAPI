var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var regularizationRequestSchema = new Schema({
  regularizationDate: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  isHalfDayRegularization: {
    type: Boolean,
    required: true
  },
  halfDayType: {
    type: String
  },
  reason: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  firstApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  firstApproverDate: {
    type: Date
  },
  firstApproverComment: {
    type: String
  },
  secondApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  secondApproverDate: {
    type: Date
  },
  secondApproverComment: {
    type: String
  },
  appliedOn: {
    type: Date,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'RegularizationRequest' });

module.exports = mongoose.model('RegularizationRequest', regularizationRequestSchema);
