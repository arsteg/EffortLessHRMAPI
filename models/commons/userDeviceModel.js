const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  isOnline: { type: Boolean, default: false },
  machineId: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',   
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',   
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',   
  }  
});
module.exports = mongoose.model("userDevice", userDeviceSchema);
