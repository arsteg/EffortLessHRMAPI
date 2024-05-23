const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ceilingAmountSchema = new Schema({
  defaultValue: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  roundType: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'CeilingAmount' });

module.exports = mongoose.model('CeilingAmount', ceilingAmountSchema);
