const mongoose = require('mongoose');

const linkPreviewSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: String,
  description: String,
  image: String,
  siteName: String
}, { _id: false });

const contentSchema = new mongoose.Schema({
  text: {
    type: String,
    maxlength: 10000
  },
  html: String,
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  links: [linkPreviewSchema]
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  originalName: String,
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  thumbnail: String,
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number, // For audio/video in seconds
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  count: {
    type: Number,
    default: 0
  }
}, { _id: false });

const readReceiptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const deliveryReceiptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const editHistorySchema = new mongoose.Schema({
  content: String,
  editedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'system', 'call'],
    default: 'text'
  },
  content: {
    type: contentSchema,
    default: () => ({})
  },
  attachments: [attachmentSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadCount: {
    type: Number,
    default: 0
  },
  threadParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [reactionSchema],
  readBy: [readReceiptSchema],
  deliveredTo: [deliveryReceiptSchema],
  editHistory: [editHistorySchema],
  forwardedFrom: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation'
    }
  },
  metadata: {
    callDuration: Number,
    callType: String,
    systemEventType: String,
    systemEventData: mongoose.Schema.Types.Mixed
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, threadId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ company: 1, createdAt: -1 });
messageSchema.index({ 'content.text': 'text' });
messageSchema.index({ 'attachments.type': 1, company: 1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ isPinned: 1, conversationId: 1 });

// Text index for search
messageSchema.index(
  { 'content.text': 'text' },
  {
    weights: { 'content.text': 10 },
    name: 'message_text_search'
  }
);

// Virtual for sender info (populated separately)
messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Update reactions count
  if (this.reactions) {
    this.reactions.forEach(reaction => {
      reaction.count = reaction.users ? reaction.users.length : 0;
    });
  }
  next();
});

// Static methods
messageSchema.statics.getConversationMessages = function(conversationId, options = {}) {
  const query = {
    conversationId,
    isDeleted: false
  };

  if (options.threadId === null) {
    // Get only main messages, not thread replies
    query.threadId = { $exists: false };
  } else if (options.threadId) {
    // Get thread replies
    query.threadId = options.threadId;
  }

  if (options.before) {
    query.createdAt = { $lt: options.before };
  }

  if (options.after) {
    query.createdAt = { ...(query.createdAt || {}), $gt: options.after };
  }

  return this.find(query)
    .sort({ createdAt: options.ascending ? 1 : -1 })
    .limit(options.limit || 50)
    .populate('senderId', 'firstName lastName email profilePicture')
    .populate('replyTo', 'content.text senderId');
};

messageSchema.statics.searchMessages = function(companyId, searchText, options = {}) {
  const query = {
    company: companyId,
    isDeleted: false,
    $text: { $search: searchText }
  };

  if (options.conversationId) {
    query.conversationId = options.conversationId;
  }

  if (options.senderId) {
    query.senderId = options.senderId;
  }

  if (options.type) {
    query.type = options.type;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .populate('senderId', 'firstName lastName email profilePicture')
    .populate('conversationId', 'name type');
};

// Instance methods
messageSchema.methods.addReaction = function(emoji, userId) {
  let reaction = this.reactions.find(r => r.emoji === emoji);

  if (!reaction) {
    reaction = { emoji, users: [], count: 0 };
    this.reactions.push(reaction);
    reaction = this.reactions[this.reactions.length - 1];
  }

  const userIdStr = userId.toString();
  if (!reaction.users.some(u => u.toString() === userIdStr)) {
    reaction.users.push(userId);
    reaction.count = reaction.users.length;
  }

  return this;
};

messageSchema.methods.removeReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);

  if (reaction) {
    reaction.users = reaction.users.filter(u => u.toString() !== userId.toString());
    reaction.count = reaction.users.length;

    if (reaction.count === 0) {
      this.reactions = this.reactions.filter(r => r.emoji !== emoji);
    }
  }

  return this;
};

messageSchema.methods.markAsRead = function(userId) {
  const userIdStr = userId.toString();
  const alreadyRead = this.readBy.some(r => r.userId.toString() === userIdStr);

  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }

  return this;
};

messageSchema.methods.markAsDelivered = function(userId) {
  const userIdStr = userId.toString();
  const alreadyDelivered = this.deliveredTo.some(d => d.userId.toString() === userIdStr);

  if (!alreadyDelivered) {
    this.deliveredTo.push({ userId, deliveredAt: new Date() });
  }

  return this;
};

messageSchema.methods.editContent = function(newText) {
  // Save current content to history
  if (this.content.text) {
    this.editHistory.push({
      content: this.content.text,
      editedAt: new Date()
    });
  }

  this.content.text = newText;
  this.isEdited = true;

  return this;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
