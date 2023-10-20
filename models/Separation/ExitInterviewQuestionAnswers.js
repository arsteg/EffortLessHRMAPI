const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exitInterviewQuestionAnswersSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming the reference is to a User schema
    required: true
  },
  question: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExitInterviewQuestion', // Assuming the reference is to an ExitInterviewQuestion schema
    required: true
  },
  answer: {
    type: String,
    required: true
  }
}, { collection: 'ExitInterviewQuestionAnswers' });

module.exports = mongoose.model('ExitInterviewQuestionAnswers', exitInterviewQuestionAnswersSchema);
