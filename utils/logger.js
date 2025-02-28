const { io } = require('../server'); // Import Socket.io instance
const global = require('../utils/globalStore'); // Import globalStore

const logEvent = (req, userId, message) => {
    if (global.selectedUserForLogging && global.selectedUserForLogging === req.cookies.userId) {
        console.log(`[LOG] User: ${userId} - ${message}`);
        // Emit log to the frontend
        io.emit(`log-${userId}`, { userId, message, timestamp: new Date() });
    }
};
module.exports = logEvent;