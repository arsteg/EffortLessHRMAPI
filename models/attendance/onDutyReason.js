const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const onDutyReasonSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  applicableEmployee:{
    type: String,
    required:true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
  userOnDutyReason: []
}, { collection: 'OnDutyReason' });

module .exports = mongoose.model('OnDutyReason', onDutyReasonSchema);

