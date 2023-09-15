var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tagSchema = new Schema({      
  title: {
    type: String,
    required: true,
    trim: true    
  },    
  createdOn: {
    type: Date,
    required: true    
  },
  updatedOn: {
    type: Date,
    required: true    
  },     
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },  
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
  //  required: [true, 'User must belong to a User']
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'//,
    //required: [true, 'User must belong to a User']
  },
  isDeleted:
  {
    type: Boolean
  }
}, {
  toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
  toObject: { virtuals: true } // Use virtuals when outputing as Object
},
{ collection: 'Tag' });
module.exports = mongoose.model('Tag', tagSchema);
