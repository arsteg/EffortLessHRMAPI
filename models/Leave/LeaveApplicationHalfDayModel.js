var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveAplicationHalfDaysSchema = new Schema({  
  leaveApplication: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveAplication',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  dayHalf: {
    type: String,
    required: true
  }
}, { collection: 'LeaveAplicationHalfDays' });

module.exports = mongoose.model('leaveAplicationHalfDays', leaveAplicationHalfDaysSchema);
