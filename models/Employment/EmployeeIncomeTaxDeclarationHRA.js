var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeIncomeTaxDeclarationHRASchema = new Schema({  
  employeeIncomeTaxDeclaration: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  rentDeclared: {
    type: Number,
    required: true
  },
  verifiedAmount: {
    type: Number,
    required: true
  },
  cityType: {
    type: String,
    required: true
  },
  landlordName: {
    type: String,
    required: true
  },
  landlordPan: {
    type: String,
    required: true
  },
  landlordAddress: {
    type: String,
    required: true
  },
  approvalStatus: {
    type: String,
    required: true
  }
}, { collection: 'EmployeeIncomeTaxDeclarationHRA' });

module.exports = mongoose.model('EmployeeIncomeTaxDeclarationHRA', employeeIncomeTaxDeclarationHRASchema);
