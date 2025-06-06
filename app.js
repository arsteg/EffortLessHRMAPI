var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var zoomRouter = require('./routes/zoomRouter');
var openaiRouter = require('./routes/openaiRouter');
var userRouter = require('./routes/userRoutes');
var timeLogRouter = require('./routes/timeLogRoutes');
var errorLogRouter = require('./routes/errorLogRouter');
var commonRouter = require('./routes/commonRouter');
var companyRouter = require('./routes/companyRouter');
var projectRouter = require('./routes/projectRouter');
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
const leaveController = require('./controllers/leaveController');
//app.use(express.json({ lmit: '5000mb' }));
const path = require('path');
var manualTimeRouter = require('./routes/manualTimeRouter');
var settingsRouter = require('./routes/settingsRouter');
var dashboardRouter = require('./routes/dashboardRoute');
var genericSettingRoute = require('./routes/genericSettingRoute');
var assetsManagementRouter = require('./routes/assetsManagementRouter');
var documentsRouter = require('./routes/documentsRouter');
var expenseRouter = require('./routes/expenseRouter');
var separationRouter = require('./routes/SeparationRouter');
var attendanceRouter = require(`./routes/attendenceRouter`);
var pricingRouter = require(`./routes/pricingRouter`);
var interviewsRouter = require(`./routes/interviewProcessRouter`);
var payrollRouter = require(`./routes/payrollRouter`);
var eventNotificationRouter = require(`./routes/eventNotificationRoutes`);
var feedbackRouter = require(`./routes/feedbackRouter`);
var locationRouter = require('./routes/locationRouter');
const i18n = require('./config/i18n'); // Import i18n config
app.use(express.json({ extended: false, limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: false, parameterLimit: 500000 }))
const loggingMiddleware = require('./Logger/loggingMiddleware');
var chatbotRouter = require(`./routes/chatbotRouter`);
var helpdeskRouter = require(`./routes/helpdeskRouter`);

// Initialize i18n middleware
app.use(i18n.init);
//app.use(loggingMiddleware);

// var allowedOrigin ="http://localhost:4200";
// if (process.env.NODE_ENV === 'development') {
//   allowedOrigin= "http://localhost:4200";
// } else if (process.env.NODE_ENV === 'test') {                        
//   allowedOrigin= "https://effort-less-hrm-web.vercel.app";
// }
// else if (process.env.NODE_ENV === 'production') {                        
//   allowedOrigin= "https://effortlesshrm.com";
// }
//app.use(compression);
app.use(cors(
  {
    "origin": process.env.ALLOWED_ORIGIN,
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
  // if (process.env.NODE_ENV === 'development') {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:4200");     
  // } else if (process.env.NODE_ENV === 'test') {
  //   res.header("Access-Control-Allow-Origin", "https://effort-less-hrm-web.vercel.app");     
  // }
  // else if (process.env.NODE_ENV === 'production') {
  //   res.header("Access-Control-Allow-Origin", "https://effortlesshrm.com");     
  // } else {
  //   console.log('Unknown environment');
  // }  
  const locale = req.headers['accept-language'] || req.query.locale || 'en-IN';
  req.setLocale(locale);
  
  res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN)
  
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST,GET,PUT,OPTIONS,DELETE,PATCH");
  
  next(); // run next middleware in stack
});

// cookie parser middleware
app.use(cookieParser());
// Use api routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/timeLogs', timeLogRouter);
app.use('/api/v1/errorlogs', errorLogRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/project', projectRouter);
app.use('/api/v1/task', taskRouter);
app.use('/api/v1/leave', leaveRouter);
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
app.use('/api/v1/genericsetting', genericSettingRoute );
app.use('/api/v1/assetsManagement', assetsManagementRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/expense', expenseRouter);
app.use('/api/v1/separation', separationRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/pricing', pricingRouter);
app.use('/api/v1/interviews', interviewsRouter);
app.use('/api/v1/zoom', zoomRouter);
app.use('/api/v1/openai', openaiRouter);
app.use('/api/v1/payroll', payrollRouter);
app.use('/api/v1/eventNotifications', eventNotificationRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/location', locationRouter);
app.use('/api/v1/chatbot', chatbotRouter);
app.use('/api/v1/helpdesk', helpdeskRouter);

app.use((err, req, res, next) => {
  // If it's an instance of AppError, use custom method
  if (err instanceof AppError) {
    return err.sendErrorJson(res);
  }

  // For unhandled or unexpected errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});
module.exports = app;