var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;

var projectModelSchema = new Schema({ 
  projectName: {
    type: String,
    required: true,
    unique: true
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
module.exports = mongoose.model('Project', projectModelSchema);