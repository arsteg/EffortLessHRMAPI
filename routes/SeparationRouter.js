const express = require('express');
const separationController = require('../controllers/SeparationController');
const authController = require('../controllers/authController');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Separation Management
 *   description: API endpoints for managing separtions
 */

/**
 * @swagger
 * /api/v1/separation/resignations:
 *   post:
 *     summary: Add a new resignation record
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       description: Resignation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               resignation_date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               last_working_day:
 *                 type: string
 *                 format: date
 *                 required: true
 *               notice_period:
 *                 type: integer
 *                 required: true
 *               resignation_reason:
 *                 type: string
 *               exit_interview_date:
 *                 type: string
 *                 format: date
 *               handover_complete:
 *                 type: boolean
 *               company_property_returned:
 *                 type: boolean
 *               final_pay_processed:
 *                 type: boolean
 *               exit_feedback:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resignation record created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/resignations', authController.protect, separationController.addResignation);

/**
 * @swagger
 * /api/v1/separation/resignations-by-user/{userId}:
 *   get:
 *     summary: Get resignation by user ID
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
 *     responses:
 *       200:
 *         description: Successful response with resignation details
 *       404:
 *         description: Resignation not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/resignations-by-user/:userId', authController.protect, separationController.getResignationByUser);

/**
 * @swagger
 * /api/v1/separation/resignations-by-status/{status}:
 *   get:
 *     summary: Get resignation by resignation status
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Pending', 'Completed', 'In-Progress', 'Approved']
 *     responses:
 *       200:
 *         description: Successful response with resignation details
 *       404:
 *         description: No resignation found with the given status
 *       500:
 *         description: Internal server error
 */
router.get('/resignations-by-status/:status', authController.protect, separationController.getResignationByStatus);

/**
 * @swagger
 * /api/v1/separation/resignations-by-company:
 *   get:
 *     summary: Get all resignations by company
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     responses:
 *       200:
 *         description: Successful response with resignations
 *       500:
 *         description: Internal server error
 */
router.get('/resignations-by-company', authController.protect, separationController.getResignationByCompany);

/**
 * @swagger
 * /api/v1/separation/resignations/{id}:
 *   put:
 *     summary: Update resignation status to "completed", only if the current status is "pending"
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
 *     requestBody:
 *       description: New resignation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resignation_reason:
 *                 type: string
 *               exit_interview_date:
 *                 type: string
 *                 format: date
 *               handover_complete:
 *                 type: boolean
 *               company_property_returned:
 *                 type: boolean
 *               final_pay_processed:
 *                 type: boolean
 *               exit_feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with updated resignation
 *       404:
 *         description: Resignation not found or invalid status change
 *       500:
 *         description: Internal server error
 */
router.put('/resignations/:id', authController.protect, separationController.updateResignation);

/**
 * @swagger
 * /api/v1/separation/resignations-by-status/{id}:
 *   patch:
 *     summary: Change resignation status
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
 *     requestBody:
 *       description: New resignation status
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resignation_status:
 *                 type: string
 *                 enum: ['Pending', 'Completed', 'In-Progress', 'Approved']
 *     responses:
 *       200:
 *         description: Successful response with status change
 *       404:
 *         description: Resignation not found
 *       500:
 *         description: Internal server error
 */
router.patch('/resignations-by-status/:id', authController.protect, separationController.changeResignationStatus);
/**
 * @swagger
 * /api/v1/separation/fnf-date-range-by-user/{userId}:
 *   get:
 *     summary: Get FNF Date Range  by user ID
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
 *     responses:
 *       200:
 *         description: Successful response with FNF Date Range details
 *       404:
 *         description: FNF Date Range not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/fnf-date-range-by-user/:userId', authController.protect, separationController.getFNFDateRangeByUser);

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

/**
 * @swagger
 * /api/v1/separation/separation-template-settings:
 *   post:
 *     summary: Create a new Separation Template Setting
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: Separation Template Setting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *                 required: true
 *               noticePeriod:
 *                 type: string
 *                 required: true
 *               leaveAllowedInNoticePeriod:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: Separation Template Setting successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/separation-template-settings', authController.protect, separationController.createSeparationTemplateSetting);

/**
 * @swagger
 * /api/v1/separation/separation-template-settings/{id}:
 *   get:
 *     summary: Get a Separation Template Setting by ID
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
 *         description: ID of the Separation Template Setting
 *     responses:
 *       200:
 *         description: Successful response with the Separation Template Setting
 *       404:
 *         description: Separation Template Setting not found
 *       500:
 *         description: Internal server error
 */
router.get('/separation-template-settings/:id', authController.protect, separationController.getSeparationTemplateSetting);

/**
 * @swagger
 * /api/v1/separation/separation-template-settings/{id}:
 *   put:
 *     summary: Update a Separation Template Setting by ID
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
 *         description: ID of the Separation Template Setting
 *     requestBody:
 *       description: New Separation Template Setting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *               noticePeriod:
 *                 type: string
 *               leaveAllowedInNoticePeriod:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Separation Template Setting
 *       404:
 *         description: Separation Template Setting not found
 *       500:
 *         description: Internal server error
 */
router.put('/separation-template-settings/:id', authController.protect, separationController.updateSeparationTemplateSetting);

/**
 * @swagger
 * /api/v1/separation/separation-template-settings/{id}:
 *   delete:
 *     summary: Delete a Separation Template Setting by ID
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
 *         description: ID of the Separation Template Setting
 *     responses:
 *       204:
 *         description: Separation Template Setting successfully deleted
 *       404:
 *         description: Separation Template Setting not found
 *       500:
 *         description: Internal server error
 */
router.delete('/separation-template-settings/:id', authController.protect, separationController.deleteSeparationTemplateSetting);

/**
 * @swagger
 * /api/v1/separation/separation-template-settings:
 *   get:
 *     summary: Get all Separation Template Settings
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     responses:
 *       200:
 *         description: Successful response with Separation Template Settings
 *       500:
 *         description: Internal server error
 */
router.get('/separation-template-settings', authController.protect, separationController.getAllSeparationTemplateSettings);

/**
 * @swagger
 * /api/v1/separation/initiate-separation-requests:
 *   post:
 *     summary: Create a new Initiate Separation Request
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: Initiate Separation Request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               separationType:
 *                 type: string
 *                 required: true
 *               comments:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Initiate Separation Request successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/initiate-separation-requests', authController.protect, separationController.createInitiateSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/initiate-separation-requests/{id}:
 *   get:
 *     summary: Get an Initiate Separation Request by ID
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
 *         description: ID of the Initiate Separation Request
 *     responses:
 *       200:
 *         description: Successful response with the Initiate Separation Request
 *       404:
 *         description: Initiate Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.get('/initiate-separation-requests/:id', authController.protect, separationController.getInitiateSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/initiate-separation-requests/{id}:
 *   put:
 *     summary: Update an Initiate Separation Request by ID
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
 *         description: ID of the Initiate Separation Request
 *     requestBody:
 *       description: New Initiate Separation Request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               separationType:
 *                 type: string
 *               comments:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Initiate Separation Request
 *       404:
 *         description: Initiate Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/initiate-separation-requests/:id',authController.protect, separationController.updateInitiateSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/initiate-separation-requests/{id}:
 *   delete:
 *     summary: Delete an Initiate Separation Request by ID
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
 *         description: ID of the Initiate Separation Request
 *     responses:
 *       204:
 *         description: Initiate Separation Request successfully deleted
 *       404:
 *         description: Initiate Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.delete('/initiate-separation-requests/:id',authController.protect, separationController.deleteInitiateSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/initiate-separation-requests:
 *   get:
 *     summary: Get all Initiate Separation Requests
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     responses:
 *       200:
 *         description: Successful response with Initiate Separation Requests
 *       500:
 *         description: Internal server error
 */
router.get('/initiate-separation-requests',authController.protect, separationController.getAllInitiateSeparationRequests);

/**
 * @swagger
 * /api/v1/separation/separation-requests:
 *   post:
 *     summary: Create a new Separation Request
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: Separation Request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               separationType:
 *                 type: string
 *                 required: true
 *               comments:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               IsModifyRelievingDate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Separation Request successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/separation-requests', authController.protect, separationController.createSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/separation-requests/{id}:
 *   get:
 *     summary: Get a Separation Request by ID
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
 *         description: ID of the Separation Request
 *     responses:
 *       200:
 *         description: Successful response with the Separation Request
 *       404:
 *         description: Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.get('/separation-requests/:id', authController.protect, separationController.getSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/separation-requests/{id}:
 *   put:
 *     summary: Update a Separation Request by ID
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
 *         description: ID of the Separation Request
 *     requestBody:
 *       description: New Separation Request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               separationType:
 *                 type: string
 *               comments:
 *                 type: string
 *               user:
 *                 type: string
 *               status:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               IsModifyRelievingDate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Separation Request
 *       404:
 *         description: Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/separation-requests/:id', authController.protect, separationController.updateSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/separation-requests/{id}:
 *   delete:
 *     summary: Delete a Separation Request by ID
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
 *         description: ID of the Separation Request
 *     responses:
 *       204:
 *         description: Separation Request successfully deleted
 *       404:
 *         description: Separation Request not found
 *       500:
 *         description: Internal server error
 */
router.delete('/separation-requests/:id', authController.protect, separationController.deleteSeparationRequest);

/**
 * @swagger
 * /api/v1/separation/separation-requests:
 *   get:
 *     summary: Get all Separation Requests
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     responses:
 *       200:
 *         description: Successful response with Separation Requests
 *       500:
 *         description: Internal server error
 */
router.get('/separation-requests', authController.protect, separationController.getAllSeparationRequests);

/**
 * @swagger
 * /api/v1/separation/termination:
 *   post:
 *     summary: Add a new termination record
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: Termination record details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               termination_date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               termination_reason:
 *                 type: string
 *                 required: true
 *               notice_given:
 *                 type: boolean
 *               performance_warnings:
 *                 type: integer
 *               severance_paid:
 *                 type: boolean
 *               final_pay_processed:
 *                 type: boolean
 *               company_property_returned:
 *                 type: boolean
 *               exit_interview_date:
 *                 type: string
 *                 format: date
 *               legal_compliance:
 *                 type: boolean
 *               unemployment_claim:
 *                 type: boolean
  *     responses:
 *       201:
 *         description: Termination successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/termination',authController.protect, separationController.addTermination);

/**
 * @swagger
 * /api/v1/separation/termination-by-user/{userId}:
 *   get:
 *     summary: Get a termination record by user
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
 *         description: User ID for the termination
 *     responses:
 *       200:
 *         description: Successful response with the termination record
 *       404:
 *         description: Termination not found
 *       500:
 *         description: Internal server error
 */
router.get('/termination-by-user/:userId',authController.protect, separationController.getTerminationByUser);

/**
 * @swagger
 * /api/v1/separation/termination-by-status/{terminationStatus}:
 *   get:
 *     summary: Get a termination record by termination status
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     parameters:
 *       - in: path
 *         name: terminationStatus
 *         required: true
 *         schema:
 *           type: string
 *         description: Status of termination (pending/completed/appealed)
 *     responses:
 *       200:
 *         description: Successful response with the termination records
 *       404:
 *         description: Termination not found
 *       500:
 *         description: Internal server error
 */
router.get('/termination-by-status/:terminationStatus',authController.protect, separationController.getTerminationByStatus);

/**
 * @swagger
 * /api/v1/separation/termination-by-company:
 *   get:
 *     summary: Get a termination record by company
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     responses:
 *       200:
 *         description: Successful response with the termination records for the company
 *       500:
 *         description: Internal server error
 */
router.get('/termination-by-company',authController.protect, separationController.getTerminationByCompany);

/**
 * @swagger
 * /api/v1/separation/termination/{id}:
 *   put:
 *     summary: Update a termination record by ID (only if status is 'pending')
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
 *         description: Termination ID
 *     requestBody:
 *       description: Updated termination details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               termination_date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               termination_reason:
 *                 type: string
 *                 required: true
 *               notice_given:
 *                 type: boolean
 *               performance_warnings:
 *                 type: integer
 *               severance_paid:
 *                 type: boolean
 *               final_pay_processed:
 *                 type: boolean
 *               company_property_returned:
 *                 type: boolean
 *               exit_interview_date:
 *                 type: string
 *                 format: date
 *               legal_compliance:
 *                 type: boolean
 *               unemployment_claim:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Termination successfully updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Termination not found
 *       500:
 *         description: Internal server error
 */
router.put('/termination/:id',authController.protect, separationController.updateTermination);

/**
 * @swagger
 * /api/v1/separation/termination-by-status/{id}:
 *   put:
 *     summary: Change the termination status, If status is completed then user goes in termination status
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
 *         description: Termination ID
 *     requestBody:
 *       description: New resignation status
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               termination_status:
 *                 type: string
 *                 enum: ['Completed', 'Appealed']
 *     responses:
 *       200:
 *         description: Termination status successfully changed
 *       400:
 *         description: Bad request
 *       404:
 *         description: Termination not found
 *       500:
 *         description: Internal server error
 */
router.put('/termination-by-status/:id',authController.protect, separationController.changeTerminationStatus);

/**
 * @swagger
 * /api/v1/separation/termination-appeal:
 *   post:
 *     summary: Submit a new termination appeal
 *     tags: [Separation Management]
 *     security: [{
 *         bearerAuth: []
 *     }]  
 *     requestBody:
 *       description: Appeal submission data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               termination:
 *                 type: string
 *               user:
 *                 type: string
 *               appeal_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appeal submitted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/termination-appeal',authController.protect, separationController.submitTerminationAppeal);

/**
 * @swagger
 * /api/v1/separation/termination-appeal/{id}:
 *   put:
 *     summary: Approve or reject a termination appeal
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
 *         description: Appeal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appeal_reason:
 *                 type: string
 *               appeal_status:
 *                 type: string
 *                 enum: ['Approved', 'Rejected']
 *               decision_notes:
 *                 type: string
 *               decided_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appeal decision processed
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Appeal not found
 *       500:
 *         description: Internal server error
 */
router.put('/termination-appeal/:id',authController.protect, separationController.updateTerminationAppeal);
/**
 * @swagger
 * /api/v1/separation/termination-appeal-by-termination/{terminationId}:
 *   get:
 *     summary: Get termination appeal by termination ID
 *     tags: [Separation Management]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: terminationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the termination record
 *     responses:
 *       200:
 *         description: Appeal retrieved successfully
 *       400:
 *         description: Invalid termination ID
 *       404:
 *         description: Appeal not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/termination-appeal-by-termination/:terminationId',
    authController.protect,
    separationController.getTerminationAppealByTerminationId
  );
  
module.exports = router;
