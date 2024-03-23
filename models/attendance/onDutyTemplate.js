var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var onDutyTemplateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isCommentMandatory: {
    type: Boolean,
    required: true
  },
  canSubmitForMultipleDays: {
    type: Boolean,
    required: true
  },
  ApprovalLevel: {
    type: String
  },
  FirstApproverCommentsMandatoryforApproval: {
    type: Boolean
  },
  SecondApproverCommentsMandatoryforApproval: {
    type: Boolean
  },
  FirstApproverCommentsMandatoryforRejection: {
    type: Boolean
  },
  SecondApproverCommentsMandatoryforRejection: {
    type: Boolean
  },
  IntitiateDutyRequestBy: {
    type: [String]
  },
  ApprovarType: {
    type: String
  },
  FirstLevelApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  SecondLevelApprovar: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'OnDutyTemplate' });

module.exports = mongoose.model('OnDutyTemplate', onDutyTemplateSchema);
