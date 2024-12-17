var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var planSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  planId:{
    type: String
  },
  software: {
    type: mongoose.Schema.ObjectId,
    ref: 'Software'
  },
  currentprice: {
    type: Number,
    required: true
  },
  IsActive: {
    type: Boolean,
    required: true
  },
  softwares:[]
}, { collection: 'Plan' });

module.exports = mongoose.model('Plan', planSchema);
