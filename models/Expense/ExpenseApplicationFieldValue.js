var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseApplicationFieldValueSchema = new Schema({
  expenseApplicationField: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseApplicationField',
    required: true
  },
  Name: String,
  Type: String,
  Value: String // Store JSON string as a plain string
}, { collection: 'ExpenseApplicationFieldValue' });

module.exports = mongoose.model('ExpenseApplicationFieldValue', expenseApplicationFieldValueSchema);
