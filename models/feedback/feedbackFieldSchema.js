var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackFieldSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },  
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'rating', 'date', 'boolean'],
    required: true,
    set: v => v.toLowerCase()
  },
  isRequired: {
    type: Boolean,
    required: true,
    default: false
  }
}, { collection: 'feedbackField', timestamps: true });

// Optional unique index for name + company
feedbackFieldSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('feedbackField', feedbackFieldSchema);