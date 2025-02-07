var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ctctemplateEmployeeDeductionSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  employeeDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedContribution',
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { collection: 'CTCTemplateEmployeeDeduction' });
ctctemplateEmployeeDeductionSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'employeeDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating employee deductions:", error);
  }
  next();
});
module.exports = mongoose.model('CTCTemplateEmployeeDeduction', ctctemplateEmployeeDeductionSchema);
