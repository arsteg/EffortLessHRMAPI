var documentSchema = new Schema({
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'DocumentCategory'
    },
    description: {
      type: String
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'Document' });
  module.exports = mongoose.model('Document', documentSchema);
  