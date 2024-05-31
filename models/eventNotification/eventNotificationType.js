
const mongoose = require('mongoose');
const baseSchema = require('./baseSchema');

const eventNotificationTypeSchema = new mongoose.Schema({
  name: {
   type:String
 },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
});
eventNotificationTypeSchema.add(baseSchema);
module.exports = mongoose.model('EventNotificationType', eventNotificationTypeSchema);

