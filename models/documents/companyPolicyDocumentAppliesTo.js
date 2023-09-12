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
  