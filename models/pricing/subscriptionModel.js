var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
  userGroupType: {
    type: mongoose.Schema.ObjectId,
    ref: 'UserGroupType',
    // required: true
  },
  trialPeriodStartDate: {
    type: Date,
    // required: true,
  },
  trialPeriodEndDate: {
    type: Date,
    // required: true,
  },
  subscriptionAfterTrial: {
    type: String,
    // required: true,
  },
  currentPlanId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: true
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer',
    // required: true
  },
  offerStartDate: {
    type: Date,
    // required: true,
  },
  offerEndDate: {
    type: Date,
    // required: true,
  },
  dateSubscribed: {
    type: Date,
    // required: true,
  },
  validTo: {
    type: Date,
    // required: true,
  },
  dateUnsubscribed: {
    type: Date,
    // required: true,
  },
  subscriptionId:{
    type: String
  },
  companyId: {
    type: String
  }
}, { collection: 'Subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
