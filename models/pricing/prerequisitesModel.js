var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var prerequisitesModelSchema = new Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan'
  },
  offer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Offer'
  }
  }, { collection: 'PrerequisitesModel' });

module.exports = mongoose.model('PrerequisitesModel', prerequisitesModelSchema);
