const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roundingInformationSchema = new Schema({
  roundingPatternName: {
    type: String,
    required: true
  },
  roundingPatternCode: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  roundingPatternMethod: {
    type: String,
    required: true
  },
  roundingPattern: {
    type: String,
    required: true
  },
  roundingValue: {
    type: Number,
    required: true
  },
  OTtypeApplicablePreOT: {
    type: String,
    required: true
  },
  PreOTValueMinutes: {
    type: String,
    required: true
  },
  PreOTValueHour: {
    type: String,
    required: true
  },
  OTtypeApplicablePostOT: {
    type: String,
    required: true
  },
  PostOTValueHour: {
    type: String,
    required: true
  },
  PostOTValueMinutes: {
    type: String,
    required: true
  },
  OTtypeApplicableWeekOff: {
    type: String,
    required: true
  }
}, { collection: 'RoundingInformation' });

module.exports = mongoose.model('RoundingInformation', roundingInformationSchema);
