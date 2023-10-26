const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRegularizationReasonSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  regularizationReason: {
    type: mongoose.Schema.ObjectId,
    ref: 'RegularizationReason',
    required: true,
  },
}, { collection: 'UserRegularizationReason' });

module.exports = mongoose.model('UserRegularizationReason', userRegularizationReasonSchema);
