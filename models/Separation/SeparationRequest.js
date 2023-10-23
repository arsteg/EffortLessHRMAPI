const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const separationRequestSchema = new Schema({
  separationType: {
    type: mongoose.Schema.ObjectId,
    ref: 'SeparationType',  // Assuming the reference is to a User schema
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
  },
  status: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  IsModifyRelievingDate: {
    type: Boolean,
    default: false
  }
}, { collection: 'SeparationRequest' });

module.exports = mongoose.model('SeparationRequest', separationRequestSchema);
