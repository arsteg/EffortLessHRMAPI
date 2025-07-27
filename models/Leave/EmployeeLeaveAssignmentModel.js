var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeLeaveAssignmentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User must belong to a User']
  },
  leaveTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplate',
    required: true
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: false
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Replace 'User' with the actual user reference schema
    required: false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'EmployeeLeaveAssignment' });

employeeLeaveAssignmentSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'leaveTemplate',
      select: 'id label approvalType'
    })
  } catch (error) {
    console.error("Error populating leave templates:", error);
  }
  next();
});

module.exports = mongoose.model('EmployeeLeaveAssignment', employeeLeaveAssignmentSchema);
