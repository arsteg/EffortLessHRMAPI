const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ctcTemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes whitespace from the beginning and end of the string
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  ctcTemplateVariableAllowances:[],
  ctcTemplateVariableDeductions:[],
  ctcTemplateEmployerContributions:[],
  ctcTemplateOtherBenefitAllowances: [],
  ctcTemplateEmployeeDeductions:[],
  ctcTemplateFixedAllowances:[],
  ctcTemplateFixedDeductions:[]
}, { collection: 'CTCTemplate' });

module.exports = mongoose.model('CTCTemplate', ctcTemplateSchema);
