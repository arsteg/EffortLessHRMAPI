const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceTemplateAssignmentsSchema = new Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  attendanceTemplate: {
    type: mongoose.Schema.ObjectId,
    ref: 'AttendanceTemplate',
  },
  primaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  secondaryApprover: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  effectiveFrom: {
    type: Date
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'AttendanceTemplateAssignments' });
attendanceTemplateAssignmentsSchema.pre(/^find/, async function (next) {
  try {
    this.populate({
      path: 'attendanceTemplate',
      select: 'id label approversType'
    },
      this.populate({
        path: 'employee',
        select: 'id firstName lastName'
      }),
      this.populate({
        path: 'primaryApprover',
        select: 'id firstName lastName'
      }),
      this.populate({
        path: 'secondaryApprover',
        select: 'id firstName lastName'
      })
    );
  } catch (error) {
    console.error("Error populating fixed deductions:", error);
  }
  next();
});
module.exports = mongoose.model('AttendanceTemplateAssignments', attendanceTemplateAssignmentsSchema);
