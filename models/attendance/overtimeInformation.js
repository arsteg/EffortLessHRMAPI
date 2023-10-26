const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overtimeInformationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  roundingPattern: {
    type: String,
    required: true,
  },
  baseType: {
    type: String,
  },
  attendanceShift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift',
  },
  customMultiplier: {
    type: Number,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'OvertimeInformation' });

module.exports = mongoose.model('OvertimeInformation', overtimeInformationSchema);
