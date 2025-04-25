const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

const LiveTracking = require('./../models/liveTrackingModel');
//const express = require('express');
//const app = express();
//app.use(express.json);
const catchAsync = require('./../utils/catchAsync');
//const WebSocket = require('ws');
//const socketIo = require('socket.io');
//const wss = new WebSocket.Server({ noServer: true });
//const http = require('http');
// Store connected clients
//const clients = new Set();
//const cors = require('cors'); // Import the cors package
const { sendUsersLiveImagesToApp } = require('../utils/liveScreenSender');


exports.startStopLivePreview = catchAsync(async (req, res, next) => {
  // try{
  //   clients.forEach(function each(client, clientId) {
  //     if (clientId === req.body.userId && client.readyState === WebSocket.OPEN) {
  //       if(req.body.isStart == true) {
  //         client.send(JSON.stringify({ EventName: "startlivepreview", UserId: req.body.userId }));
  //       } else{
  //         client.send(JSON.stringify({ EventName: "stoplivepreview", UserId: req.body.userId }));
  //       }
  //       res.status(200).json({
  //         status: constants.APIResponseStatus.Success
  //       });

  //     }
  //   });
  // }
  // catch(error){
  //   console.log(error);
  // }
});

exports.closeWebSocket = catchAsync(async (req, res, next) => {
  // try{
  //   if (wpfSocket && wpfSocket.readyState === WebSocket.OPEN) {
  //     console.log('openeed');
  //     wpfSocket.close();
  //     console.log('closed');
  //   }
  //   res.status(200).json({
  //     status: constants.APIResponseStatus.Success,
  //     data: 'Connection closed'
  //   });
  // }
  // catch(error){
  //   console.log(error);
  // }
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
      status: constants.APIResponseStatus.Success,
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
            status: constants.APIResponseStatus.Success,
            data: liveTrackings
          }); 
        });  
  }
  });


  exports.setLiveTrackingByUser = catchAsync(async (req, res, next) => {
      // Create a new LiveTracking record
      const liveTrackigExits = await LiveTracking.find({}).where('user').equals(req.body.users);    
      if (liveTrackigExits.length <= 0) {
        const newLiveTracking = await LiveTracking.create({
          user:req.body.users,
          company : req.cookies.companyId,
        });
        // Send a success response
        res.status(200).json({
          success: true,
          data: newLiveTracking,
        });
      }
      else{
        res.status(200).json({
          success: false,
          data: req.t('liveTracking.userAlreadyAdded')
        });
      }
  });

  exports.removeUserFromLiveTracking = catchAsync(async (req, res, next) => {
    const liveTrackigExits = await LiveTracking.where('user').equals(req.body.users);
    if (liveTrackigExits.length > 0) {
      const newLiveTracking = await LiveTracking.deleteMany({ user: req.body.users });
      if(newLiveTracking.deletedCount>0){
        res.status(200).json({
          success: true,
          data: newLiveTracking,
        });
      }
      else{
        res.status(200).json({
          success: false
        });
      }
    }
    else{
      res.status(200).json({
        success: false
      });
    }
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
  
  websocketHandler.sendScreenshot([req.cookies.userId], req.body.fileString);

  res.status(200).json({
    status: constants.APIResponseStatus.Success
  });  
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
        data: req.t('liveTracking.noLiveTrackingDataFound')
      });
    }
  }
  else{
    res.status(200).json({
      status: false,
      data: req.t('liveTracking.noLiveTrackingDataFound')
    });
  }
});