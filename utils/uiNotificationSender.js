const eventNotificationController = require('../controllers/eventNotificationController');
const eventNotificationType = require('../models/eventNotification/eventNotificationType');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');

async function SendUINotification(title, message, notificationTypeName, userId, companyId, req) {
    if (!userId) {
        websocketHandler.sendLog(req, `Missing parameters: userId`, constants.LOG_TYPES.ERROR);
        return;
    }

    try {
        const notificationType = await eventNotificationType.findOne({ name: notificationTypeName, company: companyId });
        
        if (!notificationType) { 
            websocketHandler.sendLog(req, `Notification type ${notificationTypeName} not found`, constants.LOG_TYPES.WARN); 
        }

        const notificationBody = {
            name: title,
            description: message,
            eventNotificationType: notificationType?._id?.toString(),
            date: new Date(),
            navigationUrl: '',
            isRecurring: false,
            recurringFrequency: null,
            leadTime: 0,
            status: 'unread'
        };

        const notificationReq = {
            ...req,
            body: notificationBody,
            cookies: {
                ...req.cookies,
                userId: userId,
                companyId: companyId
            }
        };

        // Fire and forget
        (async () => {
            try {
                await eventNotificationController.addNotificationForUser(notificationReq, {}, () => {});
            } catch (err) {
                console.error('Error calling addNotificationForUser:', err.message);
            }
        })();
    } catch (error) {
        websocketHandler.sendLog(req, `Failed to create event notification for task`, constants.LOG_TYPES.ERROR);
    }
}

module.exports = {
    SendUINotification
};