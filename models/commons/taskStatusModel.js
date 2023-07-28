const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  }, 
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',   
  }  
});
module.exports = mongoose.model("taskStatus", taskStatusSchema);
