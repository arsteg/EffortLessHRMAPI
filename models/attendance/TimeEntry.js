var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeEntrySchema = new Schema({
  duration: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  trackTimeEntries: []
}, { collection: 'TimeEntry' });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
