const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dutyRequestSchema = new Schema({
  onDutyReason: {
    type: mongoose.Schema.ObjectId,
    ref: 'OnDutyReason',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
}, { collection: 'DutyRequest' });

module.exports = mongoose.model('DutyRequest', dutyRequestSchema);
