const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Permission',
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
    collection: 'RolePermission',
  }
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1, company: 1 });

rolePermissionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'company',
    select: 'companyName',
  })
    .populate({
      path: 'roleId',
      select: 'Name description',
    })
    .populate({
      path: 'permissionId',
      select: 'permissionName permissionDetails resource action uiElement',
    });
  next();
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);