
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var payrollSchema = new Schema({
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
      enum: ['InProgress', 'OnHold', 'Closed'],
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
  }, { collection: 'Payroll' });
  
module.exports = mongoose.model('Payroll', payrollSchema);
