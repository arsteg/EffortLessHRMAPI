
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollFNFSchema = new Schema({
    date: {
      type: Date,
      required: true
    },
    updatedOnDate: {
      type: Date,
      required: false
    },
    status: {
      type: String,
      enum: ['InProgress','Pending', 'OnHold', 'Processed','Approved','Paid','Cleared','Rjected','Finilized','Exit Interview Completed'],
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'PayrollFNF' });
  
module.exports = mongoose.model('PayrollFNF', payrollFNFSchema);
