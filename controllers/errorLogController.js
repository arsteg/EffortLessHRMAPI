
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ErrorLog = require('../models/errorLogModel');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

  // Save Permission List
  exports.getErrorLogList = catchAsync(async (req, res, next) => {    
    const errorLogList = await ErrorLog.find({}).all();  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        errorLogList: errorLogList
      }
    });  
  });
  exports.getErrorLogListByUser = catchAsync(async (req, res, next) => {    
    const errorLogList = await ErrorLog.find({}).where('createdBy').equals(req.params.userId).where('company').equals(req.cookies.companyId);  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        errorLogList: errorLogList
      }
    });  
  });
  
  exports.getErrorLog = catchAsync(async (req, res, next) => {    
    const errorLogList = await ErrorLog.find({}).where('_id').equals(req.params.id).where('company').equals(req.cookies.companyId); 
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        errorLogList: errorLogList
      }
    });  
  });
  // Save Permission
  exports.saveErrorLog = catchAsync(async (req, res, next) => {    
    const newErrorLog=null;
   /* const newErrorLog = await ErrorLog.create({      
      error:req.body.error,
      details:req.body.details,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now()),
      company:req.cookies.companyId,
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      status:"Active"
    }); 
     */
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        ErrorLog:newErrorLog
      }
    }); 
   
  });
  exports.deleteErrorLog = catchAsync(async (req, res, next) => {  
    const document = await ErrorLog.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError(req.t('error.noDocumentFound'), 404));
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  
  exports.updateErrorLog = factory.updateOne(ErrorLog);
  
  
  

