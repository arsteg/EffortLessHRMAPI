var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var genericSettingListDataModelSchema = new Schema({  
  genericSetting: {
    type: mongoose.Schema.ObjectId,
    ref: 'GenericSetting',
    required:true,    
  },   
    key: {
      type: String,
      required: false
    },
    value: {
      type: String,
      required: false
    },       
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  {collection: 'GenericSettingListData' });
  genericSettingListDataModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'genericSetting',
      select: 'CategoryName'
    });
    next();
  });
  module.exports = mongoose.model('GenericSettingListData', genericSettingListDataModelSchema);