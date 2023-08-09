const appWebsiteController = require('./../controllers/appWebsiteController');
const express = require('express');
const { Router } = require('express');
const app = require('../app');
const authController = require('../controllers/authController');
const router = express.Router();
module.exports = router;


//App Website Routes
/**
 * @swagger
 * /api/v1/appWebsite/create:
 *  post:
 *      tags:
 *          - App Website Management
 *      summary: "Create App Website Data"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
  *                      properties:
 *                          appWebsite:
 *                              type: string
 *                          ModuleName:
 *                              type: string
 *                          ApplicationTitle:
 *                              type: string
 *                          TimeSpent:
 *                              type: string
 *                          date:
 *                              type: string
 *                          type:
 *                              type: string
 *                          projectReference:
 *                              type: string
 *                          userReference:
 *                              type: string
 *                          mouseClicks:
 *                              type: string
 *                          keyboardStrokes:
 *                              type: string
 *                          scrollingNumber:
 *                              type: string
 *                          inactive:
 *                              type: string
 *                          total:
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
router.post('/create', appWebsiteController.addNew);

/**
 * @swagger
 * /api/v1/appWebsite/delete/{id}:
 *  delete:
 *      tags:
 *          - App Website Management
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
router.delete('/delete/:id', appWebsiteController.delete);

/**
 * @swagger
 * /api/v1/appWebsite/get/{id}:
 *  get:
 *      tags:
 *          - App Website Management
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

router.get('/get/:id', appWebsiteController.getById);

// User Preferences routes
/**
 * @swagger
 * /api/v1/appWebsite/update/{id}:
 *  patch:
 *      tags:
 *          - App Website Management
 *      summary: "Update"
 * 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          appWebsite:
 *                              type: string
 *                          ModuleName:
 *                              type: string
 *                          ApplicationTitle:
 *                              type: string
 *                          TimeSpent:
 *                              type: string
 *                          date:
 *                              type: string
 *                          type:
 *                              type: string
 *                          projectReference:
 *                              type: string
 *                          userReference:
 *                              type: string
 *                          mouseClicks:
 *                              type: string
 *                          keyboardStrokes:
 *                              type: string
 *                          scrollingNumber:
 *                              type: string
 *                          inactive:
 *                              type: string
 *                          total:
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

router.patch('/update/:id', appWebsiteController.update);


router.get('/getByIdandDate/:id', appWebsiteController.getByIdAndDate);

router.get('/getAll', appWebsiteController.getAllbyDate);

//Productivity CRUD
/**
 * @swagger
 * /api/v1/appWebsite/productivity/apps/{userId}:
 *   get:
 *     summary: Get all productivity applications
 *     tags: [Productivity]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID of the productivity applications
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/models/productivityModel'
 */
router.get('/productivity/apps/:userId',authController.protect, appWebsiteController.getUserProductivityApps);
/**
 * @swagger
 * /api/v1/appWebsite/productivity:
 *   get:
 *     summary: Get all productivity data
 *     tags: [Productivity]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Productivity'
 */
router.get('/productivity', appWebsiteController.getproductivities);
/**
 * @swagger
 * /api/v1/appWebsite/productivity/{id}:
 *   get:
 *     summary: Get a specific productivity record
 *     tags: [Productivity]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the productivity record
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Productivity'
 *       404:
 *         description: Productivity record not found
 */
router.get('/productivity/:id', appWebsiteController.getproductivityById);
/**
 * @swagger
 * /api/v1/appWebsite/productivity:
 *   post:
 *     summary: Create a new productivity record
 *     tags: [Productivity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          icon:
 *                              type: string
 *                          key:
 *                              type: string 
 *                              required: true
 *                          name:
 *                              type: string  
 *                              required: true
 *                          isProductive:
 *                              type: boolean
 *                              required: true
 *                          status:
 *                              type: string
 *                              required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/models/productivityModel'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Productivity record not found
 */
router.post('/productivity', appWebsiteController.addProductivity);
/**
 * @swagger
 * /api/v1/appWebsite/productivity/{id}:
 *   put:
 *     summary:  Update a specific productivity record
 *     tags: [Productivity]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the productivity record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *                  schema:
 *                      type: object
 *                      properties:  
 *                          status:
 *                              type: string
 *                              required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Productivity'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Productivity record not found
 */
router.put('/productivity/:id', appWebsiteController.updateProductivity);
/**
 * @swagger
 * /api/v1/appWebsite/productivity/{id}:
 *   delete:
 *     summary: Delete a specific productivity record
 *     tags: [Productivity]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the productivity record
 *     responses:
 *       204:
 *         description: Success
 *       404:
 *         description: Productivity record not found
 */
router.delete('/productivity/:id', appWebsiteController.deleteProductivity);

//Browser History

/**
 * @swagger
 * /api/v1/appWebsite/browser-history:
 *   post:
 *     summary: Create a new browser history document
 *     tags: [BrowserHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               browser:
 *                 type: string
 *               uri:
 *                 type: string
 *               title:
 *                 type: string
 *                 required: true
 *               lastVisitTime:
 *                 type: string
 *                 format: date
 *               visitCount:
 *                 type: number
 *                 required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: "Success"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/browser-history', appWebsiteController.addBrowserHistory);
  
  /**
   * @swagger
   * /api/v1/appWebsite/browser-history/{id}:
   *   delete:
   *     summary: Delete a browser history document by ID
   *     tags: [BrowserHistory]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Document deleted successfully
   *       404:
   *         description: Document not found
   *       500:
   *         description: Internal Server Error
   */
  router.delete('/browser-history/:id', appWebsiteController.deleteBrowserHistory);
  
  /**
   * @swagger
   * /api/v1/appWebsite/browser-history:
   *   get:
   *     summary: Retrieve browser history documents based on filters
   *     tags: [BrowserHistory]
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *         description: Start date for filtering
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *         description: End date for filtering
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *         description: User ID for filtering   
   *     responses:
   *       200:
   *         description: Retrieved browser history documents
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BrowserHistory'
   *       500:
   *         description: Internal Server Error
   */
  router.get('/browser-history', appWebsiteController.getBrowserHistory);