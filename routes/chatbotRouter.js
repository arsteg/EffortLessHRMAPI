const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const chatbotRouter = express.Router();

/**
 * @swagger
 * /api/v1/chatbot/create:
 *   post:
 *     summary: Create multiple chatbot entries with embeddings
 *     tags: [Chatbot Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 Question:
 *                   type: string
 *                   example: "What is the refund policy?"
 *                 Answer:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "text"
 *                       content:
 *                         type: string
 *                         example: "The refund policy is available on our website."
 *     responses:
 *       201:
 *         description: Chatbot entries created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
chatbotRouter.post('/create', chatbotController.createChatbot);

/**
 * @swagger
 * /api/v1/chatbot:
 *   get:
 *     summary: Retrieve all chatbot entries
 *     tags: [Chatbot Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved chatbot entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
chatbotRouter.get('/', chatbotController.getChatbot);

/**
 * @swagger
 * /api/v1/chatbot/search:
 *   post:
 *     summary: Search chatbot entries using semantic similarity
 *     tags: [Chatbot Management]
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
 *         description: Successfully retrieved similar entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           content:
 *                             type: string
 *                     - type: string
 *                       example: "I'm sorry, I couldn't find a good match for your question."
 *       400:
 *         description: Bad Request - Text is required in request body
 *       500:
 *         description: Internal server error - Failed to generate embedding
 */
chatbotRouter.post('/search', chatbotController.searchChatbot);

module.exports = chatbotRouter;