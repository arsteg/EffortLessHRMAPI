const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incomeTaxComponantSchema = new Schema({
  componantName: {
    type: String,
    required: true
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'IncomeTaxSection',
    required: true
  },
  maximumAmount: {
    type: Number,
    required: true
  },
  order:{
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company'
  }
}, { collection: 'IncomeTaxComponant' });

incomeTaxComponantSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'section',
      select: 'id section'
    });
  } catch (error) {
    console.error("Error populating section:", error);
  }
  next();
});
module.exports = mongoose.model('IncomeTaxComponant', incomeTaxComponantSchema);
