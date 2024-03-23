const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overtimeInformationSchema = new Schema({
  Name: {
    type: String,
    required: true
  },
  OvertimeInformation: {
    type: String,
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
    type: String,
    required: true
  },
  FromTimeMinutes: {
    type: String,
    required: true
  },
  FromTimeTT: {
    type: String,
    required: true
  },
  ToTimeHour: {
    type: String,
    required: true
  },
  ToTimeMinutes: {
    type: String,
    required: true
  },
  ToTimeTT: {
    type: String,
    required: true
  },
  CutomMultiplier: {
    type: Number,
    required: true
  },
  CalculationType: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'OvertimeInformation' });

module.exports = mongoose.model('OvertimeInformation', overtimeInformationSchema);
