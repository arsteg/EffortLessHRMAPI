const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Pincode will automatically be deleted after 5 minutes (300 seconds)
    },
    status: {
        type: String,
        enum: ['active', 'verified', 'cancelled'],
        default: 'active'
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;