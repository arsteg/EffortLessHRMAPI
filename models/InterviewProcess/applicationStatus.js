var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var applicationStatusSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  }
}, { collection: 'ApplicationStatus' });

module.exports = mongoose.model('ApplicationStatus', applicationStatusSchema);
