var templateSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    content: {
      type: String
    },
    active: {
      type: Boolean
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company'
    }
  }, { collection: 'Template' });
  module.exports = mongoose.model('Template', templateSchema);
  