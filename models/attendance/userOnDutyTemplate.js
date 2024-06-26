const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userOnDutyTemplateSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  onDutyTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'OnDutyTemplate',
    required: true,
  }, 
  effectiveFrom: {
    type: Date,
    required: true
  },
  primaryApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  secondaryApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
}, { collection: 'UserOnDutyTemplate' });

module.exports = mongoose.model('UserOnDutyTemplate', userOnDutyTemplateSchema);
