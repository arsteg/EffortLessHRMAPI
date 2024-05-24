const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flexiBenefitsCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
}, { collection: 'FlexiBenefitsCategory' });

module.exports = mongoose.model('FlexiBenefitsCategory', flexiBenefitsCategorySchema);
