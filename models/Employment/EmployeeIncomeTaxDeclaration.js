const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeIncomeTaxDeclarationSchema = new Schema({
  financialYear: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  incomeTaxDeclarationComponent: [],
  incomeTaxDeclarationHRA: []
}, { collection: 'EmployeeIncomeTaxDeclaration' });

module.exports = mongoose.model('EmployeeIncomeTaxDeclaration', employeeIncomeTaxDeclarationSchema);
