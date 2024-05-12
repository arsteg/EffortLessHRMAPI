const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ptEligibleStatesSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  state: {
    type: String,
    required: true
  },
  isEligible: {
    type: Boolean,
    default: true // Assuming the default value for isEligible is true
  }
}, { collection: 'PTEligibleStates' });

module.exports = mongoose.model('PTEligibleStates', ptEligibleStatesSchema);
