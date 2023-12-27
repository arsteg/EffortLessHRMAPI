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
  expenseReportExpenseFields:[]
 
}, { collection: 'ExpenseReportExpense' });

module.exports = mongoose.model('ExpenseReportExpense', expenseReportExpenseSchema);
