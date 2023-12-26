var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateCategoryRateDetailSchema = new Schema({
  expenseTemplateCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplateCategory',
    required: true
  },  
  Label: {
    type: String,
    required: true  
  },
  Rate: {
    type: Number,
    required: true
  },
 
}, { collection: 'ExpenseTemplateCategoryRate' });

module.exports = mongoose.model('ExpenseTemplateCategoryRate', expenseTemplateCategoryRateDetailSchema);
