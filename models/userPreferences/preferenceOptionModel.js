var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var preferenceOptionSchema = new Schema({
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'preferencecategory',
        required: [true, 'Preference category is required']
      },
    name: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dataType: {
        type: String,
        required: true
    },
    defaultValue: {
        type: String        
    }
    
});
preferenceOptions = mongoose.model('preferenceOptions', preferenceOptionSchema);
module.exports = preferenceOptions;