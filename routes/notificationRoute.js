const express = require('express');
const { Router } = require('express');
const app = require('../app');
const router = express.Router();
module.exports = router;
const notificationController = require('../controllers/notficationController')
const authController = require('../controllers/authController');
// Create
/**
 * @swagger
 * /api/v1/notification/send:
 *   post:
 *     tags:
 *       - Notification
 *     summary: "Send notification"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          message:
 *                              type: string
 *     responses:
 *       200:
 *         description: Successfully send message
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/send',authController.protect, notificationController.SendNotification);
