const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ptEligibleStatesSchema = new Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  },
  state: {
    type: mongoose.Schema.ObjectId,
    ref: 'PTConfigureStates', // Assuming the reference is to a State schema
    required: true
  },
  isEligible: {
    type: Boolean,
    default: true // Assuming the default value for isEligible is true
  }
}, { collection: 'PTEligibleStates' });

ptEligibleStatesSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'state',
      select: 'id state'
    });
  } catch (error) {
    console.error("Error populating elegible state:", error);
  }
  next();
});

module.exports = mongoose.model('PTEligibleStates', ptEligibleStatesSchema);
