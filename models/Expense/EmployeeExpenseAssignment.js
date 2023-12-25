var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeExpenseAssignmentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  expenseTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplate',
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
}, { collection: 'EmployeeExpenseAssignment' });

module.exports = mongoose.model('EmployeeExpenseAssignment', employeeExpenseAssignmentSchema);
