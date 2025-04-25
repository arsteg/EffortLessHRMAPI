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
 * /api/v1/openai/generateQueryFromText:
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
router.post('/generateQueryFromText', openaiController.generateQueryFromText);

/**
 * @swagger
 * /api/v1/openai/chatBot:
 *   post:
 *     summary: reply user message
 *     tags: [OpenAI Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userMessage:
 *                 type: string
 *             required:
 *               - userMessage
 *     responses:
 *       200:
 *         description: Successfully replied to the user message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chatBotResponse:
 *                   message: string
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/chatbot", openaiController.chatbot)

module.exports = router;