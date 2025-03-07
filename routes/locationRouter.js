const express = require('express');
const locationController = require('../controllers/locationController');
const locationRouter = express.Router();

/**
 * @swagger
 * /api/v1/states:
 *   get:
 *     summary: Get States of India
 *     tags: [States] 
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSettings
 *       404:
 *         description: GeneralSettings not found
 *       500:
 *         description: Internal server error
 */
locationRouter.get('/states', locationController.getAllStates);

module.exports = locationRouter;
