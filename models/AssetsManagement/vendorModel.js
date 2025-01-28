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
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']  // Assuming you want to validate the email address
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/ // Example: Ensures a 10-digit phone number
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'Vendor' });

module.exports = mongoose.model('Vendor', vendorSchema);
