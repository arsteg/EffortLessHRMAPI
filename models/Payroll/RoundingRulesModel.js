const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roundingRulesSchema = new Schema({
  generalSetting: {
    type: mongoose.Schema.ObjectId,
    ref: 'PayrollGeneralSetting',  // Assuming the reference is to a GeneralSetting schema
    required: true
  },
  name: {
    type: String,
    required: true
  },
  roundingType: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  }
}, { collection: 'RoundingRules' });

module.exports = mongoose.model('RoundingRules', roundingRulesSchema);
