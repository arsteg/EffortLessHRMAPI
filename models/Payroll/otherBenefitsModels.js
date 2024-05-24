var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var otherBenefitsSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  isEffectAttendanceOnEligibility: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'OtherBenefits' });

module.exports = mongoose.model('OtherBenefits', otherBenefitsSchema);
