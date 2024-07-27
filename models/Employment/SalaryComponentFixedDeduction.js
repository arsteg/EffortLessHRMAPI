var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentFixedDeductionSchema = new Schema({  
  fixedDeduction: {
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
}, { collection: 'SalaryComponentFixedDeduction' });

module.exports = mongoose.model('SalaryComponentFixedDeduction', salaryComponentFixedDeductionSchema);
