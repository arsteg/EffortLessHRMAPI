var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var signatorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'Signatory' });

module.exports = mongoose.model('Signatory', signatorySchema);
