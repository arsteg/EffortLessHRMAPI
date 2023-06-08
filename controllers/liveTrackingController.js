
const LiveTracking = require('./../models/liveTrackingModel');
const express = require('express');
const app = express();
app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });
const clients = new Map();
let wpfSocket = null;

wss.on('connection', (socket, req) => {
  console.log('Client connected');
  wpfSocket = socket;
  const userId = req.url.slice(1);
  clients.set(userId, wpfSocket);

  wpfSocket.on('close', () => {
    clients.delete(userId);
  });

});

exports.startStopLivePreview = catchAsync(async (req, res, next) => {
  try{
    clients.forEach(function each(client, clientId) {
      if (clientId === req.body.userId && client.readyState === WebSocket.OPEN) {
        if(req.body.isStart == true){
          console.log('startlivepreview');
          client.send(JSON.stringify({ EventName: "startlivepreview", UserId: req.body.userId }));
        } else{
          console.log('stoplivepreview');
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