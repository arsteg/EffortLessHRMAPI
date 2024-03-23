var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roundingInformationSchema = new Schema({
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
    type: String
  },
  PreOTValueHour: {
    type: String
  },
  OTtypeApplicablePostOT: {
    type: String,
    required: true
  },
  PostOTValueHour: {
    type: String
  },
  PostOTValueMinutes: {
    type: String
  },
  OTtypeApplicableWeekOFf: {
    type: String,
    required: true
  }
}, { collection: 'RoundingInformation' });

module.exports = mongoose.model('RoundingInformation', roundingInformationSchema);
