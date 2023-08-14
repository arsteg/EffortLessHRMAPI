var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var preferenceCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});
preferenceCategories = mongoose.model('preferenceCategories', preferenceCategorySchema);
module.exports = preferenceCategories;