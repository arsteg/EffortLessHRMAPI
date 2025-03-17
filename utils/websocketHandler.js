// logEvent.js
const WebSocket = require('ws');
const global = require('./globalStore'); // Import globalStore
const constants = require('../constants'); // Import constants

let wss;

const initWebSocket = (server) => {
  console.log('Initializing WebSocket server:');  
  wss = new WebSocket.Server({ server });    
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected:');

        ws.on('message', (message) => {
            console.log(`Received message from client: ${message}`);
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
  };

// Function to send logs
const logEvent = (req, message) => {
    console.log('Sending log message:', message);
    const userId = req.cookies.userId;
    if (global.selectedUserForLogging && global.selectedUserForLogging === userId) {
        const logMessage = JSON.stringify({
            type: 'log',
            contentType: constants.webSocketContentType.Text,
            userId,
            message,
            timestamp: new Date(),
        });        
        broadcastMessage(logMessage);
    }
};

// Function to send notifications
const sendNotification = (userId, notification) => {
    const notificationMessage = JSON.stringify({
        type: 'notification',
        contentType: constants.webSocketContentType.Text,
        userId,
        message: notification,
        timestamp: new Date(),
    });
    broadcastMessage(notificationMessage);
};


// Helper function to broadcast messages
// Function to broadcast messages
const broadcastMessage = (message) => {
    if (wss) {
      console.log(`Broadcasting message: "${message}" to ${wss.clients.size} clients`);
  
      wss.clients.forEach((client, index) => {
        console.log(`Client ${index + 1}: readyState = ${client.readyState}`);  
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
          console.log(`✅ Successfully sent to Client ${index + 1}`);
        } else {
          console.warn(`⚠️ Skipped Client ${index + 1}: Connection not open (readyState = ${client.readyState})`);
        }
      });
  
      console.log("Broadcasting completed.");
    } else {
      console.error("❌ WebSocket server (wss) is not initialized.");
    }
  };

 
// Export functions for external use
module.exports = {
    logEvent,
    sendNotification,
    initWebSocket
};