const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const chatbotModelSchema = new Schema({
  // company: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Company',
  //   required: [true, 'Chatbot entry must belong to a company']
  // },
  question: {
    type: String,
    required: [true, 'Question is required']
  },
  answer: {
    type: [mongoose.Schema.Types.Mixed], // stores array of { type, content }
    required: [true, 'Answer is required']
  },
  embedding: {
    type: [Number],
    required: false // optional, in case you plan to generate later
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'ChatbotData'
});

// Auto-increment chatbotId field
chatbotModelSchema.plugin(AutoIncrement, { inc_field: 'chatbotId' });

// Populate createdBy and updatedBy when querying
chatbotModelSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName'
  }).populate({
    path: 'updatedBy',
    select: 'firstName'
  });
  next();
});

module.exports = mongoose.model('ChatbotData', chatbotModelSchema);