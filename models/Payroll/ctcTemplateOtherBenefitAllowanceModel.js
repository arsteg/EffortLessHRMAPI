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

ctctemplateOtherBenefitAllowanceSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'otherBenefit',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating variable deductions:", error);
  }
  next();
});

module.exports = mongoose.model('CTCTemplateOtherBenefitAllowance', ctctemplateOtherBenefitAllowanceSchema);
