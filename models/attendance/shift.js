var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shiftSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  dashboardColor: {
    type: String,
    required: true
  },
  isOffShift: {
    type: Boolean,
    default: false
  },
  shiftType: {
    type: String,
    required: true
  },
  startTimeHour: {
    type: String,
    required: true
  },
  startTimeMinutes: {
    type: String,
    required: true
  },
  endTimeHour: {
    type: String,
    required: true
  },
  endTimeMinutes: {
    type: String,
    required: true
  },
  minhoursPerDayToGetCreditForFullDayHour: {
    type: Number,
    required: true
  },
  minhoursPerDayToGetCreditForFullDayMinutes: {
    type: Number,
    required: true
  },
  isCheckoutTimeNextDay: {
    type: Boolean,
    default: false
  },
  isLatestDepartureTimeNextDay: {
    type: Boolean,
    default: false
  },
  earliestArrival: {
    type: String,
    required: true
  },
  latestDeparture: {
    type: Date,
    required: true
  },
  firstHalfDuration: {
    type: String,
    required: true
  },
  secondHalfDuration: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  isLateComingAllowed: {
    type: Boolean,
    default: false
  },
  noOfDaysLateComing: {
    type: Number,
    default: 0
  },
  graceTimeLimitForLateComing: {
    type: Number,
    default: 0
  },
  willLateComingDeductfromPresentDays: {
    type: Boolean,
    default: false
  },
  numberOflateComingDaysAllowed: {
    type: Number,
    default: 0
  },
  numberOfDaysToBeDeducted: {
    type: String,
    defult: ''
  },
  maximumTimeLimitForLateComing: {
    type: Number,
    default: 0
  },
  isEarlyGoingAllowed: {
    type: Boolean,
    default: false
  },
  enterNumberOfDaysForEarlyGoing: {
    type: Number,
    default: 0
  },
  graceTimeLimitForEarlyGoing: {
    type: Number,
    default: 0
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'Shift' });

module.exports = mongoose.model('Shift', shiftSchema);
