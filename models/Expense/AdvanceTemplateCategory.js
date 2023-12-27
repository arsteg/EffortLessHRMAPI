var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var advanceTemplateCategoriesSchema = new Schema({
  advanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdvanceTemplate',
    required: true
  },
  advanceCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'AdvanceCategory',
    required: true
  }
}, { collection: 'AdvanceTemplateCategories' });

module.exports = mongoose.model('AdvanceTemplateCategories', advanceTemplateCategoriesSchema);
