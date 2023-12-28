var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseAdvanceSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming User schema for employee
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdvanceCategory',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  comment: {
    type: String
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
}, { collection: 'ExpenseAdvance' });

module.exports = mongoose.model('ExpenseAdvance', expenseAdvanceSchema);
