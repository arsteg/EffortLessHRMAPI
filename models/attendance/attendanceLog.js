const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required.']
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required.']
    },
    type: {
        type: String,
        enum: ['check-in', 'check-out'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    photoUrl: String,
    faceMatchScore: Number,
    deviceId: String,
    isAnomaly: {
        type: Boolean,
        default: false
    },
    anomalyReason: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'auto-approved'],
        default: 'auto-approved'
    }
}, { collection: 'AttendanceLogs' });

attendanceLogSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
