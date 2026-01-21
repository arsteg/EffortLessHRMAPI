var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveApplicationSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming the reference is to an Employee schema
    required: true
  },
  leaveCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveCategory', // Assuming the reference is to a LeaveCategory schema
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isHalfDayOption: {
    type: Boolean,
    default: false
  },
  comment: {
    type: String
  },
  addedBy: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Level 1 Approval Pending', 'Level 2 Approval Pending', 'Approved', 'Cancelled', 'Rejected'],
    default: 'Level 1 Approval Pending'
  },
  level1Reason: {
    type: String
  },
  level2Reason: {
    type: String
  },
  company: {
    type: String,
    required: true
  },
  documentLink: {
    type: String
  },
  halfDays: [],
  calculatedLeaveDays: {
    type: Number,
    min: 0,
    default: 0 // Default to 0, will be updated on creation
  },
  weeklyOffDaysIncluded: {
    type: Boolean,
    default: false // Default to false, will be updated on creation
  },
  numberOfWeeklyOffDays: {
    type: Number,
    min: 0,
    default: 0 // Default to 0, will be updated on creation
  }
}, { collection: 'LeaveApplication' });

leaveApplicationSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'employee',
      select: '_id firstName lastName'
    }),
      this.populate({
        path: 'leaveCategory',
        select: 'id label isPaidLeave leaveAccrualPeriod isWeeklyOffLeavePartOfNumberOfDaysTaken isAnnualHolidayLeavePartOfNumberOfDaysTaken negativeLeaveBalancePolicy'
      });
  } catch (error) {
    console.error("Error populating employee", error);
  }
  next();
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
