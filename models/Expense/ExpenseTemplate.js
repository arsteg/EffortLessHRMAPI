var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateSchema = new Schema({
  policyLabel: String,
  approvalType: String,
  approvalLevel: String, 
  firstApprovalEmployee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming the reference is to a Company schema  
  },
  secondApprovalEmployee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming the reference is to a Company schema    
  },
  downloadableFormats: [String], // Assuming an array of format strings
  advanceAmount: Boolean,
  applyforSameCategorySamedate: Boolean,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  applicableCategories:[]
}, { collection: 'ExpenseTemplate' });

module.exports = mongoose.model('ExpenseTemplate', expenseTemplateSchema);
