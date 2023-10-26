const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regularizationReasonSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'RegularizationReason' });

module .exports = mongoose.model('RegularizationReason', regularizationReasonSchema);
