const express = require('express');
const zoomController = require('./../controllers/zoomController');
const router = express.Router();

// Auth routes
/**
 * @swagger
 * /api/v1/zoom/createmeeting:
 *  post:
 *      tags:
 *          - Zoom Integration
 *      summary: "Register New User"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          topic:
 *                              type: string
 *                          type:
 *                              type: number
 *                          start_time:
 *                              type: string
 *                              example: "2024-02-14T12:00:00Z"
 *                          duration:
 *                              type: string
 *                          password:
 *                              type: string
 *                          allow_multiple_devices:
 *                              type: boolean
 *                          join_before_host:
 *                              type: boolean
 *                          waiting_room:
 *                              type: boolean
 *              
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
router.post('/createmeeting', zoomController.createZoomMeeting);

module.exports = router;