const express = require('express');
const openaiController = require('../controllers/openaiController');
const router = express.Router();
const authController = require('../controllers/authController');
// OpenAi routes
/**
 * @swagger
 * /api/v1/openai/testResponse:
 *  post:
 *      tags:
 *          - OpenAI Integration
 *      summary: "Create Meeting"   
 *      security: [{
 *         bearerAuth: []
 *     }] 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          prompt:
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
router.post('/testResponse', openaiController.testResponse);

/**
 * @swagger
 * /api/v1/openai/runQuery:
 *  post:
 *      tags:
 *          - OpenAI Integration
 *      summary: "Create Meeting"   
 *      security: [{
 *         bearerAuth: []
 *     }] 
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          query:
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
router.post('/runQuery', openaiController.runDynamicQuery);



module.exports = router;