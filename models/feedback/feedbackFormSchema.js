var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Reference to the Company schema
    required: true
  },
  storeId: {
    type: String // Could be ObjectId if referencing a Store schema    
  },
  tableId: {
    type: String, // Could be ObjectId or custom ID depending on your setup    
  },
  provider: {
    email: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Basic email validation
      required: false // Optional
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'], // Basic phone validation (E.164-like)
      required: false // Optional
    }
  },
  feedbackValues: [{
    field: {
      type: mongoose.Schema.ObjectId,
      ref: 'feedbackField', // Reference to feedbackField schema
      required: true
    },
    value: {
      type: Schema.Types.Mixed, // Flexible type to store string, number, boolean, etc.
      required: function() {
        // Required only if the linked feedbackField has isRequired: true
        return this.populated('field') ? this.field.isRequired : false;
      }
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now // Automatically set submission time
  }
}, { collection: 'feedback', timestamps: true });

// Index for faster queries by company and store
feedbackSchema.index({ company: 1, storeId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);