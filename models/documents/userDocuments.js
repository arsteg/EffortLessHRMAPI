var userDocumentsSchema = new Schema({
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    name: {
      type: String
    },
    date: {
      type: Date
    },
    url: {
      type: String
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'UserDocuments' });
  module.exports = mongoose.model('UserDocuments', userDocumentsSchema);
  