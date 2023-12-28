var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var advanceTemplateSchema = new Schema({
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
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  advanceCategories: []
}, { collection: 'AdvanceTemplate' });

module.exports = mongoose.model('AdvanceTemplate', advanceTemplateSchema);
