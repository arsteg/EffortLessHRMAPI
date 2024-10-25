const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollLoanAdvanceSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    employeeLoanAdvance: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmployeeLoanAdvance',
      required: true
    },
    disbursementAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved'],
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollLoanAdvance' });
  module.exports = mongoose.model('PayrollLoanAdvance', payrollLoanAdvanceSchema);
  