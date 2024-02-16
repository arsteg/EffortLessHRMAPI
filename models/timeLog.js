var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeLogSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a user']
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: [true, 'Task must belong to a project']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  filePath: {
    type: String    
  },
  fileString: {
    type: String,
    required: false
  },
  keysPressed: {
    type: Number,
    required: false
  },
  allKeysPressed: {
    type: String,
    required: false
  },
  clicks: {
    type: Number,
    required: false
  },
  scrolls: {
    type: Number,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  isManualTime: {
    type: Boolean,
    required: false
  }

}, { collection: 'TimeLog' });
timeLogSchema.pre(/^find/,async function(next) {
  this.populate({
    path: 'task',
    select: 'taskName'
  }).populate({
    path: 'project',
    select: 'projectName'
  }).populate({
    path: 'user',
    select: 'firstName lastName'
  });
  next();
});
module.exports = mongoose.model('TimeLog', timeLogSchema);
