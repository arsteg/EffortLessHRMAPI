const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var attendanceProcessUersSchema = new Schema({
  attendanceProcess: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceProcess',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true
  }
  }, { collection: 'AttendanceProcessUsers' });

 attendanceProcessUersSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'user',
      select: 'id firstName lastName'
    })
    next();
  });
  module.exports = mongoose.model('AttendanceProcessUsers', attendanceProcessUersSchema);

