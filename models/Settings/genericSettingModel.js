var mongoose = require('mongoose');
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
      required: [true, 'CategoryName field is required']
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
    },  
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
  genericSettingModelSchema.virtual('genericSettingValue', {
    ref: 'GenericSettingValue',
    foreignField: 'genericSetting', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  genericSettingModelSchema.virtual('genericSettingListData', {
    ref: 'GenericSettingListData',
    foreignField: 'genericSetting', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
 
 const GenericSetting = mongoose.model('GenericSetting', genericSettingModelSchema);

module.exports = GenericSetting;
