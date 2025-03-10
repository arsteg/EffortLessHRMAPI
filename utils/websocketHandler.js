// logEvent.js
const WebSocket = require('ws');
const global = require('./globalStore'); // Import globalStore
const constants = require('../constants'); // Import constants

// Initialize WebSocket server
const initializeWebSocketServer = (port) => {
    const wss = new WebSocket.Server({ port });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected on port:', port);

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

    return wss;
};

// Initialize WebSocket server on port 4000
const wss = initializeWebSocketServer(process.env.webSocketPORT|| 3030);

// Log event function
// Function to send logs
const logEvent = (req, message) => {    
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
const broadcastMessage = (message) => {
    console.log('Broadcasting message:', message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message, (error) => {
                if (error) {
                    console.error('Failed to send message to client:', error);
                }
            });
        }
    });
};

// Export functions for external use
module.exports = {
    logEvent,
    sendNotification,
    broadcastMessage, // Export broadcastMessage for other use cases
};