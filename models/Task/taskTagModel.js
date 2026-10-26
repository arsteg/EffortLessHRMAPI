var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskTagSchema = new Schema({
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },   
  tag: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tag',
    required: [true, 'Tag is required']
  },
  
}, {
  toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
  toObject: { virtuals: true } // Use virtuals when outputing as Object
},
{ collection: 'TaskTag' });
module.exports = mongoose.model('TaskTag', taskTagSchema);
