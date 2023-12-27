var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var advanceCategorySchema = new Schema({
  label: String,  
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'AdvanceCategory' });

module.exports = mongoose.model('AdvanceCategory', advanceCategorySchema);
