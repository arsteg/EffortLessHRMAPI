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
      return this.approvalType === 'template-wise'; // Adjust the condition based on your actual logic
    }
  },
  secondaryApprover: {
    type: String,
    required: function() {
      return this.approvalType === 'template-wise' && this.approvalLevel === '2 Level'; // Adjust the condition based on your actual logic
    }
  },
  isCommentMandatory: {
    type: Boolean,
    default: false
  },
  clubbingRestrictions: {
    type: Boolean,
    default: false
  },
  weeklyOffClubTogether: {
    type: Boolean,
    default:false
    
  },
  holidayClubTogether: {
    type: Boolean,
   default:false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  applicableCategories:[],
  clubbingRestrictions:[]
}, { collection: 'LeaveTemplate' });

module.exports = mongoose.model('LeaveTemplate', leaveTemplateSchema);
