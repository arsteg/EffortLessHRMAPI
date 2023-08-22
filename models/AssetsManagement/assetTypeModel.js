var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetTypeSchema = new Schema({
  typeName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'AssetType' });

module.exports = mongoose.model('AssetType', assetTypeSchema);
