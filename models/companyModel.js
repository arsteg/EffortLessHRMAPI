var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var companyModelSchema = new Schema({      
    companyName: {
      type: String,
      required: true,
      unique: true
    },
    contactPerson: {
      type: String,
      required: true,
      unique: true
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: mongoose.Schema.ObjectId,
      ref: 'Country'//,
     // required: [true, 'Country must belong to a Country']
    },
    pincode: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'Email field is required'],
      unique: true,
      lowercase: true, // Transform value to lowercase
      validate: [validator.isEmail, 'Specified email ({VALUE}) is incorrect']
    },    
    phone: {
      type: Number
    },
    createdOn: {
      type: Date,
      required: true    
    },
    updatedOn: {
      type: Date,
      required: true    
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
    }
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  { collection: 'Company' });

  companyModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'createdBy',
      select: 'firstName'
    }).populate({
      path: 'updatedBy',
      select: 'firstName'
    });
    next();
  });

  companyModelSchema.virtual('user', {
    ref: 'User',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('project', {
    ref: 'Company',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('task', {
    ref: 'Task',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('taskUsers', {
    ref: 'TaskUsers',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('taskAttachments', {
    ref: 'TaskAttachments',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  
  module.exports = mongoose.model('Company', companyModelSchema);