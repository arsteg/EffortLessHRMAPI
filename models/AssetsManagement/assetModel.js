var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetSchema = new Schema({  
  assetType: {
    type: mongoose.Schema.ObjectId,
    ref: 'AssetType',  // Assuming the reference is to an AssetType schema
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  assetName: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyExpiry: {
    type: Date    
  },
  status: {
    type: mongoose.Schema.ObjectId,
    ref: 'AssetStatus',  // Assuming the reference is to an AssetStatus schema
    required: true
  },    
  image: {
    type: String    
  }
}, { collection: 'Asset' });

module.exports = mongoose.model('Asset', assetSchema);
