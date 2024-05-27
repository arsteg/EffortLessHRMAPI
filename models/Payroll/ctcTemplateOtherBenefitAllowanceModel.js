var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ctctemplateOtherBenefitAllowanceSchema = new Schema({
  CTCTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  OtherBenefits: {
    type: String,
    required: true
  }
}, { collection: 'CTCTemplateOtherBenefitAllowance' });

module.exports = mongoose.model('CTCTemplateOtherBenefitAllowance', ctctemplateOtherBenefitAllowanceSchema);
