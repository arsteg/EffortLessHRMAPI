const express = require('express');
const router = express.Router();
const { presenceController } = require('../../controllers/communication');
const authController = require('../../controllers/authController');

// Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Presence
 *   description: User presence and status management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPresence:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, away, busy, dnd, invisible, offline]
 *         customStatus:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               maxLength: 128
 *             emoji:
 *               type: string
 *             expiresAt:
 *               type: string
 *               format: date-time
 *         lastSeenAt:
 *           type: string
 *           format: date-time
 *         activeDevices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *               isActive:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/v1/communication/presence:
 *   get:
 *     summary: Get current user's presence
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's presence
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPresence'
 */
router.get('/', presenceController.getMyPresence);

/**
 * @swagger
 * /api/v1/communication/presence/status:
 *   patch:
 *     summary: Update presence status
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [online, away, busy, dnd, invisible]
 *               duration:
 *                 type: integer
 *                 description: Duration in milliseconds (optional)
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/status', presenceController.updateStatus);

/**
 * @swagger
 * /api/v1/communication/presence/custom-status:
 *   post:
 *     summary: Set custom status
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 128
 *               emoji:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in milliseconds (optional)
 *     responses:
 *       200:
 *         description: Custom status set
 */
router.post('/custom-status', presenceController.setCustomStatus);

/**
 * @swagger
 * /api/v1/communication/presence/custom-status:
 *   delete:
 *     summary: Clear custom status
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Custom status cleared
 */
router.delete('/custom-status', presenceController.clearCustomStatus);

/**
 * @swagger
 * /api/v1/communication/presence/bulk:
 *   post:
 *     summary: Get presence for multiple users
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 100
 *     responses:
 *       200:
 *         description: Map of user IDs to presence data
 */
router.post('/bulk', presenceController.getPresenceForUsers);

/**
 * @swagger
 * /api/v1/communication/presence/online:
 *   get:
 *     summary: Get all online users in company
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of online users
 */
router.get('/online', presenceController.getOnlineUsers);

/**
 * @swagger
 * /api/v1/communication/presence/device:
 *   post:
 *     summary: Register a device
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - platform
 *             properties:
 *               deviceId:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [web, desktop, mobile, tablet]
 *               os:
 *                 type: string
 *               browser:
 *                 type: string
 *               appVersion:
 *                 type: string
 *               pushToken:
 *                 type: string
 *               pushProvider:
 *                 type: string
 *                 enum: [fcm, apns, web]
 *     responses:
 *       200:
 *         description: Device registered
 */
router.post('/device', presenceController.registerDevice);

/**
 * @swagger
 * /api/v1/communication/presence/device/{deviceId}:
 *   delete:
 *     summary: Unregister a device
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device unregistered
 */
router.delete('/device/:deviceId', presenceController.unregisterDevice);

/**
 * @swagger
 * /api/v1/communication/presence/notifications:
 *   patch:
 *     summary: Update notification settings
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               desktop:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   sound:
 *                     type: boolean
 *               mobile:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   sound:
 *                     type: boolean
 *                   vibrate:
 *                     type: boolean
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   frequency:
 *                     type: string
 *                     enum: [instant, hourly, daily, never]
 *               quietHours:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   startTime:
 *                     type: string
 *                   endTime:
 *                     type: string
 *                   timezone:
 *                     type: string
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.patch('/notifications', presenceController.updateNotificationSettings);

/**
 * @swagger
 * /api/v1/communication/presence/dnd-schedule:
 *   post:
 *     summary: Set Do Not Disturb schedule
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               startTime:
 *                 type: string
 *                 description: HH:MM format
 *               endTime:
 *                 type: string
 *                 description: HH:MM format
 *               timezone:
 *                 type: string
 *               days:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Days of week (0=Sunday, 6=Saturday)
 *     responses:
 *       200:
 *         description: DND schedule set
 */
router.post('/dnd-schedule', presenceController.setDndSchedule);

/**
 * @swagger
 * /api/v1/communication/presence/heartbeat:
 *   post:
 *     summary: Send heartbeat to keep presence alive
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 description: Whether user is actively using the app
 *     responses:
 *       200:
 *         description: Heartbeat received
 */
router.post('/heartbeat', presenceController.heartbeat);

/**
 * @swagger
 * /api/v1/communication/presence/user/{userId}:
 *   get:
 *     summary: Get presence for a single user
 *     tags: [Presence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User presence
 */
router.get('/user/:userId', presenceController.getUserPresence);

module.exports = router;
