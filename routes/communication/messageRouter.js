const express = require('express');
const router = express.Router();
const { messageController } = require('../../controllers/communication');
const authController = require('../../controllers/authController');

// Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conversationId:
 *           type: string
 *         senderId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image, video, audio, file, system, call]
 *         content:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *             mentions:
 *               type: array
 *               items:
 *                 type: string
 *         attachments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Attachment'
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Attachment:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, video, audio, file]
 *         url:
 *           type: string
 *         name:
 *           type: string
 *         size:
 *           type: integer
 *         mimeType:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/communication/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *             properties:
 *               conversationId:
 *                 type: string
 *               content:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *                   mentions:
 *                     type: array
 *                     items:
 *                       type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Attachment'
 *               replyTo:
 *                 type: string
 *                 description: Message ID to reply to
 *               type:
 *                 type: string
 *                 default: text
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/v1/communication/messages/search:
 *   get:
 *     summary: Search messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: conversationId
 *         schema:
 *           type: string
 *         description: Filter by conversation
 *       - in: query
 *         name: senderId
 *         schema:
 *           type: string
 *         description: Filter by sender
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by message type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', messageController.searchMessages);

/**
 * @swagger
 * /api/v1/communication/messages/delivered:
 *   post:
 *     summary: Mark messages as delivered
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as delivered
 */
router.post('/delivered', messageController.markAsDelivered);

/**
 * @swagger
 * /api/v1/communication/messages/conversation/{conversationId}:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this timestamp
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages after this timestamp
 *       - in: query
 *         name: threadId
 *         schema:
 *           type: string
 *         description: Filter by thread (null for main messages)
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/conversation/:conversationId', messageController.getMessages);

/**
 * @swagger
 * /api/v1/communication/messages/conversation/{conversationId}/pinned:
 *   get:
 *     summary: Get pinned messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pinned messages
 */
router.get('/conversation/:conversationId/pinned', messageController.getPinnedMessages);

/**
 * @swagger
 * /api/v1/communication/messages/{id}:
 *   patch:
 *     summary: Edit a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message edited
 */
router.patch('/:id', messageController.editMessage);

/**
 * @swagger
 * /api/v1/communication/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/:id', messageController.deleteMessage);

/**
 * @swagger
 * /api/v1/communication/messages/{id}/reactions:
 *   post:
 *     summary: Add reaction to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction added
 */
router.post('/:id/reactions', messageController.addReaction);

/**
 * @swagger
 * /api/v1/communication/messages/{id}/reactions:
 *   delete:
 *     summary: Remove reaction from a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction removed
 */
router.delete('/:id/reactions', messageController.removeReaction);

/**
 * @swagger
 * /api/v1/communication/messages/{id}/thread:
 *   get:
 *     summary: Get thread messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent message ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Thread messages
 */
router.get('/:id/thread', messageController.getThreadMessages);

/**
 * @swagger
 * /api/v1/communication/messages/{id}/thread:
 *   post:
 *     summary: Reply to a thread
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Attachment'
 *               type:
 *                 type: string
 *                 default: text
 *     responses:
 *       201:
 *         description: Reply sent
 */
router.post('/:id/thread', messageController.replyToThread);

/**
 * @swagger
 * /api/v1/communication/messages/{id}/forward:
 *   post:
 *     summary: Forward a message to other conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetConversationIds
 *             properties:
 *               targetConversationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message forwarded
 */
router.post('/:id/forward', messageController.forwardMessage);

module.exports = router;
