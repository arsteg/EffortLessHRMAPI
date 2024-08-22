var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rosterShiftAssignmentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a User schema
    required: true
  },
  shift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',  // Assuming the reference is to a Shift schema
    required: true
  },
  repeat: {
    type: Boolean,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  endsOn: {
    type: String,
    required: true
  },
  endDate: {
    type: Date
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'RosterShiftAssignment' });

module.exports = mongoose.model('RosterShiftAssignment', rosterShiftAssignmentSchema);
