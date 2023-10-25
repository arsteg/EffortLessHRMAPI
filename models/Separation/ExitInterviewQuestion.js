var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ExitInterviewQuestionOptions = require('./ExitInterviewQuestionOptions');
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
exitInterviewQuestionSchema.pre('remove', async function(next) { 
  // Now, remove ExpenseApplicationFieldValue documents associated with the removed ExpenseApplicationField records
  await ExitInterviewQuestionOptions.deleteMany({ question: this._id }); 
  next(); // Continue with the delete operation
});
module.exports = mongoose.model('ExitInterviewQuestion', exitInterviewQuestionSchema);
