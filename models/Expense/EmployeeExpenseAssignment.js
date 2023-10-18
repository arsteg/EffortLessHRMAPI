var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeExpenseAssignmentSchema = new Schema({
  expenseTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplate',
    required: true
  },
  approver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: true
  },
  effectiveDate: Date,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'EmployeeExpenseAssignment' });

module.exports = mongoose.model('EmployeeExpenseAssignment', employeeExpenseAssignmentSchema);
