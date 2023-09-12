var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var companyPolicyDocumentAppliesToSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    companyPolicyDocument: {
      type: mongoose.Schema.ObjectId,
      ref: 'CompanyPolicyDocument'
    }
  }, { collection: 'CompanyPolicyDocumentAppliesTo' });
  module.exports = mongoose.model('CompanyPolicyDocumentAppliesTo', companyPolicyDocumentAppliesToSchema);
  