var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inGroupSchema = new Schema({
  userGroup: {
    type: mongoose.Schema.ObjectId,
    ref: 'UserGroupType',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
  }, { collection: 'InGroup' });

module.exports = mongoose.model('InGroup', inGroupSchema);
