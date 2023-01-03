
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ErrorLog = require('../models/errorLogModel');

  // Save Permission List
  exports.getErrorLogList = catchAsync(async (req, res, next) => {    
    const errorLogList = await ErrorLog.find({}).all();  
    res.status(200).json({
      status: 'success',
      data: {
        errorLogList: errorLogList
      }
    });  
  });
  exports.getErrorLog = catchAsync(async (req, res, next) => {    
    const errorLogList = await ErrorLog.find({}).where('_id').equals(req.params.id); 
    res.status(200).json({
      status: 'success',
      data: {
        errorLogList: errorLogList
      }
    });  
  });
  // Save Permission
  exports.saveErrorLog = catchAsync(async (req, res, next) => {    
    const newErrorLog = await ErrorLog.create({      
      error:req.body.error,
      details:req.body.details,
      createdOn: new Date(Date.now()),
      updatedOn: new Date(Date.now()),
      company:req.cookies.companyId,
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
      status:"Active"

    });  
    res.status(200).json({
      status: 'success',
      data: {
        ErrorLog:newErrorLog
      }
    }); 
  });
  exports.deleteErrorLog = catchAsync(async (req, res, next) => {  
    const document = await ErrorLog.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.updateErrorLog = factory.updateOne(ErrorLog);
  
  
  

