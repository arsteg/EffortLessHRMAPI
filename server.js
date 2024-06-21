// This is our run file
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./config/swaggerConfig');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();
const { Server } = require('socket.io');
const socket = require('./utils/socket');
const cron = require("node-cron");
const routes = require('./routes');
const notificationSender = require('./utils/notificationSender');
//  import environment variables
// Handle unhandled exceptions
// For synchronous code
process.on('uncaughtException', err => {  
  console.log(err);
  process.exit(1);
});

// Load config file (before app)
dotenv.config({ path: './config.env' });


const app = require('./app');
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const userSocketMap = new Map();

io.on('connection', (client) => {
  client.on('register', (userId) => {    
    console.log(`Registered the user ID ${userId} with the connected socket ID, the client Id is:${client.id}`);
    userSocketMap.set(userId, client.id);    
    // Emit the current user list to the new connection
    //io.to(client.id).emit('users-online', getUserList());
  });

  // Handle client disconnection
  client.on('disconnect', () => {
    // Find the user ID associated with this socket ID    
    console.log(`Client disconnected`);    
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === client.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });  
});

const swaggerSpec = (swaggerJsDoc(swaggerConfig));

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/", routes);
       
// Get db url from env file and replace <PW> with actual password
const DB = process.env.DATABASE.replace(  
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(DB);
//Connect to database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful.');
  })

// This block of code is handled by proccess 'unhadledRejection' event
.catch(err => {
  console.log('DB connection error.');
  console.log(err);
});

//execute on 1st day of each month
cron.schedule('0 0 1 * *', () => {
  console.log('This Job will run every day......');
//  leaveController.assignLeavesByJobs(); // Pass the company name as a parameter
});

//execute at every minute
cron.schedule('* * * * *', async () => {
  console.log('This Job will run every minute...');
  notificationSender.sendNotification('62dfa6993babb9ac20728636',io,userSocketMap,'users-online',{'message':'Hello'});
  // await leaveController.assignLeavesByJobs(); // Pass the company name as a parameter
});

// This is important, Heroku won't work with hard coded port
const port = process.env.PORT || 8080;
const webSocketPORT = process.env.webSocketPORT|| 8090;
httpServer.listen(webSocketPORT, () => {
  console.log(`Web socket Server listening on port ${webSocketPORT}`);
});


// Run server
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Handle unhandled rejections
// In the future, unhadled rejections will exit our application
// For asynchronous code
process.on('unhandledRejection', err => {
  // console.log('UNHADLED REJECTION! Shutting down...');
  // console.log(err.name, err.message);

  // To exit gracefuly, we should first close server and
  // just then exit the application
  server.close(() => {
    // This force exists our application
    process.exit(1); // 0 success, 1 unhadled rejection
  });
});
