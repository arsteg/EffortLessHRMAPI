const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bandSchema = new Schema({
  band: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'Band' });

module.exports = mongoose.model('Band', bandSchema);
