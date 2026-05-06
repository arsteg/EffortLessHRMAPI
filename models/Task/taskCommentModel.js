var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({     
  content:{
    type: String,
    required: true,
  },
  author:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:true
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  commentedAt:{
    type:Date,
    required:true
  },
  parent:{
    type:mongoose.Schema.ObjectId,
    ref:'Comment'
  },
  status: {  // "pending review" or "resolved."
    type:String
  }, 
  commentType:{ //Whether the comment is a general note, a question, a suggestion, or another type of comment.
  type: String
  }  
}, {
  toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
  toObject: { virtuals: true } // Use virtuals when outputing as Object
},
{ collection: 'Comments' });
commentSchema.pre(/^find/,async function(next) {
  this.populate({
    path: 'task',
    select: 'title'
  }).populate({
    path: 'author',
    select: 'firstName lastName'
  });
  next();
});
commentSchema.virtual('taskAttachments', {
  ref: 'TaskAttachments',
  foreignField: 'comment', // tour field in review model pointing to this model
  localField: '_id' // id of current model
});
module.exports = mongoose.model('Comment', commentSchema);
