var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var customAttributeSchema = new Schema({
  attributeName: {
    type: String,
    required: true
  },
  assetType: {
    type: mongoose.Schema.ObjectId,
    ref: 'AssetType',  // Assuming the reference is to an AssetType schema
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',  // Assuming the reference is to a Company schema
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    required: true
  }
}, { collection: 'CustomAttribute' });

module.exports = mongoose.model('CustomAttribute', customAttributeSchema);
