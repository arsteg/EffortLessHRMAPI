
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const { ObjectId } = require('mongodb');
const { v1: uuidv1} = require('uuid');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const EventNotification= require('../models/eventNotification/eventNotification');
const EventNotificationType = require('../models/eventNotification/eventNotificationType');
const UserNotification   = require('../models/eventNotification/userNotification');
const NotificationStatus = require('../models/eventNotification/enums.js');
const moment = require('moment'); 

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
    console.log(`req.params.id:${req.params.id}`);
    const eventNotification = await EventNotification.findByIdAndDelete(req.params.id);
    if (!eventNotification) {
      return next(new AppError('Event notification not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: eventNotification
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
      data: userNotification
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

exports.getUserNotificationsForToday = catchAsync(async (req, res, next) => {
  const userId = req.cookies.userId;
  console.log(`Fetching notifications for user ID: ${userId}`);

  // Get the start and end of the current date
  const startOfDay = moment().startOf('day').toDate();
  const endOfDay = moment().endOf('day').toDate();
  console.log(`Start of day: ${startOfDay}`);
  console.log(`End of day: ${endOfDay}`);

  // Fetch UserNotification records for the given user
  const userNotifications = await UserNotification.find({ user: userId });
  console.log(`User notifications fetched: ${JSON.stringify(userNotifications, null, 2)}`);

  if (!userNotifications || userNotifications.length === 0) {
    res.status(200).json({
      status: 'success',
      data: []
    });
  }

  // Extract notification IDs from UserNotification records
  const notificationIds = userNotifications.map(notification => notification.notification);
  console.log(`Notification IDs extracted: ${notificationIds}`);

  // Fetch EventNotification records for the extracted notification IDs and apply date filter
  const eventNotifications = await EventNotification.find({
    _id: { $in: notificationIds },
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  console.log(`Event notifications fetched: ${JSON.stringify(eventNotifications, null, 2)}`);  

  console.log('Event notifications found, sending response');
  res.status(200).json({
    status: 'success',
    data: eventNotifications
  });
});

exports.getUserNotificationsAll = catchAsync(async (req, res, next) => {
  const userId = req.cookies.userId;
  console.log(`Fetching notifications for user ID: ${userId}`);
  
  // Fetch UserNotification records for the given user
  const userNotifications = await UserNotification.find({ user: userId });
  console.log(`User notifications fetched: ${JSON.stringify(userNotifications, null, 2)}`);

  if (!userNotifications || userNotifications.length === 0) {
    res.status(200).json({
      status: 'success',
      data: []
    });
  }

  // Extract notification IDs from UserNotification records
  const notificationIds = userNotifications.map(notification => notification.notification);
  console.log(`Notification IDs extracted: ${notificationIds}`);

  // Fetch EventNotification records for the extracted notification IDs and apply date filter
  const eventNotifications = await EventNotification.find({
    _id: { $in: notificationIds }});
  console.log(`Event notifications fetched: ${JSON.stringify(eventNotifications, null, 2)}`);
  console.log('Event notifications found, sending response');
  res.status(200).json({
    status: 'success',
    data: eventNotifications
  });
});

exports.getUserNotifications = async (userIds) => {
//  const { userIds } = req.body; // Extract userIds from the request body

  console.log('Received user IDs:', userIds); // Log the received user IDs

  try {
      // Step 1: Retrieve UserNotification records for given user IDs
      console.log('Retrieving UserNotification records for given user IDs...');
      
      const userNotifications = await UserNotification.find({
          user: { $in: userIds },
          status: 'unread' // Only consider unread notifications
      }).populate('notification'); // Populate EventNotification reference

      console.log('Retrieved user notifications:', userNotifications); // Log the retrieved user notifications         

      // Step 2: Filter to get EventNotification for the current date
      console.log('Filtering notifications for the current date...');
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      console.log('Start of day:', startOfDay); // Log the start of the day
      console.log('End of day:', endOfDay); // Log the end of the day

      const eventNotifications = userNotifications.filter(userNotification => {
          const eventDate = userNotification.notification.date;
          console.log('Event date:', eventDate); // Log the event date
          return eventDate >= startOfDay && eventDate <= endOfDay;
      });

      console.log('Filtered event notifications:', eventNotifications); // Log the filtered event notifications
      return eventNotifications;      
      console.log('Response sent successfully'); // Log that the response was sent successfully
  } catch (error) {
      console.error('Error retrieving user notifications:', error); // Log any errors encountered     
  }
};

exports.updateRecurringNotifications = async () => {
  try {
    console.log('Fetching UserNotification records with status "read"...');
    const userNotifications = await UserNotification.find({
      status: 'read'
    }).populate('notification');

    console.log(`Fetched ${userNotifications.length} UserNotification records.`);

    for (const userNotification of userNotifications) {
      const eventNotification = userNotification.notification;
      console.log(`Processing UserNotification with ID: ${userNotification._id} and EventNotification ID: ${eventNotification._id}`);

      console.log(`eventNotification.isRecurring: ${eventNotification.isRecurring}`);

      if (eventNotification.isRecurring) {
        console.log(`UserNotification is recurring with frequency: ${eventNotification.recurringFrequency}`);

        // Update the date based on the recurringFrequency
        let newDate;
        switch (eventNotification.recurringFrequency) {
          case 'daily':
            newDate = moment(eventNotification.date).add(1, 'days').toDate();
            break;
          case 'weekly':
            newDate = moment(eventNotification.date).add(1, 'weeks').toDate();
            break;
          case 'monthly':
            newDate = moment(eventNotification.date).add(1, 'months').toDate();
            break;
          case 'annually':
            newDate = moment(eventNotification.date).add(1, 'years').toDate();
            break;
          default:
            console.log(`Unrecognized recurring frequency: ${eventNotification.recurringFrequency} for UserNotification ID: ${userNotification._id}`);
            continue;
        }

        console.log(`Updating EventNotification ID: ${eventNotification._id} with new date: ${newDate}`);
        await EventNotification.findByIdAndUpdate(eventNotification._id, { date: newDate });

        console.log(`Resetting status of UserNotification ID: ${userNotification._id} to 'unread'`);
        await UserNotification.findByIdAndUpdate(userNotification._id, { status: 'unread' });
      } else {
        console.log(`UserNotification ID: ${userNotification._id} is not recurring and will be skipped.`);
        // If needed to delete the non-recurring notification, uncomment the following line
        // console.log(`Deleting non-recurring UserNotification ID: ${userNotification._id}`);
        // await UserNotification.findByIdAndDelete(userNotification._id);
      }
    }

    console.log('Completed processing all UserNotification records.');
  } catch (error) {
    console.error('An error occurred while updating recurring notifications:', error);
  }
};

exports.testMe = catchAsync(async (req, res, next) => {    
    res.status(200).json({
      status: 'success',
      data: {}
    });
  });







