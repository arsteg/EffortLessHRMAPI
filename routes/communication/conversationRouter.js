const express = require('express');
const router = express.Router();
const { conversationController } = require('../../controllers/communication');
const authController = require('../../controllers/authController');

// Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation management endpoints
 */

/**
 * @swagger
 * /api/v1/communication/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group, channel]
 *         description: Filter by conversation type
 *       - in: query
 *         name: archived
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filter archived conversations
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of conversations to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of conversations to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or message preview
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 */
router.get('/', conversationController.getConversations);

/**
 * @swagger
 * /api/v1/communication/conversations/direct:
 *   post:
 *     summary: Create a direct conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user to start conversation with
 *     responses:
 *       201:
 *         description: Conversation created
 *       200:
 *         description: Existing conversation returned
 */
router.post('/direct', conversationController.createDirectConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/group:
 *   post:
 *     summary: Create a group conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - participantIds
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add
 *               avatar:
 *                 type: string
 *                 description: URL to group avatar
 *               description:
 *                 type: string
 *               linkedProjectId:
 *                 type: string
 *               linkedTaskId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group conversation created
 */
router.post('/group', conversationController.createGroupConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/direct/{targetUserId}:
 *   get:
 *     summary: Get or create direct conversation with user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Direct conversation
 */
router.get('/direct/:targetUserId', conversationController.getOrCreateDirect);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}:
 *   get:
 *     summary: Get a single conversation
 *     tags: [Conversations]
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
 *         description: Conversation details
 *       404:
 *         description: Conversation not found
 */
router.get('/:id', conversationController.getConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}:
 *   patch:
 *     summary: Update a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               description:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Conversation updated
 */
router.patch('/:id', conversationController.updateConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
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
 *         description: Conversation deleted
 */
router.delete('/:id', conversationController.deleteConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/participants:
 *   post:
 *     summary: Add participants to group conversation
 *     tags: [Conversations]
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
 *               - participantIds
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Participants added
 */
router.post('/:id/participants', conversationController.addParticipants);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/participants/{participantId}:
 *   delete:
 *     summary: Remove participant from group conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant removed
 */
router.delete('/:id/participants/:participantId', conversationController.removeParticipant);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/archive:
 *   post:
 *     summary: Archive a conversation
 *     tags: [Conversations]
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
 *         description: Conversation archived
 */
router.post('/:id/archive', conversationController.archiveConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/unarchive:
 *   post:
 *     summary: Unarchive a conversation
 *     tags: [Conversations]
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
 *         description: Conversation unarchived
 */
router.post('/:id/unarchive', conversationController.unarchiveConversation);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/read:
 *   post:
 *     summary: Mark conversation as read
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: Last message ID to mark as read (optional)
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.post('/:id/read', conversationController.markAsRead);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/notifications:
 *   patch:
 *     summary: Update notification preferences for conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preference:
 *                 type: string
 *                 enum: [all, mentions, none]
 *               muted:
 *                 type: boolean
 *               mutedUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch('/:id/notifications', conversationController.updateNotificationPreference);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/pin:
 *   post:
 *     summary: Pin a message in conversation
 *     tags: [Conversations]
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
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message pinned
 */
router.post('/:id/pin', conversationController.pinMessage);

/**
 * @swagger
 * /api/v1/communication/conversations/{id}/pin/{messageId}:
 *   delete:
 *     summary: Unpin a message from conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message unpinned
 */
router.delete('/:id/pin/:messageId', conversationController.unpinMessage);

module.exports = router;
