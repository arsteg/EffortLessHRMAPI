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
    type: String
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  minHoursPerDayToGetCreditForFullDay: {
    type: String
  },
  isHalfDayApplicable: {
    type: Boolean
  },
  minHoursPerDayToGetCreditforHalfDay: {
    type: String
  },
  maxLateComingAllowedMinutesFirstHalfAttendance: {
    type: Number
  },
  isCheckoutTimeNextDay: {
    type: Boolean
  },
  isLatestDepartureTimeNextDay: {
    type: Boolean
  },
  earliestArrival: {
    type: String
  },
  latestDeparture: {
    type: Date
  },
  firstHalfDuration: {
    type: String
  },
  secondHalfDuration: {
    type: String
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
