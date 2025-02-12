const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overTimeInformationSchema = new Schema({
    User: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    AttandanceShift: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shift',
        required: true
    },
    ShiftTime: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    CheckInDate: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    CheckOutDate: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    CheckInTime: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    CheckOutTime: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    OverTime: {
        type: String, // Adjust the type if you want a specific format (e.g., Number, etc.)
        required: true // Assuming OverTime is required
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    }
}, { collection: 'OverTimeInformation' });

module.exports = mongoose.model('OverTimeInformation', overTimeInformationSchema);
