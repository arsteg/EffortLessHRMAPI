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

/**
 * @swagger
 * /api/v1/settings/user-location:
 *  post:
 *      tags:
 *          - User Location
 *      summary: "Add user GPS location"
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
 *                              description: user id
 *                          coordinates:
 *                              type: array
 *                              items:
 *                                 type: number
 *                              description: GPS coordinates [longitude, latitude]
 *                          address:
 *                              type: string
 *                              description: Address 
 *      responses:
 *          200:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
router.post("/user-location", settingsController.saveUserLocation);

/**
 * @swagger
 * /api/v1/settings/user-location:
 *   get:
 *     tags:
 *       - User Location
 *     summary: "Retrieve user locations"
 *     description: "Fetches stored user locations with optional filters."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: "Filter by user ID"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: "Search radius in meters (default: 1000m)"
 *     responses:
 *       200:
 *         description: "Successfully retrieved locations."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: "Internal Server Error."
 */
router.get("/user-location", settingsController.getUserLocations);

/**
 * @swagger
 * /api/v1/settings/user-locations:
 *   get:
 *     tags:
 *       - User Location
 *     summary: "Retrieve locations for all users"
 *     description: "Fetches stored locations for all users with optional filters such as radius."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: "Search radius in meters (default: 1000m)"
 *     responses:
 *       200:
 *         description: "Successfully retrieved locations for all users."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: "The ID of the user."
 *                   latitude:
 *                     type: number
 *                     description: "The latitude of the user's location."
 *                   longitude:
 *                     type: number
 *                     description: "The longitude of the user's location."
 *                   address:
 *                     type: string
 *                     description: "The address corresponding to the user's location."
 *       500:
 *         description: "Internal Server Error."
 */
router.get("/user-locations", settingsController.getAllUserLocations);

/**
 * @swagger
 * /api/v1/settings/user-location/{userId}:
 *   delete:
 *     tags:
 *       - User Location
 *     summary: "Delete a user's location"
 *     description: "Deletes the location for a specific user based on the provided user ID."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: "The ID of the user whose location is to be deleted."
 *     responses:
 *       200:
 *         description: "User location deleted successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "User location deleted successfully."
 *       404:
 *         description: "User location not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User location not found."
 *       500:
 *         description: "Internal Server Error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error."
 */
router.delete("/user-location/:userId", settingsController.deleteUserLocation);

/**
 * @swagger
 * /api/v1/settings/user-location/{userId}:
 *  put:
 *      tags:
 *          - User Location
 *      summary: "Update user GPS location"
 *      security: [ { bearerAuth: [] } ]
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            schema:
 *                type: string
 *            description: The user ID whose location needs to be updated
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          coordinates:
 *                              type: array
 *                              items:
 *                                 type: number
 *                              description: GPS coordinates [longitude, latitude]
 *                          address:
 *                              type: string
 *                              description: Updated address
 *      responses:
 *          200:
 *              description: "Location updated successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *          400:
 *              description: "Invalid input data"
 *          404:
 *              description: "User location not found"
 *          500:
 *              description: "Internal Server Error"
 */
router.put("/user-location/:userId", settingsController.updateUserLocation);

module.exports = router;