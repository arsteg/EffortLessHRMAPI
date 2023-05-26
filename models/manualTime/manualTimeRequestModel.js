var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var manualTimeRequestSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },  
  date: {
    type: Date,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
    //required: [true, 'User must belong to a User']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  manager:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  task:{
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  status:{
    type:String,   
  },
  reason:{
    type:String,   
  },
  createdOn: {
    type: Date,
    required: true    
  },
  updatedOn: {
    type: Date,
    required: true    
  },  
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
  //  required: [true, 'User must belong to a User']
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
    //required: [true, 'User must belong to a User']
  },
}, { collection: 'manualTimeRequest' });
module.exports = mongoose.model('manualTimeRequest', manualTimeRequestSchema);
