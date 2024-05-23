var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fixedDeductionSchema = new Schema({
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
}, { collection: 'FixedDeduction' });

module.exports = mongoose.model('FixedDeduction', fixedDeductionSchema);
