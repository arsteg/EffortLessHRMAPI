const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userOnDutyReasonSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  onDutyReason: {
    type: mongoose.Schema.ObjectId,
    ref: 'OnDutyReason',
    required: true,
  },
}, { collection: 'UserOnDutyReason' });

module.exports = mongoose.model('UserOnDutyReason', userOnDutyReasonSchema);
