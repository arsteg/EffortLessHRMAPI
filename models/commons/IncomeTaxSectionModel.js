var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incomeTaxSectionSchema = new Schema({
  section: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'IncomeTaxSection' });

module.exports = mongoose.model('IncomeTaxSection', incomeTaxSectionSchema);
