const express = require('express');
const { Router } = require('express');
const app = require('../app');
const router = express.Router();
module.exports = router;
const liveTrackingController = require('../controllers/liveTrackingController')
const authController = require('../controllers/authController');
// Create
/**
 * @swagger
 * /api/v1/liveTracking/save:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Create a new live tracking entry"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          fileString:
 *                              type: string
 *     responses:
 *       200:
 *         description: Successfully created a live tracking entry
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/save',authController.protect, liveTrackingController.addOrUpdateIfExists);

// Start Stop Live Preview
/**
 * @swagger
 * /api/v1/liveTracking/startstoplivepreview:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Start Stop Live Preview"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userId:
 *                              type: string
 *                          isStart:
 *                              type: boolean
 *     responses:
 *       200:
 *         description: Successfully Start/Stop Live Preview
 */
router.post('/startstoplivepreview',authController.protect, liveTrackingController.startStopLivePreview);

// Start Close Web Socket
/**
 * @swagger
 * /api/v1/liveTracking/closewebsocket:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Close Web Socket"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     responses:
 *       200:
 *         description: Successfully Start/Stop Live Preview
 */
router.post('/closewebsocket',authController.protect, liveTrackingController.closeWebSocket);

// Read by ID
/**
 * @swagger
 * /api/v1/liveTracking/getByUsers:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/getByUsers',authController.protect, liveTrackingController.getByUsers);

// Set live tracking
/**
 * @swagger
 * /api/v1/liveTracking/setLiveTrackingByUser:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: string
 *                              items:
 *                                type: string
 *                                example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/setLiveTrackingByUser', authController.protect, liveTrackingController.setLiveTrackingByUser);

// Set live tracking
/**
 * @swagger
 * /api/v1/liveTracking/removeUserFromLiveTracking:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: string
 *                              items:
 *                                type: string
 *                                example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/removeUserFromLiveTracking', authController.protect, liveTrackingController.removeUserFromLiveTracking);

// Read live tracking
/**
 * @swagger
 * /api/v1/liveTracking/getLiveTrackingByUserId:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         user:
 *                              type: string
 *                              items:
 *                                type: string
 *                                example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/getLiveTrackingByUserId', authController.protect, liveTrackingController.getLiveTrackingByUserId);

// Read live tracking
/**
 * @swagger
 * /api/v1/liveTracking/getLiveTrackingTestData:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/getLiveTrackingTestData', liveTrackingController.getLiveTrackingTestData);

// Create
/**
 * @swagger
 * /api/v1/liveTracking/updateUserScreen:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Create a new live tracking entry"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          fileString:
 *                              type: string
 *     responses:
 *       200:
 *         description: Successfully created a live tracking entry
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/updateUserScreen', authController.protect, liveTrackingController.updateUserScreen);

// Read live tracking
/**
 * @swagger
 * /api/v1/liveTracking/getUsersLiveScreen:
 *   post:
 *     tags:
 *       - Live Tracking
 *     summary: "Get a live tracking entry by ID"
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: string
 *                              items:
 *                                type: string
 *                                example: ""
 *     responses:
 *       200:
 *         description: Successfully retrieved the live tracking entry
 *       404:
 *         description: Live tracking entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/getUsersLiveScreen', authController.protect, liveTrackingController.getUsersLiveScreen);