//const { io } = require('../server'); // Import Socket.io instance
const global = require('../utils/globalStore'); // Import globalStore

let io;
const setLoggerSocketIO = (ioInstance) => {
    io = ioInstance;
    if (!io) {
        console.log('Socket.io not initialize');
    }
    else{
        console.log('Socket.io initialized');
    }
};

const logEvent = (req, userId, message) => {
    if (global.selectedUserForLogging && global.selectedUserForLogging === req.cookies.userId) {
        console.log(`[LOG] User: ${userId} - ${message}`);
        try {
            io.emit(`log-${userId}`, { userId, message, timestamp: new Date() });
        } catch (error) {
            console.error('Error retrieving Socket.io instance:', error.message);
        }
    }
};
//module.exports = logEvent;

module.exports = {
    setLoggerSocketIO,
    logEvent,
};