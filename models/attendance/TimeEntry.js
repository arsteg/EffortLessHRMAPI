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
    type: String,
    required: true
  },
  task: {
    type: String,
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
  }
}, { collection: 'TimeEntry' });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
