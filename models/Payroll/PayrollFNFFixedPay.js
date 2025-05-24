const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var payrollFNFFixedPaySchema = new Schema({
  payrollFNFUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUser',
    required: true
  },
  fixedDeduction: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedDeduction'
  },
  fixedAllowance: {
    type: mongoose.Schema.ObjectId,
    ref: 'FixedAllowances'
  },
  amount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  collection: 'PayrollFNFFixedPay',
  validate: {
    validator: function () {
      return this.fixedDeduction || this.fixedAllowance;
    },
    message: 'Either fixedDeduction or fixedAllowance must be provided.'
  }
});

payrollFNFFixedPaySchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'fixedAllowance',
      select: '_id label'
    });
    this.populate({
      path: 'fixedDeduction',
      select: '_id label'
    });
  } catch (error) {
    console.error("Error populating fixed allowance or deduction:", error);
  }
  next();
});

module.exports = mongoose.model('PayrollFNFFixedPay', payrollFNFFixedPaySchema);