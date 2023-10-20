const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exitInterviewQuestionOptionsSchema = new Schema({
  question: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExitInterviewQuestion', // Reference to ExitInterviewQuestion schema
    required: true
  },
  option1: {
    type: String,
    required: true
  },
  option2: {
    type: String,
    required: true
  },
  option3: {
    type: String,
    required: true
  },
  option4: {
    type: String,
    required: true
  }
}, { collection: 'ExitInterviewQuestionOptions' });

module.exports = mongoose.model('ExitInterviewQuestionOptions', exitInterviewQuestionOptionsSchema);
