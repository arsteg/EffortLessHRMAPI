
const LiveTracking = require('./../models/liveTrackingModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

// Store connected clients
const clients = new Set();

// WebSocket upgrade listener for the HTTP server
const server = app.listen(4000, () => {
  console.log('WebSocket server is running on port 4000');
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection event
wss.on('connection', (ws, request) => {
  console.log('A new client connected');
  const userId = request.url.slice(1);
  clients.set(userId, wpfSocket);
  // Add the client to the set of connected clients
  clients.add(ws);

  // WebSocket message event
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // You can handle incoming messages from the client here if needed
  });

  // WebSocket close event
  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove the client from the set of connected clients
    clients.delete(ws);
  });

  // You can also send an initial message to the client upon connection if needed
  // ws.send('Welcome to the WebSocket server!');
});


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