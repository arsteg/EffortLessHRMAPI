const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appWebsiteSchema = new mongoose.Schema({
    appWebsite: {
        type: String,
        required: true
    },
    ModuleName: {
        type: String,
        required: true
    },
    ApplicationTitle: {
        type: String,
        required: true
    },
    TimeSpent: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    type: {
        type: String,
        required: true
    },
    projectReference: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    userReference: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mouseClicks: {
        type: Number,
        required: true
    },
    keyboardStrokes: {
        required: true,
        type: Number
    },
    scrollingNumber: {
        type: Number,
        required: true
    },
    inactive: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
})
appWebsiteSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'userReference',
      select: 'firstName lastName createdOn'
    }).populate({
      path: 'projectReference',
      select: 'projectName'
    });
    next();
  });
module.exports = mongoose.model("appWebsiteModel", appWebsiteSchema);
