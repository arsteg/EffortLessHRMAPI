var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackFieldSchema = new Schema({
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  subType: {
    type: String
  },
  isRequired: {
    type: Boolean
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
}, { collection: 'FeedbackField' });

module.exports = mongoose.model('FeedbackField', feedbackFieldSchema);
