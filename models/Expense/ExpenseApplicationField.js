var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ExpenseApplicationFieldValue = require('./ExpenseApplicationFieldValue');
var expenseApplicationFieldSchema = new Schema({
  expenseCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  },
  fieldName: String,
  fieldType: String,  
  ExpenseApplicationFieldValues:[]
}, { collection: 'ExpenseApplicationField' });
// Pre hook to remove related ExpenseApplicationFieldValue records
expenseApplicationFieldSchema.pre('remove', async function(next) {
  const ExpenseApplicationFieldValue = require('./ExpenseApplicationFieldValue'); // Import the ExpenseApplicationFieldValue model

  // Remove related ExpenseApplicationFieldValue records
  await ExpenseApplicationFieldValue.deleteMany({ expenseApplicationField: this._id });

  next(); // Continue with the delete operation
});
expenseApplicationFieldSchema.pre('remove', async function(next) { 
  // Now, remove ExpenseApplicationFieldValue documents associated with the removed ExpenseApplicationField records
  await ExpenseApplicationFieldValue.deleteMany({ expenseApplicationField: this._id }); 
  next(); // Continue with the delete operation
});
module.exports = mongoose.model('ExpenseApplicationField', expenseApplicationFieldSchema);
