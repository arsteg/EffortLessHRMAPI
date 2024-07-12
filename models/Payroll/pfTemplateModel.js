var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pfTemplateSchema = new Schema({  
  templateName: {
    type: String,
    required: true
  },
  allowanceApplicable: {
    type: [String],
    required: true
  }
}, { collection: 'PFTemplates' });

module.exports = mongoose.model('PFTemplates', pfTemplateSchema);
