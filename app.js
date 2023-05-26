var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var itemRouter = require('./routes/item');
var tourRouter = require('./routes/tourRoutes');
var userRouter = require('./routes/userRoutes');
var timeLogRouter = require('./routes/timeLogRoutes');
var errorLogRouter = require('./routes/errorLogRouter');
var commonRouter = require('./routes/commonRouter');
var companyRouter = require('./routes/companyRouter');
var projectRouter = require('./routes/projectRouter');
var holidayCalendarRouter = require('./routes/holidayCalendarRouter');
var taskRouter = require('./routes/taskRouter');
var userPreferences = require('./routes/userPreferencesRoutes');
var appWebsite = require('./routes/appWebsiteRoute');
var reportRouter = require('./routes/reportRouter');
const compression = require('compression');
const cors = require('cors');
var authRouter = require('./routes/authRouter');
var leaveRouter = require('./routes/leaveRouter');
var liveTracking = require('./routes/liveTrackingRoute');
const AppError = require('./utils/appError');
var recruitmentRouter = require('./routes/recruitmentRouter');
var app = express();
const cookieParser = require("cookie-parser");
//app.use(express.json({ lmit: '5000mb' }));
const path = require('path');
var manualTimeRouter = require('./routes/manualTimeRouter');
var settingsRouter = require('./routes/settingsRouter');
var dashboardRouter = require('./routes/dashboardRoute');

app.use(express.json({ extended: false, limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: false, parameterLimit: 500000 }))

console.log('max limit set');

var allowedOrigin ="http://localhost:4200";
if (process.env.NODE_ENV === 'development') {
  allowedOrigin= "http://localhost:4200";
} else if (process.env.NODE_ENV === 'production') {                        
  allowedOrigin= "https://effort-less-hrm-web.vercel.app";
}
//app.use(compression);
app.use(cors(
  {
    "origin": allowedOrigin,
    credentials: true, // This MUST be "true" if your endpoint is
                     // authenticated via either a session cookie
                     // or Authorization header. Otherwise the
                     // browser will block the response.
  methods: 'POST,GET,PUT,OPTIONS,DELETE, PATCH' // Make sure you're not blocking 
                                               // pre-flight OPTIONS requests
  }
));
app.options('*', cors());
app.set("view engine", "pug");
app.set("email", path.join(__dirname, "email"));

// Each request will contain requested time
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");     
  } else if (process.env.NODE_ENV === 'production') {
    res.header("Access-Control-Allow-Origin", "https://effort-less-hrm-web.vercel.app");     
  } else {
    console.log('Unknown environment');
  }  
  
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST,GET,PUT,OPTIONS,DELETE,PATCH");
  
  next(); // run next middleware in stack
});

// cookie parser middleware
app.use(cookieParser());
// Use api routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/timeLogs', timeLogRouter);
app.use('/api/v1/errorlogs', errorLogRouter);
app.use('/api/v1/holidayCalendar', holidayCalendarRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/project', projectRouter);
app.use('/api/v1/task', taskRouter);
app.use('/api/v1/leave', leaveRouter);
app.use('/api/v1/recruitment', recruitmentRouter);
app.use('/api/v1/recruitment', recruitmentRouter);

app.use('/api/v1/userPreferences', userPreferences);
app.use('/api/v1/appWebsite', appWebsite);
app.use('/api/v1/report', reportRouter);
app.use('/api/v1/liveTracking', liveTracking);

// api route for common API like Country , Role , Permission , RolePermission
app.use('/api/v1/common', commonRouter);
app.use('/api/v1/manualTime', manualTimeRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/dashboard', dashboardRouter );
module.exports = app;