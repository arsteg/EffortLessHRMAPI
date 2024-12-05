const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollOvertimeSchema = new Schema({
    PayrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    LateComing: {
      type: String,
      required: true
    },
    EarlyGoing: {
      type: String,
      required: true
    },
    FinalOvertime: {
      type: String,
      required: true
    }

  }, { collection: 'PayrollOvertime' });
  
module.exports = mongoose.model('PayrollOvertime', payrollOvertimeSchema);
  