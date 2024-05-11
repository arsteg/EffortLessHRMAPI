var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lwfFixedContributionMonthSchema = new Schema({  
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
}, { collection: 'LWFFixedContributionMonth' });

module.exports = mongoose.model('LWFFixedContributionMonth', lwfFixedContributionMonthSchema);
