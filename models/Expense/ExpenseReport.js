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
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Level 1 Approval Pending','Level 2 Approval Pending','Approved', 'Cancelled', 'Rejected'],
    default: 'Level 1 Approval Pending'
  },
  primaryApprovalReason: {
    type: String
  },
  secondaryApprovalReason: {
    type: String
  },
  expenseReportExpense: []
}, { collection: 'ExpenseReport' });
// Pre hook to remove related ExpenseApplicationFieldValue records
expenseReportSchema.pre('remove', async function(next) {
  const ExpenseReportExpense = require('./ExpenseReportExpense'); // Import the ExpenseApplicationFieldValue model

  // Remove related ExpenseApplicationFieldValue records
  await ExpenseReportExpense.deleteMany({ expenseReport: this._id });

  next(); // Continue with the delete operation
});

module.exports = mongoose.model('ExpenseReport', expenseReportSchema);
