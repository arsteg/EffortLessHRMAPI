var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var planHistorySchema = new Schema({
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
    required: true
  },
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  } 
}, { collection: 'PlanHistory' });

module.exports = mongoose.model('PlanHistory', planHistorySchema);
