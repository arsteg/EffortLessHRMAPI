var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var templateCubbingRestrictionSchema = new Schema({  
  leaveTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplate',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  restrictedClubbedCategory: {
    type: String,
    required: true
  }
}, { collection: 'TemplateCubbingRestriction' });

module.exports = mongoose.model('TemplateCubbingRestriction', templateCubbingRestrictionSchema);
