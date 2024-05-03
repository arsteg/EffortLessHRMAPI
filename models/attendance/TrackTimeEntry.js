var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackTimeEntrySchema = new Schema({
  timeEntry: {
    type: mongoose.Schema.ObjectId,
    ref: 'TimeEntry',
    required: true
  },
  fromTime: {
    type: String,
    required: true
  },
  toTime: {
    type: String,
    required: true
  },
  totalTime: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  trackTimeEntries:[]
}, { collection: 'TrackTimeEntry' });

module.exports = mongoose.model('TrackTimeEntry', trackTimeEntrySchema);
