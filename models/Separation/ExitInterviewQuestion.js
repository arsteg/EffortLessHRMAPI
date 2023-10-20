var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var exitInterviewQuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true
  },
  separationType: {
    type: mongoose.Schema.ObjectId,
    ref: 'SeparationType', // Assuming the reference is to a SeparationType schema
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'ExitInterviewQuestion' });

module.exports = mongoose.model('ExitInterviewQuestion', exitInterviewQuestionSchema);
