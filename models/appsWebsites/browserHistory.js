var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var browserHistory = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },  
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },  
  browser: {
    type: String,
    required:true
  },
  uri: {
    type: String,
    required:true 
  },
  title: {
    type: String    
  },
  lastVisitTime: {
    type: Date,
    required: true
  },
  visitCount: {
    type: Number,
    required: true
  }
}, { collection: 'browserHistory' });
module.exports = mongoose.model('browserHistory', browserHistory);
