const express = require('express');
const router = express.Router();
const { callController } = require('../../controllers/communication');
const authController = require('../../controllers/authController');

// Protect all routes
router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Calls
 *   description: Voice and video call management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CallSession:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [voice, video, screen_share]
 *         mode:
 *           type: string
 *           enum: [p2p, sfu, mcu]
 *         status:
 *           type: string
 *           enum: [initiating, ringing, connecting, active, on_hold, reconnecting, ended, missed, rejected, failed, busy]
 *         initiator:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *               hasVideo:
 *                 type: boolean
 *               hasAudio:
 *                 type: boolean
 *         duration:
 *           type: integer
 *           description: Call duration in seconds
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/communication/calls:
 *   post:
 *     summary: Initiate a call
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: User ID to call (for 1:1 calls)
 *               conversationId:
 *                 type: string
 *                 description: Conversation ID (optional)
 *               channelId:
 *                 type: string
 *                 description: Voice channel ID (for group calls)
 *               type:
 *                 type: string
 *                 enum: [voice, video]
 *                 default: voice
 *     responses:
 *       201:
 *         description: Call initiated
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
 *                     callSession:
 *                       $ref: '#/components/schemas/CallSession'
 *                     iceServers:
 *                       type: array
 */
router.post('/', callController.initiateCall);

/**
 * @swagger
 * /api/v1/communication/calls/active:
 *   get:
 *     summary: Get current active call
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active call or null
 */
router.get('/active', callController.getActiveCall);

/**
 * @swagger
 * /api/v1/communication/calls/history:
 *   get:
 *     summary: Get call history
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [voice, video]
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
 *         description: Call history
 */
router.get('/history', callController.getCallHistory);

/**
 * @swagger
 * /api/v1/communication/calls/scheduled:
 *   get:
 *     summary: Get scheduled meetings
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled meetings
 */
router.get('/scheduled', callController.getScheduledMeetings);

/**
 * @swagger
 * /api/v1/communication/calls/schedule:
 *   post:
 *     summary: Schedule a meeting
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledAt
 *               - participantIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [voice, video]
 *                 default: video
 *     responses:
 *       201:
 *         description: Meeting scheduled
 */
router.post('/schedule', callController.scheduleMeeting);

/**
 * @swagger
 * /api/v1/communication/calls/join:
 *   post:
 *     summary: Join a call by meeting link
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meetingLink
 *             properties:
 *               meetingLink:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined call
 */
router.post('/join', callController.joinByLink);

/**
 * @swagger
 * /api/v1/communication/calls/{id}:
 *   get:
 *     summary: Get call details
 *     tags: [Calls]
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
 *         description: Call details
 */
router.get('/:id', callController.getCall);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/answer:
 *   post:
 *     summary: Answer a call
 *     tags: [Calls]
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
 *               hasVideo:
 *                 type: boolean
 *                 default: false
 *               hasAudio:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Call answered
 */
router.post('/:id/answer', callController.answerCall);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/reject:
 *   post:
 *     summary: Reject a call
 *     tags: [Calls]
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
 *         description: Call rejected
 */
router.post('/:id/reject', callController.rejectCall);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/end:
 *   post:
 *     summary: End a call
 *     tags: [Calls]
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
 *               reason:
 *                 type: string
 *                 default: completed
 *     responses:
 *       200:
 *         description: Call ended
 */
router.post('/:id/end', callController.endCall);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/leave:
 *   post:
 *     summary: Leave a call (for group calls)
 *     tags: [Calls]
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
 *         description: Left call
 */
router.post('/:id/leave', callController.leaveCall);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/state:
 *   patch:
 *     summary: Update participant state (mute, video toggle, etc.)
 *     tags: [Calls]
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
 *               hasAudio:
 *                 type: boolean
 *               hasVideo:
 *                 type: boolean
 *               isScreenSharing:
 *                 type: boolean
 *               isMuted:
 *                 type: boolean
 *               isDeafened:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: State updated
 */
router.patch('/:id/state', callController.updateParticipantState);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/recording/start:
 *   post:
 *     summary: Start recording a call
 *     tags: [Calls]
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
 *         description: Recording started
 */
router.post('/:id/recording/start', callController.startRecording);

/**
 * @swagger
 * /api/v1/communication/calls/{id}/recording/stop:
 *   post:
 *     summary: Stop recording a call
 *     tags: [Calls]
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
 *               url:
 *                 type: string
 *                 description: URL of the recording
 *               size:
 *                 type: integer
 *                 description: Size in bytes
 *     responses:
 *       200:
 *         description: Recording stopped
 */
router.post('/:id/recording/stop', callController.stopRecording);

module.exports = router;
