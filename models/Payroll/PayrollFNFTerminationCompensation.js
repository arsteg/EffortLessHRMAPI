const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var payrollFNFTerminationCompensationSchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
    required: true
  },
  terminationDate: {
    type: Date,
    required: true
  },
  noticePeriod: {
    type: Number,
    required: true
  },
  noticePeriod: {
    type: Number,
    required: true
  },
  yearsOfService: {
    type: Number,
    required: false
  },
  severancePay: {
    type: Number,
    required: false
  },
  retirementBenefits: {
    type: Number,
    required: false
  },
  redeploymentCompensation: {
    type: Number,
    required: false
  },
  outplacementServices: {
    type: String,
    required: false
  },
  outplacementServicePay: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'paid'],
    default: 'pending'
  }
}, { collection: 'PayrollFNFTerminationCompensation' });

module.exports = mongoose.model('PayrollFNFTerminationCompensation', payrollFNFTerminationCompensationSchema);
