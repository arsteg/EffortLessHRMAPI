var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userGroupTypeSchema = new Schema({
  typeName: {
    type: String,
    required: true
  },
  membersMin: {
    type: Number,
    required: true
  },
  membersMax: {
    type: Number,
    required: true
  }
}, { collection: 'userGroupType' });

module.exports = mongoose.model('userGroupType', userGroupTypeSchema);
