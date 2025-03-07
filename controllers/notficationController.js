const catchAsync = require('../utils/catchAsync');
const catchMessageAsync= require('../utils/catchMessageAsync');
const WebSocket = require('ws');
const express = require('express');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

const app = express();
// Create a new WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Store connected clients
const connectedClients = new Set();

// WebSocket upgrade listener for the HTTP server
const server = app.listen(4000, () => {
  console.log('WebSocket server is running on port 4000');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection event
wss.on('connection', (ws, request) => {
  console.log('A new client connected');

  // Add the client to the set of connected clients
  connectedClients.add(ws);

  // WebSocket message event
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // You can handle incoming messages from the client here if needed
  });

  // WebSocket close event
  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove the client from the set of connected clients
    connectedClients.delete(ws);
  });

  // You can also send an initial message to the client upon connection if needed
  // ws.send('Welcome to the WebSocket server!');
});

// API endpoint to send notifications to connected clients
exports.SendNotification = catchMessageAsync(async (req, res, next, message) => {
  console.log(message);
  const notificationMessage = message;
  // Send the notification message to all connected clients
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(notificationMessage);
    }
  });

  return Promise.resolve();
});