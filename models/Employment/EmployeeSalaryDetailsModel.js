const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSalaryDetailsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User schema assuming it exists
    required: true
  },
  payrollEffectiveFrom: {
    type: Date,
    required: true
  },
  actualEffectiveDate: {
    type: Date,
    required: true
  },
  frequencyToEnterCTC: {
    type: String,
    required: true
  },
  CTCTemplate: {
    type: String,
    required: true
  },
  isEmployerPartInclusiveInSalaryStructure: {
    type: Boolean,
    required: true
  },
  enteringAmount: {
    type: String
  },
  CTCAmount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Reference to the Company schema assuming it exists
    required: true
  }
}, { collection: 'EmployeeSalaryDetails' });

module.exports = mongoose.model('EmployeeSalaryDetails', employeeSalaryDetailsSchema);
