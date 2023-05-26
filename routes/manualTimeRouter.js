const express = require('express');
const manualTimeController = require('../controllers/manualTimeController');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/manualTime/addManualTimeRequest:
 *  post:
 *      tags:
 *          - Manual Time
 *      summary: "Add Manual Time"   
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
 *                          project:
 *                              type: string 
 *                          manager:
 *                              type: string
 *                          task:
 *                              type: string 
 *                          fromDate:
 *                              type: string
 *                              format: date 
 *                          toDate:
 *                              type: string 
 *                              format: date
 *                          reason:
 *                              type: string 
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
router.post('/addManualTimeRequest', manualTimeController.addManualTimeRequest);

/**
 * @swagger
 * /api/v1/manualTime/updateManualTimeRequest:
 *  post:
 *      tags:
 *          - Manual Time
 *      summary: "Update Manual Time"   
 *      security: [{
 *         bearerAuth: []
 *     }]        
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          requestId:
 *                              type: string 
 *                          user:
 *                              type: string  
 *                          project:
 *                              type: string 
 *                          manager:
 *                              type: string
 *                          fromDate:
 *                              type: string
 *                              format: date 
 *                          toDate:
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
router.post('/updateManualTimeRequest', authController.protect, manualTimeController.updateManualTimeRequest);

/**
 * @swagger
 * /api/v1/manualTime/getManualTimeRequests/{id}:
 *  get:
 *      tags:
 *          - Manual Time
 *      summary: "Get Manual Time Requests by user Id"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: User ID
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
router.get('/getManualTimeRequests/:id', authController.protect, manualTimeController.getManualTimeRequestsByUser);

/**
  * @swagger
  * /api/v1/manualTime/manualTimeRequest/{id}:
  *  delete:
  *      tags:
  *          - Manual Time
  *      summary: "Delete Manual Time Request Based on Id"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
  *       - name: id
  *         in: path
  *         description: Manual Time Request Id
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
router.route('/manualTimeRequest/:id').delete(authController.protect, manualTimeController.deleteManualTimeRequest);

/**
 * @swagger
 * /api/v1/manualTime/getManualTimeRequestsForApproval/{id}:
 *  get:
 *      tags:
 *          - Manual Time
 *      summary: "Get Manual Time Requests For Approval by user Id"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: User ID
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
router.get('/getManualTimeRequestsForApproval/:id', authController.protect, manualTimeController.getManualTimeRequestsForApprovalByUser);

/**
 * @swagger
 * /api/v1/manualTime/getManualTimeApprovedRequests/{userId}/{projectId}/{managerId}:
 *  get:
 *      tags:
 *          - Manual Time
 *      summary: "Get Manual Time Approved Requests"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *       - name: projectId
 *         in: path
 *         description: Project ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *       - name: managerId
 *         in: path
 *         description: Manager ID
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
router.get('/getManualTimeApprovedRequests/:userId/:projectId/:managerId', authController.protect, manualTimeController.getManualTimeApprovedRequests);

module.exports = router;