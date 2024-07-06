const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeTaxComponantSchema = new Schema({
  componantName: {
    type: String,
    required: true
  },
  MaximumAmount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Reference to the Company schema assuming it exists
    required: true
  }
}, { collection: 'IncomeTaxComponant' });

module.exports = mongoose.model('IncomeTaxComponant', incomeTaxComponantSchema);
