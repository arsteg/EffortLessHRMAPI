var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentEmployerContributionSchema = new Schema({  
  employerContribution: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedContribution',
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
}, { collection: 'SalaryComponentEmployerContribution' });
salaryComponentEmployerContributionSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'employerContribution',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentEmployerContribution', salaryComponentEmployerContributionSchema);
