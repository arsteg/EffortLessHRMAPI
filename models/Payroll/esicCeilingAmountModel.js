const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ceilingAmountSchema = new Schema({
  employeeCount: {
    type: Number,
    required: true
  },
  maxGrossAmount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'CeilingAmount' });

module.exports = mongoose.model('CeilingAmount', ceilingAmountSchema);
