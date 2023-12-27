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

// Pre hook to remove related ExpenseApplicationFieldValue records
expenseReportExpenseSchema.pre('remove', async function(next) {
  const ExpenseReportExpenseFields = require('./ExpenseReportExpenseFields'); // Import the ExpenseApplicationFieldValue model

  // Remove related ExpenseApplicationFieldValue records
  await ExpenseReportExpenseFields.deleteMany({ expenseReportExpense: this._id });

  next(); // Continue with the delete operation
});
module.exports = mongoose.model('ExpenseReportExpense', expenseReportExpenseSchema);
