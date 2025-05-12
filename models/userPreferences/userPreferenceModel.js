var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userPreferencesSchema = new Schema({
    userId: {
        type: String,
        required: [true, 'userId is required']
    },
    preferenceOptionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'PreferenceOption',
        required: [true, 'Preference option is required']
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

userPreferences = mongoose.model('userPreferences', userPreferencesSchema);
module.exports = userPreferences;