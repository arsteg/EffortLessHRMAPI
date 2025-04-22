const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Role',
      required: true,
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: [true, 'Company must belong to a Company'],
    },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'UserRole',
  }
);

userRoleSchema.index({ userId: 1, roleId: 1, company: 1 });

userRoleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'firstName lastName email',
  }).populate({
    path: 'roleId',
    select: 'Name description',
  });
  next();
});

module.exports = mongoose.model('UserRole', userRoleSchema);