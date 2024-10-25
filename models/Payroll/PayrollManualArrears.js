const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollManualArrearsSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
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
  }, { collection: 'PayrollManualArrears' });
     
module.exports = mongoose.model('PayrollManualArrears', payrollManualArrearsSchema);