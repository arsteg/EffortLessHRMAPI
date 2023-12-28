var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeAdvanceAssignmentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  advanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdvanceTemplate',
    required: true
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: false
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: false
  },
  effectiveDate: Date,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'EmployeeAdvanceAssignment' });

module.exports = mongoose.model('EmployeeAdvanceAssignment', employeeAdvanceAssignmentSchema);
