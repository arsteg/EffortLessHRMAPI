const express = require('express');
const settingsController = require('../controllers/settingsController');
const authController = require('../controllers/authController');
const router = express.Router();

// Settings Router
/**
 * @swagger
 * /api/v1/settings/productivity/add:
 *  post:
 *      tags:
 *          - Productivity Settings
 *      summary: "Add a new productivity"
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          icon:
 *                              type: string 
 *                          key:
 *                              type: string
 *                          name:
 *                              type: string
 *                          isProductive:
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
router.post('/productivity/add',authController.protect,settingsController.addProductivity);
/**
 * @swagger
 * /api/v1/settings/productivity/update/{id}:
 *  post:
 *      tags:
 *          - Productivity Settings
 *      summary: "Add a new productivity"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Productovity Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          icon:
 *                              type: string 
 *                          key:
 *                              type: string
 *                          name:
 *                              type: string
 *                          isProductive:
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
router.post('/productivity/update/:id',authController.protect,settingsController.updateProductivity);

/**
 * @swagger
 * /api/v1/settings/Productivity/Get/{id}:
 *  get:
 *      tags:
 *          - Productivity Settings
 *      summary: "Get Productivity by Id"
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
router.get('/productivity/Get/:id',authController.protect,settingsController.get);

/**
 * @swagger
 * /api/v1/settings/Productivity/GetAll:
 *  get:
 *      tags:
 *          - Productivity Settings
 *      summary: "Get Productivity by Id"
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
router.get('/productivity/GetAll',authController.protect,settingsController.getAll);

/**
 * @swagger
 * /api/v1/settings/Productivity/{id}:
 *  delete:
 *      tags:
 *          -  Productivity Settings
 *      summary: "Delete Productivity"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Productvity Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 *                
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
router.route('/productivity/:id').delete(authController.protect,settingsController.deleteProductivity);

module.exports = router;