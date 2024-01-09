const express = require('express');
const errorLogController = require('../controllers/errorLogController');
const authController = require('../controllers/authController');
const router = express.Router();

// Error Log Router
/**
 * @swagger
 * /api/v1/errorlogs/errorloglist:
 *  get:
 *      tags:
 *          - Error Log Management
 *      summary: "Get all Error Log"
 *      security: [{
 *         bearerAuth: []
 *     }]
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

router.get('/errorloglist',authController.protect,errorLogController.getErrorLogList);
/**
 * @swagger
 * /api/v1/errorlogs/errorloglist/{userId}:
 *  get:
 *      tags:
 *          - Error Log Management
 *      summary: "Get all Error Log"
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

router.get('/errorloglist/:userId',authController.protect,errorLogController.getErrorLogListByUser);
/**
 * @swagger
 * /api/v1/errorlogs/new:
 *  post:
 *      tags:
 *          - Error Log Management
 *      summary: "Create New Error Log"   
 *      security: [{
 *         bearerAuth: []
 *     }]      
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          error:
 *                              type: string
 *                          details:
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
router.post('/new',authController.protect,errorLogController.saveErrorLog);

/**
 * @swagger
 * /api/v1/errorlogs/{id}:
 *  get:
 *      tags:
 *          - Error Log Management
 *      summary: "Get Error Log Based On ErrorLogId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Error Log Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
 router.get('/:id',authController.protect,errorLogController.getErrorLog);
 
 /**
  * @swagger
  * /api/v1/errorlogs/{id}:
  *  patch:
  *      tags:
  *          - Error Log Management
  *      summary: "Update Error Log based on ErrorLogId"   
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
  *       - name: id
  *         in: path
  *         description: Error Log Id
  *         required: true
  *         schema:
  *           type: string
  *           format: int64
  *           
  *      requestBody:
  *          content:
  *              application/json:
  *                  schema:
  *                      type: object
  *                      properties:
  *                          error:
  *                              type: string  
  *                          details:
  *                              type: string
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
 router.patch('/:id',authController.protect,errorLogController.updateErrorLog);
 
 /**
  * @swagger
  * /api/v1/errorlogs/{id}:
  *  delete:
  *      tags:
  *          - Error Log Management
  *      summary: "Delete Error Log based on Error Log Id"   
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
  *       - name: id
  *         in: path
  *         description: Error Log Id
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
 router.delete('/:id',authController.protect,errorLogController.deleteErrorLog);


module.exports = router;