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
