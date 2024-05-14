var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ptSlabSchema = new Schema({  
  fromAmount: {
    type: String,
    required: true
  },
  toAmount: {
    type: String,
    required: true
  },
  employeePercentage: {
    type: Number,
    required: true
  },
  employeeAmount: {
    type: Number,
    required: true
  },
  twelfthMonthValue: {
    type: Number,
    required: true
  },
  twelfthMonthAmount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming there's a Company schema for reference
    required: true
  }
}, { collection: 'PTSlab' });

module.exports = mongoose.model('PTSlab', ptSlabSchema);
