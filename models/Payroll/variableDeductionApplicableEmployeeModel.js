const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variableDeductionApplicableEmployeeSchema = new Schema({
  variableAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableDeduction',  // Assuming the reference is to a GeneralSetting schema
    required: true
  },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a GeneralSetting schema
    required: true
  }
}, { collection: 'VariableDeductionApplicableEmployee' });

module.exports = mongoose.model('VariableDeductionApplicableEmployee', variableDeductionApplicableEmployeeSchema);
