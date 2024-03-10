const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveAssignedSchema = new Schema({
  cycle: {
    type: String,
    required: true
  },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming the reference is to an Employee schema
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveCategory', // Assuming the reference is to an Employee schema
    required: true
  },
  type: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  startMonth: {
    type: Number,
    required: true
  },
  endMonth: {
    type: Number,
    required: true
  },
  openingBalance: {
    type: Number,
    required: true
  },
  accruedBalance: {
    type: Number,
    required: true
  },
  leaveApplied: {
    type: Number,
    required: true
  },
  leaveRemaining: {
    type: Number,
    required: true
  },
  closingBalance: {
    type: Number,
    required: true
  },
  leaveTaken: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'LeaveAssigned' });

module.exports = mongoose.model('LeaveAssigned', leaveAssignedSchema);
