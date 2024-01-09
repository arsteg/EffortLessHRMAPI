var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userInGroupSchema = new Schema({
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
}, { collection: 'UserInGroup' });

module.exports = mongoose.model('UserInGroup', userInGroupSchema);
