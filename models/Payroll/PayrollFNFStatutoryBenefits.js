const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollFNFStatutoryBenefitsSchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
    required: true,
  },
  IsGratuityApplicable: {
    type: Boolean,
    required: true,
  },
  GratuityAmount: {
    type: Number
  },
  IsProvidentFundApplicable: {
    type: Boolean,
    required: true,
  },
  ProvidentFundAmount: {
    type: Number
  },
  ProvidentFundPaymentProcess: {
    type: String,
    enum: ['Transfer', 'Withdraw'],
    required: true,
  },
  IsProvidentFundWithdrawFormSubmitted: {
    type: Boolean,
    required: true,
  }  
}, { collection: 'PayrollFNFStatutoryBenefits' });

module.exports = mongoose.model('PayrollFNFStatutoryBenefits', payrollFNFStatutoryBenefitsSchema);
