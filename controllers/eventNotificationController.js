
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
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');
exports.createEventNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createEventNotification process', constants.LOG_TYPES.INFO);
  req.body.company = req.cookies.companyId;
  websocketHandler.sendLog(req, `Creating event notification with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const eventNotification = await EventNotification.create(req.body);
  websocketHandler.sendLog(req, `Successfully created event notification with ID: ${eventNotification._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotification
  });
});

exports.getEventNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getEventNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching event notification with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const eventNotification = await EventNotification.findById(req.params.id);
  if (!eventNotification) {
      websocketHandler.sendLog(req, `Event notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification not found', 404));
  }
  websocketHandler.sendLog(req, `Found event notification ID: ${eventNotification._id}`, constants.LOG_TYPES.DEBUG);

  websocketHandler.sendLog(req, 'Completed getEventNotification process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotification
  });
});

exports.updateEventNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateEventNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating event notification ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const eventNotification = await EventNotification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  if (!eventNotification) {
      websocketHandler.sendLog(req, `Event notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully updated event notification ID: ${eventNotification._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotification
  });
});

exports.deleteEventNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteEventNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete event notification with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const eventNotification = await EventNotification.findByIdAndDelete(req.params.id);
  if (!eventNotification) {
      websocketHandler.sendLog(req, `Event notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully deleted event notification ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotification
  });
});

exports.getAllEventNotifications = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllEventNotifications process', constants.LOG_TYPES.INFO);
  const eventNotifications = await EventNotification.find();
  websocketHandler.sendLog(req, `Retrieved ${eventNotifications.length} event notifications`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getAllEventNotifications process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotifications
  });
});

exports.createEventNotificationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createEventNotificationType process', constants.LOG_TYPES.INFO);
  req.body.company = req.cookies.companyId;
  websocketHandler.sendLog(req, `Creating event notification type with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const eventNotificationType = await EventNotificationType.create(req.body);
  websocketHandler.sendLog(req, `Successfully created event notification type with ID: ${eventNotificationType._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotificationType
  });
});

exports.getEventNotificationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getEventNotificationType process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching event notification type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const eventNotificationType = await EventNotificationType.findById(req.params.id);
  if (!eventNotificationType) {
      websocketHandler.sendLog(req, `Event notification type not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification type not found', 404));
  }
  websocketHandler.sendLog(req, `Found event notification type ID: ${eventNotificationType._id}`, constants.LOG_TYPES.DEBUG);

  websocketHandler.sendLog(req, 'Completed getEventNotificationType process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotificationType
  });
});

exports.updateEventNotificationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateEventNotificationType process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating event notification type ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const eventNotificationType = await EventNotificationType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  if (!eventNotificationType) {
      websocketHandler.sendLog(req, `Event notification type not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification type not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully updated event notification type ID: ${eventNotificationType._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotificationType
  });
});

exports.deleteEventNotificationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteEventNotificationType process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete event notification type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const eventNotificationType = await EventNotificationType.findByIdAndDelete(req.params.id);
  if (!eventNotificationType) {
      websocketHandler.sendLog(req, `Event notification type not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification type not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully deleted event notification type ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
  });
});

exports.getAllEventNotificationTypes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllEventNotificationTypes process', constants.LOG_TYPES.INFO);
  const companyId = req.cookies.companyId;

  if (!companyId) {
      websocketHandler.sendLog(req, 'No companyId found in cookies', constants.LOG_TYPES.WARN);
      return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'No companyId found in cookies'
      });
  }

  let objectId;
  try {
      objectId = ObjectId(companyId);
      websocketHandler.sendLog(req, `Converted companyId ${companyId} to ObjectId`, constants.LOG_TYPES.TRACE);
  } catch (error) {
      websocketHandler.sendLog(req, `Invalid companyId format: ${companyId}`, constants.LOG_TYPES.ERROR);
      return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Invalid companyId format'
      });
  }

  try {
      const eventNotificationTypes = await EventNotificationType.find({ company: objectId });
      websocketHandler.sendLog(req, `Retrieved ${eventNotificationTypes.length} event notification types`, constants.LOG_TYPES.DEBUG);
      websocketHandler.sendLog(req, 'Completed getAllEventNotificationTypes process', constants.LOG_TYPES.INFO);

      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: eventNotificationTypes
      });
  } catch (error) {
      websocketHandler.sendLog(req, `Error fetching event notification types: ${error.message}`, constants.LOG_TYPES.ERROR);
      next(error);
  }
});

exports.createUserNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createUserNotification process', constants.LOG_TYPES.INFO);
  req.body.company = req.cookies.companyId;
  websocketHandler.sendLog(req, `Creating user notification with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const userNotification = await UserNotification.create(req.body);
  websocketHandler.sendLog(req, `Successfully created user notification with ID: ${userNotification._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: userNotification
  });
});

exports.getUserNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching user notification with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const userNotification = await UserNotification.findById(req.params.id);
  if (!userNotification) {
      websocketHandler.sendLog(req, `User notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('User notification not found', 404));
  }
  websocketHandler.sendLog(req, `Found user notification ID: ${userNotification._id}`, constants.LOG_TYPES.DEBUG);

  websocketHandler.sendLog(req, 'Completed getUserNotification process', constants.LOG_TYPES.INFO);
  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: userNotification
  });
});

exports.updateUserNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateUserNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating user notification ID: ${req.params.id} with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);

  const userNotification = await UserNotification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  if (!userNotification) {
      websocketHandler.sendLog(req, `User notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('User notification not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully updated user notification ID: ${userNotification._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: userNotification
  });
});

exports.deleteUserNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteUserNotification process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Attempting to delete user notification with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const userNotification = await UserNotification.findByIdAndDelete(req.params.id);
  if (!userNotification) {
      websocketHandler.sendLog(req, `User notification not found with ID: ${req.params.id}`, constants.LOG_TYPES.WARN);
      return next(new AppError('User notification not found', 404));
  }
  websocketHandler.sendLog(req, `Successfully deleted user notification ID: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: userNotification
  });
});

exports.getAllUserNotifications = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllUserNotifications process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching user notifications for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const userNotifications = await UserNotification.find({ company: req.cookies.companyId });
  websocketHandler.sendLog(req, `Retrieved ${userNotifications.length} user notifications`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getAllUserNotifications process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: userNotifications
  });
});

exports.getAllUserNotificationsByNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllUserNotificationsByNotification process', constants.LOG_TYPES.INFO);
  const notificationId = req.params.id;
  websocketHandler.sendLog(req, `Fetching user notifications for notification ${notificationId} and company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  try {
      const userNotifications = await UserNotification.find({ company: req.cookies.companyId }).where('notification').equals(req.params.id);
      websocketHandler.sendLog(req, `Retrieved ${userNotifications.length} user notifications`, constants.LOG_TYPES.DEBUG);
      websocketHandler.sendLog(req, 'Completed getAllUserNotificationsByNotification process', constants.LOG_TYPES.INFO);

      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: userNotifications
      });
  } catch (error) {
      websocketHandler.sendLog(req, `Error fetching user notifications: ${error.message}`, constants.LOG_TYPES.ERROR);
      res.status(400).json({
          status: constants.APIResponseStatus.Error,
          message: error.message
      });
  }
});

exports.assignOrUnAssignUserNotification = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting assignOrUnAssignUserNotification process', constants.LOG_TYPES.INFO);
  const { user, notification, action } = req.body;
  websocketHandler.sendLog(req, `Processing action: ${action} for user ${user} and notification ${notification}`, constants.LOG_TYPES.TRACE);

  if (!user || !notification || !action) {
      websocketHandler.sendLog(req, 'Missing required fields in request', constants.LOG_TYPES.WARN);
      return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'User, notification, and action are required'
      });
  }

  if (action === 'assign') {
      const existingNotification = await UserNotification.findOne({ user, notification });
      if (existingNotification) {
          websocketHandler.sendLog(req, `Notification ${notification} already assigned to user ${user}`, constants.LOG_TYPES.WARN);
          return res.status(400).json({
              status: constants.APIResponseStatus.Failure,
              message: 'Notification already assigned to this user'
          });
      }

      const userNotification = await UserNotification.create({ user, notification, status: 'unread' });
      websocketHandler.sendLog(req, `Assigned notification ${notification} to user ${user} with ID: ${userNotification._id}`, constants.LOG_TYPES.INFO);

      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: userNotification
      });
  } else if (action === 'unassign') {
      const deletedNotification = await UserNotification.findOneAndDelete({ user, notification });
      if (!deletedNotification) {
          websocketHandler.sendLog(req, `No notification found for user ${user} and notification ${notification}`, constants.LOG_TYPES.WARN);
          return res.status(400).json({
              status: constants.APIResponseStatus.Failure,
              message: 'Notification not found for this user'
          });
      }
      websocketHandler.sendLog(req, `Unassigned notification ${notification} from user ${user}`, constants.LOG_TYPES.INFO);

      res.status(201).json({
          status: constants.APIResponseStatus.Success,
          message: 'Notification successfully unassigned'
      });
  } else {
      websocketHandler.sendLog(req, `Invalid action: ${action}`, constants.LOG_TYPES.WARN);
      res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Invalid action'
      });
  }
});

exports.getUserNotificationsForToday = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserNotificationsForToday process', constants.LOG_TYPES.INFO);
  const userId = req.cookies.userId;
  const startOfDay = moment().startOf('day').toDate();
  const endOfDay = moment().endOf('day').toDate();
  websocketHandler.sendLog(req, `Fetching notifications for user ${userId} for today ${startOfDay} to ${endOfDay}`, constants.LOG_TYPES.TRACE);

  const userNotifications = await UserNotification.find({ user: userId });
  if (!userNotifications || userNotifications.length === 0) {
      websocketHandler.sendLog(req, `No user notifications found for user ${userId}`, constants.LOG_TYPES.DEBUG);
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: []
      });
  }

  const notificationIds = userNotifications.map(notification => notification.notification);
  websocketHandler.sendLog(req, `Extracted ${notificationIds.length} notification IDs`, constants.LOG_TYPES.DEBUG);

  const eventNotifications = await EventNotification.find({
      _id: { $in: notificationIds },
      createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
      }
  });
  websocketHandler.sendLog(req, `Found ${eventNotifications.length} event notifications for today`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getUserNotificationsForToday process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotifications
  });
});

exports.getUserNotificationsAll = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getUserNotificationsAll process', constants.LOG_TYPES.INFO);
  const userId = req.cookies.userId;
  websocketHandler.sendLog(req, `Fetching all notifications for user ${userId}`, constants.LOG_TYPES.TRACE);

  const userNotifications = await UserNotification.find({ user: userId });
  if (!userNotifications || userNotifications.length === 0) {
      websocketHandler.sendLog(req, `No user notifications found for user ${userId}`, constants.LOG_TYPES.DEBUG);
      res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: []
      });
  }

  const notificationIds = userNotifications.map(notification => notification.notification);
  websocketHandler.sendLog(req, `Extracted ${notificationIds.length} notification IDs`, constants.LOG_TYPES.DEBUG);

  const eventNotifications = await EventNotification.find({
      _id: { $in: notificationIds }
  });
  websocketHandler.sendLog(req, `Found ${eventNotifications.length} event notifications`, constants.LOG_TYPES.DEBUG);
  websocketHandler.sendLog(req, 'Completed getUserNotificationsAll process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotifications
  });
});

exports.getUserNotifications = async (userIds) => {
  websocketHandler.sendLog(null, 'Starting getUserNotifications process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(null, `Fetching notifications for users: ${userIds}`, constants.LOG_TYPES.TRACE);

  try {
      const userNotifications = await UserNotification.find({
          user: { $in: userIds },
          status: 'unread'
      }).populate('notification');
      websocketHandler.sendLog(null, `Retrieved ${userNotifications.length} unread user notifications`, constants.LOG_TYPES.DEBUG);

      const currentDate = new Date();
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      const eventNotifications = userNotifications.filter(userNotification => {
          const eventDate = userNotification.notification.date;
          return eventDate >= startOfDay && eventDate <= endOfDay;
      });
      websocketHandler.sendLog(null, `Filtered ${eventNotifications.length} notifications for today`, constants.LOG_TYPES.DEBUG);
      websocketHandler.sendLog(null, 'Completed getUserNotifications process', constants.LOG_TYPES.INFO);

      return eventNotifications;
  } catch (error) {
      websocketHandler.sendLog(null, `Error retrieving user notifications: ${error.message}`, constants.LOG_TYPES.ERROR);
      throw error;
  }
};

exports.updateRecurringNotifications = async () => {
  websocketHandler.sendLog(null, 'Starting updateRecurringNotifications process', constants.LOG_TYPES.INFO);

  try {
      const userNotifications = await UserNotification.find({
          status: 'read'
      }).populate('notification');
      websocketHandler.sendLog(null, `Fetched ${userNotifications.length} read user notifications`, constants.LOG_TYPES.DEBUG);

      for (const userNotification of userNotifications) {
          const eventNotification = userNotification.notification;
          websocketHandler.sendLog(null, `Processing user notification ${userNotification._id}`, constants.LOG_TYPES.TRACE);

          if (eventNotification.isRecurring) {
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
                      websocketHandler.sendLog(null, `Unrecognized recurring frequency: ${eventNotification.recurringFrequency} for ID: ${userNotification._id}`, constants.LOG_TYPES.WARN);
                      continue;
              }

              await EventNotification.findByIdAndUpdate(eventNotification._id, { date: newDate });
              await UserNotification.findByIdAndUpdate(userNotification._id, { status: 'unread' });
              websocketHandler.sendLog(null, `Updated recurring notification ${eventNotification._id} to new date: ${newDate}`, constants.LOG_TYPES.TRACE);
          } else {
              websocketHandler.sendLog(null, `Skipping non-recurring notification ${userNotification._id}`, constants.LOG_TYPES.TRACE);
          }
      }

      websocketHandler.sendLog(null, 'Completed updateRecurringNotifications process', constants.LOG_TYPES.INFO);
  } catch (error) {
      websocketHandler.sendLog(null, `Error updating recurring notifications: ${error.message}`, constants.LOG_TYPES.ERROR);
      throw error;
  }
};

exports.testMe = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting testMe process', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, 'Executing test endpoint', constants.LOG_TYPES.TRACE);
  websocketHandler.sendLog(req, 'Completed testMe process', constants.LOG_TYPES.INFO);

  res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {}
  });
});

exports.addNotificationForUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting addNotificationForUser process', constants.LOG_TYPES.INFO);
    
    const { name, description, eventNotificationType, date, isRecurring, recurringFrequency, leadTime } = req.body;
    const userId = req.cookies.userId;
    websocketHandler.sendLog(req, `User ID from cookies: ${userId}`, constants.LOG_TYPES.TRACE);
    const companyId = req.cookies.companyId;
  
    if (!userId || !companyId) {
      websocketHandler.sendLog(req, 'Missing userId or companyId in request', constants.LOG_TYPES.WARN);
      return next(new AppError('User ID and Company ID are required', 400));
    }
  
    websocketHandler.sendLog(req, `Creating event notification with data: ${JSON.stringify(req.body)}`, constants.LOG_TYPES.TRACE);
  
    // Create the EventNotification
    const eventNotificationData = {
      name,
      description,
      eventNotificationType,
      date,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      leadTime,
      company: companyId
    };
    const eventNotification = await EventNotification.create(eventNotificationData);
    websocketHandler.sendLog(req, `Created event notification with ID: ${eventNotification._id}`, constants.LOG_TYPES.INFO);
  
    // Link it to the user via UserNotification
    const userNotificationData = {
      user: userId,
      notification: eventNotification._id,
      status: 'unread'
    };
    const userNotification = await UserNotification.create(userNotificationData);
    websocketHandler.sendLog(req, `Linked notification ${eventNotification._id} to user ${userId} with UserNotification ID: ${userNotification._id}`, constants.LOG_TYPES.INFO);
  
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        eventNotification,
        userNotification
      }
    });
  });

  exports.getAllUserNotifications = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getAllUserNotifications process', constants.LOG_TYPES.INFO);
    const userId = req.params.userId || req.cookies.userId; // Allow userId from params or cookies
  
    if (!userId) {
      websocketHandler.sendLog(req, 'Missing userId in request', constants.LOG_TYPES.WARN);
      return next(new AppError('User ID is required', 400));
    }
  
    websocketHandler.sendLog(req, `Fetching all notifications for user ${userId}`, constants.LOG_TYPES.TRACE);
  
    // Fetch all UserNotifications for the user
    const userNotifications = await UserNotification.find({ user: userId });
    if (!userNotifications || userNotifications.length === 0) {
      websocketHandler.sendLog(req, `No notifications found for user ${userId}`, constants.LOG_TYPES.DEBUG);
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: []
      });
    }
  
    // Extract notification IDs
    const notificationIds = userNotifications.map(un => un.notification);
    websocketHandler.sendLog(req, `Found ${notificationIds.length} notification IDs for user ${userId}`, constants.LOG_TYPES.DEBUG);
  
    // Fetch corresponding EventNotifications
    const eventNotifications = await EventNotification.find({ _id: { $in: notificationIds } })
      .populate('eventNotificationType')
      .populate('company');
    websocketHandler.sendLog(req, `Retrieved ${eventNotifications.length} event notifications`, constants.LOG_TYPES.DEBUG);
  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: eventNotifications
    });
  });

  exports.deleteNotificationForUser = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting deleteNotificationForUser process', constants.LOG_TYPES.INFO);
    const { userId, notificationId } = req.body;
  
    if (!userId || !notificationId) {
      websocketHandler.sendLog(req, 'Missing userId or notificationId in request', constants.LOG_TYPES.WARN);
      return next(new AppError('User ID and Notification ID are required', 400));
    }
  
    websocketHandler.sendLog(req, `Deleting notification ${notificationId} for user ${userId}`, constants.LOG_TYPES.TRACE);
  
    // Delete the UserNotification
    const userNotification = await UserNotification.findOneAndDelete({
      user: userId,
      notification: notificationId
    });
    if (!userNotification) {
      websocketHandler.sendLog(req, `UserNotification not found for user ${userId} and notification ${notificationId}`, constants.LOG_TYPES.WARN);
      return next(new AppError('User notification link not found', 404));
    }
    websocketHandler.sendLog(req, `Deleted UserNotification for user ${userId} and notification ${notificationId}`, constants.LOG_TYPES.INFO);
  
    // Delete the EventNotification
    const eventNotification = await EventNotification.findByIdAndDelete(notificationId);
    if (!eventNotification) {
      websocketHandler.sendLog(req, `EventNotification ${notificationId} not found`, constants.LOG_TYPES.WARN);
      return next(new AppError('Event notification not found', 404));
    }
    websocketHandler.sendLog(req, `Deleted EventNotification ${notificationId}`, constants.LOG_TYPES.INFO);
  
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  });
  





