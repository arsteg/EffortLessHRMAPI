const { CallSession, Conversation, UserPresence, Channel } = require('../../models/communication');
const User = require('../../models/permissions/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { getWebSocketManager } = require('../../websocket/communicationWSManager');

// ICE server configuration
const getIceServers = () => {
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN server if configured
    ...(process.env.TURN_URL ? [{
      urls: process.env.TURN_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL
    }] : [])
  ];
};

// Initiate a call
exports.initiateCall = catchAsync(async (req, res, next) => {
  const { targetUserId, conversationId, type = 'voice', channelId } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  // Validate input
  if (!targetUserId && !channelId) {
    return next(new AppError('Target user ID or channel ID is required', 400));
  }

  // Check if user is already in a call
  const existingCall = await CallSession.findOne({
    'participants.userId': userId,
    status: { $in: ['ringing', 'connecting', 'active'] }
  });

  if (existingCall) {
    return next(new AppError('You are already in a call', 400));
  }

  let conversation;
  let participants = [{ userId, status: 'connected' }];

  if (channelId) {
    // Group call in voice channel
    const channel = await Channel.findOne({
      _id: channelId,
      type: 'voice',
      isDeleted: false
    });

    if (!channel) {
      return next(new AppError('Voice channel not found', 404));
    }

    // Get all users in the voice channel
    channel.activeVoiceUsers.forEach(user => {
      if (user.userId.toString() !== userId.toString()) {
        participants.push({ userId: user.userId, status: 'ringing' });
      }
    });
  } else {
    // 1:1 or direct call
    // Verify target user exists and is in same company
    const targetUser = await User.findOne({
      _id: targetUserId,
      company: companyId
    });

    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if target user is busy
    const targetPresence = await UserPresence.findOne({ userId: targetUserId });
    if (targetPresence?.currentCallId) {
      return next(new AppError('User is currently busy', 400));
    }

    participants.push({ userId: targetUserId, status: 'ringing' });

    // Get or create conversation
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userId,
        isDeleted: false
      });
    } else {
      conversation = await Conversation.findDirectConversation(userId, targetUserId, companyId);
      if (!conversation) {
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
    }
  }

  // Create call session
  const callSession = await CallSession.create({
    type,
    mode: participants.length > 2 ? 'sfu' : 'p2p',
    status: 'ringing',
    initiator: userId,
    participants,
    maxParticipants: participants.length > 2 ? 25 : 2,
    conversationId: conversation?._id,
    channelId,
    iceServers: getIceServers(),
    company: companyId
  });

  // Update initiator's presence
  await UserPresence.findOneAndUpdate(
    { userId },
    { $set: { currentCallId: callSession._id, status: 'busy' } }
  );

  // Notify target users via WebSocket
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const callerInfo = {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profilePicture: req.user.profilePicture
    };

    participants.forEach(p => {
      if (p.userId.toString() !== userId.toString()) {
        wsManager.emitToUser(p.userId, 'call:incoming', {
          callId: callSession._id,
          callerId: userId,
          callerInfo,
          type,
          conversationId: conversation?._id,
          channelId,
          iceServers: getIceServers()
        });
      }
    });
  }

  // Set timeout for missed call (30 seconds)
  setTimeout(async () => {
    const call = await CallSession.findById(callSession._id);
    if (call && call.status === 'ringing') {
      call.miss();
      await call.save();

      // Update presence
      await UserPresence.findOneAndUpdate(
        { userId },
        { $unset: { currentCallId: 1 }, $set: { status: 'online' } }
      );

      // Notify all participants
      const wsManager = getWebSocketManager();
      if (wsManager) {
        call.participants.forEach(p => {
          wsManager.emitToUser(p.userId, 'call:missed', {
            callId: callSession._id
          });
        });
      }
    }
  }, 30000);

  res.status(201).json({
    status: 'success',
    data: {
      callSession,
      iceServers: getIceServers()
    }
  });
});

// Answer a call
exports.answerCall = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { hasVideo = false, hasAudio = true } = req.body;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId,
    status: { $in: ['ringing', 'connecting'] }
  });

  if (!callSession) {
    return next(new AppError('Call not found or already answered', 404));
  }

  callSession.answer(userId);
  callSession.updateParticipant(userId, { hasVideo, hasAudio });
  await callSession.save();

  // Update presence
  await UserPresence.findOneAndUpdate(
    { userId },
    { $set: { currentCallId: callSession._id, status: 'busy' } }
  );

  // Notify initiator
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.emitToUser(callSession.initiator, 'call:answered', {
      callId: id,
      answeredBy: userId,
      hasVideo,
      hasAudio
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      callSession,
      iceServers: getIceServers()
    }
  });
});

// Reject a call
exports.rejectCall = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId,
    status: 'ringing'
  });

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  callSession.reject(userId);
  await callSession.save();

  // Notify initiator
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.emitToUser(callSession.initiator, 'call:rejected', {
      callId: id,
      rejectedBy: userId
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Call rejected'
  });
});

// End a call
exports.endCall = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason = 'completed' } = req.body;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId,
    status: { $in: ['ringing', 'connecting', 'active', 'on_hold'] }
  });

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  callSession.end(reason);
  await callSession.save();

  // Update presence for all participants
  const participantIds = callSession.participants.map(p => p.userId);
  await UserPresence.updateMany(
    { userId: { $in: participantIds } },
    { $unset: { currentCallId: 1 } }
  );

  // Notify all participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    callSession.participants.forEach(p => {
      wsManager.emitToUser(p.userId, 'call:ended', {
        callId: id,
        endedBy: userId,
        duration: callSession.duration,
        reason
      });
    });
  }

  // Create system message in conversation
  if (callSession.conversationId && callSession.duration) {
    const { Message } = require('../../models/communication');
    await Message.create({
      conversationId: callSession.conversationId,
      senderId: callSession.initiator,
      type: 'call',
      content: {
        text: `${callSession.type} call ended`
      },
      metadata: {
        callDuration: callSession.duration,
        callType: callSession.type
      },
      company: callSession.company
    });
  }

  res.status(200).json({
    status: 'success',
    data: callSession
  });
});

// Leave a call (for group calls)
exports.leaveCall = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId,
    status: 'active'
  });

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  callSession.removeParticipant(userId);
  await callSession.save();

  // Update presence
  await UserPresence.findOneAndUpdate(
    { userId },
    { $unset: { currentCallId: 1 }, $set: { status: 'online' } }
  );

  // Notify remaining participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    callSession.participants
      .filter(p => p.status === 'connected')
      .forEach(p => {
        wsManager.emitToUser(p.userId, 'call:participant_left', {
          callId: id,
          userId
        });
      });
  }

  // If no participants left, end the call
  const activeParticipants = callSession.participants.filter(p => p.status === 'connected');
  if (activeParticipants.length === 0) {
    callSession.end('completed');
    await callSession.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Left call'
  });
});

// Get active call
exports.getActiveCall = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    'participants.userId': userId,
    status: { $in: ['ringing', 'connecting', 'active', 'on_hold'] }
  })
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .populate('conversationId', 'name type');

  if (!callSession) {
    return res.status(200).json({
      status: 'success',
      data: null
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      callSession,
      iceServers: getIceServers()
    }
  });
});

// Get call history
exports.getCallHistory = catchAsync(async (req, res, next) => {
  const { type, startDate, endDate, limit = 50, skip = 0 } = req.query;
  const userId = req.user._id;
  const companyId = req.user.company;

  const options = {
    type,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  const calls = await CallSession.getCallHistory(userId, companyId, options);

  res.status(200).json({
    status: 'success',
    results: calls.length,
    data: calls
  });
});

// Get call by ID
exports.getCall = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId
  })
    .populate('participants.userId', 'firstName lastName email profilePicture')
    .populate('conversationId', 'name type');

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: callSession
  });
});

// Update participant state (mute, video toggle, etc.)
exports.updateParticipantState = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { hasAudio, hasVideo, isScreenSharing, isMuted, isDeafened } = req.body;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'participants.userId': userId,
    status: 'active'
  });

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  const updates = {};
  if (hasAudio !== undefined) updates.hasAudio = hasAudio;
  if (hasVideo !== undefined) updates.hasVideo = hasVideo;
  if (isScreenSharing !== undefined) updates.isScreenSharing = isScreenSharing;
  if (isMuted !== undefined) updates.isMuted = isMuted;
  if (isDeafened !== undefined) updates.isDeafened = isDeafened;

  callSession.updateParticipant(userId, updates);

  // Add event
  if (hasVideo !== undefined) {
    callSession.addEvent(hasVideo ? 'video_on' : 'video_off', userId);
  }
  if (isScreenSharing !== undefined) {
    callSession.addEvent(isScreenSharing ? 'screen_share_start' : 'screen_share_stop', userId);
  }

  await callSession.save();

  // Notify other participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    callSession.participants
      .filter(p => p.userId.toString() !== userId.toString() && p.status === 'connected')
      .forEach(p => {
        wsManager.emitToUser(p.userId, 'call:participant_updated', {
          callId: id,
          userId,
          updates
        });
      });
  }

  res.status(200).json({
    status: 'success',
    data: callSession
  });
});

// Start recording
exports.startRecording = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    status: 'active'
  });

  if (!callSession) {
    return next(new AppError('Call not found', 404));
  }

  // Check if user has permission to record
  if (callSession.initiator.toString() !== userId.toString()) {
    return next(new AppError('Only call initiator can start recording', 403));
  }

  callSession.startRecording(userId);
  await callSession.save();

  // Notify all participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    callSession.participants
      .filter(p => p.status === 'connected')
      .forEach(p => {
        wsManager.emitToUser(p.userId, 'call:recording_started', {
          callId: id,
          recordedBy: userId
        });
      });
  }

  res.status(200).json({
    status: 'success',
    message: 'Recording started'
  });
});

// Stop recording
exports.stopRecording = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { url, size } = req.body;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    _id: id,
    'recording.enabled': true
  });

  if (!callSession) {
    return next(new AppError('Recording not found', 404));
  }

  callSession.stopRecording(url, size);
  await callSession.save();

  // Notify all participants
  const wsManager = getWebSocketManager();
  if (wsManager) {
    callSession.participants
      .filter(p => p.status === 'connected')
      .forEach(p => {
        wsManager.emitToUser(p.userId, 'call:recording_stopped', {
          callId: id,
          recordingUrl: url
        });
      });
  }

  res.status(200).json({
    status: 'success',
    data: callSession.recording
  });
});

// Schedule a meeting
exports.scheduleMeeting = catchAsync(async (req, res, next) => {
  const { title, description, scheduledAt, duration, participantIds, type = 'video' } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!scheduledAt || !participantIds || participantIds.length === 0) {
    return next(new AppError('Scheduled time and participants are required', 400));
  }

  const participants = [
    { userId, status: 'connected' }
  ];

  participantIds.forEach(id => {
    if (id !== userId.toString()) {
      participants.push({ userId: id, status: 'invited' });
    }
  });

  const callSession = await CallSession.create({
    type,
    mode: participants.length > 2 ? 'sfu' : 'p2p',
    status: 'initiating',
    initiator: userId,
    participants,
    maxParticipants: 25,
    title,
    description,
    scheduledAt: new Date(scheduledAt),
    scheduledDuration: duration || 60,
    company: companyId
  });

  // Generate meeting link
  callSession.generateMeetingLink();
  await callSession.save();

  // TODO: Send calendar invites to participants

  res.status(201).json({
    status: 'success',
    data: {
      callSession,
      meetingLink: `${process.env.APP_URL}/meeting/${callSession.meetingLink}`
    }
  });
});

// Get scheduled meetings
exports.getScheduledMeetings = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.user.company;

  const meetings = await CallSession.findScheduledCalls(userId, companyId);

  res.status(200).json({
    status: 'success',
    results: meetings.length,
    data: meetings
  });
});

// Join by meeting link
exports.joinByLink = catchAsync(async (req, res, next) => {
  const { meetingLink, password } = req.body;
  const userId = req.user._id;

  const callSession = await CallSession.findOne({
    meetingLink,
    status: { $in: ['initiating', 'ringing', 'active'] }
  });

  if (!callSession) {
    return next(new AppError('Meeting not found', 404));
  }

  if (callSession.meetingPassword && callSession.meetingPassword !== password) {
    return next(new AppError('Invalid meeting password', 401));
  }

  // Add user as participant if not already
  if (!callSession.participants.some(p => p.userId.toString() === userId.toString())) {
    callSession.addParticipant(userId, { status: 'connecting' });
    await callSession.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      callSession,
      iceServers: getIceServers()
    }
  });
});
