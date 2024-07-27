var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentEmployerContributionSchema = new Schema({  
  employerContribution: {
    type: String,
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

module.exports = mongoose.model('SalaryComponentEmployerContribution', salaryComponentEmployerContributionSchema);
