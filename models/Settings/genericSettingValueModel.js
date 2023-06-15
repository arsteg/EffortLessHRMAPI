var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var genericSettingValueModelSchema = new Schema({  
  genericSetting: {
    type: mongoose.Schema.ObjectId,
    ref: 'GenericSetting',
    required:true,    
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
  {collection: 'GenericSettingValue' });
  genericSettingValueModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'genericSetting',
      select: 'CategoryName'
    });
    next();
  });
  module.exports = mongoose.model('GenericSettingValue', genericSettingValueModelSchema);