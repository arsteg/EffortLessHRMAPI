var documentAppliedToSchema = new Schema({
    document: {
      type: mongoose.Schema.ObjectId,
      ref: 'Document'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }, { collection: 'DocumentAppliedTo' });
  module.exports = mongoose.model('DocumentAppliedTo', documentAppliedToSchema);
  