const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollIncomeTaxSchema = new Schema({
    PayrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
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
  }, { collection: 'PayrollIncomeTax' });
  
  module.exports = mongoose.model('PayrollIncomeTax', payrollIncomeTaxSchema);
  
  