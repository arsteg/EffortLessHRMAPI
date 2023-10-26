const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const onDutyTemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isCommentMandatory: {
    type: Boolean,
    required: true,
  },
  canSubmitForMultipleDays: {
    type: Boolean,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { collection: 'OnDutyTemplate' });

module.exports = mongoose.model('OnDutyTemplate', onDutyTemplateSchema);
