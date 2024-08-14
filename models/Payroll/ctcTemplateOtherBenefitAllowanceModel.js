var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ctctemplateOtherBenefitAllowanceSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  otherBenefit: {
    type: mongoose.Schema.ObjectId,
    ref: 'OtherBenefits',
    required: true
  }
}, { collection: 'CTCTemplateOtherBenefitAllowance' });

module.exports = mongoose.model('CTCTemplateOtherBenefitAllowance', ctctemplateOtherBenefitAllowanceSchema);
