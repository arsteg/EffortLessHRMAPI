var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fixedContributionSlabSchema = new Schema({  
  fixedContribution: {
    type: String,
    required: true
  },
  fromAmount: {
    type: Number,
    required: true
  },
  toAmount: {
    type: Number,
    required: true
  },
  employeePercent: {
    type: Number,
    required: true
  },
  employeeAmount: {
    type: Number,
    required: true
  },
  employerPercentage: {
    type: Number,
    required: true
  },
  employerAmount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'LWFFixedContributionSlab' });

module.exports = mongoose.model('LWFFixedContributionSlab', fixedContributionSlabSchema);
