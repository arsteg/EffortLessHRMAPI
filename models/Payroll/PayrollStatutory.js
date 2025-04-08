
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollStatutorySchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    fixedContribution: {
      type: mongoose.Schema.ObjectId,
      ref: 'FixedContribution'
    },
    fixedDeduction: {
      type: mongoose.Schema.ObjectId,
      ref: 'FixedDeduction'
    },
    ContributorType: {
      type: String,
      required: true
    },
    StautoryName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
    
  }, { 
    collection: 'PayrollVariablePay',
   });
     
module.exports = mongoose.model('PayrollStatutory', payrollStatutorySchema);