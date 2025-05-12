const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSalutatoryDetailsSchema = new Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User schema assuming it exists
      required: true
    },
  isEmployeeEligibleForPFDeduction: {
    type: Boolean,
    default: false
  },
  isEmployerPFCappedAtPFCeiling: {
    type: Boolean,
    default: false
  },
  isEmployeePFCappedAtPFCeiling: {
    type: Boolean,
    default: false
  },
  providentFundJoiningDate: {
    type: Date
  },
  providentFundNumber: {
    type: Number
  },
  UANNumber: {
    type: Number
  },
  fixedAmountForYourProvidentFundWage: {
    type: Number,
    default: 0
  },
  additionalPFContributionInPercentage: {
    type: Number,
    default: 0
  },
  isESICDeductedFromSalary: {
    type: Boolean,
    default: false
  },
  ESICNumber: {
    type: String
  },
  isTaxDeductedFromPlayslip: {
    type: Boolean,
    default: false
  },
  isLWFDeductedFromPlayslip: {
    type: Boolean,
    default: false
  },
  isIncomeTaxDeducted: {
    type: Boolean,
    default: false
  },  
  isGratuityEligible: {
    type: Boolean,
    default: false
  },
  isComeUnderGratuityPaymentAct: {
    type: Boolean,
    default: false
  },
  taxRegime: {
    type: String,
    default: false
  },
  taxRegimeUpdated: {
    type: Date
  },
  taxRegimeUpdatedBy: {
    type: String
  },
  roundOffApplicable: {
    type: Boolean,
    default: false
  },
  dailyWageApplicable: {
    type: Boolean,
    default: false
  },
  eligibleForOvertime: {
    type: Boolean,
    default: false
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'EmployeeSalutatoryDetails' });

module.exports = mongoose.model('EmployeeSalutatoryDetails', employeeSalutatoryDetailsSchema);
