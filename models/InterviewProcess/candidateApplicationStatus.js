var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateApplicationStatusSchema = new Schema({
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Candidate',
    required: true
  },
  status: {
    type: mongoose.Schema.ObjectId,
    ref: 'ApplicationStatus',
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
}, { collection: 'CandidateApplicationStatus' });

module.exports = mongoose.model('CandidateApplicationStatus', candidateApplicationStatusSchema);
