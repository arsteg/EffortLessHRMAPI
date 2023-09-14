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

// Routes for CompanyPolicyDocumentAppliesTo
/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentAppliesTo:
 *   post:
 *     summary: Add a new CompanyPolicyDocumentAppliesTo
 *     tags: [Documents management]
 *     requestBody:
 *       description: CompanyPolicyDocumentAppliesTo details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               companyPolicyDocument:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: CompanyPolicyDocumentAppliesTo successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/companyPolicyDocumentAppliesTo', documentsController.createCompanyPolicyDocumentAppliesTo);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentAppliesTo/{id}:
 *   get:
 *     summary: Get a CompanyPolicyDocumentAppliesTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentAppliesTo
 *     responses:
 *       200:
 *         description: Successful response with the CompanyPolicyDocumentAppliesTo
 *       404:
 *         description: CompanyPolicyDocumentAppliesTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocumentAppliesTo/:id', documentsController.getCompanyPolicyDocumentAppliesTo);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentAppliesTo/{id}:
 *   put:
 *     summary: Update a CompanyPolicyDocumentAppliesTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentAppliesTo
 *     requestBody:
 *       description: New CompanyPolicyDocumentAppliesTo details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               companyPolicyDocument:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated CompanyPolicyDocumentAppliesTo
 *       404:
 *         description: CompanyPolicyDocumentAppliesTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/companyPolicyDocumentAppliesTo/:id', documentsController.updateCompanyPolicyDocumentAppliesTo);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentAppliesTo/{id}:
 *   delete:
 *     summary: Delete a CompanyPolicyDocumentAppliesTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentAppliesTo
 *     responses:
 *       204:
 *         description: CompanyPolicyDocumentAppliesTo successfully deleted
 *       404:
 *         description: CompanyPolicyDocumentAppliesTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/companyPolicyDocumentAppliesTo/:id', documentsController.deleteCompanyPolicyDocumentAppliesTo);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentAppliesTo:
 *   get:
 *     summary: Get all CompanyPolicyDocumentAppliesTo
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with CompanyPolicyDocumentAppliesTo
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocumentAppliesTo', documentsController.getAllCompanyPolicyDocumentAppliesTo);

// Routes for CompanyPolicyDocumentUser
/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentUser:
 *   post:
 *     summary: Add a new CompanyPolicyDocumentUser
 *     tags: [Documents management]
 *     requestBody:
 *       description: CompanyPolicyDocumentUser details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               companyPolicyDocument:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: CompanyPolicyDocumentUser successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/companyPolicyDocumentUser', documentsController.createCompanyPolicyDocumentUser);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentUser/{id}:
 *   get:
 *     summary: Get a CompanyPolicyDocumentUser by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentUser
 *     responses:
 *       200:
 *         description: Successful response with the CompanyPolicyDocumentUser
 *       404:
 *         description: CompanyPolicyDocumentUser not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocumentUser/:id', documentsController.getCompanyPolicyDocumentUser);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentUser/{id}:
 *   put:
 *     summary: Update a CompanyPolicyDocumentUser by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentUser
 *     requestBody:
 *       description: New CompanyPolicyDocumentUser details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               companyPolicyDocument:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated CompanyPolicyDocumentUser
 *       404:
 *         description: CompanyPolicyDocumentUser not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/companyPolicyDocumentUser/:id', documentsController.updateCompanyPolicyDocumentUser);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentUser/{id}:
 *   delete:
 *     summary: Delete a CompanyPolicyDocumentUser by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CompanyPolicyDocumentUser
 *     responses:
 *       204:
 *         description: CompanyPolicyDocumentUser successfully deleted
 *       404:
 *         description: CompanyPolicyDocumentUser not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/companyPolicyDocumentUser/:id', documentsController.deleteCompanyPolicyDocumentUser);

/**
 * @swagger
 * /api/v1/documents/companyPolicyDocumentUser:
 *   get:
 *     summary: Get all CompanyPolicyDocumentUser
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with CompanyPolicyDocumentUser
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/companyPolicyDocumentUser', documentsController.getAllCompanyPolicyDocumentUser);

/**
 * @swagger
 * /api/v1/documents:
 *   post:
 *     summary: Add a Document
 *     tags: [Documents management]
 *     requestBody:
 *       description: Document details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Document successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/', documentsController.createDocument);

/**
 * @swagger
 * /api/v1/documents/document{id}:
 *   get:
 *     summary: Get a Document by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the document
 *     responses:
 *       200:
 *         description: Successful response with the document
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('document/:id', documentsController.getDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: Update a Document by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the document
 *     requestBody:
 *       description: New document details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated document
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/:id', documentsController.updateDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete a Document by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the document
 *     responses:
 *       204:
 *         description: Document successfully deleted
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/:id', documentsController.deleteDocument);

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Get all Documents
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with documents
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/', documentsController.getAllDocuments);

/**
 * @swagger
 * /api/v1/documents/documentAppliedTo:
 *   post:
 *     summary: Add a DocumentAppliedTo
 *     tags: [Documents management]
 *     requestBody:
 *       description: Document applied to details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: DocumentAppliedTo successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/documentAppliedTo', documentsController.createDocumentAppliedTo);

/**
 * @swagger
 * /api/v1/documents/documentAppliedTo/{id}:
 *   get:
 *     summary: Get a DocumentAppliedTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentAppliedTo
 *     responses:
 *       200:
 *         description: Successful response with the DocumentAppliedTo
 *       404:
 *         description: DocumentAppliedTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/documentAppliedTo/:id', documentsController.getDocumentAppliedTo);

/**
 * @swagger
 * /api/v1/documents/documentAppliedTo/{id}:
 *   put:
 *     summary: Update a DocumentAppliedTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentAppliedTo
 *     requestBody:
 *       description: New DocumentAppliedTo details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated DocumentAppliedTo
 *       404:
 *         description: DocumentAppliedTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/documentAppliedTo/:id', documentsController.updateDocumentAppliedTo);

/**
 * @swagger
 * /api/v1/documents/documentAppliedTo/{id}:
 *   delete:
 *     summary: Delete a DocumentAppliedTo by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentAppliedTo
 *     responses:
 *       204:
 *         description: DocumentAppliedTo successfully deleted
 *       404:
 *         description: DocumentAppliedTo not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/documentAppliedTo/:id', documentsController.deleteDocumentAppliedTo);

/**
 * @swagger
 * /api/v1/documents/documentAppliedTo:
 *   get:
 *     summary: Get all DocumentAppliedTo
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with DocumentAppliedTo
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/documentAppliedTo', documentsController.getAllDocumentAppliedTo);

/**
 * @swagger
 * /api/v1/documents/document-categories: 
 *   post:
 *     summary: Add a DocumentCategory
 *     tags: [Documents management]
 *     requestBody:
 *       description: Document category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: DocumentCategory successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/document-categories', documentsController.addDocumentCategory);

/**
 * @swagger
 * /api/v1/documents/document-categories/{id}:
 *   get:
 *     summary: Get a DocumentCategory by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentCategory
 *     responses:
 *       200:
 *         description: Successful response with DocumentCategory
 *       404:
 *         description: DocumentCategory not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/document-categories/:id', documentsController.getDocumentCategory);

/**
 * @swagger
 * /api/v1/documents/document-categories/{id}:
 *   put:
 *     summary: Update a DocumentCategory by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentCategory
 *     requestBody:
 *       description: Updated DocumentCategory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with updated DocumentCategory
 *       404:
 *         description: DocumentCategory not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/document-categories/:id', documentsController.updateDocumentCategory);

/**
 * @swagger
 * /api/v1/documents/document-categories/{id}:
 *   delete:
 *     summary: Delete a DocumentCategory by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentCategory
 *     responses:
 *       204:
 *         description: DocumentCategory successfully deleted
 *       404:
 *         description: DocumentCategory not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/document-categories/:id', documentsController.deleteDocumentCategory);

/**
 * @swagger
 * /api/v1/documents/document-categories:
 *   get:
 *     summary: Get all DocumentCategories
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with DocumentCategories
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/document-categories', documentsController.getAllDocumentCategories);

/**
 * @swagger
 * /api/v1/documents/documentUsers:
 *   post:
 *     summary: Add a new DocumentUsers
 *     tags: [Documents management]
 *     requestBody:
 *       description: DocumentUsers details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: DocumentUsers successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/documentUsers', documentsController.createDocumentUser);

/**
 * @swagger
 * /api/v1/documents/documentUsers/{id}:
 *   get:
 *     summary: Get a DocumentUsers by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentUsers
 *     responses:
 *       200:
 *         description: Successful response with DocumentUsers
 *       404:
 *         description: DocumentUsers not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/documentUsers/:id', documentsController.getDocumentUser);

/**
 * @swagger
 * /api/v1/documents/documentUsers/{id}:
 *   put:
 *     summary: Update a DocumentUsers by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentUsers
 *     requestBody:
 *       description: Updated DocumentUsers details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated DocumentUsers
 *       404:
 *         description: DocumentUsers not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/documentUsers/:id', documentsController.updateDocumentUser);

/**
 * @swagger
 * /api/v1/documents/documentUsers/{id}:
 *   delete:
 *     summary: Delete a DocumentUsers by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DocumentUsers
 *     responses:
 *       204:
 *         description: DocumentUsers successfully deleted
 *       404:
 *         description: DocumentUsers not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/documentUsers/:id', documentsController.deleteDocumentUser);

/**
 * @swagger
 * /api/v1/documents/documentUsers:
 *   get:
 *     summary: Get all DocumentUsers
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with DocumentUsers
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/documentUsers', documentsController.getAllDocumentUsers);

/**
 * @swagger
 * /api/v1/documents/template:
 *   post:
 *     summary: Add a Template
 *     tags: [Documents management]
 *     requestBody:
 *       description: Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               active:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/template', documentsController.addTemplate);

/**
 * @swagger
 * /api/v1/documents/template/{id}:
 *   get:
 *     summary: Get a Template by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Template
 *     responses:
 *       200:
 *         description: Successful response with the Template
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/template/:id', documentsController.getTemplate);

/**
 * @swagger
 * /api/v1/documents/template/{id}:
 *   put:
 *     summary: Update a Template by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Template
 *     requestBody:
 *       description: New Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Template
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/template/:id', documentsController.updateTemplate);

/**
 * @swagger
 * /api/v1/documents/template/{id}:
 *   delete:
 *     summary: Delete a Template by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Template
 *     responses:
 *       204:
 *         description: Template successfully deleted
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/template/:id', documentsController.deleteTemplate);

/**
 * @swagger
 * /api/v1/documents/template:
 *   get:
 *     summary: Get all TemplateFields
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with TemplateFields
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/template', documentsController.getAllTemplates);

/**
 * @swagger
 * /api/v1/documents/:
 *   post:
 *     summary: Add a UserDocument
 *     tags: [Documents management]
 *     requestBody:
 *       description: UserDocument details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserDocument'
 *     responses:
 *       201:
 *         description: UserDocument successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
documentsRouter.post('/', documentsController.addUserDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Get a UserDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the UserDocument
 *     responses:
 *       200:
 *         description: Successful response with the UserDocument
 *       404:
 *         description: UserDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/:id', documentsController.getUserDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: Update a UserDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the UserDocument
 *     requestBody:
 *       description: Updated UserDocument details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserDocument'
 *     responses:
 *       200:
 *         description: Successful update of UserDocument
 *       404:
 *         description: UserDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.put('/:id', documentsController.updateUserDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete a UserDocument by ID
 *     tags: [Documents management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the UserDocument
 *     responses:
 *       204:
 *         description: UserDocument successfully deleted
 *       404:
 *         description: UserDocument not found
 *       500:
 *         description: Internal server error
 */
documentsRouter.delete('/:id', documentsController.deleteUserDocument);

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: Get all UserDocuments
 *     tags: [Documents management]
 *     responses:
 *       200:
 *         description: Successful response with all UserDocuments
 *       500:
 *         description: Internal server error
 */
documentsRouter.get('/', documentsController.getAllUserDocuments);


module.exports = documentsRouter;