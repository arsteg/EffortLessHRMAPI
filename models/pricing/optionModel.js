var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
  name: {
    type: String,
    required: true
  }, 
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  }
}, { collection: 'Option' });

module.exports = mongoose.model('Option', optionSchema);
