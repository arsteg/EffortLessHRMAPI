const express = require('express');
const separationController = require('../controllers/SeparationController');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Separation Management
 *   description: API endpoints for managing expenses
 */

/**
 * @swagger
 *   /api/v1/separation/separationTypes:
 *   post:
 *     summary: Create a new SeparationType
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: SeparationType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: SeparationType successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/separationTypes', authController.protect, separationController.createSeparationType);

/**
 * @swagger
 * /api/v1/separation/separationTypes/{id}:
 *   get:
 *     summary: Get a SeparationType by ID
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SeparationType
 *     responses:
 *       200:
 *         description: Successful response with the SeparationType
 *       404:
 *         description: SeparationType not found
 *       500:
 *         description: Internal server error
 */
router.get('/separationTypes/:id', authController.protect, separationController.getSeparationType);

/**
 * @swagger
 * /api/v1/separation/separationTypes/{id}:
 *   put:
 *     summary: Update a SeparationType by ID
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SeparationType
 *     requestBody:
 *       description: New SeparationType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated SeparationType
 *       404:
 *         description: SeparationType not found
 *       500:
 *         description: Internal server error
 */
router.put('/separationTypes/:id', authController.protect, separationController.updateSeparationType);

/**
 * @swagger
 * /api/v1/separation/separationTypes/{id}:
 *   delete:
 *     summary: Delete a SeparationType by ID
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SeparationType
 *     responses:
 *       204:
 *         description: SeparationType successfully deleted
 *       404:
 *         description: SeparationType not found
 *       500:
 *         description: Internal server error
 */
router.delete('/separationTypes/:id', authController.protect, separationController.deleteSeparationType);

/**
 * @swagger
 * /api/v1/separation/separationTypes:
 *   get:
 *     summary: Get all SeparationTypes
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     responses:
 *       200:
 *         description: Successful response with SeparationTypes
 *       500:
 *         description: Internal server error
 */
router.get('/separationTypes', authController.protect, separationController.getAllSeparationTypes);

module.exports = router;
