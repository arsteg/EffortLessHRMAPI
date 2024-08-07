var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeLoanAdvanceSchema = new Schema({  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the Company schema assuming it exists
    required: true
  },
  loanAdvancesCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanAdvancesCategory',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  repaymentFrequency: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Reference to the Company schema assuming it exists
    required: true
  },
}, { collection: 'EmployeeLoanAdvance' });

module.exports = mongoose.model('EmployeeLoanAdvance', employeeLoanAdvanceSchema);
