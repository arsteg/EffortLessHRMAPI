var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var roleModelSchema = new Schema({    
    Name: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: [true, 'Company must belong to a Company']
    },
    active: {
      type: Boolean,
      default: true,
      select: false
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
    createdOn: {
      type: Date,
     // required: true    
    },
    updatedOn: {
      type: Date,
    //  required: true    
    }    
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  {collection: 'Role' });      
  roleModelSchema.virtual('rolePermission', {
    ref: 'RolePermission',
    foreignField: 'role', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  roleModelSchema.virtual('user', {
    ref: 'User',
    foreignField: 'role', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  module.exports = mongoose.model('Role', roleModelSchema);