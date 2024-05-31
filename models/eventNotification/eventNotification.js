// models/EventNotification.js
const mongoose = require('mongoose');
const baseSchema = require('./baseSchema');
const { RecurringFrequency } = require('../enums');
const Schema = mongoose.Schema;

const eventNotificationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventNotificationType: {
    type: Schema.Types.ObjectId,
    ref: 'EventNotificationType',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    required: true
  },
recurringFrequency: {
    type: String,
    enum: Object.values(RecurringFrequency),
    required: function() { return this.isRecurring; }
  },
  leadTime: {
    type: Number,
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
});
eventNotificationSchema.add(baseSchema);
module.exports = mongoose.model('EventNotification', eventNotificationSchema);
