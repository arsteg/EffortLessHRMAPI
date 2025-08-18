const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollGeneralSettingSchema = new Schema({
  dayOfMonthToRunPayroll: {
    type: String,
    required: true
  },
  payrollApprovar: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  isPasswordForSalaryRegister: {
    type: Boolean,
    required: true
  },
  isGraduityEligible: {
    type: Boolean,
    required: true
  },
  percentageForGraduity: {
    type: String
  },  
  isAllowTDSFromEffortlessHRM: {
    type: Boolean,
    required: true
  },
  isAllowToCalculateOvertime: {
    type: Boolean,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'PayrollGeneralSetting' });

module.exports = mongoose.model('PayrollGeneralSetting', payrollGeneralSettingSchema);
