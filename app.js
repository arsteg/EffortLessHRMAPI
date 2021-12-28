var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var itemRouter = require('./routes/item');
var tourRouter = require('./routes/tourRoutes');
var userRouter = require('./routes/userRoutes');
const compression = require('compression');
var authRouter = require('./routes/authRouter');
const AppError = require('./utils/appError');

var app = express();

app.use(express.json({ lmit: '10kb' }));

//app.use(compression);

// Each request will contain requested time
app.use((req, res, next) => {    
  console.log('received the request');  
  next(); // run next middleware in stack
  });  
  
  // Use api routes
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/tours', tourRouter);
 



module.exports = app;