const WebSocket = require('ws');
const constants = require('../constants'); // Assuming this has content types and notification types
const {globalStore} = require('./globalStore'); 

class WebSocketManager {
  constructor() {
    this.connectedUsers = new Map();
    this.wss = null;
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    console.log('WebSocket server initialized');

    this.wss.on('connection', (ws) => {
      console.log('New WebSocket client connected');

      ws.on('message', (message) => this.handleMessage(ws, message));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (error) => console.error('WebSocket error:', error));
    });
  }

  // Handle incoming messages
  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth' && data.userId) {
        this.connectedUsers.set(data.userId, ws);
        ws.userId = data.userId;
        console.log(`User ${data.userId} authenticated. Total users: ${this.connectedUsers.size}`);
      } else {
        console.log(`Received message from ${ws.userId || 'unknown'}: ${message}`);
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }

  // Handle client disconnection
  handleDisconnect(ws) {
    if (ws.userId) {
      this.connectedUsers.delete(ws.userId);
      console.log(`User ${ws.userId} disconnected. Total users: ${this.connectedUsers.size}`);
    }
  }

  // Generic message sender
  sendMessage(userIds, notificationType, content, contentType = constants.webSocketContentType.TEXT) {
    const message = {
      notificationType,
      contentType,
      content,
      timestamp: new Date().toISOString(),
    };

    const messageString = JSON.stringify(message);

    userIds.forEach((userId) => {
      const client = this.connectedUsers.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
        console.log(`Sent ${notificationType} (${contentType}) to user ${userId}`);
      } else {
        console.warn(`User ${userId} not connected or WebSocket closed`);
      }
    });
  }

  // Updated sendLog function
  sendLog(req, message,logType = constants.LOG_TYPES.INFO) {
    const userId = req.cookies?.userId || req.user?.id; // Fallback to req.user.id if cookies unavailable
    if (!userId) {
      console.warn('sendLog: No userId found in request');
      return; // Exit if no userId
    }

    if (!this.connectedUsers.has(userId)) {
      console.warn(`sendLog: User ${userId} is not connected via WebSocket`);
      return; // Exit if user isn’t connected
    }

    if(req.cookies?.userId == globalStore?.selectedUserForLogging) {
      this.sendMessage([userId], constants.WEB_SOCKET_NOTIFICATION_TYPES.LOG, message, constants.webSocketContentType.TEXT);
      return; // Exit if user isn’t the same as the one in the request
    }
  }

  // Specific notification helpers
  sendNotification(userId, content) {
    this.sendMessage([userId], constants.WEB_SOCKET_NOTIFICATION_TYPES.NOTIFICATION, content, constants.webSocketContentType.TEXT);
  }

  sendAlert(userIds, content) {
    this.sendMessage(userIds, constants.WEB_SOCKET_NOTIFICATION_TYPES.ALERT, content, constants.webSocketContentType.TEXT);
  }

  sendChat(userIds, content) {
    // Fixed typo: constants.WEB_SOCKET_NOTIFICATION_TYPES.CHAT instead of NOTIFICATION.CHAT
    this.sendMessage(userIds, constants.WEB_SOCKET_NOTIFICATION_TYPES.CHAT, content, constants.webSocketContentType.TEXT);
  }

  sendScreenshot(userIds, base64Image) {
    // Fixed typo: constants.WEB_SOCKET_NOTIFICATION_TYPES.SCREENSHOT instead of NOTIFICATION.SCREENSHOT
    console.log("Sending screenshot to users:", userIds);
    this.sendMessage(userIds, constants.WEB_SOCKET_NOTIFICATION_TYPES.SCREENSHOT, base64Image, constants.webSocketContentType.IMAGE);
    console.log("Screenshot sent to users:", userIds);
  }

  // Get connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Create and export singleton instance
const wsManager = new WebSocketManager();

module.exports = {
  initWebSocket: (server) => wsManager.initialize(server),
  sendLog: (req, message) => wsManager.sendLog(req, message),
  sendNotification: (userId, content) => wsManager.sendNotification(userId, content),
  sendAlert: (userIds, content) => wsManager.sendAlert(userIds, content),
  sendChat: (userIds, content) => wsManager.sendChat(userIds, content),
  sendScreenshot: (userIds, base64Image) => wsManager.sendScreenshot(userIds, base64Image),
  getConnectedUsers: () => wsManager.getConnectedUsers(),
};