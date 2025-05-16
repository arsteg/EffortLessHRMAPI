const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSalaryTaxAndStatutorySettingSchema = new Schema({
  employeeSalaryDetails: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeSalaryDetails',
    required: true
  },
  isVariableAllowancePartOfCTC: {
    type: Boolean,
    default: false
  },
  isPFDeduction: {
    type: Boolean,
    default: false
  },
  isProvidentPensionDeduction: {
    type: Boolean,
    default: false
  },
  isEmployeePFCappedAtPFCeiling: {
    type: Boolean,
    default: false
  },
  isEmployerPFCappedAtPFCeiling: {
    type: Boolean,
    default: false
  },
  fixedAmountForProvidentFundWage: {
    type: Number,
    default: 0
  },
  pfTemplate: {
    type: String,
    default: ''
  },
  isESICDeduction: {
    type: Boolean,
    default: false
  },
  isPTDeduction: {
    type: Boolean,
    default: false
  },
  isLWFDeduction: {
    type: Boolean,
    default: false
  },
  isGratuityApplicable: {
    type: Boolean,
    default: false
  },
  gratuityTemplate: {
    type: String,
    default: ''
  },
  isIncomeTaxDeduction: {
    type: Boolean,
    default: false
  },
  isPFChargesApplicable: {
    type: Boolean,
    default: false
  },
  isRoundOffApplicable: {
    type: Boolean,
    default: false
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'EmployeeSalaryTaxAndStatutorySetting' });

module.exports = mongoose.model('EmployeeSalaryTaxAndStatutorySetting', employeeSalaryTaxAndStatutorySettingSchema);
