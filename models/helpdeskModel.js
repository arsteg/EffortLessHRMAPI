const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const helpdeskSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Helpdesk ticket must belong to a company']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  remarks: {
    type: String,
    default: ''
  },
  files: {
    type: String, // comma-separated URLs
    default: ''
  },
  video: {
    type: String, // video URL
    default: null
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collection: 'HelpdeskTickets'
});

// // Auto-increment helpdeskId
// helpdeskSchema.plugin(AutoIncrement, { 
//   inc_field: 'helpdeskId',
//   start_seq: 1 // start from 1
// });

// Populate createdBy and updatedBy when querying
helpdeskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName'
  }).populate({
    path: 'updatedBy',
    select: 'firstName'
  });
  next();
});

module.exports = mongoose.model('HelpdeskTicket', helpdeskSchema);