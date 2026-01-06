var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var holidayapplicableOfficeSchema = new Schema({
    holiday: {
        type: mongoose.Schema.ObjectId,
        ref: 'HolidayCalendar',
        required: true
    },
    office: {
        type: mongoose.Schema.ObjectId,
        ref: 'AttendanceOffice',
        required: true
    }
}, { collection: 'HolidayapplicableOffice' });

module.exports = mongoose.model('HolidayapplicableOffice', holidayapplicableOfficeSchema);
