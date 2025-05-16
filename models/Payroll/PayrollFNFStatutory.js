
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFStatutorySchema = new Schema({
    payrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
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
    collection: 'PayrollFNFStatutory',
   });
     
module.exports = mongoose.model('PayrollFNFStatutory', payrollFNFStatutorySchema);