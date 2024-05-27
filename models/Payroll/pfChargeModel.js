const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pfChargeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes whitespace from the beginning and end of the string
  },
  frequency: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'annually'] // Assuming frequency can only be one of these values
  },
  percentage: {
    type: Number,
    required: true,
    min: [0, 'Percentage must be a positive number'], // Ensures percentage is non-negative
    max: [100, 'Percentage cannot exceed 100'] // Ensures percentage does not exceed 100
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'PFCharge' });

module.exports = mongoose.model('PFCharge', pfChargeSchema);
