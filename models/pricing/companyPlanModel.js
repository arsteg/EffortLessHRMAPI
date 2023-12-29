var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companyPlanSchema = new Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  }
  }, { collection: 'CompanyPlan' });

module.exports = mongoose.model('CompanyPlan', companyPlanSchema);
