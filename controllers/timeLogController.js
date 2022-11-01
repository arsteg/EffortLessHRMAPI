const TimeLog = require('../models/timeLog');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');
const { v1: uuidv1} = require('uuid');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Stream } = require('nodemailer/lib/xoauth2');
const  FileAPI = require('file-api');
var moment = require('moment'); 

  // AZURE STORAGE CONNECTION DETAILS
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
throw Error("Azure Storage Connection string not found");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);

exports.addLog = catchAsync(async (req, res, next) => { 

  // Upload Capture image on block blob client
  const blobName = "Capture" + uuidv1() + `${req.body.filePath}`;
  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  console.log("\nUploading to Azure storage as blob:\n\t", blobName);
  // Upload data to the blob
  var FileString = req.body.fileString;
  //const buffer = new Buffer.from(FileString, 'base64');
  const uploadBlobResponse = await blockBlobClient.upload(FileString,FileString.length);
  console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}, url: ${uploadBlobResponse}`);
  
  const newTimeLog = await TimeLog.create({
    user: req.body.user,
    task:req.body.task, 
    date :req.body.date,
    startTime: req.body.startTime,
    endTime:req.body.endTime,
    filePath:blobName,
    keysPressed:req.body.keysPressed,
    clicks:req.body.clicks,
    url:uploadBlobResponse.url
  });  
  console.log('time log created');
  res.status(200).json({
    status: 'success',
    data: {
      timeLog: newTimeLog
    }
  });  
});

exports.getTimeLogs = catchAsync(async (req, res, next) => {
  let date = `${req.body.date}.000+00:00`;
  console.log("getTimeLogs, date:" + date);
  const timeLogs = await TimeLog.find({}).where('user').equals(req.body.user).where('date').equals(date);
  res.status(200).json({
    status: 'success',
    data: timeLogs
  });  
});

exports.getCurrentWeekTotalTime = catchAsync(async (req, res, next) => {      
  const timeLogs = await TimeLog.find({}).where('user').equals(req.body.user).find({
    "date" : {"$gte": req.body.startDate,"$lte": req.body.endDate}});
  res.status(200).json({
    status: 'success',
    length:timeLogs.length,
    data: timeLogs
  });  
});

exports.getLog = catchAsync(async (req, res, next) => {  
  res.status(200).json({
    status: 'success',
    data: {
      timeLog: "he"
    }
  });
});

exports.getLogsWithImages = catchAsync(async (req, res, next) => {
  //let date = `${req.body.date}.000+00:00`;
  const timeLogs = await TimeLog.find({}).where('user').equals(req.body.user).where('date').equals(req.body.date);    
  let response =[];
  for (const timeLog of timeLogs) {
    const blobName = timeLog.filePath;
    const blobClient = containerClient.getBlobClient(blobName);    
    try{
    const downloadBlockBlobResponse = await blobClient.download(0);        
    const fileString =await streamToText(downloadBlockBlobResponse.readableStreamBody)
    timeLog.fileString= fileString;
    response.push(timeLog);    
    }
    catch(err){      
    }
  } 

  res.status(200).json({
    status: 'success',
    data: response
  });
});

// Convert stream to text
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}


async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}