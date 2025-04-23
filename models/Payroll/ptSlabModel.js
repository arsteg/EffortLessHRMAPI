var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ptSlabSchema = new Schema({  
  fromAmount: {
    type: Number
  },
  toAmount: {
    type: String
  },
  employeePercentage: {
    type: Number,
    required: true
  },
  employeeAmount: {
    type: Number,
    required: true
  },
  twelfthMonthValue: {
    type: Number,
    required: true
  },
  twelfthMonthAmount: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming there's a Company schema for reference
    required: true
  }
}, { collection: 'PTSlab' });

ptSlabSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'state',
      select: 'id state'
    });
  } catch (error) {
    console.error("Error populating state:", error);
  }
  next();
});

module.exports = mongoose.model('PTSlab', ptSlabSchema);
