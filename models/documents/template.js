var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var templateSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    content: {
      type: String
    },
    active: {
      type: Boolean
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'Template' });
  module.exports = mongoose.model('Template', templateSchema);
  