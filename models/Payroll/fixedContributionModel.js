const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixedContributionSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  }
}, { collection: 'FixedContribution' });

module.exports = mongoose.model('FixedContribution', fixedContributionSchema);
