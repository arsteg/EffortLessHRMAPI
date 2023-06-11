const genericSettingController = require('../controllers/genericSettingController');
const express = require('express');
const { Router } = require('express');
const app = require('../app');
const router = express.Router();
module.exports = router;


//App Website Routes
/**
 * @swagger
 * /api/v1/genericsetting/create:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Create Generic setting Data"   
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
router.post('/create', genericSettingController.addNew);

/**
 * @swagger
 * /api/v1/genericsetting/delete/{id}:
 *  delete:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Delete by ID"  
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
router.delete('/delete/:id', genericSettingController.delete);

/**
 * @swagger
 * /api/v1/genericsetting/get/{id}:
 *  get:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Get ID"  
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

router.get('/get/:id', genericSettingController.getById);

// User Preferences routes
/**
 * @swagger
 * /api/v1/genericsetting/update/{id}:
 *  patch:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Update"
 * 
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

router.patch('/update/:id', genericSettingController.update);

/**
 * @swagger
 * /api/v1/genericsetting/getsettingbyuser:
 *  post:
 *      tags:
 *          - Generic Setting Management
 *      summary: "Create Generic setting Data"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: string
 *                          company:
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
router.post('/getsettingbyuser', genericSettingController.getGenericSettingByUser);
