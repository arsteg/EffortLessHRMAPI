// This is our run file
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./config/swaggerConfig');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const routes = require('./routes');
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

// This is important, Heroku won't work with hard coded port
const port = process.env.PORT || 8080;


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
