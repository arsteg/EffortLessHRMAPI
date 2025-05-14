const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixedAllowancesSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  // type: {
  //   type: String,
  //   required: true
  // },
  // isArrearsAffect: {
  //   type: Boolean,
  //   default: false
  // },
  // calculatedBy: {
  //   type: String,
  //   required: true
  // },
  // isTaxEnabledOnce: {
  //   type: Boolean,
  //   default: false
  // },
  isProvidentFundAffected: {
    type: Boolean,
    default: false
  },
  isESICAffected: {
    type: Boolean,
    default: false
  },
  isGratuityFundAffected: {
    type: Boolean,
    default: false
  },
  isLWFAffected: {
    type: Boolean,
    default: false
  },
  isProfessionalTaxAffected: {
    type: Boolean,
    default: false
  },
  isTDSAffected: {
    type: Boolean,
    default: false
  },
  isDelete: {
    type: Boolean,
    default: true
  },
  // isAttendanceToEffectTheEligibility: {
  //   type: Boolean,
  //   default: false
  // },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'FixedAllowances' });

module.exports = mongoose.model('FixedAllowances', fixedAllowancesSchema);
