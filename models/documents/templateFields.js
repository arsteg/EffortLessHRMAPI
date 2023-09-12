var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var templateFieldsSchema = new Schema({
  tableName: {
    type: String
  },
  fieldName: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  }
}, { collection: 'TemplateFields' });
module.exports = mongoose.model('TemplateFields', templateFieldsSchema);
