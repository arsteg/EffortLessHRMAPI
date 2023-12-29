var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var planOfferSchema = new Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: true
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer',
    required: true
  }
  }, { collection: 'PlanOffer' });

module.exports = mongoose.model('PlanOffer', planOfferSchema);
