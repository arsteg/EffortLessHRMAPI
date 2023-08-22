var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetSchema = new Schema({
  assetId: {
    type: String,
    required: true,
    unique: true  // Assuming you want each assetId to be unique
  },
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
    type: Date,
    required: true
  },
  status: {
    type: mongoose.Schema.ObjectId,
    ref: 'AssetStatus',  // Assuming the reference is to an AssetStatus schema
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
}, { collection: 'Asset' });

module.exports = mongoose.model('Asset', assetSchema);
