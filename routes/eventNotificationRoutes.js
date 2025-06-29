const express = require('express');
const eventNotificationController = require('../controllers/eventNotificationController');
const authController = require('../controllers/authController');
const router = express.Router();

// Event Notification routes

/**
 * @swagger
 * /api/v1/eventNotifications/Notification:
 *   post:
 *     summary: Add a new event notification
 *     tags: [Event Notification]
 *     requestBody:
 *       description: Event notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               eventNotificationType:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               isRecurring:
 *                 type: boolean
 *                 required: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: ['daily', 'weekly', 'monthly', 'yearly']
 *               leadTime:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *                 default: 'scheduled'
 *     responses:
 *       201:
 *         description: Event notification successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     eventNotificationType:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     isRecurring:
 *                       type: boolean
 *                     recurringFrequency:
 *                       type: string
 *                     leadTime:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/Notification', eventNotificationController.createEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification/{id}:
 *   get:
 *     summary: Get an event notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification
 *     responses:
 *       200:
 *         description: Successful response with the event notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     eventNotificationType:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     isRecurring:
 *                       type: boolean
 *                     recurringFrequency:
 *                       type: string
 *                     leadTime:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *       404:
 *         description: Event notification not found
 *       500:
 *         description: Internal server error
 */
router.get('/Notification/:id',  eventNotificationController.getEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification/{id}:
 *   put:
 *     summary: Update an event notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification
 *     requestBody:
 *       description: New event notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eventNotificationType:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               isRecurring:
 *                 type: boolean
 *               recurringFrequency:
 *                 type: string
 *                 enum: ['daily', 'weekly', 'monthly', 'yearly']
 *               leadTime:
 *                 type: number
 *               company:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *     responses:
 *       200:
 *         description: Successful response with the updated event notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     eventNotificationType:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     isRecurring:
 *                       type: boolean
 *                     recurringFrequency:
 *                       type: string
 *                     leadTime:
 *                       type: number
 *                     company:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *       404:
 *         description: Event notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/Notification/:id',  eventNotificationController.updateEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification/{id}:
 *   delete:
 *     summary: Delete an event notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification
 *     responses:
 *       204:
 *         description: Event notification successfully deleted
 *       404:
 *         description: Event notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/Notification/:id', eventNotificationController.deleteEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification:
 *   get:
 *     summary: Get all event notifications
 *     tags: [Event Notification]
 *     responses:
 *       200:
 *         description: Successful response with event notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                       type: string
 *                       description:
 *                         type: string
 *                       eventNotificationType:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       isRecurring:
 *                         type: boolean
 *                       recurringFrequency:
 *                         type: string
 *                       leadTime:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *       500:
 *         description: Internal server error
 */
router.get('/Notification', eventNotificationController.getAllEventNotifications);

/**
 * @swagger
 * /api/v1/eventNotifications/eventNotificationTypes:
 *   post:
 *     summary: Create a new event notification type
 *     tags: [Event Notification]
 *     requestBody:
 *       description: Event notification type details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true 
 *     responses:
 *       201:
 *         description: Event notification type successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/eventNotificationTypes', eventNotificationController.createEventNotificationType);

/**
 * @swagger
 * /api/v1/eventNotifications/eventNotificationType/{id}:
 *   get:
 *     summary: Get an event notification type by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification type
 *     responses:
 *       200:
 *         description: Successful response with the event notification type
 *       404:
 *         description: Event notification type not found
 *       500:
 *         description: Internal server error
 */
router.get('/eventNotificationType/:id', eventNotificationController.getEventNotificationType);

/**
 * @swagger
 * /api/v1/eventNotifications/eventNotificationTypes/{id}:
 *   put:
 *     summary: Update an event notification type by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification type
 *     requestBody:
 *       description: New event notification type details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated event notification type
 *       404:
 *         description: Event notification type not found
 *       500:
 *         description: Internal server error
 */
router.put('/eventNotificationTypes/:id',  eventNotificationController.updateEventNotificationType);

/**
 * @swagger
 * /api/v1/eventNotifications/eventNotificationTypes/{id}:
 *   delete:
 *     summary: Delete an event notification type by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event notification type
 *     responses:
 *       204:
 *         description: Event notification type successfully deleted
 *       404:
 *         description: Event notification type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/eventNotificationTypes/:id',  eventNotificationController.deleteEventNotificationType);

/**
 * @swagger
 * /api/v1/eventNotifications/eventNotificationTypes:
 *   get:
 *     summary: Get all event notification types
 *     tags: [Event Notification]
 *     responses:
 *       200:
 *         description: Successful response with event notification types
 *       500:
 *         description: Internal server error
 */
router.get('/eventNotificationTypes',  eventNotificationController.getAllEventNotificationTypes);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications:
 *   post:
 *     summary: Add a new user notification
 *     tags: [Event Notification]
 *     requestBody:
 *       description: User notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               notification:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: User notification successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/userNotifications',  eventNotificationController.createUserNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications/{id}:
 *   get:
 *     summary: Get a user notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user notification
 *     responses:
 *       200:
 *         description: Successful response with the user notification
 *       404:
 *         description: User notification not found
 *       500:
 *         description: Internal server error
 */
router.get('/userNotifications/:id', eventNotificationController.getUserNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications/{id}:
 *   put:
 *     summary: Update a user notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user notification
 *     requestBody:
 *       description: New user notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               notification:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [unread, read, dismissed]
 *     responses:
 *       200:
 *         description: Successful response with the updated user notification
 *       404:
 *         description: User notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/userNotifications/:id',  eventNotificationController.updateUserNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications/{id}:
 *   delete:
 *     summary: Delete a user notification by ID
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user notification
 *     responses:
 *       204:
 *         description: User notification successfully deleted
 *       404:
 *         description: User notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/userNotifications/:id', eventNotificationController.deleteUserNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications:
 *   get:
 *     summary: Get all user notifications
 *     tags: [Event Notification]
 *     responses:
 *       200:
 *         description: Successful response with user notifications
 *       500:
 *         description: Internal server error
 */
router.get('/userNotifications', eventNotificationController.getAllUserNotifications);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications/notification/{id}:
 *   get:
 *     summary: Get all user notifications by Notification id
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user notification 
 *     responses:
 *       200:
 *         description: Successful response with user notifications
 *       500:
 *         description: Internal server error
 */
router.get('/userNotifications/notification/:id', eventNotificationController.getAllUserNotificationsByNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/userNotifications/update:
 *   post:
 *     summary: Add or remove a user notification
 *     tags: [Event Notification]
 *     requestBody:
 *       description: User notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               notification:
 *                 type: string
 *                 required: true
 *               action:
 *                 type: string
 *                 enum: [assign, unassign]
 *                 required: true
 *     responses:
 *       201:
 *         description: User notification successfully updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/userNotifications/update', eventNotificationController.assignOrUnAssignUserNotification);
/**
 * @swagger
 * /api/v1/eventNotifications/today:
 *   get:
 *     summary: Get today's notifications for the logged-in user
 *     tags: [Event Notification] 
 *     responses:
 *       200:
 *         description: Successful response with user notifications
 *       500:
 *         description: Internal server error
 */
router.get('/today', eventNotificationController.getUserNotificationsForToday);

/**
 * @swagger
 * /api/v1/eventNotifications/All:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Event Notification] 
 *     responses:
 *       200:
 *         description: Successful response with user notifications
 *       500:
 *         description: Internal server error
 */
router.get('/All', eventNotificationController.getUserNotificationsAll);

/**
 * @swagger
 * /api/v1/eventNotifications/user/notification:
 *   post:
 *     summary: Add a new event notification for a specific user
 *     tags: [Event Notification]
 *     requestBody:
 *       description: Event notification and user details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               eventNotificationType:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               navigationUrl:
 *                 type: string
 *                 required: false
 *               isRecurring:
 *                 type: boolean
 *                 required: true
 *               recurringFrequency:
 *                 type: string
 *                 enum: ['daily', 'weekly', 'monthly', 'annually']
 *               leadTime:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *                 default: 'unread'
 *     responses:
 *       201:
 *         description: Event notification and user link successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventNotification:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         eventNotificationType:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date
 *                         navigationUrl:
 *                           type: string
 *                         isRecurring:
 *                           type: boolean
 *                         recurringFrequency:
 *                           type: string
 *                         leadTime:
 *                           type: number
 *                         status:
 *                           type: string
 *                           enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *                     userNotification:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: string
 *                         notification:
 *                           type: string
 *       400:
 *         description: Bad request (missing required fields)
 *       500:
 *         description: Internal server error
 */
router.post('/user/notification', eventNotificationController.addNotificationForUser);
/**
 * @swagger
 * /api/v1/eventNotifications/user/{userId}/notifications:
 *   get:
 *     summary: Get all notifications for a specific user
 *     tags: [Event Notification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Successful response with all event notifications for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       eventNotificationType:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       isRecurring:
 *                         type: boolean
 *                       recurringFrequency:
 *                         type: string
 *                       leadTime:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: ['unread', 'scheduled', 'sent', 'delivered', 'read']
 *       400:
 *         description: Bad request (missing userId)
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId/notifications', eventNotificationController.getAllUserNotifications);

/**
 * @swagger
 * /api/v1/eventNotifications/user/notification:
 *   delete:
 *     summary: Delete an event notification and its user link
 *     tags: [Event Notification]
 *     requestBody:
 *       description: User and notification IDs to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *               notificationId:
 *                 type: string
 *                 required: true
 *     responses:
 *       204:
 *         description: Notification and user link successfully deleted
 *       400:
 *         description: Bad request (missing required fields)
 *       404:
 *         description: Notification or user link not found
 *       500:
 *         description: Internal server error
 */
router.delete('/user/notification', eventNotificationController.deleteNotificationForUser);

/**
 * @swagger
 * /api/v1/eventNotifications/user/notification/updatestatus:
 *   patch:
 *     summary: Update the status of an event notification for a user
 *     tags: [Event Notification]
 *     requestBody:
 *       description: User ID, Notification ID, and Status to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 required: true
 *               notificationId:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *                 enum: [read, unread, scheduled, archived]
 *     responses:
 *       200:
 *         description: Notification status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.patch('/user/notification/updatestatus', eventNotificationController.updateNotificationStatus);

/**
 * @swagger
 * /api/v1/eventNotifications/userevents:
 *   get:
 *     summary: Get calendar events for the current user
 *     tags: [Event Notification]
 *     responses:
 *       200:
 *         description: Successful response with calendar events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - user not logged in
 *       500:
 *         description: Internal server error
 */
router.get('/userevents', eventNotificationController.getUserCalenderEvents);

module.exports = router;
