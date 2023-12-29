var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var includeSchema = new Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan'
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer'
  }
  }, { collection: 'Include' });

module.exports = mongoose.model('Include', includeSchema);
