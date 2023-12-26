var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseReportExpenseSchema = new Schema({
  expenseReport: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseReport',
    required: true
  },
  expenseCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  },
  incurredDate: {
    type: Date,
    required: true
  },
  type: {
    type: String
  },
  quantity: {
    type: Number
  },
  amount: {
    type: Number,
    required: true
  },
  isReimbursable: {
    type: Boolean,
    default: true
  },
  isBillable: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String
  },
  documentLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Cancelled', 'Rejected'],
    default: 'Pending'
  }
}, { collection: 'ExpenseReportExpense' });

module.exports = mongoose.model('ExpenseReportExpense', expenseReportExpenseSchema);
