var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeLeaveAssignmentSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  leaveTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'LeaveTemplate',
    required: true
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'EmployeeLeaveAssignment' });

employeeLeaveAssignmentSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'leaveTemplate',
      select: 'id label approvalType'
    })
    this.populate({
      path: 'primaryApprover',
      select: 'id firstName lastName'
    })
    this.populate({
      path: 'user',
      select: 'id firstName lastName'
    })
  } catch (error) {
    console.error("Error populating leave templates:", error);
  }
  next();
});

module.exports = mongoose.model('EmployeeLeaveAssignment', employeeLeaveAssignmentSchema);
