const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { UserPresence } = require('../models/communication');
const User = require('../models/permissions/userModel');

let wsManagerInstance = null;

class CommunicationWebSocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set<socketId>
    this.socketUsers = new Map(); // socketId -> { userId, companyId, deviceId }
    this.typingUsers = new Map(); // conversationId -> Map<userId, timeout>
  }

  /**
   * Initialize the WebSocket server
   * @param {http.Server} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    // Setup namespaces
    this.setupNamespaces();

    // Setup main connection handler
    this.io.use(this.authMiddleware.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    console.log('Communication WebSocket Manager initialized');
  }

  /**
   * JWT authentication middleware
   */
  async authMiddleware(socket, next) {
    try {
      const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id company firstName lastName');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.companyId = user.company.toString();
      socket.userName = `${user.firstName} ${user.lastName}`;
      socket.deviceId = socket.handshake.auth.deviceId || 'unknown';

      next();
    } catch (error) {
      console.error('WebSocket auth error:', error.message);
      next(new Error('Invalid token'));
    }
  }

  /**
   * Setup namespaces for different concerns
   */
  setupNamespaces() {
    // Communication namespace
    this.commNs = this.io.of('/communication');
    this.commNs.use(this.authMiddleware.bind(this));
    this.commNs.on('connection', this.handleConnection.bind(this));
  }

  /**
   * Handle new socket connection
   */
  async handleConnection(socket) {
    const { userId, companyId, deviceId } = socket;

    console.log(`User ${userId} connected via socket ${socket.id}`);

    // Track socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    this.socketUsers.set(socket.id, { userId, companyId, deviceId });

    // Join company room
    socket.join(`company:${companyId}`);

    // Update presence
    await this.updatePresenceOnConnect(userId, companyId, deviceId);

    // Setup event handlers
    this.setupMessageHandlers(socket);
    this.setupPresenceHandlers(socket);
    this.setupCallHandlers(socket);
    this.setupTypingHandlers(socket);

    // Handle disconnect
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle socket disconnect
   */
  async handleDisconnect(socket) {
    const { userId, companyId, deviceId } = socket;

    console.log(`User ${userId} disconnected from socket ${socket.id}`);

    // Remove socket tracking
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);

        // User has no more connections - mark offline
        await this.updatePresenceOnDisconnect(userId, companyId, deviceId);
      }
    }
    this.socketUsers.delete(socket.id);
  }

  /**
   * Update presence when user connects
   */
  async updatePresenceOnConnect(userId, companyId, deviceId) {
    try {
      let presence = await UserPresence.findOne({ userId });

      if (!presence) {
        presence = new UserPresence({
          userId,
          company: companyId,
          status: 'online'
        });
      }

      presence.setOnline({ deviceId, platform: 'web' });
      await presence.save();

      // Broadcast presence change to company
      this.broadcastPresenceChange(userId, companyId, 'online');
    } catch (error) {
      console.error('Error updating presence on connect:', error);
    }
  }

  /**
   * Update presence when user disconnects
   */
  async updatePresenceOnDisconnect(userId, companyId, deviceId) {
    try {
      const presence = await UserPresence.findOne({ userId });

      if (presence) {
        presence.setOffline(deviceId);
        await presence.save();

        // Broadcast presence change
        this.broadcastPresenceChange(userId, companyId, presence.status);
      }
    } catch (error) {
      console.error('Error updating presence on disconnect:', error);
    }
  }

  /**
   * Setup message-related event handlers
   */
  setupMessageHandlers(socket) {
    const { userId } = socket;

    // Join conversation room
    socket.on('conversation:join', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Message read acknowledgment (handled via REST, but can also be via WS)
    socket.on('message:read', async ({ conversationId, messageId }) => {
      const { Conversation, Message } = require('../models/communication');

      try {
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.isParticipant(userId)) {
          conversation.updateLastRead(userId, messageId);
          await conversation.save();

          // Notify message sender
          const message = await Message.findById(messageId);
          if (message && message.senderId.toString() !== userId) {
            this.emitToUser(message.senderId, 'message:read', {
              conversationId,
              messageId,
              readBy: userId,
              readAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error handling message read:', error);
      }
    });
  }

  /**
   * Setup presence-related event handlers
   */
  setupPresenceHandlers(socket) {
    const { userId, companyId } = socket;

    // Presence sync - send all online users to newly connected client
    socket.on('presence:sync', async () => {
      try {
        const onlineUsers = await UserPresence.getOnlineUsers(companyId);
        socket.emit('presence:initial', { users: onlineUsers });
      } catch (error) {
        console.error('Error syncing presence:', error);
      }
    });

    // Heartbeat
    socket.on('presence:heartbeat', async ({ isActive }) => {
      try {
        const presence = await UserPresence.findOne({ userId });
        if (presence) {
          if (isActive === false) {
            presence.setIdle();
          } else {
            presence.setActive();
          }
          presence.lastSeenAt = new Date();
          await presence.save();
        }
      } catch (error) {
        console.error('Error handling heartbeat:', error);
      }
    });

    // Status update
    socket.on('presence:status', async ({ status, customStatus }) => {
      try {
        const presence = await UserPresence.findOne({ userId });
        if (presence) {
          if (status) {
            presence.setStatus(status);
          }
          if (customStatus) {
            presence.setCustomStatus(customStatus.text, customStatus.emoji, customStatus.duration);
          }
          await presence.save();

          this.broadcastPresenceChange(userId, companyId, presence.effectiveStatus, presence.customStatus);
        }
      } catch (error) {
        console.error('Error handling status update:', error);
      }
    });
  }

  /**
   * Setup call-related event handlers
   */
  setupCallHandlers(socket) {
    const { userId } = socket;

    // WebRTC signaling - offer
    socket.on('call:offer', ({ callId, targetUserId, sdp }) => {
      this.emitToUser(targetUserId, 'call:offer', {
        callId,
        fromUserId: userId,
        sdp
      });
    });

    // WebRTC signaling - answer
    socket.on('call:answer-sdp', ({ callId, targetUserId, sdp }) => {
      this.emitToUser(targetUserId, 'call:answer-sdp', {
        callId,
        fromUserId: userId,
        sdp
      });
    });

    // WebRTC signaling - ICE candidate
    socket.on('call:ice-candidate', ({ callId, targetUserId, candidate }) => {
      this.emitToUser(targetUserId, 'call:ice-candidate', {
        callId,
        fromUserId: userId,
        candidate
      });
    });

    // Join call room
    socket.on('call:join-room', ({ callId }) => {
      socket.join(`call:${callId}`);
    });

    // Leave call room
    socket.on('call:leave-room', ({ callId }) => {
      socket.leave(`call:${callId}`);
    });
  }

  /**
   * Setup typing indicator handlers
   */
  setupTypingHandlers(socket) {
    const { userId } = socket;

    socket.on('typing:start', ({ conversationId }) => {
      // Clear existing timeout
      const conversationTyping = this.typingUsers.get(conversationId) || new Map();
      if (conversationTyping.has(userId)) {
        clearTimeout(conversationTyping.get(userId));
      }

      // Broadcast typing start
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: true
      });

      // Set auto-stop timeout (5 seconds)
      const timeout = setTimeout(() => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', {
          conversationId,
          userId,
          isTyping: false
        });
        conversationTyping.delete(userId);
      }, 5000);

      conversationTyping.set(userId, timeout);
      this.typingUsers.set(conversationId, conversationTyping);
    });

    socket.on('typing:stop', ({ conversationId }) => {
      const conversationTyping = this.typingUsers.get(conversationId);
      if (conversationTyping && conversationTyping.has(userId)) {
        clearTimeout(conversationTyping.get(userId));
        conversationTyping.delete(userId);
      }

      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false
      });
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    const userIdStr = userId.toString();
    return this.userSockets.has(userIdStr) && this.userSockets.get(userIdStr).size > 0;
  }

  /**
   * Emit event to a specific user (all their sockets)
   */
  emitToUser(userId, event, data) {
    const userIdStr = userId.toString();
    const socketIds = this.userSockets.get(userIdStr);

    if (socketIds && socketIds.size > 0) {
      socketIds.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  /**
   * Emit event to multiple users
   */
  emitToUsers(userIds, event, data) {
    userIds.forEach(userId => {
      this.emitToUser(userId, event, data);
    });
  }

  /**
   * Emit event to a conversation room
   */
  emitToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Emit event to a company room
   */
  emitToCompany(companyId, event, data) {
    this.io.to(`company:${companyId}`).emit(event, data);
  }

  /**
   * Emit event to a call room
   */
  emitToCall(callId, event, data) {
    this.io.to(`call:${callId}`).emit(event, data);
  }

  /**
   * Broadcast presence change to all relevant users
   */
  broadcastPresenceChange(userId, companyId, status, customStatus = null) {
    this.emitToCompany(companyId, 'presence:update', {
      userId,
      status,
      customStatus,
      timestamp: new Date()
    });
  }

  /**
   * Get count of online users
   */
  getOnlineUserCount() {
    return this.userSockets.size;
  }

  /**
   * Get all socket IDs for a user
   */
  getUserSocketIds(userId) {
    return this.userSockets.get(userId.toString()) || new Set();
  }
}

// Initialize singleton
function initializeWebSocketManager(server) {
  if (!wsManagerInstance) {
    wsManagerInstance = new CommunicationWebSocketManager();
    wsManagerInstance.initialize(server);
  }
  return wsManagerInstance;
}

function getWebSocketManager() {
  return wsManagerInstance;
}

module.exports = {
  CommunicationWebSocketManager,
  initializeWebSocketManager,
  getWebSocketManager
};
