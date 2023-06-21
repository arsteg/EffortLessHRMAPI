const genericSettingController = require('../controllers/genericSettingController');
const express = require('express');
const { Router } = require('express');
const app = require('../app');
const router = express.Router();
const authController = require('../controllers/authController');
module.exports = router;

/**
 * @swagger
 * /api/v1/genericsetting/create:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Create Generic setting Data"   
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          CategoryName:
 *                              type: string
 *                          ControlType:
 *                              type: string
 *                          ControlLabel:
 *                              type: string
 *                          ToolTip:
 *                              type: string
 *                          FieldName:
 *                              type: string 
 *                          values:
 *                              type: array
 *                              items:
 *                                type: string 
 *                                example: {"value"} 
 *                          listData:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"key","value"}  
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
 * 
 */
router.post('/create',authController.protect, genericSettingController.addNew);

/**
 * @swagger
 * /api/v1/genericsetting/delete/{id}:
 *  delete:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Delete by ID"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Id
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
router.delete('/delete/:id',authController.protect, genericSettingController.delete);

/**
 * @swagger
 * /api/v1/genericsetting/get/{id}:
 *  get:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Get ID"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Id
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
router.get('/get/:id',authController.protect, genericSettingController.getById);

/**
 * @swagger
 * /api/v1/genericsetting/update/{id}:
 *  patch:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Update"
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
  *                          CategoryName:
 *                              type: string
 *                          ControlType:
 *                              type: string
 *                          ControlLabel:
 *                              type: string
 *                          ToolTip:
 *                              type: string
 *                          FieldName:
 *                              type: string 
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Id
 *         required: true
 *         schema:
 *           type: string 
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
router.patch('/update/:id',authController.protect, genericSettingController.update);

/**
 * @swagger
 * /api/v1/genericsetting/getsettingbyuser:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Get Generic setting Data By User"  
 *      security: [{
 *         bearerAuth: []
 *      }]  
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
 * 
 */
router.post('/getsettingbyuser',authController.protect, genericSettingController.getGenericSettingByUser);

/**
 * @swagger
 * /api/v1/genericsetting/createvalues/{genericSettingId}:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Create Generic setting values"   
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: genericSettingId
 *         in: path
 *         description: generic SettingId
 *         required: true
 *         schema:
 *           type: string 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          values:
 *                              type: array
 *                              items:
 *                                type: string 
 *                                example: {"value"} 
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
 * 
 */
router.post('/createvalues/:genericSettingId',authController.protect, genericSettingController.addGenericSettingValue);

/**
 * @swagger
 * /api/v1/genericsetting/createlistdata/{genericSettingId}:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Create Generic setting values"   
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: genericSettingId
 *         in: path
 *         description: generic SettingId
 *         required: true
 *         schema:
 *           type: string 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:  
 *                          listData:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"key","value"}
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
 * 
 */
router.post('/createlistdata/:genericSettingId',authController.protect, genericSettingController.addGenericSettingListData);

/**
 * @swagger
 * /api/v1/genericsetting/deletelistdata/{listDataId}:
 *  delete:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Delete listData by Id"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: listDataId
 *         in: path
 *         description: Delete listDataId by Id
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
router.delete('/deletelistdata/:listDataId',authController.protect, genericSettingController.deleteGenericSettingListData);

/**
 * @swagger
 * /api/v1/genericsetting/getlistdata/{genericSettingId}:
 *  get:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Get List Data by genericSettingId"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: genericSettingId
 *         in: path
 *         description: Get List Data by generic Setting Id
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

router.get('/getlistdata/:genericSettingId',authController.protect, genericSettingController.getGenericSettingListData);


/**
 * @swagger
 * /api/v1/genericsetting/deletevalues/{valuesId}:
 *  delete:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Delete values by valuesId"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: valuesId
 *         in: path
 *         description: Delete values by Id
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
router.delete('/deletevalues/:valuesId',authController.protect, genericSettingController.deleteGenericSettingValue);

/**
 * @swagger
 * /api/v1/genericsetting/getvalues/{genericSettingId}:
 *  get:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Get values by genericSettingId"  
 *      security: [{
 *         bearerAuth: []
 *      }] 
 *      parameters:
 *       - name: genericSettingId
 *         in: path
 *         description: Get values by generic Setting Id
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

router.get('/getvalues/:genericSettingId',authController.protect, genericSettingController.getGenericSettingValue);