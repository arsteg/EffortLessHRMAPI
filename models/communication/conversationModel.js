const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  lastReadMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  notificationPreference: {
    type: String,
    enum: ['all', 'mentions', 'none'],
    default: 'all'
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: Date
}, { _id: false });

const conversationSettingsSchema = new mongoose.Schema({
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowReactions: {
    type: Boolean,
    default: true
  },
  allowThreads: {
    type: Boolean,
    default: true
  },
  allowFileSharing: {
    type: Boolean,
    default: true
  },
  retentionDays: {
    type: Number,
    default: 0 // 0 means no retention policy
  }
}, { _id: false });

const metadataSchema = new mongoose.Schema({
  linkedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  linkedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: String,
  tags: [String]
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'channel'],
    required: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  avatar: String,
  participants: [participantSchema],
  settings: {
    type: conversationSettingsSchema,
    default: () => ({})
  },
  metadata: {
    type: metadataSchema,
    default: () => ({})
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessagePreview: {
    type: String,
    maxlength: 200
  },
  lastMessageSenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ company: 1, 'participants.userId': 1 });
conversationSchema.index({ company: 1, type: 1, lastMessageAt: -1 });
conversationSchema.index({ company: 1, isArchived: 1, lastMessageAt: -1 });
conversationSchema.index({ 'metadata.linkedProjectId': 1 });
conversationSchema.index({ 'metadata.linkedTaskId': 1 });
conversationSchema.index({ createdAt: -1 });

// Virtual for unread count (calculated per user)
conversationSchema.virtual('unreadCount').get(function() {
  return this._unreadCount || 0;
});

conversationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Static methods
conversationSchema.statics.findByParticipant = function(userId, companyId, options = {}) {
  const query = {
    company: companyId,
    'participants.userId': userId,
    isDeleted: false
  };

  if (options.type) {
    query.type = options.type;
  }

  if (!options.includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

conversationSchema.statics.findDirectConversation = function(userId1, userId2, companyId) {
  return this.findOne({
    company: companyId,
    type: 'direct',
    isDeleted: false,
    $and: [
      { 'participants.userId': userId1 },
      { 'participants.userId': userId2 }
    ],
    'participants': { $size: 2 }
  });
};

// Instance methods
conversationSchema.methods.addParticipant = function(userId, role = 'member') {
  const exists = this.participants.some(p => p.userId.toString() === userId.toString());
  if (!exists) {
    this.participants.push({ userId, role, joinedAt: new Date() });
  }
  return this;
};

conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.userId.toString() !== userId.toString()
  );
  return this;
};

conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString());
};

conversationSchema.methods.getParticipantRole = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  return participant ? participant.role : null;
};

conversationSchema.methods.updateLastRead = function(userId, messageId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.lastReadAt = new Date();
    participant.lastReadMessageId = messageId;
  }
  return this;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
