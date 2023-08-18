var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userPreferencesSchema = new Schema({    
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'user is required']
    },
    preference: {
        type: mongoose.Schema.ObjectId,
        ref: 'PreferenceOption',
        required: [true, 'Preference option is required']
    },
    preferenceValue: {
        type: String,
        required: true
    }
});
userPreferences = mongoose.model('userPreferences', userPreferencesSchema);
module.exports = userPreferences;