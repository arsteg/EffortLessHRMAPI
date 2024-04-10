var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var holidayapplicableEmployeeSchema = new Schema({
 holiday: {
    type: mongoose.Schema.ObjectId,
    ref: 'HolidayCalendar',  // Assuming the reference is to a Company schema
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'HolidayapplicableEmployee' });

module.exports = mongoose.model('HolidayapplicableEmployee', holidayapplicableEmployeeSchema);