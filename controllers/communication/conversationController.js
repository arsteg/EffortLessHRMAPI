const { Conversation, Message, UserPresence } = require('../../models/communication');
const User = require('../../models/permissions/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { getWebSocketManager } = require('../../websocket/communicationWSManager');

// Get all conversations for current user
exports.getConversations = catchAsync(async (req, res, next) => {
  const { type, archived, limit = 50, skip = 0, search } = req.query;
  const userId = req.user._id;
  const companyId = req.user.company;

  const query = {
    company: companyId,
    'participants.userId': userId,
    isDeleted: false
  };

  if (type) {
    query.type = type;
  }

  if (archived === 'true') {
    query.isArchived = true;
  } else if (archived !== 'all') {
    query.isArchived = false;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { lastMessagePreview: { $regex: search, $options: 'i' } }
    ];
  }

  const conversations = await Conversation.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .populate('lastMessageSenderId', 'firstName lastName')
    .lean();

  // Calculate unread counts
  for (const conv of conversations) {
    const participant = conv.participants.find(
      p => p.userId._id.toString() === userId.toString()
    );

    if (participant && participant.lastReadAt) {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        createdAt: { $gt: participant.lastReadAt },
        senderId: { $ne: userId },
        isDeleted: false
      });
      conv.unreadCount = unreadCount;
    } else {
      conv.unreadCount = 0;
    }
  }

  // Get presence for direct conversation participants
  const directConvs = conversations.filter(c => c.type === 'direct');
  const otherUserIds = directConvs.map(c => {
    const other = c.participants.find(p => p.userId._id.toString() !== userId.toString());
    return other ? other.userId._id : null;
  }).filter(Boolean);

  if (otherUserIds.length > 0) {
    const presences = await UserPresence.find({
      userId: { $in: otherUserIds }
    }).select('userId status customStatus lastSeenAt');

    const presenceMap = new Map(presences.map(p => [p.userId.toString(), p]));

    conversations.forEach(conv => {
      if (conv.type === 'direct') {
        const other = conv.participants.find(p => p.userId._id.toString() !== userId.toString());
        if (other) {
          conv.otherUserPresence = presenceMap.get(other.userId._id.toString()) || null;
        }
      }
    });
  }

  const total = await Conversation.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    total,
    data: conversations
  });
});

// Get single conversation
exports.getConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  })
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .populate('pinnedMessages');

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Create direct conversation
exports.createDirectConversation = catchAsync(async (req, res, next) => {
  const { targetUserId } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!targetUserId) {
    return next(new AppError('Target user ID is required', 400));
  }

  if (targetUserId === userId.toString()) {
    return next(new AppError('Cannot create conversation with yourself', 400));
  }

  // Check if target user exists and is in same company
  const targetUser = await User.findOne({
    _id: targetUserId,
    company: companyId
  });

  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  // Check if conversation already exists
  let conversation = await Conversation.findDirectConversation(userId, targetUserId, companyId);

  if (conversation) {
    // Return existing conversation
    await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

    return res.status(200).json({
      status: 'success',
      data: conversation,
      existing: true
    });
  }

  // Create new conversation
  conversation = await Conversation.create({
    type: 'direct',
    participants: [
      { userId, role: 'member' },
      { userId: targetUserId, role: 'member' }
    ],
    company: companyId,
    createdBy: userId
  });

  await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

  // Notify target user via WebSocket
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.emitToUser(targetUserId, 'conversation:new', {
      conversation
    });
  }

  res.status(201).json({
    status: 'success',
    data: conversation
  });
});

// Create group conversation
exports.createGroupConversation = catchAsync(async (req, res, next) => {
  const { name, participantIds, avatar, description, linkedProjectId, linkedTaskId } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!name) {
    return next(new AppError('Group name is required', 400));
  }

  if (!participantIds || participantIds.length === 0) {
    return next(new AppError('At least one participant is required', 400));
  }

  // Verify all participants are in the same company
  const validUsers = await User.find({
    _id: { $in: participantIds },
    company: companyId
  }).select('_id');

  const validUserIds = validUsers.map(u => u._id.toString());
  const invalidIds = participantIds.filter(id => !validUserIds.includes(id));

  if (invalidIds.length > 0) {
    return next(new AppError('Some participants are invalid', 400));
  }

  // Create participants array
  const participants = [
    { userId, role: 'owner' }
  ];

  participantIds.forEach(id => {
    if (id !== userId.toString()) {
      participants.push({ userId: id, role: 'member' });
    }
  });

  const conversation = await Conversation.create({
    type: 'group',
    name,
    avatar,
    participants,
    metadata: {
      description,
      linkedProjectId,
      linkedTaskId
    },
    company: companyId,
    createdBy: userId
  });

  await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

  // Notify all participants via WebSocket
  const wsManager = getWebSocketManager();
  if (wsManager) {
    participantIds.forEach(participantId => {
      if (participantId !== userId.toString()) {
        wsManager.emitToUser(participantId, 'conversation:new', {
          conversation
        });
      }
    });
  }

  // Create system message
  await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    type: 'system',
    content: {
      text: `${req.user.firstName} ${req.user.lastName} created the group "${name}"`
    },
    metadata: {
      systemEventType: 'group_created'
    },
    company: companyId
  });

  res.status(201).json({
    status: 'success',
    data: conversation
  });
});

// Update conversation
exports.updateConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, avatar, description, settings } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  // Check if user has permission to update
  const role = conversation.getParticipantRole(userId);
  if (conversation.type === 'group' && role !== 'owner' && role !== 'admin') {
    return next(new AppError('You do not have permission to update this conversation', 403));
  }

  // Update fields
  if (name !== undefined) conversation.name = name;
  if (avatar !== undefined) conversation.avatar = avatar;
  if (description !== undefined) conversation.metadata.description = description;
  if (settings) {
    conversation.settings = { ...conversation.settings.toObject(), ...settings };
  }

  await conversation.save();
  await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers(participantIds, 'conversation:updated', {
      conversationId: conversation._id,
      updates: { name, avatar, description, settings }
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Add participants to group
exports.addParticipants = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { participantIds } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!participantIds || participantIds.length === 0) {
    return next(new AppError('Participant IDs are required', 400));
  }

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    type: 'group',
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const role = conversation.getParticipantRole(userId);
  if (role !== 'owner' && role !== 'admin') {
    return next(new AppError('You do not have permission to add participants', 403));
  }

  // Verify users
  const validUsers = await User.find({
    _id: { $in: participantIds },
    company: companyId
  }).select('_id firstName lastName');

  const addedUsers = [];
  for (const user of validUsers) {
    if (!conversation.isParticipant(user._id)) {
      conversation.addParticipant(user._id);
      addedUsers.push(user);
    }
  }

  if (addedUsers.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No new participants added',
      data: conversation
    });
  }

  await conversation.save();
  await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

  // Create system message
  const names = addedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ');
  await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    type: 'system',
    content: {
      text: `${req.user.firstName} ${req.user.lastName} added ${names} to the group`
    },
    metadata: {
      systemEventType: 'participants_added',
      systemEventData: { addedUserIds: addedUsers.map(u => u._id) }
    },
    company: companyId
  });

  // Notify all participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const allParticipantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers(allParticipantIds, 'conversation:participants_added', {
      conversationId: conversation._id,
      addedUsers: addedUsers.map(u => ({ _id: u._id, firstName: u.firstName, lastName: u.lastName }))
    });

    // Send new conversation to added users
    addedUsers.forEach(user => {
      wsManager.emitToUser(user._id, 'conversation:new', { conversation });
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Remove participant from group
exports.removeParticipant = catchAsync(async (req, res, next) => {
  const { id, participantId } = req.params;
  const userId = req.user._id;
  const companyId = req.user.company;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    type: 'group',
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const role = conversation.getParticipantRole(userId);
  const targetRole = conversation.getParticipantRole(participantId);

  // Only owner can remove admins, admins can remove members
  if (targetRole === 'owner') {
    return next(new AppError('Cannot remove the owner', 403));
  }

  if (role !== 'owner' && (targetRole === 'admin' || participantId !== userId.toString())) {
    return next(new AppError('You do not have permission to remove this participant', 403));
  }

  const removedUser = await User.findById(participantId).select('firstName lastName');

  conversation.removeParticipant(participantId);
  await conversation.save();

  // Create system message
  const isLeaving = participantId === userId.toString();
  await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    type: 'system',
    content: {
      text: isLeaving
        ? `${req.user.firstName} ${req.user.lastName} left the group`
        : `${req.user.firstName} ${req.user.lastName} removed ${removedUser.firstName} ${removedUser.lastName} from the group`
    },
    metadata: {
      systemEventType: isLeaving ? 'participant_left' : 'participant_removed',
      systemEventData: { removedUserId: participantId }
    },
    company: companyId
  });

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers([...participantIds, participantId], 'conversation:participant_removed', {
      conversationId: conversation._id,
      removedUserId: participantId
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Archive conversation
exports.archiveConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  conversation.isArchived = true;
  conversation.archivedAt = new Date();
  await conversation.save();

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Unarchive conversation
exports.unarchiveConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  conversation.isArchived = false;
  conversation.archivedAt = null;
  await conversation.save();

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Delete conversation (soft delete)
exports.deleteConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  // Only owner can delete group conversations
  if (conversation.type === 'group') {
    const role = conversation.getParticipantRole(userId);
    if (role !== 'owner') {
      return next(new AppError('Only the owner can delete this conversation', 403));
    }
  }

  conversation.isDeleted = true;
  conversation.deletedAt = new Date();
  await conversation.save();

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers(participantIds, 'conversation:deleted', {
      conversationId: conversation._id
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Conversation deleted'
  });
});

// Mark conversation as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { messageId } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  // Find the latest message if not provided
  let lastMessageId = messageId;
  if (!lastMessageId) {
    const lastMessage = await Message.findOne({
      conversationId: id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    if (lastMessage) {
      lastMessageId = lastMessage._id;
    }
  }

  if (lastMessageId) {
    conversation.updateLastRead(userId, lastMessageId);
    await conversation.save();

    // Notify sender that message was read
    const message = await Message.findById(lastMessageId);
    if (message && message.senderId.toString() !== userId.toString()) {
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.emitToUser(message.senderId, 'message:read', {
          conversationId: id,
          messageId: lastMessageId,
          readBy: userId,
          readAt: new Date()
        });
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Marked as read'
  });
});

// Update notification preferences
exports.updateNotificationPreference = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { preference, muted, mutedUntil } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const participant = conversation.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (participant) {
    if (preference) participant.notificationPreference = preference;
    if (muted !== undefined) participant.isMuted = muted;
    if (mutedUntil) participant.mutedUntil = mutedUntil;
  }

  await conversation.save();

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Pin message
exports.pinMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { messageId } = req.body;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const message = await Message.findOne({
    _id: messageId,
    conversationId: id,
    isDeleted: false
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (!conversation.pinnedMessages.includes(messageId)) {
    conversation.pinnedMessages.push(messageId);
    message.isPinned = true;
    await Promise.all([conversation.save(), message.save()]);
  }

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers(participantIds, 'message:pinned', {
      conversationId: id,
      messageId,
      pinnedBy: userId
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Unpin message
exports.unpinMessage = catchAsync(async (req, res, next) => {
  const { id, messageId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  conversation.pinnedMessages = conversation.pinnedMessages.filter(
    m => m.toString() !== messageId
  );

  const message = await Message.findById(messageId);
  if (message) {
    message.isPinned = false;
    await message.save();
  }

  await conversation.save();

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId._id || p.userId);
    wsManager.emitToUsers(participantIds, 'message:unpinned', {
      conversationId: id,
      messageId,
      unpinnedBy: userId
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// Get or create direct conversation
exports.getOrCreateDirect = catchAsync(async (req, res, next) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (targetUserId === userId.toString()) {
    return next(new AppError('Cannot create conversation with yourself', 400));
  }

  // Check if target user exists
  const targetUser = await User.findOne({
    _id: targetUserId,
    company: companyId
  });

  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  // Find existing conversation
  let conversation = await Conversation.findDirectConversation(userId, targetUserId, companyId);

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      type: 'direct',
      participants: [
        { userId, role: 'member' },
        { userId: targetUserId, role: 'member' }
      ],
      company: companyId,
      createdBy: userId
    });
  }

  await conversation.populate('participants.userId', 'firstName lastName email profilePicture');

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});
