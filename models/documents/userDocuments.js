var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var userDocumentsSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: {
      type: String
    },
    date: {
      type: Date
    },
    url: {
      type: String
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'UserDocuments' });
  module.exports = mongoose.model('UserDocuments', userDocumentsSchema);
  