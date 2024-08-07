const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeIncomeTaxDeclarationComponentSchema = new Schema({
  incomeTaxComponent: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  maximumAmount: {
    type: Number,
    required: true
  },
  appliedAmount: {
    type: Number,
    required: true
  },
  approvedAmount: {
    type: Number,
    required: true
  },
  approvalStatus: {
    type: String,
    required: true
  },
  remark: {
    type: String
  },
  attachment: {
    type: String
  },
  employeeIncomeTaxDeclaration: {
    type: mongoose.Schema.ObjectId,
    ref: 'EmployeeIncomeTaxDeclaration',
    required: true
  }
}, { collection: 'EmployeeIncomeTaxDeclarationComponent' });

module.exports = mongoose.model('EmployeeIncomeTaxDeclarationComponent', employeeIncomeTaxDeclarationComponentSchema);
