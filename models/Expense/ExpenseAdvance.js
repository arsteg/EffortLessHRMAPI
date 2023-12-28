var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseAdvanceSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  Status: {
    type: String,
    enum: ['Remaining', 'Pending', 'Approved', 'Paid'],
    default: 'Remaining'
  }
}, { collection: 'ExpenseAdvance' });

module.exports = mongoose.model('ExpenseAdvance', expenseAdvanceSchema);
