const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regularizationRequestSchema = new Schema({
  regularizationDate: {
    type: Date,
    required: true,
  },
  requestType: {
    type: String,
    required: true,
  },
  shift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, { collection: 'RegularizationRequest' });

module.exports = mongoose.model('RegularizationRequest', regularizationRequestSchema);
