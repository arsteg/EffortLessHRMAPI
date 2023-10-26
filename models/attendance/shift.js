const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isOffShift: {
    type: Boolean,
    required: true,
  },
  shiftType: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isCheckoutTimeNextDay: {
    type: Boolean,
    required: true,
  },
  earliestArrival: {
    type: Date,
    required: true,
  },
  latestDeparture: {
    type: Date,
    required: true,
  },
  firstHalfDuration: {
    type: Date,
    required: true,
  },
  secondHalfDuration: {
    type: Date,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'Shift' });

module.exports = mongoose.model('Shift', shiftSchema);
