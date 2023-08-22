var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vendorSchema = new Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true  // Assuming you want each vendorId to be unique
  },
  vendorName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'Vendor' });

module.exports = mongoose.model('Vendor', vendorSchema);
