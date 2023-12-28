var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var advanceReportSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming User schema for employee
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdvanceCategory',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  Status: {
    type: String,
    enum: ['Remaining', 'Pending', 'Approved', 'Paid'],
    default: 'Remaining'
  }
}, { collection: 'AdvanceReport.' });

module.exports = mongoose.model('AdvanceReport',advanceReportSchema);
