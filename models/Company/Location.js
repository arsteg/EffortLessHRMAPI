const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  locationCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  providentFundRegistrationCode: {
    type: String
  },
  esicRegistrationCode: {
    type: String
  },
  professionalTaxRegistrationCode: {
    type: String
  },
  lwfRegistrationCode: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'Location' });

module.exports = mongoose.model('Location', locationSchema);
