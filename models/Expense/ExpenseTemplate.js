var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateSchema = new Schema({
  policyLabel: String,
  approvalType: String,
  downloadableFormats: [String], // Assuming an array of format strings
  advanceAmount: Boolean,
  applyforSameCategorySamedate: Boolean,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'ExpenseTemplate' });

module.exports = mongoose.model('ExpenseTemplate', expenseTemplateSchema);