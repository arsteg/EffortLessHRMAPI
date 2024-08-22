const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeTaxComponantSchema = new Schema({
  componantName: {
    type: String,
    required: true
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'IncomeTaxSection',
    required: true
  },
  maximumAmount: {
    type: Number,
    required: true
  },
  order:{
    type: Number,
    required: true
  }
}, { collection: 'IncomeTaxComponant' });

module.exports = mongoose.model('IncomeTaxComponant', incomeTaxComponantSchema);
