var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseReportExpenseFieldsSchema = new Schema({  
  expenseReportExpense: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseReportExpense',
    required: true
  },
  expenseApplicationField: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseApplicationField',
    required: true
  }
}, { collection: 'ExpenseReportExpenseFields' });

module.exports = mongoose.model('ExpenseReportExpenseFields', expenseReportExpenseFieldsSchema);
