var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateDataFieldValueSchema = new Schema({
  candidateDataField: {
    type: mongoose.Schema.ObjectId,
    ref: 'CandidateDataField',
    required: true
  },
  fieldValue: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Candidate',
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
}, { collection: 'CandidateDataFieldValue' });

module.exports = mongoose.model('CandidateDataFieldValue', candidateDataFieldValueSchema);
