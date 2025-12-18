var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const projectUser = require('./projectUserModel');
var projectModelSchema = new Schema({ 
  projectName: {
    type: String,
    required: true
   },
   startDate: {
    type: Date 
  },
  endDate: {
    type: Date   
  },
  estimatedTime:{
    type:Number
  },
  notes:{
    type:String
  },
  createdOn: {
    type: Date,
    required: true    
  },
  updatedOn: {
    type: Date,
    required: true    
  },  
  ProjectUser:[],
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
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company must belong to a Company']
  },
  status:
  {
    type: String
  }
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  { collection: 'Project' });
  projectModelSchema.pre(/^find/,async function(next) {
    this.populate({
      path: 'createdBy',
      select: 'firstName lastName'
    });
    next();
  });
  projectModelSchema.virtual('timeLog', {
    ref: 'TimeLog',
    foreignField: 'project', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  projectModelSchema.virtual('appwebsiteModel', {
    ref: 'appWebsiteModel',
    foreignField: 'project', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  projectModelSchema.virtual('projectuser', {
    ref: 'ProjectUser',
    foreignField: 'project', // tour field in review model pointing to this model
    localField: '_id' // id of current model
  });
  projectModelSchema.pre('remove', async function(next) { 
    // Now, remove ExpenseApplicationFieldValue documents associated with the removed ExpenseApplicationField records
    await projectUser.deleteMany({ project: this._id }); 
    next(); // Continue with the delete operation
  });
module.exports = mongoose.model('Project', projectModelSchema);