var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveTemplateSchema = new Schema({  
  label: {
    type: String,
    required: true
  },
  approvalLevel: {
    type: String,
    required: true
  },
  approvalType: {
    type: String,
    required: true
  },
  primaryApprover: {
    type: String,
    required: function() {
      return this.approvalType === 'some_approval_type'; // Adjust the condition based on your actual logic
    }
  },
  secondaryApprover: {
    type: String,
    required: function() {
      return this.approvalType === 'some_other_approval_type'; // Adjust the condition based on your actual logic
    }
  },
  isCommentMandatory: {
    type: Boolean,
    required: true
  },
  clubbingRestrictions: {
    type: Boolean,
    required: true
  },
  weeklyOffClubTogether: {
    type: Boolean,
    required: function() {
      return this.clubbingRestrictions;
    }
  },
  holidayClubTogether: {
    type: Boolean,
    required: function() {
      return this.clubbingRestrictions;
    }
  },
  company: {
    type: String,
    required: true
  }
}, { collection: 'LeaveTemplate' });

module.exports = mongoose.model('LeaveTemplate', leaveTemplateSchema);
