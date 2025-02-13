var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeLogCheckInOutSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required.']
  },
  checkInTime: {
    type: Date,
    required: true
},
checkOutTime: {
    type: Date
},
latitude: {
    type: Number,
    required: true
},
longitude: {
    type: Number,
    required: true
},
  date: {
    type: Date,
    required: true
  },
}, { collection: 'TimeLogCheckInOut' });

module.exports = mongoose.model('TimeLogCheckInOut', timeLogCheckInOutSchema);
