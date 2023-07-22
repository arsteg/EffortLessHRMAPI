
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Handle messages from clients
  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});




exports.setLiveImage = catchAsync(async (req, res, next) => {
  try{
    var liveImagejson = fs.readFileSync('C:\\Work\\EffortlessHRM\\EffortLessHRMAPI\\utils\\liveImage.json');
    var elements = JSON.parse(liveImagejson);
    var updatedElements = elements.map(function(element) {
      if (element.userId === req.cookies.userId) {
        element.base64string = req.body.image; // Replace with your desired update
      }
      return element;
    });
    fs.writeFile("C:\\Work\\EffortlessHRM\\EffortLessHRMAPI\\utils\\liveImage.json", JSON.stringify(updatedElements), err => {
      if (err) throw err; 
    });
  }
  catch(error){

  }
});

exports.getLiveImage = catchAsync(async (req, res, next) => {
    var liveImagejson = fs.readFileSync('C:\\Work\\EffortlessHRM\\EffortLessHRMAPI\\utils\\liveImage.json');
    try{
      console.log('getLiveImage called for ' + req.body.userIds);
    var elements = JSON.parse(liveImagejson);
    var filteredElements = elements.filter(function(element) {
      return req.body.userIds.includes(element.userId)
    });
    
    console.log('getLiveImage called for ' + filteredElements.length);

    res.status(200).json({
        status: 'success',
        data: filteredElements
      });
    }
    catch(error){
      res.status(401).json({
        status: 'error',
        data: ""
      });
    }
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