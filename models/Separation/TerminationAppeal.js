var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// timestamps: true will automatically add createdAt and updatedAt
const TerminationAppealSchema = new mongoose.Schema({
  termination: { type: mongoose.Schema.Types.ObjectId, ref: 'Termination', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appeal_reason: { type: String, required: true },
  appeal_status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  decision_notes: { type: String },
  decided_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decided_on: { type: Date },
  created_at: { type: Date, default: Date.now }
}, { collection: 'TerminationAppeal', timestamps: true });  // timestamps: true will automatically add createdAt and updatedAt


module.exports = mongoose.model('TerminationAppeal', TerminationAppealSchema);
