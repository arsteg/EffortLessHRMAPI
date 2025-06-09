const mongoose = require('mongoose');
const baseSchema = require('./baseSchema');
const { RecurringFrequency } = require('../eventNotification/enums');
const Schema = mongoose.Schema;
const { NotificationStatus, NotificationChannel } = require('../eventNotification/enums'); // Corrected import path

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
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  navigationUrl: {
    type: String,
    required: false
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
  status: {
    type: String,
    enum: Object.values(NotificationStatus), // Corrected typo
    required: true,
     default: 'unread'
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  notificationChannel: {
    type: [String],
    enum: Object.values(NotificationChannel),
    required: true,
    default: [NotificationChannel.UI]
  }
});
eventNotificationSchema.add(baseSchema);
module.exports = mongoose.model('eventNotification', eventNotificationSchema);
