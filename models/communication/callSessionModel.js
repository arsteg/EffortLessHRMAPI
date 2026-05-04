const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['invited', 'ringing', 'connecting', 'connected', 'reconnecting', 'left', 'rejected', 'missed', 'failed'],
    default: 'invited'
  },
  joinedAt: Date,
  leftAt: Date,
  hasVideo: {
    type: Boolean,
    default: false
  },
  hasAudio: {
    type: Boolean,
    default: true
  },
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isDeafened: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    platform: String,
    browser: String,
    deviceId: String
  },
  connectionQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
    default: 'unknown'
  }
}, { _id: false });

const recordingSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  startedAt: Date,
  endedAt: Date,
  url: String,
  size: Number, // bytes
  duration: Number, // seconds
  format: {
    type: String,
    enum: ['webm', 'mp4', 'mkv'],
    default: 'webm'
  },
  resolution: String,
  status: {
    type: String,
    enum: ['recording', 'processing', 'completed', 'failed'],
    default: 'recording'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const qualityMetricsSchema = new mongoose.Schema({
  avgBitrate: Number,
  maxBitrate: Number,
  minBitrate: Number,
  avgPacketLoss: Number,
  maxPacketLoss: Number,
  avgLatency: Number, // ms
  maxLatency: Number,
  avgJitter: Number,
  resolution: String,
  frameRate: Number,
  codec: String
}, { _id: false });

const iceServerSchema = new mongoose.Schema({
  urls: [String],
  username: String,
  credential: String
}, { _id: false });

const callSessionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['voice', 'video', 'screen_share'],
    required: true
  },
  mode: {
    type: String,
    enum: ['p2p', 'sfu', 'mcu'],
    default: 'p2p'
  },
  status: {
    type: String,
    enum: ['initiating', 'ringing', 'connecting', 'active', 'on_hold', 'reconnecting', 'ended', 'missed', 'rejected', 'failed', 'busy'],
    default: 'initiating'
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 2
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  recording: recordingSchema,
  qualityMetrics: qualityMetricsSchema,
  // WebRTC configuration
  iceServers: [iceServerSchema],
  // Scheduled call info
  scheduledAt: Date,
  scheduledDuration: Number, // minutes
  title: String,
  description: String,
  // Meeting link for external participants
  meetingLink: String,
  meetingPassword: String,
  // Call events log
  events: [{
    type: {
      type: String,
      enum: ['started', 'joined', 'left', 'muted', 'unmuted', 'video_on', 'video_off', 'screen_share_start', 'screen_share_stop', 'recording_start', 'recording_stop', 'reconnecting', 'reconnected', 'ended']
    },
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }],
  startedAt: Date,
  answeredAt: Date,
  endedAt: Date,
  duration: Number, // seconds
  endReason: {
    type: String,
    enum: ['completed', 'declined', 'missed', 'failed', 'cancelled', 'busy', 'timeout', 'network_error', 'kicked']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  metadata: {
    region: String,
    sfuServerId: String,
    roomId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
callSessionSchema.index({ conversationId: 1, createdAt: -1 });
callSessionSchema.index({ channelId: 1, createdAt: -1 });
callSessionSchema.index({ 'participants.userId': 1, status: 1 });
callSessionSchema.index({ company: 1, startedAt: -1 });
callSessionSchema.index({ initiator: 1, createdAt: -1 });
callSessionSchema.index({ status: 1, createdAt: -1 });
callSessionSchema.index({ meetingLink: 1 });
callSessionSchema.index({ scheduledAt: 1, status: 1 });

// TTL index for cleaning up old call sessions (90 days)
callSessionSchema.index({ endedAt: 1 }, { expireAfterSeconds: 7776000 });

callSessionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    // Remove sensitive data
    delete ret.meetingPassword;
    delete ret.iceServers;
    return ret;
  }
});

// Virtual for active participant count
callSessionSchema.virtual('activeParticipantCount').get(function() {
  return this.participants.filter(p => p.status === 'connected').length;
});

// Virtual for is group call
callSessionSchema.virtual('isGroupCall').get(function() {
  return this.maxParticipants > 2 || this.participants.length > 2;
});

// Static methods
callSessionSchema.statics.findActiveCalls = function(userId) {
  return this.find({
    'participants.userId': userId,
    status: { $in: ['ringing', 'connecting', 'active', 'on_hold', 'reconnecting'] }
  }).sort({ createdAt: -1 });
};

callSessionSchema.statics.findByConversation = function(conversationId, options = {}) {
  const query = { conversationId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

callSessionSchema.statics.findScheduledCalls = function(userId, companyId) {
  const now = new Date();
  return this.find({
    company: companyId,
    'participants.userId': userId,
    scheduledAt: { $gte: now },
    status: 'initiating'
  }).sort({ scheduledAt: 1 });
};

callSessionSchema.statics.getCallHistory = function(userId, companyId, options = {}) {
  const query = {
    company: companyId,
    'participants.userId': userId,
    status: { $in: ['ended', 'missed', 'rejected'] }
  };

  if (options.type) {
    query.type = options.type;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .populate('participants.userId', 'firstName lastName email profilePicture');
};

// Instance methods
callSessionSchema.methods.addParticipant = function(userId, options = {}) {
  const exists = this.participants.some(
    p => p.userId.toString() === userId.toString()
  );

  if (!exists) {
    this.participants.push({
      userId,
      status: options.status || 'invited',
      hasAudio: options.hasAudio !== false,
      hasVideo: options.hasVideo || false,
      deviceInfo: options.deviceInfo
    });
  }

  return this;
};

callSessionSchema.methods.updateParticipant = function(userId, updates) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (participant) {
    Object.assign(participant, updates);

    // Log the event
    if (updates.status === 'connected' && !participant.joinedAt) {
      participant.joinedAt = new Date();
      this.addEvent('joined', userId);
    } else if (updates.status === 'left' && !participant.leftAt) {
      participant.leftAt = new Date();
      this.addEvent('left', userId);
    }
  }

  return this;
};

callSessionSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (participant) {
    participant.status = 'left';
    participant.leftAt = new Date();
    this.addEvent('left', userId);
  }

  return this;
};

callSessionSchema.methods.addEvent = function(eventType, userId, data = {}) {
  this.events.push({
    type: eventType,
    userId,
    timestamp: new Date(),
    data
  });
  return this;
};

callSessionSchema.methods.start = function() {
  this.status = 'active';
  this.startedAt = new Date();
  this.addEvent('started', this.initiator);
  return this;
};

callSessionSchema.methods.answer = function(userId) {
  this.status = 'active';
  this.answeredAt = new Date();

  if (!this.startedAt) {
    this.startedAt = new Date();
  }

  this.updateParticipant(userId, { status: 'connected' });

  return this;
};

callSessionSchema.methods.end = function(reason = 'completed') {
  this.status = 'ended';
  this.endedAt = new Date();
  this.endReason = reason;

  if (this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }

  // Mark all connected participants as left
  this.participants.forEach(p => {
    if (p.status === 'connected' || p.status === 'reconnecting') {
      p.status = 'left';
      p.leftAt = this.endedAt;
    }
  });

  this.addEvent('ended', null, { reason });

  return this;
};

callSessionSchema.methods.reject = function(userId) {
  this.updateParticipant(userId, { status: 'rejected' });

  // If all participants rejected, mark call as rejected
  const allRejected = this.participants
    .filter(p => p.userId.toString() !== this.initiator.toString())
    .every(p => p.status === 'rejected');

  if (allRejected) {
    this.status = 'rejected';
    this.endedAt = new Date();
    this.endReason = 'declined';
  }

  return this;
};

callSessionSchema.methods.miss = function() {
  this.status = 'missed';
  this.endedAt = new Date();
  this.endReason = 'missed';

  this.participants.forEach(p => {
    if (p.status === 'ringing' || p.status === 'invited') {
      p.status = 'missed';
    }
  });

  return this;
};

callSessionSchema.methods.startRecording = function(userId) {
  this.recording = {
    enabled: true,
    startedAt: new Date(),
    status: 'recording',
    recordedBy: userId
  };
  this.addEvent('recording_start', userId);
  return this;
};

callSessionSchema.methods.stopRecording = function(url, size) {
  if (this.recording) {
    this.recording.enabled = false;
    this.recording.endedAt = new Date();
    this.recording.url = url;
    this.recording.size = size;
    this.recording.status = 'completed';
    this.recording.duration = Math.floor((this.recording.endedAt - this.recording.startedAt) / 1000);
    this.addEvent('recording_stop', this.recording.recordedBy);
  }
  return this;
};

callSessionSchema.methods.generateMeetingLink = function() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let link = '';
  for (let i = 0; i < 10; i++) {
    link += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.meetingLink = link;

  // Generate password
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += Math.floor(Math.random() * 10);
  }
  this.meetingPassword = password;

  return this;
};

const CallSession = mongoose.model('CallSession', callSessionSchema);

module.exports = CallSession;
