const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overtimeInformationSchema = new Schema({
  Name: {
    type: String,
    required: true
  },
  RoundingInformation: {
    type: String,
    ref: 'RoundingInformation',
    required: true
  },
  BaseType: {
    type: String,
    required: true
  },
  AttandanceShift: {
    type: String,
    required: true
  },
  FromTimeHour: {
    type: String
  },
  FromTimeMinutes: {
    type: String
  },
  FromTimeTT: {
    type: String
  },
  ToTimeHour: {
    type: String
  },
  ToTimeMinutes: {
    type: String
  },
  ToTimeTT: {
    type: String
  },
  CutomMultiplier: {
    type: Number,
    required: true
  },
  CalculationType: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'OvertimeInformation' });

module.exports = mongoose.model('OvertimeInformation', overtimeInformationSchema);
