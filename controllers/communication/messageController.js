const { Conversation, Message, CommunicationFile } = require('../../models/communication');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { getWebSocketManager } = require('../../websocket/communicationWSManager');

// Get messages for a conversation
exports.getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const { limit = 50, before, after, threadId } = req.query;
  const userId = req.user._id;

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const options = {
    limit: parseInt(limit),
    before: before ? new Date(before) : null,
    after: after ? new Date(after) : null,
    threadId: threadId === 'null' ? null : threadId
  };

  const messages = await Message.getConversationMessages(conversationId, options);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages
  });
});

// Send a message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { conversationId, content, attachments, replyTo, type = 'text' } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!conversationId) {
    return next(new AppError('Conversation ID is required', 400));
  }

  if (!content?.text && (!attachments || attachments.length === 0)) {
    return next(new AppError('Message content or attachments required', 400));
  }

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  // Create message
  const messageData = {
    conversationId,
    senderId: userId,
    type,
    content: {
      text: content?.text || '',
      mentions: content?.mentions || []
    },
    company: companyId
  };

  if (attachments && attachments.length > 0) {
    messageData.attachments = attachments;
    if (!messageData.content.text && attachments.length === 1) {
      messageData.type = attachments[0].type;
    }
  }

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  const message = await Message.create(messageData);

  // Update conversation
  await Conversation.updateOne(
    { _id: conversationId },
    {
      lastMessageAt: new Date(),
      lastMessagePreview: message.content.text
        ? message.content.text.substring(0, 100)
        : `Sent ${message.type}`,
      lastMessageSenderId: userId,
      $inc: { messageCount: 1 }
    }
  );

  // Populate sender info
  await message.populate('senderId', 'firstName lastName email profilePicture');
  await message.populate('replyTo', 'content.text senderId');

  // Broadcast to all participants via WebSocket
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants
      .map(p => p.userId.toString())
      .filter(id => id !== userId.toString());

    wsManager.emitToUsers(participantIds, 'message:received', {
      message,
      conversationId
    });

    // Send acknowledgement to sender
    wsManager.emitToUser(userId, 'message:sent', {
      message,
      conversationId
    });

    // Mark as delivered to online users
    participantIds.forEach(participantId => {
      if (wsManager.isUserOnline(participantId)) {
        message.markAsDelivered(participantId);
      }
    });
    await message.save();
  }

  // Handle mentions - send notifications
  if (content?.mentions && content.mentions.length > 0) {
    // TODO: Send push notifications to mentioned users
  }

  res.status(201).json({
    status: 'success',
    data: message
  });
});

// Edit a message
exports.editMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) {
    return next(new AppError('Message text is required', 400));
  }

  const message = await Message.findOne({
    _id: id,
    senderId: userId,
    isDeleted: false
  });

  if (!message) {
    return next(new AppError('Message not found or not authorized', 404));
  }

  // Check if message is too old to edit (e.g., 24 hours)
  const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - message.createdAt > maxEditTime) {
    return next(new AppError('Message is too old to edit', 400));
  }

  message.editContent(text);
  await message.save();

  // Notify participants
  const conversation = await Conversation.findById(message.conversationId);
  if (conversation) {
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const participantIds = conversation.participants.map(p => p.userId.toString());
      wsManager.emitToUsers(participantIds, 'message:edited', {
        messageId: id,
        conversationId: message.conversationId,
        newContent: message.content,
        editedAt: new Date()
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: message
  });
});

// Delete a message
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if user is sender or has admin permission
  const conversation = await Conversation.findById(message.conversationId);
  const role = conversation?.getParticipantRole(userId);

  if (message.senderId.toString() !== userId.toString() && role !== 'owner' && role !== 'admin') {
    return next(new AppError('Not authorized to delete this message', 403));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = userId;
  await message.save();

  // Notify participants
  if (conversation) {
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const participantIds = conversation.participants.map(p => p.userId.toString());
      wsManager.emitToUsers(participantIds, 'message:deleted', {
        messageId: id,
        conversationId: message.conversationId,
        deletedBy: userId
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Message deleted'
  });
});

// Add reaction to message
exports.addReaction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  if (!emoji) {
    return next(new AppError('Emoji is required', 400));
  }

  const message = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: message.conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Not authorized', 403));
  }

  message.addReaction(emoji, userId);
  await message.save();

  // Notify participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const participantIds = conversation.participants.map(p => p.userId.toString());
    wsManager.emitToUsers(participantIds, 'message:reaction_added', {
      messageId: id,
      conversationId: message.conversationId,
      emoji,
      userId,
      reactions: message.reactions
    });
  }

  res.status(200).json({
    status: 'success',
    data: message.reactions
  });
});

// Remove reaction from message
exports.removeReaction = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  message.removeReaction(emoji, userId);
  await message.save();

  // Notify participants
  const conversation = await Conversation.findById(message.conversationId);
  if (conversation) {
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const participantIds = conversation.participants.map(p => p.userId.toString());
      wsManager.emitToUsers(participantIds, 'message:reaction_removed', {
        messageId: id,
        conversationId: message.conversationId,
        emoji,
        userId,
        reactions: message.reactions
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: message.reactions
  });
});

// Get thread messages
exports.getThreadMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { limit = 50, before } = req.query;
  const userId = req.user._id;

  // Get parent message
  const parentMessage = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!parentMessage) {
    return next(new AppError('Message not found', 404));
  }

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: parentMessage.conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Not authorized', 403));
  }

  const query = {
    threadId: id,
    isDeleted: false
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: 1 })
    .limit(parseInt(limit))
    .populate('senderId', 'firstName lastName email profilePicture');

  res.status(200).json({
    status: 'success',
    results: messages.length,
    parentMessage,
    data: messages
  });
});

// Reply to thread
exports.replyToThread = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content, attachments, type = 'text' } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  // Get parent message
  const parentMessage = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!parentMessage) {
    return next(new AppError('Message not found', 404));
  }

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: parentMessage.conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Not authorized', 403));
  }

  // Create reply
  const messageData = {
    conversationId: parentMessage.conversationId,
    senderId: userId,
    type,
    content: {
      text: content?.text || '',
      mentions: content?.mentions || []
    },
    threadId: id,
    company: companyId
  };

  if (attachments && attachments.length > 0) {
    messageData.attachments = attachments;
  }

  const message = await Message.create(messageData);

  // Update parent message thread count and participants
  parentMessage.threadCount += 1;
  if (!parentMessage.threadParticipants.includes(userId)) {
    parentMessage.threadParticipants.push(userId);
  }
  await parentMessage.save();

  await message.populate('senderId', 'firstName lastName email profilePicture');

  // Notify thread participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const notifyIds = [...new Set([
      ...parentMessage.threadParticipants.map(id => id.toString()),
      parentMessage.senderId.toString()
    ])].filter(id => id !== userId.toString());

    wsManager.emitToUsers(notifyIds, 'thread:reply', {
      message,
      parentMessageId: id,
      conversationId: parentMessage.conversationId
    });
  }

  res.status(201).json({
    status: 'success',
    data: message
  });
});

// Search messages
exports.searchMessages = catchAsync(async (req, res, next) => {
  const { q, conversationId, senderId, type, startDate, endDate, limit = 50, skip = 0 } = req.query;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!q || q.length < 2) {
    return next(new AppError('Search query must be at least 2 characters', 400));
  }

  // If searching within a conversation, verify access
  if (conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId,
      isDeleted: false
    });

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }
  }

  const options = {
    conversationId,
    senderId,
    type,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  const messages = await Message.searchMessages(companyId, q, options);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages
  });
});

// Forward message
exports.forwardMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { targetConversationIds } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!targetConversationIds || targetConversationIds.length === 0) {
    return next(new AppError('Target conversation IDs required', 400));
  }

  const originalMessage = await Message.findOne({
    _id: id,
    isDeleted: false
  });

  if (!originalMessage) {
    return next(new AppError('Message not found', 404));
  }

  // Verify user has access to original message
  const originalConversation = await Conversation.findOne({
    _id: originalMessage.conversationId,
    'participants.userId': userId
  });

  if (!originalConversation) {
    return next(new AppError('Not authorized', 403));
  }

  const forwardedMessages = [];

  for (const targetConversationId of targetConversationIds) {
    // Verify access to target conversation
    const targetConversation = await Conversation.findOne({
      _id: targetConversationId,
      'participants.userId': userId,
      isDeleted: false
    });

    if (!targetConversation) continue;

    // Create forwarded message
    const forwardedMessage = await Message.create({
      conversationId: targetConversationId,
      senderId: userId,
      type: originalMessage.type,
      content: originalMessage.content,
      attachments: originalMessage.attachments,
      forwardedFrom: {
        messageId: originalMessage._id,
        conversationId: originalMessage.conversationId
      },
      company: companyId
    });

    // Update target conversation
    await Conversation.updateOne(
      { _id: targetConversationId },
      {
        lastMessageAt: new Date(),
        lastMessagePreview: `Forwarded: ${originalMessage.content.text?.substring(0, 50) || originalMessage.type}`,
        lastMessageSenderId: userId,
        $inc: { messageCount: 1 }
      }
    );

    await forwardedMessage.populate('senderId', 'firstName lastName email profilePicture');
    forwardedMessages.push(forwardedMessage);

    // Notify participants
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const participantIds = targetConversation.participants
        .map(p => p.userId.toString())
        .filter(id => id !== userId.toString());

      wsManager.emitToUsers(participantIds, 'message:received', {
        message: forwardedMessage,
        conversationId: targetConversationId
      });
    }
  }

  res.status(201).json({
    status: 'success',
    results: forwardedMessages.length,
    data: forwardedMessages
  });
});

// Mark messages as delivered
exports.markAsDelivered = catchAsync(async (req, res, next) => {
  const { messageIds } = req.body;
  const userId = req.user._id;

  if (!messageIds || messageIds.length === 0) {
    return next(new AppError('Message IDs required', 400));
  }

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      'deliveredTo.userId': { $ne: userId }
    },
    {
      $addToSet: {
        deliveredTo: {
          userId,
          deliveredAt: new Date()
        }
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as delivered'
  });
});

// Get pinned messages
exports.getPinnedMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': userId,
    isDeleted: false
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const messages = await Message.find({
    _id: { $in: conversation.pinnedMessages },
    isDeleted: false
  }).populate('senderId', 'firstName lastName email profilePicture');

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages
  });
});
