const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFFlexiBenefitsAndPFTaxSchema = new Schema({
    PayrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
      required: true
    },
    TotalFlexiBenefitAmount: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollFNFFlexiBenefitsAndPFTax' });
      
module.exports = mongoose.model('PayrollFNFFlexiBenefitsAndPFTax', payrollFNFFlexiBenefitsAndPFTaxSchema);