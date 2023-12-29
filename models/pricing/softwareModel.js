var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var softwareSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  accessLink: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  }
}, { collection: 'Software' });

module.exports = mongoose.model('Software', softwareSchema);
