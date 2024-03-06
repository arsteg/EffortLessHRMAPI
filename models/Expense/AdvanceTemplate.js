var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var advanceTemplateSchema = new Schema({
  policyLabel: String,
  approvalType: {
    type: String,   
    default: 'employee-wise'
  },
  approvalLevel: {
    type: String,
    enum: ['1','2'],
    default: '1'
  }, 
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
