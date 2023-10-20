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

/**
 * @swagger
 * /api/v1/separation/exit-interview-questions:
 *   post:
 *     summary: Create a new ExitInterviewQuestion
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: ExitInterviewQuestion details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 required: true
 *               separationType:
 *                 type: string
 *                 format: uuid
 *                 required: true
 *     responses:
 *       201:
 *         description: ExitInterviewQuestion successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/exit-interview-questions', authController.protect, separationController.createExitInterviewQuestion);

/**
 * @swagger
 * /api/v1/separation/exit-interview-questions/{id}:
 *   get:
 *     summary: Get an ExitInterviewQuestion by ID
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
 *         description: ID of the ExitInterviewQuestion
 *     responses:
 *       200:
 *         description: Successful response with the ExitInterviewQuestion
 *       404:
 *         description: ExitInterviewQuestion not found
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-questions/:id', authController.protect, separationController.getExitInterviewQuestion);

/**
 * @swagger
 * /api/v1/separation/exit-interview-questions/{id}:
 *   put:
 *     summary: Update an ExitInterviewQuestion by ID
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
 *         description: ID of the ExitInterviewQuestion
 *     requestBody:
 *       description: New ExitInterviewQuestion details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               separationType:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Successful response with the updated ExitInterviewQuestion
 *       404:
 *         description: ExitInterviewQuestion not found
 *       500:
 *         description: Internal server error
 */
router.put('/exit-interview-questions/:id', authController.protect, separationController.updateExitInterviewQuestion);

/**
 * @swagger
 * /api/v1/separation/exit-interview-questions/{id}:
 *   delete:
 *     summary: Delete an ExitInterviewQuestion by ID
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
 *         description: ID of the ExitInterviewQuestion
 *     responses:
 *       204:
 *         description: ExitInterviewQuestion successfully deleted
 *       404:
 *         description: ExitInterviewQuestion not found
 *       500:
 *         description: Internal server error
 */
router.delete('/exit-interview-questions/:id', authController.protect, separationController.deleteExitInterviewQuestion);

/**
 * @swagger
 * /api/v1/separation/exit-interview-questions-by-separation-type/{separationTypeId}:
 *   get:
 *     summary: Get all ExitInterviewQuestions based o Separation Type
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: separationTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: separationTypeId of the separationType
 *     responses:
 *       200:
 *         description: Successful response with ExitInterviewQuestions
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-questions-by-separation-type/:separationTypeId', authController.protect, separationController.getExitInterviewQuestionsBySeparationType);

/**
 * @swagger
 * /api/v1/separation/exit-interview-options:
 *   post:
 *     summary: Add a new ExitInterviewQuestionOptions
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       description: New SeparationType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               option1:
 *                 type: string
 *               option2:
 *                 type: string
 *               option3:
 *                 type: string
 *               option4:
 *                 type: string
 *     responses:
 *       201:
 *         description: ExitInterviewQuestionOptions successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/exit-interview-options', authController.protect, separationController.createExitInterviewOptions);

/**
 * @swagger
 * /api/v1/separation/exit-interview-options/{id}:
 *   get:
 *     summary: Get ExitInterviewQuestionOptions by ID
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
 *         description: ID of the ExitInterviewQuestionOptions
 *     responses:
 *       200:
 *         description: Successful response with the ExitInterviewQuestionOptions
 *       404:
 *         description: ExitInterviewQuestionOptions not found
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-options/:id', authController.protect, separationController.getExitInterviewOptions);

/**
 * @swagger
 * /api/v1/separation/exit-interview-options/{id}:
 *   put:
 *     summary: Update ExitInterviewQuestionOptions by ID
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
 *         description: ID of the ExitInterviewQuestionOptions
 *     requestBody:
 *       description: New SeparationType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Question:
 *                 type: string
 *               Option1:
 *                 type: string
 *               Option2:
 *                 type: string
 *               Option3:
 *                 type: string
 *               Option4:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated ExitInterviewQuestionOptions
 *       404:
 *         description: ExitInterviewQuestionOptions not found
 *       500:
 *         description: Internal server error
 */
router.put('/exit-interview-options/:id', authController.protect, separationController.updateExitInterviewOptions);

/**
 * @swagger
 * /api/v1/separation/exit-interview-options/{id}:
 *   delete:
 *     summary: Delete ExitInterviewQuestionOptions by ID
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
 *         description: ID of the ExitInterviewQuestionOptions
 *     responses:
 *       204:
 *         description: ExitInterviewQuestionOptions successfully deleted
 *       404:
 *         description: ExitInterviewQuestionOptions not found
 *       500:
 *         description: Internal server error
 */
router.delete('/exit-interview-options/:id', authController.protect, separationController.deleteExitInterviewOptions);

/**
 * @swagger
 * /api/v1/separation/exit-interview-options:
 *   get:
 *     summary: Get all ExitInterviewQuestionOptions
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     responses:
 *       200:
 *         description: Successful response with ExitInterviewQuestionOptions
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-options', authController.protect, separationController.getAllExitInterviewOptions);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers:
 *   post:
 *     summary: Add a new Exit Interview Question Answer
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       description: Exit Interview Question Answer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               question:
 *                 type: string
 *                 required: true
 *               answer:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Exit Interview Question Answer successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/exit-interview-question-answers', separationController.createExitInterviewQuestionAnswer);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers/{id}:
 *   get:
 *     summary: Get an Exit Interview Question Answer by ID
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
 *         description: ID of the Exit Interview Question Answer
 *     responses:
 *       200:
 *         description: Successful response with the Exit Interview Question Answer
 *       404:
 *         description: Exit Interview Question Answer not found
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-question-answers/:id', separationController.getExitInterviewQuestionAnswer);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers/{id}:
 *   put:
 *     summary: Update an Exit Interview Question Answer by ID
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
 *         description: ID of the Exit Interview Question Answer
 *     requestBody:
 *       description: New Exit Interview Question Answer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Exit Interview Question Answer
 *       404:
 *         description: Exit Interview Question Answer not found
 *       500:
 *         description: Internal server error
 */
router.put('/exit-interview-question-answers/:id', separationController.updateExitInterviewQuestionAnswer);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers/{id}:
 *   delete:
 *     summary: Delete an Exit Interview Question Answer by ID
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
 *         description: ID of the Exit Interview Question Answer
 *     responses:
 *       204:
 *         description: Exit Interview Question Answer successfully deleted
 *       404:
 *         description: Exit Interview Question Answer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/exit-interview-question-answers/:id', separationController.deleteExitInterviewQuestionAnswer);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers-by-question/{questionId}:
 *   get:
 *     summary: Get all Exit Interview Question Answers
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Exit Interview Question
 *     responses:
 *       200:
 *         description: Successful response with Exit Interview Question Answers
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-question-answers-by-question/:questionId', separationController.getAllExitInterviewQuestionAnswersByQuestion);

/**
 * @swagger
 * /api/v1/separation/exit-interview-question-answers-by-user/{userId}:
 *   get:
 *     summary: Get all Exit Interview Question Answers
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Exit Interview Question
 *     responses:
 *       200:
 *         description: Successful response with Exit Interview Question Answers
 *       500:
 *         description: Internal server error
 */
router.get('/exit-interview-question-answers-by-user/:userId', separationController.getAllExitInterviewQuestionAnswersByUser);


module.exports = router;
