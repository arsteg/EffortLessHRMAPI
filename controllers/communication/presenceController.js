const { UserPresence } = require('../../models/communication');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { getWebSocketManager } = require('../../websocket/communicationWSManager');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPresence:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, away, busy, dnd, invisible, offline]
 *         customStatus:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             emoji:
 *               type: string
 *         lastSeenAt:
 *           type: string
 *           format: date-time
 */

// Get current user's presence
exports.getMyPresence = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.user.company;

  const presence = await UserPresence.findOrCreate(userId, companyId);

  res.status(200).json({
    status: 'success',
    data: presence
  });
});

// Update presence status
exports.updateStatus = catchAsync(async (req, res, next) => {
  const { status, duration } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  const validStatuses = ['online', 'away', 'busy', 'dnd', 'invisible'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  let presence = await UserPresence.findOrCreate(userId, companyId);

  if (status === 'online') {
    presence.manualStatus = null;
  } else {
    presence.setStatus(status, duration);
  }

  await presence.save();

  // Broadcast presence change
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcastPresenceChange(userId, companyId, presence.effectiveStatus);
  }

  res.status(200).json({
    status: 'success',
    data: presence
  });
});

// Set custom status
exports.setCustomStatus = catchAsync(async (req, res, next) => {
  const { text, emoji, duration } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!text && !emoji) {
    return next(new AppError('Text or emoji is required', 400));
  }

  let presence = await UserPresence.findOrCreate(userId, companyId);
  presence.setCustomStatus(text, emoji, duration);
  await presence.save();

  // Broadcast
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcastPresenceChange(userId, companyId, presence.effectiveStatus, presence.customStatus);
  }

  res.status(200).json({
    status: 'success',
    data: presence
  });
});

// Clear custom status
exports.clearCustomStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.user.company;

  let presence = await UserPresence.findOne({ userId });

  if (presence) {
    presence.clearCustomStatus();
    await presence.save();

    // Broadcast
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcastPresenceChange(userId, companyId, presence.effectiveStatus, null);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Custom status cleared'
  });
});

// Get presence for multiple users
exports.getPresenceForUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;

  if (!userIds || userIds.length === 0) {
    return next(new AppError('User IDs are required', 400));
  }

  // Limit to 100 users
  const limitedIds = userIds.slice(0, 100);

  const presences = await UserPresence.getPresenceForUsers(limitedIds);

  // Create a map for easy lookup
  const presenceMap = {};
  presences.forEach(p => {
    presenceMap[p.userId.toString()] = {
      userId: p.userId,
      status: p.effectiveStatus,
      customStatus: p.customStatus,
      lastSeenAt: p.lastSeenAt
    };
  });

  // Fill in offline status for users not found
  limitedIds.forEach(id => {
    if (!presenceMap[id]) {
      presenceMap[id] = {
        userId: id,
        status: 'offline',
        customStatus: null,
        lastSeenAt: null
      };
    }
  });

  res.status(200).json({
    status: 'success',
    data: presenceMap
  });
});

// Get online users in company
exports.getOnlineUsers = catchAsync(async (req, res, next) => {
  const companyId = req.user.company;

  const onlineUsers = await UserPresence.getOnlineUsers(companyId);

  res.status(200).json({
    status: 'success',
    results: onlineUsers.length,
    data: onlineUsers
  });
});

// Register device
exports.registerDevice = catchAsync(async (req, res, next) => {
  const { deviceId, platform, os, browser, appVersion, pushToken, pushProvider } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  if (!deviceId || !platform) {
    return next(new AppError('Device ID and platform are required', 400));
  }

  let presence = await UserPresence.findOrCreate(userId, companyId);

  presence.updateDevice({
    deviceId,
    platform,
    os,
    browser,
    appVersion,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (pushToken) {
    presence.registerPushToken(deviceId, pushToken, pushProvider);
  }

  presence.setOnline({ deviceId, platform });
  await presence.save();

  // Broadcast
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcastPresenceChange(userId, companyId, 'online');
  }

  res.status(200).json({
    status: 'success',
    data: presence
  });
});

// Unregister device
exports.unregisterDevice = catchAsync(async (req, res, next) => {
  const { deviceId } = req.params;
  const userId = req.user._id;
  const companyId = req.user.company;

  const presence = await UserPresence.findOne({ userId });

  if (presence) {
    presence.removeDevice(deviceId);
    presence.setOffline(deviceId);
    await presence.save();

    // Broadcast if offline
    if (presence.status === 'offline') {
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.broadcastPresenceChange(userId, companyId, 'offline');
      }
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Device unregistered'
  });
});

// Update notification settings
exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  const { desktop, mobile, email, quietHours } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  let presence = await UserPresence.findOrCreate(userId, companyId);

  if (desktop) {
    presence.notificationSettings.desktop = { ...presence.notificationSettings.desktop, ...desktop };
  }
  if (mobile) {
    presence.notificationSettings.mobile = { ...presence.notificationSettings.mobile, ...mobile };
  }
  if (email) {
    presence.notificationSettings.email = { ...presence.notificationSettings.email, ...email };
  }
  if (quietHours) {
    presence.notificationSettings.quietHours = { ...presence.notificationSettings.quietHours, ...quietHours };
  }

  await presence.save();

  res.status(200).json({
    status: 'success',
    data: presence.notificationSettings
  });
});

// Set DND schedule
exports.setDndSchedule = catchAsync(async (req, res, next) => {
  const { enabled, startTime, endTime, timezone, days } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  let presence = await UserPresence.findOrCreate(userId, companyId);

  presence.dndSchedule = {
    enabled: enabled !== false,
    startTime,
    endTime,
    timezone: timezone || 'UTC',
    days: days || [0, 1, 2, 3, 4, 5, 6]
  };

  await presence.save();

  res.status(200).json({
    status: 'success',
    data: presence.dndSchedule
  });
});

// Heartbeat - keep presence alive
exports.heartbeat = catchAsync(async (req, res, next) => {
  const { deviceId, isActive } = req.body;
  const userId = req.user._id;
  const companyId = req.user.company;

  let presence = await UserPresence.findOne({ userId });

  if (!presence) {
    presence = await UserPresence.findOrCreate(userId, companyId);
  }

  if (isActive === false) {
    presence.setIdle();
  } else {
    presence.setActive();
  }

  if (deviceId) {
    const device = presence.activeDevices.find(d => d.deviceId === deviceId);
    if (device) {
      device.lastActiveAt = new Date();
      device.isActive = true;
    }
  }

  presence.lastSeenAt = new Date();
  await presence.save();

  res.status(200).json({
    status: 'success',
    message: 'Heartbeat received'
  });
});

// Get presence for a single user
exports.getUserPresence = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const presence = await UserPresence.findOne({ userId })
    .select('userId status customStatus lastSeenAt');

  if (!presence) {
    return res.status(200).json({
      status: 'success',
      data: {
        userId,
        status: 'offline',
        customStatus: null,
        lastSeenAt: null
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      userId: presence.userId,
      status: presence.effectiveStatus,
      customStatus: presence.customStatus,
      lastSeenAt: presence.lastSeenAt
    }
  });
});
