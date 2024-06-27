let io;
let userSocketMap = new Map();
let clientId;
let connectedClient;

const setSocketIO = (ioInstance, clientIdInstance, connectedClientInstance) => {
    io = ioInstance;
    clientId = clientIdInstance;
    connectedClient = connectedClientInstance;
};


const sendUsersLiveImagesToApp = (userId, imageString) => {
    try{
        if(typeof io !== 'undefined'){
            if(userId == connectedClient)
            {
                console.log(`In: connectedClient: ${connectedClient} #userId: ${userId}`);
                io.to(clientId).emit("liveImage", imageString);
                console.log('live imagesent!');
            }
        }
    }
    catch(error){
        console.log(error);
    }
};

module.exports = {
    setSocketIO,
    sendUsersLiveImagesToApp,
};
