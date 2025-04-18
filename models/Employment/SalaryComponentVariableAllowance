var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentVariableAllowanceSchema = new Schema({  
  variableAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableAllowance',
    required: true
  },
  monthlyAmount: {
    type: Number,
    required: true
  },
  yearlyAmount: {
    type: Number,
    required: true
  },
  employeeSalaryDetails: {
    type: mongoose.Schema.ObjectId,
    ref: 'EmployeeSalaryDetails',  // Assuming there is an EmployeeSalaryDetails schema
    required: true
  }
}, { collection: 'SalaryComponentVariableAllowance' });
salaryComponentVariableAllowanceSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'variableAllowance',
      select: 'id label isProvidentFundAffected isESICAffected isLWFAffected isIncomeTaxAffected isProfessionalTaxAffected deductIncomeTaxAllowance'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentVariableAllowance', salaryComponentVariableAllowanceSchema);
