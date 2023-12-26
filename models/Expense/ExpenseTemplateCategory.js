var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseTemplateCategoriesSchema = new Schema({
  expenseTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseTemplate',
    required: true
  },
  expenseCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'ExpenseCategory',
    required: true
  },
  isMaximumAmountPerExpenseSet: {
    type: Boolean,
    default: false
  },
  maximumAmountPerExpense: {
    type: Number
  },
  isMaximumAmountWithoutReceiptSet: {
    type: Boolean,
    default: false
  },
  maximumAmountWithoutReceipt: {
    type: Number   
  },
  maximumExpensesCanApply: {
    type: Number
  },
  isTimePeroidSet: {
    type: Boolean,
    default: false
  },
  timePeroid: {
    type: String   
  },
  expiryDay: {
    type: Number
  },
  isEmployeeCanAddInTotalDirectly: {
    type: Boolean,
    default: false
  },
  ratePerDay: {
    type: Number
  },
}, { collection: 'ExpenseTemplateApplicableCategories' });

module.exports = mongoose.model('ExpenseTemplateCategories', expenseTemplateCategoriesSchema);
