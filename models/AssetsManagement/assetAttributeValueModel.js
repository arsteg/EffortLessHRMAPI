var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetAttributeValueSchema = new Schema({
  assetId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Asset',  // Assuming the reference is to an Asset schema
    required: true
  },
  attributeId: {
    type: mongoose.Schema.ObjectId,
    ref: 'CustomAttribute',  // Assuming the reference is to a CustomAttribute schema
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { collection: 'AssetAttributeValue' });

module.exports = mongoose.model('AssetAttributeValue', assetAttributeValueSchema);
