var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateApplicableCategoriesSchema = new Schema({
  expenseTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplate',
    required: true
  },
  expenseCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  }
}, { collection: 'ExpenseTemplateApplicableCategories' });

module.exports = mongoose.model('ExpenseTemplateApplicableCategories', expenseTemplateApplicableCategoriesSchema);
