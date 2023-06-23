var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var taskModelSchema = new Schema({ 
  taskName: {
    type: String,
    required: true,
    unique: true
   },
   title: {
    type: String,
    required: true    
   },
   description: {
    type: String    
   },
   startDate: {
    type: Date 
  },
  endDate: {
    type: Date   
  },
  description:{
    type:String
  },
  comment:{
    type:String
  },
  isSubTask:{
    type:Boolean
  },
  parentTaskId:{
    type:String
  },
  priority:{
    type:String
  },  
  taskNumber:{
    type:Number,
    required: true
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
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company must belong to a Company']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: [true, 'Project must belong to a Project']
  },
  parentTask: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  },
  TaskUsers:[],
  status:
  {
    type: String
  },
  isDeleted:
  {
    type: Boolean
  },
  estimate:{
    type: Number
  },
  timeTaken:{
    type: Number
  },
  dueDate:{
    type: Date
  }, 
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  { collection: 'Task' });


  taskModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'company',
      select: 'companyName'
    }).populate({
      path: 'createdBy',
      select: 'firstName lastName'
    }).populate({
      path: 'updatedBy',
      select: 'firstName lastName'
    }).populate({
      path: 'project',
      select: 'projectName'
    });
    next();
  });
  taskModelSchema.virtual('taskAttachments', {
    ref: 'TaskAttachments',
    foreignField: 'task', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  taskModelSchema.virtual('taskUsers', {
    ref: 'TaskUsers',
    foreignField: 'task', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  taskModelSchema.virtual('timeLog', {
    ref: 'TimeLog',
    foreignField: 'task', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  taskModelSchema.virtual('comments', {
    ref: 'Comments',
    foreignField: 'task', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
module.exports = mongoose.model('Task', taskModelSchema);