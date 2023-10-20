const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const separationTemplateSettingsSchema = new Schema({
  templateName: {
    type: String,
    required: true
  },
  noticePeriod: {
    type: String,
    required: true
  },
  leaveAllowedInNoticePeriod: {
    type: Boolean,
    required: true,
    default: false // Default value is set to false, change it as per your requirement
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
}
}, { collection: 'SeparationTemplateSettings' });

module.exports = mongoose.model('SeparationTemplateSettings', separationTemplateSettingsSchema);
