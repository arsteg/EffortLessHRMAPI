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
 *      summary: "Get TimeLog Note: please pass UserId in user"   
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
router.post('/getTimeLogs', authController.protect, timeLogController.getTimeLogs);

/**
 * @swagger
 * /api/v1/timelogs/getLogInUsers:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Get TimeLog Note: please pass UserId in user"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
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
 *                         projects:
 *                              type: array
 *                              items:
 *                                type: object
 *                                example: ""
 *                         tasks:
  *                              type: array
 *                              items:
 *                                type: object
 *                                example: ""
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
 router.post('/getLogInUsers', authController.protect, timeLogController.getLogInUser);
router.get('/', authController.protect, timeLogController.getLog);

/**
* @swagger
* /api/v1/timelogs:
*  post:
*      tags:
*          - Timelog Management
*      summary: "Add TimeLog Note: please pass UserId in user"   
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
*                          project:
*                              type: string
*                          startTime:
*                              type: string
*                          endTime:
*                              type: string
*                          keysPressed:
*                              type: string
*                          clicks:
*                              type: string
*                          scrolls:
*                              type: string
*                          filePath:
*                              type: string
*                          fileString:
*                              type: string 
*                          date:
*                              type: string
*                              format: date
*                          machineId:
*                               type: string
*                          makeThisDeviceActive:
*                               type: boolean
*                               default: false
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
router.post('/', authController.protect, timeLogController.addLog);

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
router.post('/getLogsWithImages', authController.protect, timeLogController.getLogsWithImages);
/**
 * @swagger
 * /api/v1/timelogs/getCurrentWeekTotalTime:
 *  post:
 *      tags:
 *          - Timelog Management
 *      summary: "Get Curent Week Total Time Note: please pass UserId in user"   
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
router.post('/getCurrentWeekTotalTime', authController.protect, timeLogController.getCurrentWeekTotalTime);

/**
 * @swagger
 * /api/v1/timelogs:
 *  delete:
 *      tags:
 *          - Timelog Management
 *      summary: "Delete Timelog based on LogId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          logs:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"logId"}
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
router.delete('/', authController.protect, timeLogController.deleteLog);

/**
* @swagger
* /api/v1/timelogs/addTimeLog:
*  post:
*      tags:
*          - Timelog Management
*      summary: "Add Manual TimeLog Note: please pass UserId in user"   
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
*                          projectId:
*                              type: string 
*                          startTime:
*                              type: string
*                          endTime:
*                              type: string
*                          date:
*                              type: string
*                              format: date
*                          isManualTime:
*                              type: boolean
*                          machineId:
*                               type: string
*                          makeThisDeviceActive:
*                               type: boolean
*                               default: false
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
router.post('/addTimeLog', authController.protect, timeLogController.addManualTime);
/**
* @swagger
* /api/v1/timelogs/timesheet/{userId}/{startDate}/{endDate}:
*  post:
*      tags:
*          - Timelog Management
*      summary: "Get timesheet for given user and date range"   
*      security: [{
*         bearerAuth: []
*     }]        
*      requestBody:
*          content:
*              application/json:
*                  schema:
*                      type: object
*                      properties:
*                          userId:
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
router.post('/timesheet', authController.protect, timeLogController.getTimesheet);
/**
* @swagger
* /api/v1/timelogs/timesheets:
*  post:
*      tags:
*          - Timelog Management
*      summary: "Get timesheets for given user ids and date range"   
*      security: [{
*         bearerAuth: []
*     }]        
*      requestBody:
*          content:
*              application/json:
*                  schema:
*                      type: object
*                      properties:
*                          userIds:
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
router.post('/timesheets', authController.protect, timeLogController.getTimesheetByUserIds);

module.exports = router;