var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userEmploymentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: true
  },
  effectiveFrom: {
    type: Date,
    required: true
  },
  location: {
    type: String
  },
  designation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Designation', // Replace 'User' with the actual user reference schema
  },
  employmentType: {
    type: String
  },
  reportingSupervisor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: 'Department', // Replace 'User' with the actual user reference schema
  },
  band: {
    type: mongoose.Schema.ObjectId,
    ref: 'Band', // Replace 'User' with the actual user reference schema
  },
  subDepartments: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubDepartment', // Replace 'User' with the actual user reference schema
  },
  employmentStatusEffectiveFrom: {
    type: Date
  },
  zone: {
    type: mongoose.Schema.ObjectId,
    ref: 'Zone', // Assuming the reference is to a Company schema
  },
  noticePeriod: {
    type: String
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'UserEmployment' });

userEmploymentSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'designation',
      select: 'id designation'
    }),
    this.populate({
      path: 'department',
      select: 'id departmentName'
    })
  } catch (error) {
    console.error("Error populating designation:", error);
  }
  next();
});

module.exports = mongoose.model('UserEmployment', userEmploymentSchema);
