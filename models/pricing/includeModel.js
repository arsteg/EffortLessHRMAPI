var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var includeSchema = new Schema({
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
  }, { collection: 'Include' });

module.exports = mongoose.model('Include', includeSchema);
