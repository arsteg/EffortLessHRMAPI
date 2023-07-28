const mongoose = require('mongoose');

const taskPrioritySchema = new mongoose.Schema({
  priority: {
    type: String,
    required: true
  }, 
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',   
  }  
});
module.exports = mongoose.model("taskPriority",taskPrioritySchema);
