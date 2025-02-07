const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctctemplateFixedAllowanceSchema = new Schema({
  ctcTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'CTCTemplate',
    required: true
  },
  fixedAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedAllowances',
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
}, { collection: 'CTCTemplateFixedAllowance' });
ctctemplateFixedAllowanceSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'fixedAllowance',
      select: 'id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance:", error);
  }
  next();
});
module.exports = mongoose.model('CTCTemplateFixedAllowance', ctctemplateFixedAllowanceSchema);
