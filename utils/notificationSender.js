const sendNotification = (userId, io,userSocketMap,notificationTye, messageToSend) => {  
    if (userId && userSocketMap.has(userId)) {
      const socketId = userSocketMap.get(userId);            
      // Emit to the specific socket (user) identified by socketId
      io.to(socketId).emit(notificationTye,messageToSend);
       console.log('Notification sent!');      
    } else {
        console.log('Invalid or missing user ID');      
    }
};
module.exports = { sendNotification};