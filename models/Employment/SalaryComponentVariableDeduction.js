var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentVariableDeductionSchema = new Schema({  
  variableDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableDeduction',
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
}, { collection: 'SalaryComponentVariableDeduction' });
salaryComponentVariableDeductionSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'variableDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentVariableDeduction', salaryComponentVariableDeductionSchema);
