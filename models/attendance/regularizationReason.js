const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regularizationReasonSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  isFrequecyRestriction: {
    type: Boolean,
    required: true,
  },
  limit: {
    type: Number
  },
  applicableEmployee:{
    type: String,
    required:true
  },
  frequency: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
  userRegularizationReasons: []
}, { collection: 'RegularizationReason' });

module .exports = mongoose.model('RegularizationReason', regularizationReasonSchema);
