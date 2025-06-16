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
      required: true
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
      type: String
    },
    pincode: {
      type: String
    },
    logo: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,   
      lowercase: true,      
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
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    freeCompany: {
      type: Boolean,
      default: false
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
  companyModelSchema.virtual('liveTracking', {
    ref: 'LiveTracking',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('errorLog', {
    ref: 'ErrorLog',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('user', {
    ref: 'User',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('userPreferences', {
    ref: 'userPreferences',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  
  companyModelSchema.virtual('rolePermission', {
    ref: 'RolePermission',
    foreignField: 'company', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  companyModelSchema.virtual('genericSetting', {
    ref: 'GenericSetting',
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