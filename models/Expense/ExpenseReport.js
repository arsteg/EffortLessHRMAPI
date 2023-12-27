var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseReportSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming User schema for employee
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['Level 1 Approval Pending','Level 2 Approval Pending','Approved', 'Cancelled', 'Rejected'],
    default: 'Pending'
  },
  primaryApprovalReason: {
    type: String
  },
  secondaryApprovalReason: {
    type: String
  },
  expenseReportExpense: []
}, { collection: 'ExpenseReport' });

module.exports = mongoose.model('ExpenseReport', expenseReportSchema);
