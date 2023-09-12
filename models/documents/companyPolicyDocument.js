var companyPolicyDocumentSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    url: {
      type: String
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'CompanyPolicyDocument' });
  module.exports = mongoose.model('CompanyPolicyDocument', companyPolicyDocumentSchema);
  