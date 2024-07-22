var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentFixedAllowanceSchema = new Schema({  
  fixedAllowance: {
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
}, { collection: 'SalaryComponentFixedAllowance' });

module.exports = mongoose.model('SalaryComponentFixedAllowance', salaryComponentFixedAllowanceSchema);
