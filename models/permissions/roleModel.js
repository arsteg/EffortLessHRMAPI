const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String }, // New field
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: [true, 'Company must belong to a Company'],
    },
    active: { type: Boolean, default: true, select: false },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now, required: true },
    updatedOn: { type: Date, default: Date.now, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'Role',
  }
);

roleSchema.index({ company: 1, Name: 1 });

roleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'company',
    select: 'companyName',
  });
  this.find({ active: { $ne: false } });
  next();
});

roleSchema.virtual('rolePermission', {
  ref: 'RolePermission',
  foreignField: 'roleId',
  localField: '_id',
});

roleSchema.virtual('user', {
  ref: 'User',
  foreignField: 'role',
  localField: '_id',
});

module.exports = mongoose.model('Role', roleSchema);