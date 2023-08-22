var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vendorAssetsPurchasedSchema = new Schema({
  Asset: {
    type: mongoose.Schema.ObjectId,
    ref: 'Asset',  // Assuming the reference is to an Asset schema
    required: true
  },
  Vendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vendor',  // Assuming the reference is to a Vendor schema
    required: true
  }
}, { collection: 'VendorAssetsPurchased' });

module.exports = mongoose.model('VendorAssetsPurchased', vendorAssetsPurchasedSchema);
