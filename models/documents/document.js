var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var documentSchema = new Schema({
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'DocumentCategory'
    },
    description: {
      type: String
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'Document' });
  module.exports = mongoose.model('Document', documentSchema);
  