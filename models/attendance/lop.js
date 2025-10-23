const mongoose = require('mongoose');

const lopSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', // Assuming you have a Company model
        required: true,
    },
    isHalfDay: {
        type: Boolean,
        default: false // Optional: default value
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields
});

const LOP = mongoose.model('LOP', lopSchema);

module.exports = LOP;
