const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctctemplateVariableAllowanceSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  variableAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableAllowance',
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
    type: String
  },
}, { collection: 'CTCTemplateVariableAllowance' });
ctctemplateVariableAllowanceSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'variableAllowance',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed deductions:", error);
  }
  next();
});
module.exports = mongoose.model('CTCTemplateVariableAllowance', ctctemplateVariableAllowanceSchema);
