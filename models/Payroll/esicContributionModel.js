const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const esicContributionSchema = new Schema({
  fromAmount: {
    type: Number,
    required: true
  },
  toAmount: {
    type: Number,
    required: true
  },
  employeePercentage: {
    type: Number,
    required: true
  },
  employerPercentage: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'ESICContribution' });

module.exports = mongoose.model('ESICContribution', esicContributionSchema);
