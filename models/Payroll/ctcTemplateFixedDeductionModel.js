const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctctemplateFixedDeductionSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  fixedDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedDeduction',
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
  valuesOnCategory: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'  // Assuming you will have a Category schema to reference
  }],
  minimumAmount: {
    type: Number,
    required: true
  }
}, { collection: 'CTCTemplateFixedDeduction' });
ctctemplateFixedDeductionSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'fixedDeduction',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed deductions:", error);
  }
  next();
});
module.exports = mongoose.model('CTCTemplateFixedDeduction', ctctemplateFixedDeductionSchema);