var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
  name: {
    type: String,
    required: true
  }
}, { collection: 'Option' });

module.exports = mongoose.model('Option', optionSchema);
