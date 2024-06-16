
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { ObjectId } = require('mongodb');
const { v1: uuidv1} = require('uuid');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const EventNotification= require('../models/eventNotification/eventNotification');
const EventNotificationType = require('../models/eventNotification/eventNotificationType');
const UserNotification   = require('../models/eventNotification/userNotification');

exports.createEventNotification = catchAsync(async (req, res, next) => {
  req.body.company =  req.cookies.companyId; 
  const eventNotification = await EventNotification.create(req.body);
    res.status(201).json({
      status: 'success',
      data: eventNotification
    });
  }); 

  exports.getEventNotification = catchAsync(async (req, res, next) => {
    const eventNotification = await EventNotification.findById(req.params.id);
    if (!eventNotification) {
      return next(new AppError('Event notification not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: eventNotification
    });
  });
  
  exports.updateEventNotification = catchAsync(async (req, res, next) => {
    const eventNotification = await EventNotification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!eventNotification) {
      return next(new AppError('Event notification not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: eventNotification
    });
  });
  
  exports.deleteEventNotification = catchAsync(async (req, res, next) => {
    const eventNotification = await EventNotification.findByIdAndDelete(req.params.id);
    if (!eventNotification) {
      return next(new AppError('Event notification not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.getAllEventNotifications = catchAsync(async (req, res, next) => {
    const eventNotifications = await EventNotification.find();
    res.status(200).json({
      status: 'success',
      data: eventNotifications
    });
  });


  exports.createEventNotificationType = catchAsync(async (req, res, next) => {
    req.body.company =  req.cookies.companyId; 
    const eventNotificationType = await EventNotificationType.create(req.body);
    res.status(201).json({
      status: 'success',
      data: eventNotificationType
    });
  });
  
  exports.getEventNotificationType = catchAsync(async (req, res, next) => {
    const eventNotificationType = await EventNotificationType.findById(req.params.id);
    if (!eventNotificationType) {
      return next(new AppError('Event notification type not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: eventNotificationType
    });
  });
  
  exports.updateEventNotificationType = catchAsync(async (req, res, next) => {
    const eventNotificationType = await EventNotificationType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    if (!eventNotificationType) {
      return next(new AppError('Event notification type not found', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: eventNotificationType
    });
  });
  
  exports.deleteEventNotificationType = catchAsync(async (req, res, next) => {
    const eventNotificationType = await EventNotificationType.findByIdAndDelete(req.params.id);
    
    if (!eventNotificationType) {
      return next(new AppError('Event notification type not found', 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.getAllEventNotificationTypes = catchAsync(async (req, res, next) => {
    console.log('getAllEventNotificationTypes');
    console.log('Cookies:', req.cookies);

    const companyId = req.cookies.companyId;

    if (!companyId) {
        return res.status(400).json({
            status: 'fail',
            message: 'No companyId found in cookies'
        });
    }

    console.log('companyId:', companyId, 'Type:', typeof companyId);

    // Convert companyId to ObjectId
    let objectId;
    try {
        objectId = ObjectId(companyId);
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid companyId format'
        });
    }

    console.log('ObjectId:', objectId);

    try {
        const eventNotificationTypes = await EventNotificationType.find({ company: objectId });
        res.status(200).json({
            status: 'success',
            data: eventNotificationTypes
        });
    } catch (error) {
        console.error('Error fetching event notification types:', error);
        next(error);
    }
});


  exports.createUserNotification = catchAsync(async (req, res, next) => {
    req.body.company =  req.cookies.companyId; 
    const userNotification = await UserNotification.create(req.body);
    res.status(201).json({
      status: 'success',
      data: userNotification
    });
  });
  
  exports.getUserNotification = catchAsync(async (req, res, next) => {
    const userNotification = await UserNotification.findById(req.params.id);
    if (!userNotification) {
      return next(new AppError('User notification not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: userNotification
    });
  });
  
  exports.updateUserNotification = catchAsync(async (req, res, next) => {
    const userNotification = await UserNotification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!userNotification) {
      return next(new AppError('User notification not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: userNotification
    });
  });
  
  exports.deleteUserNotification = catchAsync(async (req, res, next) => {
    const userNotification = await UserNotification.findByIdAndDelete(req.params.id);
    if (!userNotification) {
      return next(new AppError('User notification not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  exports.getAllUserNotifications = catchAsync(async (req, res, next) => {
    const userNotifications = await UserNotification.find({company:req.cookies.companyId});
    res.status(200).json({
      status: 'success',
      data: userNotifications
    });
  });
  
exports.getAllUserNotificationsByNotification = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;

  try {
      const userNotifications = await UserNotification.find({company:req.cookies.companyId}).where('notification').equals(req.params.id);
      res.status(200).json({
          status: 'success',
          data: userNotifications
      });
  } catch (error) {
      res.status(400).json({
          status: 'error',
          message: error.message
      });
  }
});

exports.assignOrUnAssignUserNotification = catchAsync(async (req, res, next) => {
    const { user, notification, action } = req.body;
    if (!user || !notification || !action) {
        return res.status(400).json({
            status: 'fail',
            message: 'User, notification, and action are required'
        });
    }

    if (action === 'assign') {
        const existingNotification = await UserNotification.findOne({ user, notification });
        if (existingNotification) {
            return res.status(400).json({
                status: 'fail',
                message: 'Notification already assigned to this user'
            });        }

        const userNotification = await UserNotification.create({ user, notification, status: 'unread' });
        res.status(201).json({
            status: 'success',
            data: userNotification
        });
    } else if (action === 'unassign') {
        const deletedNotification = await UserNotification.findOneAndDelete({ user, notification });
        if (!deletedNotification) {
            return res.status(400).json({
                status: 'fail',
                message: 'Notification not found for this user'
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Notification successfully unassigned'
        });
    } else {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid action'
        });
    }
});


  exports.testMe = catchAsync(async (req, res, next) => {    
    res.status(200).json({
      status: 'success',
      data: {}
    });
  });







