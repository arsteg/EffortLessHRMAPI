// This is our run file
require('dotenv').config({ path: './config.env' }); // Ensure this is at the very top of the file
const http = require('https');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./config/swaggerConfig');
const swaggerJsDoc = require('swagger-jsdoc');
const cron = require("node-cron");
const routes = require('./routes');
const scheduleController = require('./controllers/ScheduleController');
const attendanceController = require('./controllers/attendanceController');
const { getUserNotifications,updateRecurringNotifications } = require('./controllers/eventNotificationController');
const { initWebSocket } = require('./utils/websocketHandler');
//let { setSocketIO } = require('./utils/liveScreenSender');

//  import environment variables
// Handle unhandled exceptions
// For synchronous code
process.on('uncaughtException', err => {  
  console.log(err);
  process.exit(1);
});

const app = require('./app');
const httpServer = http.createServer(app);

const swaggerSpec = (swaggerJsDoc(swaggerConfig));

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/", routes);

// Get db url from env file and replace <PW> with actual password
const DB = process.env.DATABASE.replace(  
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//Connect to database
mongoose.set('strictQuery', true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 60000, // 60 seconds
    connectTimeoutMS: 60000, // 60 seconds
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
cron.schedule('0 0 1 * *', async () => {
  console.log('This Job will run every day......');
  await updateRecurringNotifications();
  //  leaveController.assignLeavesByJobs(); // Pass the company name as a parameter
});
//execute on 1st day of each month
cron.schedule('0 0 1 * *', async () => {
  try {
    await scheduleController.assignLeavesByJobs();
    await attendanceController.MappedTimlogToAttendance();
    console.log(`${currentTime}: This Job ran successfully.`);
} catch (error) {
    console.error('Error occurred:', error);
}
});
//Execute every 10 minutes
cron.schedule('0 0 1 * *', async () => {
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleString();
  console.log('Job started');  
  console.log(`${currentTime}:This Job will run every 10 minutes...`);
  //62dfa8d13babb9ac2072863c
  //664229eec5a0b7f0dc0b7e0f
  
  let userIds = [];
  for (let [userId, socketId] of userSocketMap.entries()) {
    userIds.push(userId);
  }
  console.log('User IDs:', userIds);  
  if(userIds.length > 0){
    const allUserNotifications = await getUserNotifications(userIds);
    for (let notification of allUserNotifications) {
      if(notification){        
        //notificationSender.sendNotification(notification.user.toString(), io, userSocketMap, 'users-online', notification);
      }
    }    
  }  
  // await leaveController.assignLeavesByJobs(); // Pass the company name as a parameter
});

// This is important, Heroku won't work with hard coded port
const port = process.env.PORT || 8080;
// Run server
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  // Initialize WebSocket
 initWebSocket(server);
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