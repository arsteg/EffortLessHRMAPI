var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeOnDutyShiftSchema = new Schema({  
 employeeOnShiftDuration: {
    type: String,
    required: true
  },
  shiftDuration: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    required: true
  }
}, { collection: 'EmployeeOnDutyShift' });

module.exports = mongoose.model('EmployeeOnDutyShift', employeeOnDutyShiftSchema);
