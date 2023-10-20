const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const initiateSeparationRequestSchema = new Schema({
  separationType: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a User schema
    required: true
  }
}, { collection: 'InitiateSeparationRequest' });

module.exports = mongoose.model('InitiateSeparationRequest', initiateSeparationRequestSchema);
