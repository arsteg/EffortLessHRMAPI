var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var offerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
}, { collection: 'Offer' });

module.exports = mongoose.model('Offer', offerSchema);
