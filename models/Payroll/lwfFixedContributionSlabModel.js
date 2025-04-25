var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fixedContributionSlabSchema = new Schema({  
  state: {
    type: String,
    required: true
  },
  fixedContribution: {
    type: String,
    required: true
  },
  employeeAmount: {
    type: Number,
    required: true
  },
  employerAmount: {
    type: Number,
    required: true
  },
  employeePercentage: {
    type: Number,
    required: true
  },
  employerPercentage: {
    type: Number,
    required: true
  },
  maxContribution: {
    type: Number,
    required: true
  },
  minAmount: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default : true
  }
}, { collection: 'LWFFixedContributionSlab' });
// 🔄 Middleware to deactivate old active slabs with same state + contribution + company
fixedContributionSlabSchema.pre('save', async function (next) {
  if ((this.isNew || this.isModified('isActive')) && this.minAmount === 0 && this.maxAmount === 0) {
    await this.constructor.updateMany(
      {
        state: this.state,
        fixedContribution: this.fixedContribution,
        company: this.company,
        isActive: true,
        _id: { $ne: this._id } // Avoid deactivating the current one
      },
      {
        $set: { isActive: false }
      }
    );
  }
  next();
});

module.exports = mongoose.model('LWFFixedContributionSlab', fixedContributionSlabSchema);
