var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateFieldsSchema = new Schema({
  expenseTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplate',
    required: true
  },
  ExpenseApplicationField: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseApplicationField',
    required: true
  }
}, { collection: 'ExpenseTemplateFields' });

module.exports = mongoose.model('ExpenseTemplateFields', expenseTemplateFieldsSchema);
