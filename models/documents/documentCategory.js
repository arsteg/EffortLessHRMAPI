var documentCategorySchema = new Schema({
    name: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'DocumentCategory' });
  module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
  