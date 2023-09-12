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
  