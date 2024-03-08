const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shortLeaveSchema = new Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Replace 'User' with the actual user reference schema
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    durationInMinutes: {
        type: Number,
        required: true
    },
    comments: {
        type: String
    },
    status: {
        type: String,
        required: true
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
    }
}, { collection: 'ShortLeave' });

module.exports = mongoose.model('ShortLeave', shortLeaveSchema);
