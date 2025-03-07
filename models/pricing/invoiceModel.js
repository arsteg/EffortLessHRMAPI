var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  subscription_id:{
    type: String,
    required: true
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
    // required: true
  },
  planHistory: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlanHistory',
    // required: true
  },
  invoicePeriodStartDate: {
    type: Date,
    // required: true
  },
  invoicePeriodEndDate: {
    type: Date,
    // required: true
  },
  description: {
    type: String,
    // required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    // required: true
  },
  isPaid: {
    type: Boolean,
    required: true
  },
  invoice_id: {
    type: String,
    required: true
  },
  payment_info: {
    type: Object
  },
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  }
}, { collection: 'Invoice' });

module.exports = mongoose.model('Invoice', invoiceSchema);
