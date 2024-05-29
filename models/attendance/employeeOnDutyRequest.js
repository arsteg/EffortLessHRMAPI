const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeOnDutyRequestSchema = new Schema({
  onDutyReason: {
    type: mongoose.Schema.ObjectId,
    ref: 'OnDutyReason',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  comment: {
    type: String,
  }, 
  primaryApprovarComment: {
    type: String,
  }, 
  primaryApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  secondaryApprovarComment: {
    type: String,
  },
  secondaryApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
  },
  employeeOnDutyShifts: []
}, { collection: 'EmployeeOnDutyRequest' });

module.exports = mongoose.model('EmployeeOnDutyRequest', employeeOnDutyRequestSchema);
