var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var documentUsersSchema = new Schema({
    document: {
      type: mongoose.Schema.ObjectId,
      ref: 'Document'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }, { collection: 'DocumentUsers' });
  module.exports = mongoose.model('DocumentUsers', documentUsersSchema);
  