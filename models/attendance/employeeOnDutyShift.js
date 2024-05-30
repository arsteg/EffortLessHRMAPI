var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeOnDutyShiftSchema = new Schema({  
  employeeOnDutyRequest: {
    type: mongoose.Schema.ObjectId,
    ref: 'EmployeeOnDutyRequest'
  },
 date: {
    type: Date,
    required: true
  },
  shift: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shift'
  },
  shiftDuration: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    required: true
  }
}, { collection: 'EmployeeOnDutyShift' });

module.exports = mongoose.model('EmployeeOnDutyShift', employeeOnDutyShiftSchema);
