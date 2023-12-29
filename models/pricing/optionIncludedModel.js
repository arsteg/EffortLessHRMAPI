var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionIncludedSchema = new Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan'
  },
  option: {
    type: mongoose.Schema.ObjectId,
    ref: 'Option'
  },
  dateAdded: {
    type: Date,
    required: true
  },
  dateRemoved: {
    type: Date,
    required: true
  } 
}, { collection: 'OptionIncluded' });

module.exports = mongoose.model('OptionIncluded', optionIncludedSchema);
