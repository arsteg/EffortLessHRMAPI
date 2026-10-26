var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// TM-012: taskNumber was previously computed as
// `(await Task.countDocuments({company, project})) + 1`, which is a classic
// read-then-write race condition — two concurrent task-creation requests for
// the same project can both read the same count and produce two tasks with
// the same taskNumber. This counter document is updated atomically via
// findOneAndUpdate + $inc, which MongoDB guarantees is race-free even under
// concurrent writers.
var taskCounterSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
}, { collection: 'TaskCounter' });

taskCounterSchema.index({ company: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('TaskCounter', taskCounterSchema);
