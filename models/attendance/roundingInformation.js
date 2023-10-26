const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roundingInformationSchema = new Schema({
  roundingPatternName: {
    type: String,
    required: true,
  },
  roundingPatternCode: {
    type: String,
    required: true,
  },
  shift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',
  },
  roundingPatternMethod: {
    type: String,
    required: true,
  },
  roundingPattern: {
    type: String,
    required: true,
  },
  roundingValue: {
    type: Number,
    required: true,
  },
  OTtypeApplicable: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'RoundingInformation' });

module.exports = mongoose.model('RoundingInformation', roundingInformationSchema);
