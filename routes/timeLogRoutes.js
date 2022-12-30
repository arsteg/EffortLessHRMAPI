const express = require('express');
const timeLogController = require('../controllers/timeLogController');
const authController = require('../controllers/authController');
const router = express.Router();
/**
 * @swagger
 * /api/v1/timelogs/getTimeLogs:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Get TimeLog"   
 *      security: [{
 *         bearerAuth: []
 *     }]        
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: string
 *                          date:
 *                              type: string
 *                              format: date
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
router.post('/getTimeLogs',authController.protect,timeLogController.getTimeLogs);

 router.get('/',authController.protect,timeLogController.getLog);

 /**
 * @swagger
 * /api/v1/timelogs:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Add TimeLog"   
 *      security: [{
 *         bearerAuth: []
 *     }]        
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: string
 *                          task:
 *                              type: string
 *                          startTime:
 *                              type: string
 *                          endTime:
 *                              type: string
 *                          keysPressed:
 *                              type: string
 *                          clicks:
 *                              type: string
 *                          filePath:
 *                              type: string
 *                          fileString:
 *                              type: string 
 *                          date:
 *                              type: string
 *                              format: date
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
router.post('/',authController.protect,timeLogController.addLog);  
 
/**
 * @swagger
 * /api/v1/timelogs/getLogsWithImages:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Get Curent Week Total Time"   
 *      security: [{
 *         bearerAuth: []
 *     }]        
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: string
 *                          date:
 *                              type: string
 *                              format: date
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
router.post('/getLogsWithImages',authController.protect,timeLogController.getLogsWithImages);  
/**
 * @swagger
 * /api/v1/timelogs/getCurrentWeekTotalTime:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Get Curent Week Total Time"   
 *      security: [{
 *         bearerAuth: []
 *     }]        
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
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
router.post('/getCurrentWeekTotalTime',authController.protect,timeLogController.getCurrentWeekTotalTime);

/**
 * @swagger
 * /api/v1/timelogs/{id}:
 *  delete:
 *      tags:
 *          - Timelog Management
 *      summary: "Delete Timelog based on TimeLogId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: TimeLog Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
 router.delete('/:id',authController.protect,timeLogController.deleteLog);

module.exports = router;