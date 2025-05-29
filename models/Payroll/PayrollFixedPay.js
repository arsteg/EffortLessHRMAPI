const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var payrollFixedPaySchema = new Schema({
  payrollUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollFNFUsers',
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
  collection: 'PayrollFixedPay',
  validate: {
    validator: function () {
      return this.fixedDeduction || this.fixedAllowance;
    },
    message: 'Either fixedDeduction or fixedAllowance must be provided.'
  }
});

payrollFixedPaySchema.pre(/^find/, async function (next) {
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

module.exports = mongoose.model('PayrollFixedPay', payrollFixedPaySchema);