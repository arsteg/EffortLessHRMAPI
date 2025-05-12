const express = require('express');
const helpdeskController = require('../controllers/helpdeskController');
const helpdeskRouter = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/v1/helpdesk/create:
 *   post:
 *     summary: Create a new helpdesk ticket
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "The app crashes when clicking login"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
 *               video:
 *                 type: string
 *                 example: "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAGlzb..."
 *     responses:
 *       201:
 *         description: Helpdesk ticket created successfully
 *       400:
 *         description: Missing required data or validation error
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.post('/create', authController.protect, helpdeskController.createHelpdesk);

/**
 * @swagger
 * /api/v1/helpdesk/company:
 *   get:
 *     summary: Get all helpdesk tickets for a company
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved helpdesk tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing company ID
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.get('/company', authController.protect, helpdeskController.getAllHelpdeskByCompanyId);

/**
 * @swagger
 * /api/v1/helpdesk/user:
 *   post:
 *     summary: Get all helpdesk tickets for a user
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     requestBody:
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         skip:
 *                             type: string
 *                         next:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with expense categories
 *       400:
 *         description: Missing company ID
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.post('/user', authController.protect, helpdeskController.getAllHelpdeskByUserId);

/**
 * @swagger
 * /api/v1/helpdesk/{id}:
 *   get:
 *     summary: Get a helpdesk ticket by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Helpdesk ticket ID
 *     responses:
 *       200:
 *         description: Successfully retrieved helpdesk ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Helpdesk ticket not found
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.get('/:id', authController.protect, helpdeskController.getHelpdeskById);

/**
 * @swagger
 * /api/v1/helpdesk/{id}:
 *   patch:
 *     summary: Update a helpdesk ticket
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Helpdesk ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Closed"
 *               remark:
 *                 type: string
 *                 example: "Issue resolved and verified by QA"
 *     responses:
 *       200:
 *         description: Helpdesk ticket updated successfully
 *       404:
 *         description: Helpdesk ticket not found
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.patch('/:id', authController.protect, helpdeskController.updateHelpdeskById);

/**
 * @swagger
 * /api/v1/helpdesk/{id}:
 *   delete:
 *     summary: Delete a helpdesk ticket (soft delete)
 *     security:
 *       - bearerAuth: []
 *     tags: [Helpdesk Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Helpdesk ticket ID
 *     responses:
 *       200:
 *         description: Helpdesk ticket deleted successfully
 *       404:
 *         description: Helpdesk ticket not found
 *       500:
 *         description: Internal server error
 */
helpdeskRouter.delete('/:id', authController.protect, helpdeskController.deleteHelpdeskById);

module.exports = helpdeskRouter;