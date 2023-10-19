const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const separationTypeSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company', // Assuming the reference is to a Company schema
        required: true
    }
}, { collection: 'SeparationType' });

module.exports = mongoose.model('SeparationType', separationTypeSchema);
