const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftTemplateAssignmentSchema = new Schema({
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'ShiftTemplateAssignment' });

shiftTemplateAssignmentSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'template',
      select: 'id name minHoursPerDayToGetCreditForFullDay minHoursPerDayToGetCreditforHalfDay isHalfDayApplicable'
    })
  } catch (error) {
    console.error("Error populating fixed deductions:", error);
  }
  next();
});
module.exports = mongoose.model('ShiftTemplateAssignment', shiftTemplateAssignmentSchema);
