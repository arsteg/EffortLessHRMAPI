const mongoose = require('mongoose');

const manualAttendanceRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: String,
        default: '09:00'
    },
    checkOutTime: {
        type: String,
        default: '18:00'
    },
    reason: {
        type: String,
        required: [true, 'Reason is required.']
    },
    photoUrl: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    comments: String
}, { collection: 'ManualAttendanceRequests' });

module.exports = mongoose.model('ManualAttendanceRequest', manualAttendanceRequestSchema);
