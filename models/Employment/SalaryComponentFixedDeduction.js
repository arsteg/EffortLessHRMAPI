var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentFixedDeductionSchema = new Schema({  
  fixedDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedDeduction',
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
salaryComponentFixedDeductionSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'fixedDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentFixedDeduction', salaryComponentFixedDeductionSchema);
