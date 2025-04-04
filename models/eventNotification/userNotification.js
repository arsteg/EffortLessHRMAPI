// models/UserNotification.js
const mongoose = require('mongoose');
const baseSchema = require('./baseSchema');
const { NotificationStatus } = require('../eventNotification/enums');
const Schema = mongoose.Schema;

const userNotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notification: {
    type: Schema.Types.ObjectId,
    ref: 'EventNotification',
    required: true
  }
});

userNotificationSchema.add(baseSchema);
module.exports = mongoose.model('UserNotification', userNotificationSchema);
