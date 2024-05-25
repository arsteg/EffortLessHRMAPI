const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctctemplateEmployerContributionSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  fixedContribution: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { collection: 'CTCTemplateEmployerContribution' });

module.exports = mongoose.model('CTCTemplateEmployerContribution', ctctemplateEmployerContributionSchema);
