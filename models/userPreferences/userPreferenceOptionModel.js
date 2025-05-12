var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var preferenceOptionSchema = new Schema({
    preferenceKey: {
        type: String,
        required: [true, 'preferenceKey is required']
    },
    preferenceValue: {
        type: String,
        required: [true, 'preferenceValue is required']
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('PreferenceOption', preferenceOptionSchema);