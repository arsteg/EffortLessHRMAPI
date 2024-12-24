var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taxSlabSchema = new Schema({
  IncomeTaxSlabs: {
    type: String,
    required: true
  },
  minAmount: {
    type: Number,
    required: true // Assuming default is false
  },
  maxAmount: {
    type: Number,
    required: true // Assuming default is false
  },
  taxPercentage: {
    type: Number,
    required: true
  },
  cycle: {
    type: String,
    required: true
  },
  regime: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'TaxSlab' });

module.exports = mongoose.model('TaxSlab', taxSlabSchema);