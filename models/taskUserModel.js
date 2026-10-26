var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var taskUsersModelSchema = new Schema({ 
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: [true, 'Task must belong to a Task']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true,
    required: [true, 'User must belong to a User']
  },
  // TM-011: a task has exactly one primary "owner" (the accountable assignee)
  // plus zero or more "watchers" (collaborators who also see the task in their
  // "My Tasks" list). Legacy rows created before this field existed have no
  // `role`; controller logic treats a missing role as 'owner' so historical
  // single-assignee tasks keep their assignee as the owner.
  role: {
    type: String,
    enum: ['owner', 'watcher'],
    default: 'owner'
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
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'//,
    //required: [true, 'User must belong to a User']
  },  
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  { collection: 'TaskUsers' });

  taskUsersModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'user',
      select: 'firstName lastName'
    });
    next();
  });

module.exports = mongoose.model('TaskUsers', taskUsersModelSchema);