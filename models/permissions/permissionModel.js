const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    permissionName: { type: String, required: true, unique: true },
    permissionDetails: { type: String },
    resource: { type: String, required: true }, // e.g., employees, time-tracker
    action: { type: String, required: true }, // e.g., read, write, delete
    uiElement: { type: String }, // e.g., button:edit-employee
    parentPermission: { type: mongoose.Schema.ObjectId, ref: 'Permission' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'Permission',
  }
);

permissionSchema.index({ permissionName: 1, resource: 1, action: 1 });

permissionSchema.virtual('rolePermission', {
  ref: 'RolePermission',
  foreignField: 'permissionId',
  localField: '_id',
});

module.exports = mongoose.model('Permission', permissionSchema);