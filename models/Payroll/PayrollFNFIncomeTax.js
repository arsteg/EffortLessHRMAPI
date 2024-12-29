const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFIncomeTaxSchema = new Schema({
    PayrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
      required: true
    },
    TaxCalculatedMethod: {
      type: String,
      required: true
    },
    TaxCalculated: {
      type: Number,
      required: true
    },
    TDSCalculated: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollFNFIncomeTax' });
  
  module.exports = mongoose.model('PayrollFNFIncomeTax', payrollFNFIncomeTaxSchema);
  
  