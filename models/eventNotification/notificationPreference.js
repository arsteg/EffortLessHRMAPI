// models/NotificationPreference.js
const mongoose = require('mongoose');
const baseSchema = require('./baseSchema');
const { NotificationChannel } = require('../enums');
const Schema = mongoose.Schema;

const notificationPreferenceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },  
  channel: {
    type: String,
    enum: Object.values(NotificationChannel)    
  },
  DNDOn: {
    type: Boolean,
    required: true
  },
  doNotDisturbStart: {
    type: Date,
    required: function() { return this.DNDOn; }
  },
  doNotDisturbEnd: {
    type: Date,
    required: function() { return this.DNDOn; }
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
});

notificationPreferenceSchema.add(baseSchema);
module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
