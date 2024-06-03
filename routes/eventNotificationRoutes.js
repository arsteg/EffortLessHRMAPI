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
 *     responses:
 *       201:
 *         description: Event notification successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/Notification', authController.protect, eventNotificationController.createEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification{id}:
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
 *       404:
 *         description: Event notification not found
 *       500:
 *         description: Internal server error
 */
router.get('/Notification/:id', authController.protect, eventNotificationController.getEventNotification);

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
 *     responses:
 *       200:
 *         description: Successful response with the updated event notification
 *       404:
 *         description: Event notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/Notification/:id', authController.protect, eventNotificationController.updateEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/{id}:
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
router.delete('/Notification/:id', authController.protect, eventNotificationController.deleteEventNotification);

/**
 * @swagger
 * /api/v1/eventNotifications/Notification:
 *   get:
 *     summary: Get all event notifications
 *     tags: [Event Notification]
 *     responses:
 *       200:
 *         description: Successful response with event notifications
 *       500:
 *         description: Internal server error
 */
router.get('/Notification', authController.protect, eventNotificationController.getAllEventNotifications);

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
router.post('/eventNotificationTypes', authController.protect, eventNotificationController.createEventNotificationType);

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
router.get('/eventNotificationType/:id', authController.protect, eventNotificationController.getEventNotificationType);

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
router.put('/eventNotificationTypes/:id', authController.protect, eventNotificationController.updateEventNotificationType);

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
router.delete('/eventNotificationTypes/:id', authController.protect, eventNotificationController.deleteEventNotificationType);

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

// User Notifications
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
 *               status:
 *                 type: string
 *                 enum: [unread, read, dismissed]
 *                 required: true
 *     responses:
 *       201:
 *         description: User notification successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/userNotifications', authController.protect, eventNotificationController.createUserNotification);

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
router.get('/userNotifications/:id', authController.protect, eventNotificationController.getUserNotification);

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
router.put('/userNotifications/:id', authController.protect, eventNotificationController.updateUserNotification);

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
router.delete('/userNotifications/:id', authController.protect, eventNotificationController.deleteUserNotification);

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
router.get('/userNotifications', authController.protect, eventNotificationController.getAllUserNotifications);

module.exports = router;
