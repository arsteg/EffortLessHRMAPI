var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
    required: true
  },
  planHistory: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlanHistory',
    required: true
  },
  invoicePeriodStartDate: {
    type: Date,
    required: true
  },
  invoicePeriodEndDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  IsPaid: {
    type: Boolean,
    required: true
  }
}, { collection: 'Invoice' });

module.exports = mongoose.model('Invoice', invoiceSchema);
