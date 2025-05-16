const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollFNFStatutoryBenefitsSchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
    required: true,
  },
  GratuityAmount: {
    type: Number
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
