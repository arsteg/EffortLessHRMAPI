var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var holidayCalendarSchema = new Schema({
  label: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  isHolidayOccurEveryYearOnSameDay: {
    type: Boolean,
    default: false  // Assuming default is false
  },
  isMandatoryForFlexiHoliday: {
    type: Boolean,
    default: false  // Assuming default is false
  },
  holidaysAppliesFor: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  holidayapplicableEmployee: []
}, { collection: 'HolidayCalendar' });

module.exports = mongoose.model('HolidayCalendar', holidayCalendarSchema);