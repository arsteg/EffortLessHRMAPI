var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var genericSettingModelSchema = new Schema({  
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required:true,    
  },  
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required:true
    },
    CategoryName: {
      type: String,
      required: false
    },
    ControlType: {
      type: String,
      required: false
    },
    ControlLabel: {
      type: String,
      required: false
    },
    ToolTip: {
      type: String,
      required: false
    },
    FieldName: {
      type: String,
      required: false
    }       
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  {collection: 'GenericSetting' });
  genericSettingModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'user',
      select: 'email'
    }).populate({
      path: 'company',
      select: 'companyName'
    });
    next();
  });
  module.exports = mongoose.model('GenericSetting', genericSettingModelSchema);