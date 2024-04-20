var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var designationSchema = new Schema({
  designation: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'Designation' });

module.exports = mongoose.model('Designation', designationSchema);
