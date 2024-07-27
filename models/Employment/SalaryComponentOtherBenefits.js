var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentOtherBenefitsSchema = new Schema({  
  otherBenefits: {
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
}, { collection: 'SalaryComponentOtherBenefits' });

module.exports = mongoose.model('SalaryComponentOtherBenefits', salaryComponentOtherBenefitsSchema);
