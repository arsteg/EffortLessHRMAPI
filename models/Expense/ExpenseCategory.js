var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ExpenseApplicationField = require('./ExpenseApplicationField');

var expenseCategorySchema = new Schema({
  type: String,
  label: String,
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'ExpenseCategory' });
// Pre hook to remove related ExpenseApplicationField records
expenseCategorySchema.pre('remove', async function(next) { 
  // Now, remove ExpenseApplicationFieldValue documents associated with the removed ExpenseApplicationField records
  const removedFields = await ExpenseApplicationField.find({ expenseCategory: this._id });
  for (const field of removedFields) {
    await field.remove();
  }
  next(); // Continue with the delete operation
});

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);
