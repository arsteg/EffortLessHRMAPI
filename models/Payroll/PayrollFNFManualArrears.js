const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFManualArrearsSchema = new Schema({
    payrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
      required: true
    },
    manualArrears: {
      type: Number,
      required: true
    },
    arrearDays: {
      type: Number,
      required: true
    },
    lopReversalDays: {
      type: Number,
      required: true
    },
    salaryRevisionDays: {
      type: Number,
      required: true
    },
    lopReversalArrears: {
      type: Number,
      required: true
    },
    totalArrears: {
      type: Number,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollFNFManualArrears' });
     
module.exports = mongoose.model('PayrollFNFManualArrears', payrollFNFManualArrearsSchema);