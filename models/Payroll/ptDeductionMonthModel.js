var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ptDeductionMonthSchema = new Schema({
  state: {
    type: String,
    required: true
  },
  paymentMonth: {
    type: String,
    required: true
  },
  processMonth: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'PTDeductionMonth' });

module.exports = mongoose.model('PTDeductionMonth', ptDeductionMonthSchema);
