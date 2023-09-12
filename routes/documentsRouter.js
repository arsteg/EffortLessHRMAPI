const express = require('express');
const documentsRouter = express.Router();
const documentsController = require('../controllers/documentsController');

//CompanyPolicyDocument
/**
 * @swagger
 * /api/v1/documents/companyPolicyDocument:
 *   post:
 *     summary: Add a new companyPolicyDocument
 *     tags: [Documents management]
 *     requestBody:
 *       description: Details of companyPolicyDocument
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: companyPolicyDocument successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/companyPolicyDocument', documentsController.createCompanyPolicyDocument);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocument/{id}:
 *   get:
 *     summary: Get a companyPolicyDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the companyPolicyDocument
 *     responses:
 *       200:
 *         description: Successful response with the companyPolicyDocument
 *       404:
 *         description: companyPolicyDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocument/:id', documentsController.getCompanyPolicyDocument);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocument/{id}:
 *   put:
 *     summary: Update a companyPolicyDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the companyPolicyDocument
 *     requestBody:
 *       description: Updated details of companyPolicyDocument
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated companyPolicyDocument
 *       404:
 *         description: companyPolicyDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/companyPolicyDocument/:id', documentsController.updateCompanyPolicyDocument);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocument/{id}:
 *   delete:
 *     summary: Delete a companyPolicyDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the companyPolicyDocument
 *     responses:
 *       204:
 *         description: companyPolicyDocument successfully deleted
 *       404:
 *         description: companyPolicyDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/companyPolicyDocument/:id', documentsController.deleteCompanyPolicyDocument);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocument:
 *   get:
 *     summary: Get all companyPolicyDocuments
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with companyPolicyDocuments
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocument', documentsController.getAllCompanyPolicyDocuments);

module.exports = documentsRouter;