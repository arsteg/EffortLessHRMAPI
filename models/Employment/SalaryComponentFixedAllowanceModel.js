var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentFixedAllowanceSchema = new Schema({
  fixedAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedAllowances',
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
}, { collection: 'SalaryComponentFixedAllowance' });
salaryComponentFixedAllowanceSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'fixedAllowance',
      select: 'id label isProvidentFundAffected isESICAffected isGratuityFundAffected isLWFAffected isProfessionalTaxAffected isTDSAffected'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentFixedAllowance', salaryComponentFixedAllowanceSchema);
