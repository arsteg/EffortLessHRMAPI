var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lwfFixedDeductionMonthSchema = new Schema({  
  paymentMonth: {
    type: String,
    required: true
  },
  processMonth: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'LWFFixedDeductionMonth' });

module.exports = mongoose.model('LWFFixedDeductionMonth', lwfFixedDeductionMonthSchema);
