var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loanAdvancesCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  }
}, { collection: 'LoanAdvancesCategory' });

module.exports = mongoose.model('LoanAdvancesCategory', loanAdvancesCategorySchema);
