// logger.js

const winston = require('winston');
const winstonMongoDB = require('winston-mongodb'); // Import the winston-mongodb package


// Create a new Winston Logger instance
const dbConnectionString =  process.env.DATABASE.replace(  
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );


  // Create a new Winston Logger instance
const logger = winston.createLogger({
  level: 'info', // Default logging level, you can change this based on your needs
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Log data in JSON format
  ),
  transports: [
    // Console transport for development (optional)
    new winston.transports.Console(),

    // MongoDB transport for storing logs in the database
    new winstonMongoDB.MongoDB({
      level: 'info', // Logging level for this transport
      db: dbConnectionString,
      options: {
        useUnifiedTopology: true,
      },
      collection: 'logs', // Name of the collection to store logs
    }),
  ],
});

module.exports = logger;