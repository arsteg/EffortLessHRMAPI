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
    type: String,
    required: true
  },
  designation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Designation', // Replace 'User' with the actual user reference schema
  },
  employmentType: {
    type: String,
    required: true
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
  totalCTCExcludingVariableAndOtherBenefits: {
    type: Number
  },
  totalCTCIncludingVariable: {
    type: Number
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'UserEmployment' });

module.exports = mongoose.model('UserEmployment', userEmploymentSchema);
