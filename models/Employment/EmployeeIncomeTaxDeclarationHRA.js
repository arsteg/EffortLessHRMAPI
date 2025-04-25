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
  },
  documentLink: {
    type: String
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'IncomeTaxSection'
  },
  employeeIncomeTaxDeclarationAttachments:{
    type: Array
  }
}, { collection: 'EmployeeIncomeTaxDeclarationHRA' });

employeeIncomeTaxDeclarationHRASchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'section',
      select: 'id section isHRA'
    });
  } catch (error) {
    console.error("Error populating section:", error);
  }
  next();
});

module.exports = mongoose.model('EmployeeIncomeTaxDeclarationHRA', employeeIncomeTaxDeclarationHRASchema);
