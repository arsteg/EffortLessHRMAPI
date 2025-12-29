const mongoose = require('mongoose');

const attendanceRulesSchema = new mongoose.Schema({
    office: {
        type: mongoose.Schema.ObjectId,
        ref: 'AttendanceOffice',
        required: [true, 'Rules must belong to an office']
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'companies',
        required: [true, 'Rules must belong to a company']
    },
    selfieRequired: {
        type: Boolean,
        default: true
    },
    faceRecognitionEnabled: {
        type: Boolean,
        default: true
    },
    faceMatchThreshold: {
        type: Number,
        default: 80 // Percentage
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const AttendanceRules = mongoose.model('AttendanceRules', attendanceRulesSchema);

module.exports = AttendanceRules;
