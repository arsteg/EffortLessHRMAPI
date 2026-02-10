const mongoose = require('mongoose');

const emailTemplateTypeSchema = new mongoose.Schema(
  {
    emailTemplateTypeId: {
      type: Number,
      required: [true, 'Email Template Type ID is required'],
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Email Template Type name is required'],
      trim: true
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: [true, 'Email Template Type must belong to a company']
    },
    createdOn: {
      type: Date,
      default: Date.now
    },
    updatedOn: {
      type: Date,
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
    isDelete: {
      type: Boolean,
      required: [true, 'isDelete field is required'],
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to ensure unique name per company
emailTemplateTypeSchema.index({ name: 1, company: 1 }, { unique: true });

// Update the updatedOn field before saving
emailTemplateTypeSchema.pre('save', function(next) {
  this.updatedOn = Date.now();
  next();
});

// Update the updatedOn field before updating
emailTemplateTypeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedOn: Date.now() });
  next();
});

const EmailTemplateType = mongoose.model('EmailTemplateType', emailTemplateTypeSchema);

module.exports = EmailTemplateType;
