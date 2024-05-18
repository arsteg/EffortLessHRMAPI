const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variableAllowanceApplicableEmployeeSchema = new Schema({
  variableAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'VariableAllowance',  // Assuming the reference is to a GeneralSetting schema
    required: true
  },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a GeneralSetting schema
    required: true
  }
}, { collection: 'VariableAllowanceApplicableEmployee' });

module.exports = mongoose.model('VariableAllowanceApplicableEmployee', variableAllowanceApplicableEmployeeSchema);
