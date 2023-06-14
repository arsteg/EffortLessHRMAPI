const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController')

/**
 * @swagger
 * /api/v1/dashboard/HoursWorked:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "Get all projects Based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Date to get time logs for (YYYY-MM-DD).
 *         required: true
 *         schema:
 *           type: string 
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
router.get('/HoursWorked', dashboardController.getHoursWorked);

/**
 * @swagger
 * /api/v1/dashboard/weeklySummary:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "Get weeklySummary Based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Date to get time logs for (YYYY-MM-DD).
 *         required: true
 *         schema:
 *           type: string 
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
router.get('/weeklySummary', dashboardController.getWeeklySummary);

/**
 * @swagger
 * /api/v1/dashboard/monthlySummary:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "Get weeklySummary Based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Date to get time logs for (YYYY-MM-DD).
 *         required: true
 *         schema:
 *           type: string 
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
router.get('/monthlySummary', dashboardController.getMonthlySummary);

/**
 * @swagger
 * /api/v1/dashboard/taskwiseHours:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "Get taskwise hours worked based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string 
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
router.get('/taskwiseHours', dashboardController.getTaskwiseHours);

/**
 * @swagger
 * /api/v1/dashboard/taskwiseStatus:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "Get taskwise hours worked based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string 
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
router.get('/taskwiseStatus', dashboardController.getTaskwiseStatus);

/**
 * @swagger
 * /api/v1/dashboard/getApplicationTimeSummary:
 *  get:
 *      tags:
 *          - Dashboard
 *      summary: "get Application Time Summary based On UserId and a date"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: query
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string 
 *       - name: date
 *         in: query
 *         description: Date to get time logs for (YYYY-MM-DD).
 *         required: true
 *         schema:
 *           type: string  
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
router.get('/getApplicationTimeSummary', dashboardController.getApplicationTimeSummary);

module.exports = router;