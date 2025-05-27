const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollOvertimeSchema = new Schema({
    PayrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    LateComing: {
      type: Number,
      required: true
    },
    EarlyGoing: {
      type: Number,
      required: true
    },
    FinalOvertime: {
      type: Number,
      required: true
    },
    OvertimeAmount: {
      type: Number,
      required: true
    }

  }, { collection: 'PayrollOvertime' });
  
module.exports = mongoose.model('PayrollOvertime', payrollOvertimeSchema);
