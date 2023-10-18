var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseCategorySchema = new Schema({
  type: String,
  label: String,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'ExpenseCategory' });

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);
