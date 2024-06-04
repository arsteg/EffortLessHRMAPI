
const LiveTracking = require('./../models/liveTrackingModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
const WebSocket = require('ws');
//const server = require('http').createServer();
//const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({ noServer: true });
const http = require('http');
// Store connected clients
const clients = new Map();
const cors = require('cors'); // Import the cors package


var allowedOrigin ="http://localhost:4200";
if (process.env.NODE_ENV === 'development') {
  allowedOrigin= "http://localhost:4200";
} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {                        
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

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server');
});

// Start the HTTP server
const port = 4000;
//const port = 443;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

// // Handle WebSocket upgrade requests
// server.on('upgrade', (request, socket, head) => {
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit('connection', ws, request);
//   }); 
// });

// // WebSocket connection event
// wss.on('connection', (ws, request) => {
//   console.log('A new client connected');
//   const userId = request.url.slice(1);
  
//   // Add the client to the set of connected clients
//   //clients.add(ws);
//   clients.set(userId, ws);
//   // WebSocket message event
//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//     // You can handle incoming messages from the client here if needed
//   });

//   // WebSocket close event
//   ws.on('close', () => {
//     console.log('Client disconnected');
//     // Remove the client from the set of connected clients
//     clients.delete(ws);
//   });

//   // You can also send an initial message to the client upon connection if needed
//   // ws.send('Welcome to the WebSocket server!');
// });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received: %s', message);

    // Send a response back to the client
    ws.send('Hello, client!');
  });

  // Create a response JSON object
  const response = {
    type: "greeting",
    content: "Hello, client!",
    timestamp: new Date().toISOString()
  };
  console.log(JSON.stringify(response));
  ws.send(JSON.stringify(response));
  console.log('after');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

//Apis

exports.startStopLivePreview = catchAsync(async (req, res, next) => {
  try{
    clients.forEach(function each(client, clientId) {
      if (clientId === req.body.userId && client.readyState === WebSocket.OPEN) {
        if(req.body.isStart == true) {
          client.send(JSON.stringify({ EventName: "startlivepreview", UserId: req.body.userId }));
        } else{
          client.send(JSON.stringify({ EventName: "stoplivepreview", UserId: req.body.userId }));
        }
        res.status(200).json({
          status: 'success'
        });

      }
    });
  }
  catch(error){
    console.log(error);
  }
});

exports.closeWebSocket = catchAsync(async (req, res, next) => {
  try{
    if (wpfSocket && wpfSocket.readyState === WebSocket.OPEN) {
      console.log('openeed');
      wpfSocket.close();
      console.log('closed');
    }
    res.status(200).json({
      status: 'success',
      data: 'Connection closed'
    });
  }
  catch(error){
    console.log(error);
  }
});

exports.addNew = catchAsync(async (req, res, next) => {
    const newLiveTracking = await LiveTracking.create({
      fileString: req.body.fileString,
      user:req.cookies.userId,
      company : req.cookies.companyId,
    });   
  });

  exports.addOrUpdateIfExists = catchAsync(async (req, res, next) => {
    const liveTrackigExits = await LiveTracking.find({}).where('user').equals(req.cookies.userId);    
    if (liveTrackigExits.length>0) {
      const newliveTracking = await LiveTracking.updateOne( { user: req.cookies.userId}, { $set: { fileString: req.body.fileString }} ).exec();            
      console.log("update image string");
    }
    else{ 
     //this.addNew();
     const newLiveTracking = await LiveTracking.create({
      fileString: req.body.fileString,
      user:req.cookies.userId,
      company : req.cookies.companyId,
    });   
    console.log("save image string");
    }
    const newliveTracking = await LiveTracking.find({}).where('user').equals(req.cookies.userId);  
    res.status(200).json({
      status: 'success',
      // data: {
      //   liveTracking:newliveTracking
      // }
    });
    console.log("end save image string");
  });
   

  exports.getByUsers = catchAsync(async (req, res, next) => {
    let filter;
    
    var liveTrackings=[];
    if(req.body.users!='')
    {
      filter = { 'user': { $in: req.body.users }};
     var userIds = await LiveTracking.find(filter).distinct('user');   
      LiveTracking.where('user').in(userIds).
        then(liveTrackingEntry => {  
          liveTrackings.push(liveTrackingEntry);
          res.status(200).json({
            status: 'success',
            data: liveTrackings
          }); 
        });  
  }
  });


  exports.setLiveTrackingByUser = catchAsync(async (req, res, next) => {
    const users = req.body.users;
    const companyId = req.cookies.companyId;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No users provided',
      });
    }

    const newLiveTrackings = [];

    // Create a new LiveTracking record
    for (const userId of users) {
      const liveTrackigExits = await LiveTracking.find({}).where('user').equals(userId);    
      if (liveTrackigExits.length <= 0) {
        const newLiveTracking = await LiveTracking.create({
          user: userId,
          company : companyId,
        });
        newLiveTrackings.push(newLiveTracking);
      }
    }

    // Send a success response
    res.status(200).json({
      success: true,
      data: newLiveTrackings,
    });
  });

  exports.removeUserFromLiveTracking = catchAsync(async (req, res, next) => {
    const users = req.body.users;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(200).json({
        success: false
      });
    }

    const removedUsers = [];
    for (const userId of users) {
      const liveTrackigExits = await LiveTracking.where('user').equals(userId);
      if (liveTrackigExits.length > 0) {
        const deletedLiveTracking = await LiveTracking.deleteMany({ user: userId });
        if(deletedLiveTracking.deletedCount>0){
          removedUsers.push(userId);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: removedUsers,
    });
});

//check online user for live
exports.getLiveTrackingTestData = catchAsync(async (req, res, next) => {
  var userIds = await LiveTracking.distinct('user');
  res.status(200).json({
    success: true,
    data: userIds,
  });
});

exports.getLiveTrackingByUserId = catchAsync(async (req, res, next) => {
    const liveTrackigExits = await LiveTracking.where('user').equals(req.cookies.userId);
    if(liveTrackigExits.length > 0) {
        res.status(200).json({
          success: true
        });
    }
    else {
      res.status(200).json({
        success: false
      });
    }
});

exports.updateUserScreen = catchAsync(async (req, res, next) => {
  const liveTrackigExits = await LiveTracking.find({}).where('user').equals(req.cookies.userId);    
  if (liveTrackigExits.length>0) {
    const newliveTracking = await LiveTracking.updateOne( { user: req.cookies.userId}, { $set: { fileString: req.body.fileString }} ).exec();
    res.status(200).json({
      status: 'success'
    });
  }
  else{
    res.status(200).json({
      status: 'fail'
    });
  }
});

exports.getUsersLiveScreen = catchAsync(async (req, res, next) => {
  if(req.body.users!='')
  {
    const liveTrackigData = await LiveTracking.where('user').equals(req.body.users);    
    if (liveTrackigData.length > 0) {
      res.status(200).json({
        status: true,
        data: liveTrackigData
      });
    }
    else{
      res.status(200).json({
        status: false,
        data: "no data found"
      });
    }
  }
  else{
    res.status(200).json({
      status: false,
      data: "no data found"
    });
  }
});

exports.getMultipleUsersLiveScreen = catchAsync(async (req, res, next) => {
  if(req.body.users!='')
  {
    let filter;    
    var liveTrackings=[];
    if(req.body.users!='')
    {
      filter = { 'user': { $in: req.body.users }};
      var userIds = await LiveTracking.find(filter).distinct('user');
      LiveTracking.where('user').in(userIds).
        then(liveTrackingEntry => {  
          liveTrackings.push(liveTrackingEntry);
          res.status(200).json({
            status: true,
            data: liveTrackings
          }); 
        });  
    }
  }
  else{
    res.status(200).json({
      status: false,
      data: "no data found"
    });
  }
});