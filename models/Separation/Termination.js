var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var terminationSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Foreign key to the employee’s profile (User schema)
    required: true
  },
  termination_date: {
    type: Date,
    required: true
  },
  termination_reason: {
    type: String,  // Reason for termination (e.g., performance, misconduct, redundancy)
    required: true
  },
  notice_given: {
    type: Boolean,  // Whether the required notice period was given
    default: false
  },
  performance_warnings: {
    type: Number,  // Count of prior performance warnings (if applicable)
    default: 0
  },
  severance_paid: {
    type: Boolean,  // Indicates if severance has been paid
    default: false
  },
  final_pay_processed: {
    type: Boolean,  // Indicates whether final pay has been processed
    default: false
  },
  company_property_returned: {
    type: Boolean,  // Tracks return of company property
    default: false
  },
  exit_interview_date: {
    type: Date,  // Date of exit interview (if applicable)
    default: null
  },
  legal_compliance: {
    type: Boolean,  // Indicates if all legal compliance steps were followed
    default: false
  },
  termination_status: {
    type: String,  // Status of termination (e.g., pending, completed, appealed)
    enum: ['Pending', 'Completed', 'Appealed','Deleted'],
    required: true,
    default: 'pending'
  },
  unemployment_claim: {
    type: Boolean,  // Indicates if the employee applied for unemployment
    default: false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',  // Reference to the company schema
    required: true
  }
}, { collection: 'Termination', timestamps: true });  // timestamps: true will automatically add createdAt and updatedAt

module.exports = mongoose.model('Termination', terminationSchema);
