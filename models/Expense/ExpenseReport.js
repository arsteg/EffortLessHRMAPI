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
  }
}, { collection: 'ExpenseReport' });

module.exports = mongoose.model('ExpenseReport', expenseReportSchema);
