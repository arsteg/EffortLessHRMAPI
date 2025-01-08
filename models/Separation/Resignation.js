var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resignationSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to the 'User' schema (employee profile)
    required: true
  },
  resignation_date: {
    type: Date,
    required: true
  },
  last_working_day: {
    type: Date,
    required: true
  },
  notice_period: {
    type: Number,  // Could represent the number of days or weeks, depending on the company policy
    required: true
  },
  resignation_reason: {
    type: String,  // Optional field for the reason behind the resignation
    default: ''
  },
  exit_interview_date: {
    type: Date,  // Date of the exit interview (optional)
  },
  handover_complete: {
    type: Boolean,  // Tracks whether the handover of responsibilities is complete
    default: false
  },
  company_property_returned: {
    type: Boolean,  // Tracks whether company property has been returned
    default: false
  },
  final_pay_processed: {
    type: Boolean,  // Indicates if final pay has been processed
    default: false
  },
  exit_feedback: {
    type: String,  // Optional field for comments from the exit interview
    default: ''
  },
  resignation_status: {
    type: String,  // Could be "pending", "completed", "in-progress", etc.
    enum: ['pending', 'completed', 'in-progress', 'approved'],  // Enum for predefined statuses
    required: true,
    default: 'pending'
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',  // Assuming reference to a Company schema
    required: true
  }
}, { collection: 'Resignation', timestamps: true });  // timestamps to capture creation and update times

module.exports = mongoose.model('Resignation', resignationSchema);