var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseApplicationFieldSchema = new Schema({
  expenseCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  },
  fieldName: String,
  fieldType: String,
  isMandatory: Boolean
}, { collection: 'ExpenseApplicationField' });

module.exports = mongoose.model('ExpenseApplicationField', expenseApplicationFieldSchema);
