const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctctemplateVariableDeductionSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  variableDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableDeduction',
    required: true
  },
  criteria: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  valueType: [{
    type: String
  }],
  minimumAmount: {
    type: Number,
    required: true
  }
}, { collection: 'CTCTemplateVariableDeduction' });

ctctemplateVariableDeductionSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'variableDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating variable deductions:", error);
  }
  next();
});

module.exports = mongoose.model('CTCTemplateVariableDeduction', ctctemplateVariableDeductionSchema);
