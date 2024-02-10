var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackFieldValueSchema = new Schema({
  feedbackField: {
    type: mongoose.Schema.ObjectId,
    ref: 'FeedbackField',
    required: true
  },
  fieldValue: {
    type: String,
    required: true
  },
  fieldType: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  }
}, { collection: 'FeedbackFieldValue' });

module.exports = mongoose.model('FeedbackFieldValue', feedbackFieldValueSchema);
