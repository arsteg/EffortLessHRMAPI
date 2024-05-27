var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ctctemplateEmployeeDeductionSchema = new Schema({
  CTCTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  EmployeeDeduction: {
    type: String,
    required: true
  },
  Value: {
    type: String,
    required: true
  }
}, { collection: 'CTCTemplateEmployeeDeduction' });

module.exports = mongoose.model('CTCTemplateEmployeeDeduction', ctctemplateEmployeeDeductionSchema);
