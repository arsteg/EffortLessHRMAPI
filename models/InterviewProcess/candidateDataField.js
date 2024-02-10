var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateDataFieldSchema = new Schema({
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  subType: {
    type: String,
    required: false
  },
  isRequired: {
    type: Boolean,
    required: true
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
}, { collection: 'CandidateDataField' });

module.exports = mongoose.model('CandidateDataField', candidateDataFieldSchema);
