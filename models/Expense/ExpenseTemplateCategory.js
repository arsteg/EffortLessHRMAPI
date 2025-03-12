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
  expenseTemplateCategoryFieldValues:[]
}, { collection: 'ExpenseTemplateCategories' });

expenseTemplateCategoriesSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'expenseCategory',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating expense category:", error);
  }
  next();
});
module.exports = mongoose.model('ExpenseTemplateCategories', expenseTemplateCategoriesSchema);
