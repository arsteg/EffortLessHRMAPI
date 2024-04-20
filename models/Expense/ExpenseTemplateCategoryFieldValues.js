var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateCategoryFieldValuesSchema = new Schema({
  expenseTemplateCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplateCategory',
    required: true
  },  
  label: {
    type: String,
    required: true  
  },
  type: {
    type: String,
    required: true  
  },
  rate: {
    type: Number,
    required: false
  },
 
}, { collection: 'ExpenseTemplateCategoryFieldValues' });

module.exports = mongoose.model('ExpenseTemplateCategoryFieldValues', expenseTemplateCategoryFieldValuesSchema);
