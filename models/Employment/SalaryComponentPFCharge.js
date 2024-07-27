var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentPFChargeSchema = new Schema({  
  pfCharge: {
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
}, { collection: 'SalaryComponentPFCharge' });

module.exports = mongoose.model('SalaryComponentPFCharge', salaryComponentPFChargeSchema);
