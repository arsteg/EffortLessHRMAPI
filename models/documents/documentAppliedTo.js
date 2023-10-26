var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var documentAppliedToSchema = new Schema({
    document: {
      type: mongoose.Schema.ObjectId,
      ref: 'Document'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }, { collection: 'DocumentAppliedTo' });
  
  module.exports = mongoose.model('DocumentAppliedTo', documentAppliedToSchema);
  