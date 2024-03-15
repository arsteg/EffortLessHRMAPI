var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var templateApplicableCategoryEmployeeSchema = new Schema({  
  leaveTemplateCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplateCategory',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true
  }
}, { collection: 'TemplateApplicableCategoryEmployee' });

module.exports = mongoose.model('TemplateApplicableCategoryEmployee', templateApplicableCategoryEmployeeSchema);
