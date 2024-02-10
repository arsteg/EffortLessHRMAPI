var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateInterviewDetailsSchema = new Schema({
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Candidate',  // Assuming the reference is to a Candidate schema
    required: true
  },
  interviewDateTime: {
    type: Date,
    required: true
  },
  scheduledBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  zoomLink: {
    type: String
  },
  interviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
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
}, { collection: 'CandidateInterviewDetails' });

module.exports = mongoose.model('CandidateInterviewDetails', candidateInterviewDetailsSchema);
