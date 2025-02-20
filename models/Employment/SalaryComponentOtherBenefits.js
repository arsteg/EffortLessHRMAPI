var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var salaryComponentOtherBenefitsSchema = new Schema({
  otherBenefits: {
    type: mongoose.Schema.ObjectId,
    ref: 'OtherBenefits',
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
salaryComponentOtherBenefitsSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'otherBenefits',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('SalaryComponentOtherBenefits', salaryComponentOtherBenefitsSchema);
