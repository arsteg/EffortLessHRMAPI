var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assetStatusSchema = new Schema({
  statusName: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'AssetStatus' });
module.exports = mongoose.model('AssetStatus', assetStatusSchema);
