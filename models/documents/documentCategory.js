var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var documentCategorySchema = new Schema({
    name: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'DocumentCategory' });
  module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
  