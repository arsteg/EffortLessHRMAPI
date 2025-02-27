/**
 * Sends a notification to a specific user identified by userId.
 * @param {string} userId - The ID of the user to send the notification to.
 * @param {SocketIO.Server} io - The Socket.IO server instance.
 * @param {Map<string, string>} userSocketMap - Map of userId to socketId.
 * @param {string} notificationType - Type of the notification to send.
 * @param {any} messageToSend - Message or data to send in the notification.
 */
const sendNotification = (userId, io, userSocketMap, notificationType, messageToSend) => {
    // Validate parameters
    if (!userId || !userSocketMap.has(userId)) {
      console.error(`Invalid or missing user ID: ${userId}`);
      return;
    }
  
    const socketId = userSocketMap.get(userId);
  
    // Emit to the specific socket (user) identified by socketId
    const response = {
      status: constants.APIResponseStatus.Success,
      data: messageToSend
    };
  
    io.to(socketId).emit(notificationType, response);
    console.log(`Notification of type '${notificationType}' sent to user ${userId}`);
  };
  
  module.exports = { sendNotification };
  