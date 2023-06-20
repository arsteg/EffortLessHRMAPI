var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var taskAttachmentsModelSchema = new Schema({ 
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: [true, 'Task must belong to a Task']
  },
  attachmentName:{
    type:String
  },
  extention:{
    type:String
  },
  attachmentType:{
    type:String
  },
  attachmentSize:{
    type:Number
  },
  filePath:{
    type:String
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
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    required: false
  },
  url: {
    type: String,
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'User must belong to a User']
  },
  status:
  {
    type: String
  }
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  { collection: 'TaskAttachments' });


  taskAttachmentsModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'company',
      select: 'companyName'
    }).populate({
      path: 'createdBy',
      select: 'firstName'
    }).populate({
      path: 'updatedBy',
      select: 'firstName'
    }).populate({
      path: 'task',
      select: 'taskName'
    }).populate({
      path: 'comment',
      select: 'content'
    });
    next();
  });

module.exports = mongoose.model('TaskAttachments', taskAttachmentsModelSchema);