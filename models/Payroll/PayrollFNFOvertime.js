const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFOvertimeSchema = new Schema({
    PayrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
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
      type: Number,
      required: true
    },
    OvertimeAmount: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollFNFOvertime' });
  
module.exports = mongoose.model('PayrollFNFOvertime', payrollFNFOvertimeSchema);
  