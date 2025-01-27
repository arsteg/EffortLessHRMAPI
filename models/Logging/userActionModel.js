var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userActionLog = new Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'Action must belong to an User']
  },
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'companies',
    required: [true, 'Action must belong to a Company']
  },
  oldStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  },
  action: {
    type: String,
  },
  timestamp: {
    type: Date,
    required: true
  }
}, { collection: 'UserActionLog' });

module.exports = mongoose.model('UserActionLog', userActionLog);