var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);
var Schema = mongoose.Schema;
const validator = require('validator');

var companyPolicyDocumentUserSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    companyPolicyDocument: {
      type: mongoose.Schema.ObjectId,
      ref: 'CompanyPolicyDocument'
    }
  }, { collection: 'CompanyPolicyDocumentUser' });
  module.exports = mongoose.model('CompanyPolicyDocumentUser', companyPolicyDocumentUserSchema);
  