const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['web', 'desktop', 'mobile', 'tablet'],
    required: true
  },
  os: String,
  browser: String,
  appVersion: String,
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  pushToken: String,
  pushProvider: {
    type: String,
    enum: ['fcm', 'apns', 'web']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: String,
  userAgent: String
}, { _id: false });

const customStatusSchema = new mongoose.Schema({
  text: {
    type: String,
    maxlength: 128
  },
  emoji: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userPresenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'dnd', 'invisible', 'offline'],
    default: 'offline'
  },
  manualStatus: {
    type: String,
    enum: ['online', 'away', 'busy', 'dnd', 'invisible', null],
    default: null
  },
  customStatus: customStatusSchema,
  activeDevices: [deviceSchema],
  currentCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallSession'
  },
  currentVoiceChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  currentWorkspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  // Idle detection
  idleSince: Date,
  isIdle: {
    type: Boolean,
    default: false
  },
  // Do not disturb settings
  dndUntil: Date,
  dndSchedule: {
    enabled: Boolean,
    startTime: String, // HH:MM format
    endTime: String,
    timezone: String,
    days: [Number] // 0-6, Sunday-Saturday
  },
  // Notification settings
  notificationSettings: {
    desktop: {
      enabled: {
        type: Boolean,
        default: true
      },
      sound: {
        type: Boolean,
        default: true
      }
    },
    mobile: {
      enabled: {
        type: Boolean,
        default: true
      },
      sound: {
        type: Boolean,
        default: true
      },
      vibrate: {
        type: Boolean,
        default: true
      }
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['instant', 'hourly', 'daily', 'never'],
        default: 'never'
      }
    },
    quietHours: {
      enabled: Boolean,
      startTime: String,
      endTime: String,
      timezone: String
    }
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userPresenceSchema.index({ userId: 1 }, { unique: true });
userPresenceSchema.index({ company: 1, status: 1 });
userPresenceSchema.index({ 'activeDevices.deviceId': 1 });
userPresenceSchema.index({ lastSeenAt: -1 });
userPresenceSchema.index({ currentCallId: 1 });
userPresenceSchema.index({ currentVoiceChannelId: 1 });

userPresenceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    // Remove sensitive device information
    if (ret.activeDevices) {
      ret.activeDevices = ret.activeDevices.map(d => ({
        platform: d.platform,
        isActive: d.isActive,
        lastActiveAt: d.lastActiveAt
      }));
    }
    return ret;
  }
});

// Virtual for effective status (considering DND schedule, manual status, etc.)
userPresenceSchema.virtual('effectiveStatus').get(function() {
  // Check manual status first
  if (this.manualStatus) {
    return this.manualStatus;
  }

  // Check DND
  if (this.isDndActive()) {
    return 'dnd';
  }

  // Check if idle
  if (this.isIdle) {
    return 'away';
  }

  return this.status;
});

// Virtual for device count
userPresenceSchema.virtual('activeDeviceCount').get(function() {
  return this.activeDevices ? this.activeDevices.filter(d => d.isActive).length : 0;
});

// Instance methods
userPresenceSchema.methods.isDndActive = function() {
  const now = new Date();

  // Check explicit DND until time
  if (this.dndUntil && this.dndUntil > now) {
    return true;
  }

  // Check DND schedule
  if (this.dndSchedule && this.dndSchedule.enabled) {
    const { startTime, endTime, timezone, days } = this.dndSchedule;

    // Simple implementation - in production, use moment-timezone
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    if (days && !days.includes(currentDay)) {
      return false;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const currentTime = currentHour * 60 + currentMinute;
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight DND
      return currentTime >= start || currentTime <= end;
    }
  }

  return false;
};

userPresenceSchema.methods.setOnline = function(deviceInfo) {
  this.status = 'online';
  this.lastSeenAt = new Date();
  this.lastActivityAt = new Date();
  this.isIdle = false;
  this.idleSince = null;

  if (deviceInfo) {
    this.updateDevice(deviceInfo);
  }

  return this;
};

userPresenceSchema.methods.setOffline = function(deviceId) {
  if (deviceId) {
    // Mark specific device as inactive
    const device = this.activeDevices.find(d => d.deviceId === deviceId);
    if (device) {
      device.isActive = false;
    }

    // Check if any devices are still active
    const hasActiveDevices = this.activeDevices.some(d => d.isActive);
    if (!hasActiveDevices) {
      this.status = 'offline';
    }
  } else {
    // Mark all devices as inactive
    this.activeDevices.forEach(d => {
      d.isActive = false;
    });
    this.status = 'offline';
  }

  this.lastSeenAt = new Date();
  return this;
};

userPresenceSchema.methods.setStatus = function(status, duration = null) {
  this.manualStatus = status;

  if (duration) {
    // Clear manual status after duration (handled by separate cron job)
    this.statusExpiresAt = new Date(Date.now() + duration);
  }

  return this;
};

userPresenceSchema.methods.setCustomStatus = function(text, emoji, duration = null) {
  this.customStatus = {
    text,
    emoji,
    createdAt: new Date(),
    expiresAt: duration ? new Date(Date.now() + duration) : null
  };

  return this;
};

userPresenceSchema.methods.clearCustomStatus = function() {
  this.customStatus = null;
  return this;
};

userPresenceSchema.methods.setIdle = function() {
  if (!this.isIdle) {
    this.isIdle = true;
    this.idleSince = new Date();
  }
  return this;
};

userPresenceSchema.methods.setActive = function() {
  this.isIdle = false;
  this.idleSince = null;
  this.lastActivityAt = new Date();
  return this;
};

userPresenceSchema.methods.updateDevice = function(deviceInfo) {
  const existingDevice = this.activeDevices.find(
    d => d.deviceId === deviceInfo.deviceId
  );

  if (existingDevice) {
    Object.assign(existingDevice, deviceInfo, {
      lastActiveAt: new Date(),
      isActive: true
    });
  } else {
    this.activeDevices.push({
      ...deviceInfo,
      lastActiveAt: new Date(),
      isActive: true
    });
  }

  // Limit to 5 devices per user
  if (this.activeDevices.length > 5) {
    // Remove oldest inactive device
    const inactiveDevices = this.activeDevices.filter(d => !d.isActive);
    if (inactiveDevices.length > 0) {
      inactiveDevices.sort((a, b) => a.lastActiveAt - b.lastActiveAt);
      const oldestDeviceId = inactiveDevices[0].deviceId;
      this.activeDevices = this.activeDevices.filter(
        d => d.deviceId !== oldestDeviceId
      );
    }
  }

  return this;
};

userPresenceSchema.methods.removeDevice = function(deviceId) {
  this.activeDevices = this.activeDevices.filter(d => d.deviceId !== deviceId);
  return this;
};

userPresenceSchema.methods.registerPushToken = function(deviceId, token, provider) {
  const device = this.activeDevices.find(d => d.deviceId === deviceId);
  if (device) {
    device.pushToken = token;
    device.pushProvider = provider;
  }
  return this;
};

userPresenceSchema.methods.joinVoiceChannel = function(channelId) {
  this.currentVoiceChannelId = channelId;
  return this;
};

userPresenceSchema.methods.leaveVoiceChannel = function() {
  this.currentVoiceChannelId = null;
  return this;
};

userPresenceSchema.methods.joinCall = function(callId) {
  this.currentCallId = callId;
  this.status = 'busy';
  return this;
};

userPresenceSchema.methods.leaveCall = function() {
  this.currentCallId = null;
  if (this.manualStatus !== 'busy') {
    this.status = this.activeDevices.some(d => d.isActive) ? 'online' : 'offline';
  }
  return this;
};

// Static methods
userPresenceSchema.statics.findOrCreate = async function(userId, companyId) {
  let presence = await this.findOne({ userId });

  if (!presence) {
    presence = new this({
      userId,
      company: companyId,
      status: 'offline'
    });
    await presence.save();
  }

  return presence;
};

userPresenceSchema.statics.getOnlineUsers = function(companyId) {
  return this.find({
    company: companyId,
    status: { $in: ['online', 'away', 'busy', 'dnd'] }
  }).select('userId status customStatus lastSeenAt');
};

userPresenceSchema.statics.getPresenceForUsers = function(userIds) {
  return this.find({
    userId: { $in: userIds }
  }).select('userId status customStatus lastSeenAt activeDevices currentCallId currentVoiceChannelId');
};

userPresenceSchema.statics.bulkUpdateLastSeen = function(userIds) {
  return this.updateMany(
    { userId: { $in: userIds } },
    { $set: { lastSeenAt: new Date() } }
  );
};

const UserPresence = mongoose.model('UserPresence', userPresenceSchema);

module.exports = UserPresence;
