const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var payrollFNFAttendanceSummarySchema = new Schema({
    payrollFNFUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollFNFUsers',
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    },
    lopDays: {
      type: Number,
      required: true
    },
    payableDays: {
      type: Number,
      required: true
    },
    leaveEncashmentDays: {
      type: Number,
      required: false
    },
    leaveBalance: {
      type: Number,
      required: false
    },
    lopDays: {
      type: Number,
      required: false
    },
    adjustedPayableDays: {
      type: Number,
      required: false
    },
    adjustmentReason: {
      type: String,
      required: false
    },
    overtimeHours: {
      type: Number,
      required: false
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    adjustmentDetails: [{
        reason: { type: String },
        amountAdjusted: { type: Number },
        date: { type: Date, default: Date.now }
    }],  
    status: {
      type: String,
      enum: ['pending', 'completed', 'paid'],
      default: 'pending'
    }
}, { collection: 'PayrollFNFAttendanceSummary' });

module.exports = mongoose.model('PayrollFNFAttendanceSummary', payrollFNFAttendanceSummarySchema);
