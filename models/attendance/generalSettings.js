const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const generalSettingsSchema = new Schema({
  canSelectRegularizationReason: {
    type: Boolean,
    required: true,
  },
  canSelectOnDutyReason: {
    type: Boolean,
    required: true,
  },
  shiftAssignmentsBasedOnRoster: {
    type: Boolean,
    required: true,
  },
  regularizationRequestandLeaveApplicationBlockedForUser:{
    type: Boolean,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'GeneralSettings' });

module.exports = mongoose.model('GeneralSettings', generalSettingsSchema);
