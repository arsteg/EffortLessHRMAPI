const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },

    machineId: {
      type: String,
      required: true,
      trim: true
    },

    isOnline: {
      type: Boolean,
      default: false
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * 🔐 ENFORCE ONE DEVICE PER USER + MACHINE
 */
userDeviceSchema.index(
  { userId: 1, machineId: 1 },
  { unique: true }
);

/**
 * Optional performance index
 */
userDeviceSchema.index({ company: 1 });

module.exports = mongoose.model('UserDevice', userDeviceSchema);
