var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ptConfigureStatesSchema = new Schema({
  state: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'PTConfigureStates' });

module.exports = mongoose.model('PTConfigureStates', ptConfigureStatesSchema);
