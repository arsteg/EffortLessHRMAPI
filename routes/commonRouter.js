const express = require('express');
const commonController = require('../controllers/commonController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

// Country Router
router.get('/countrylist',commonController.getCountryList);
router.post('/savecountry',commonController.saveCoutry);

// Role Router
router.get('/getrolebyname',commonController.getRoleByName);

// Permission Router
router.get('/permissionlist',commonController.getPermissionList);
router.post('/savepermission',commonController.savePermission);

// RolePermission Router
router.get('/rolepermissionlist',commonController.getRolePermsList);
router.post('/saverolepermission',commonController.saveRolePermission);
router.get('/getrolepermsbyrole',commonController.getRolePermsByRole);

/**
 * @swagger
 * /api/v1/common/emailTemplate:
 *   post:
 *     summary: Add a new email template
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               Name:
 *                 type: string
 *               subject:
 *                 type: string
 *               templateType:
 *                 type: number
 *               contentData:
 *                 type: string
 *             required:
 *               - Name
 *               - subject
 *               - templateType
 *               - contentData
 *     responses:
 *       201:
 *         description: Successfully added a new email template
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/emailTemplate',  authController.protect, commonController.addEmailTemplate);

/**
 * @swagger
 *  /api/v1/common/emailTemplates/changestatus/{id}:
 *   put:
 *     summary: Update an existing email template
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the email template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               isDelete:
 *                 type: boolean
 *             required:
 *               - isDelete
 *     responses:
 *       200:
 *         description: The updated email template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailTemplate'
 */
router.put('/emailTemplates/changestatus/:id',  authController.protect, commonController.changeEmailTemplatesStatus)

/**
 * @swagger
 *  /api/v1/common/emailTemplates/{id}:
 *   put:
 *     summary: Update an existing email template
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the email template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               Name:
 *                 type: string
 *               subject:
 *                 type: string
 *               templateType:
 *                 type: number
 *               contentData:
 *                 type: string
 *             required:
 *               - Name
 *               - subject
 *               - templateType
 *               - contentData
 *     responses:
 *       200:
 *         description: The updated email template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailTemplate'
 */
router.put('/emailTemplates/:id',  authController.protect, commonController.changeEmailTemplatesStatus)

/**
 * @swagger
 * /api/v1/common/emailTemplates/{id}:
 *   delete:
 *     summary: Delete an email template
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the email template
 *     responses:
 *       204:
 *         description: Email template deleted successfully
 */
router.delete('/emailTemplates/:id', authController.protect, commonController.deleteEmailTemplate)

/**
 * @swagger
 * /api/v1/common/emailTemplate/{id}:
 *   get:
 *     summary: Get an email template by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email template ID 
 *     responses:
 *       200:
 *         description: Successfully retrieved the email template
 *       400:
 *         description: Invalid email template ID
 *       404:
 *         description: Email template not found
 *       500:
 *         description: Server error
 */
router.get('/emailTemplate/:id', authController.protect, commonController.getEmailTemplateById)

/**
 * @swagger
 * /api/v1/common/emailTemplates:
 *   get:
 *     summary: Get all email templates
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     responses:
 *       200:
 *         description: Successfully retrieved all email templates
 *       400:
 *         description: Invalid company ID
 *       500:
 *         description: Server error
 */
router.get('/emailTemplates', authController.protect, commonController.getAllEmailTemplates)


/**
 * @swagger
 * /api/v1/common/taskstatus:
 *   post:
 *     summary: Add a new task status
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully added a new Task Status
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/taskstatus',  authController.protect, commonController.saveTaskStatus);

/**
  * @swagger
  * /api/v1/common/taskstatuslist:
  *  get:
  *      tags: [Common Management]
  *      summary: "Get all task status"
  *      security: [{
  *         bearerAuth: []
  *     }]  
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
router.get('/taskstatuslist/', authController.protect, commonController.getTaskStatusList);

/**
 * @swagger
 *  /api/v1/common/taskstatus/{id}:
 *   put:
 *     summary: Update an existing Task Status
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated task status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskStatus'
 */
router.put('/taskstatus/:id',  authController.protect, commonController.updateTaskStatus)

/**
 * @swagger
 * /api/v1/common/taskstatus/{id}:
 *   delete:
 *     summary: Delete an task status
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task status
 *     responses:
 *       204:
 *         description: Task Status deleted successfully
 */
router.delete('/taskstatus/:id', authController.protect, commonController.deleteTaskStatus)

/**
 * @swagger
 * /api/v1/common/taskstatus/{id}:
 *   get:
 *     summary: Get an task status by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task Status ID 
 *     responses:
 *       200:
 *         description: Successfully retrieved the task status
 *       400:
 *         description: Invalid task status ID
 *       404:
 *         description: Task status not found
 *       500:
 *         description: Server error
 */
router.get('/taskstatus/:id', authController.protect, commonController.getTaskStatusById)

/**
 * @swagger
 * /api/v1/common/taskpriority:
 *   post:
 *     summary: Add a new task Priority
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully added a new Task Priority
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/taskpriority',  authController.protect, commonController.saveTaskPriority);

/**
  * @swagger
  * /api/v1/common/taskprioritylist:
  *  get:
  *      tags: [Common Management]
  *      summary: "Get all task priority"
  *      security: [{
  *         bearerAuth: []
  *     }]  
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
router.get('/taskprioritylist/', authController.protect, commonController.getTaskPriorityList);

/**
 * @swagger
 *  /api/v1/common/taskpriority/{id}:
 *   put:
 *     summary: Update an existing Task Priority
  *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task priority
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated task priority
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskPriority'
 */
router.put('/taskpriority/:id',  authController.protect, commonController.updateTaskPriority)

/**
 * @swagger
 * /api/v1/common/taskpriority/{id}:
 *   delete:
 *     summary: Delete an task priority
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the task priority
 *     responses:
 *       204:
 *         description: Task Priority deleted successfully
 */
router.delete('/taskpriority/:id', authController.protect, commonController.deleteTaskPriority)

/**
 * @swagger
 * /api/v1/common/taskpriority/{id}:
 *   get:
 *     summary: Get an task priority by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task Priority ID 
 *     responses:
 *       200:
 *         description: Successfully retrieved the task priority
 *       400:
 *         description: Invalid task priority ID
 *       404:
 *         description: Task priority not found
 *       500:
 *         description: Server error
 */
router.get('/taskpriority/:id', authController.protect, commonController.getTaskPriorityById)


/**
 * @swagger
 * /api/v1/common/UserUIState:
 *   post:
 *     summary: Save or update a state key-value pair for a user
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               key:
 *                 type: string
 *                 required: true
 *               value:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Successfully added a new Task Priority
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/UserUIState',  commonController.saveUserUiState);
 
/**
 * @swagger
 * /api/v1/common/UserUIState/{key}:
 *   get:
 *     summary: Retrieve the state value for a specific user and key
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path      
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: The key for the state item
 *     responses:
 *       200:
 *         description: Successfully retrieved the UserUIState
 *       400:
 *         description: Invalid UserUIState ID
 *       404:
 *         description: UserUIState not found
 *       500:
 *         description: Server error
 */ 
router.get('/UserUIState/:key', commonController.getUserUiState);

/**
 * @swagger
 * /api/v1/common/income-tax-sections:
 *   post:
 *     summary: Add a new IncomeTaxSection
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       description: IncomeTaxSection details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: IncomeTaxSection successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/income-tax-sections', authController.protect,commonController.createIncomeTaxSection);

/**
 * @swagger
 * /api/v1/common/income-tax-sections-by-company:
 *   get:
 *     summary: Get all IncomeTaxSections by company
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     responses:
 *       200:
 *         description: Successful response with IncomeTaxSections
 *       404:
 *         description: IncomeTaxSections not found
 *       500:
 *         description: Internal server error
 */
router.get('/income-tax-sections-by-company', authController.protect, commonController.getIncomeTaxSectionsByCompany);

/**
 * @swagger
 * /api/v1/common/income-tax-sections/{id}:
 *   put:
 *     summary: Update an IncomeTaxSection by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the IncomeTaxSection
 *     requestBody:
 *       description: New IncomeTaxSection details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated IncomeTaxSection
 *       404:
 *         description: IncomeTaxSection not found
 *       500:
 *         description: Internal server error
 */
router.put('/income-tax-sections/:id',authController.protect, commonController.updateIncomeTaxSection);

/**
 * @swagger
 * /api/v1/common/income-tax-sections/{id}:
 *   get:
 *     summary: Get an IncomeTaxSection by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the IncomeTaxSection
 *     responses:
 *       200:
 *         description: Successful response with the IncomeTaxSection
 *       404:
 *         description: IncomeTaxSection not found
 *       500:
 *         description: Internal server error
 */
router.get('/income-tax-sections/:id',authController.protect, commonController.getIncomeTaxSectionById);

/**
 * @swagger
 * /api/v1/common/income-tax-sections/{id}:
 *   delete:
 *     summary: Delete an IncomeTaxSection by ID
 *     tags: [Common Management]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the IncomeTaxSection
 *     responses:
 *       204:
 *         description: IncomeTaxSection successfully deleted
 *       404:
 *         description: IncomeTaxSection not found
 *       500:
 *         description: Internal server error
 */
router.delete('/income-tax-sections/:id',authController.protect, commonController.deleteIncomeTaxSection);

/**
 * @swagger
 * /api/v1/common/income-tax-componants:
 *   post:
 *     summary: Add a new Income Tax Componant
 *     security:
 *       - bearerAuth: []
 *     tags: [Common Management]
 *     requestBody:
 *       description: Income Tax Componant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               componantName:
 *                 type: string
 *                 required: true
 *               section:
 *                 type: string
 *                 required: true
 *               maximumAmount:
 *                 type: number
 *                 required: true
 *               order:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Income Tax Componant successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/income-tax-componants', authController.protect, commonController.createIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/common/income-tax-componants/{id}:
 *   get:
 *     summary: Get an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Common Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     responses:
 *       200:
 *         description: Successful response with the Income Tax Componant
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.get('/income-tax-componants/:id', authController.protect, commonController.getIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/common/income-tax-componants/{id}:
 *   put:
 *     summary: Update an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Common Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     requestBody:
 *       description: New Income Tax Componant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               componantName:
 *                 type: string
 *               section:
 *                 type: string
 *               maximumAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Income Tax Componant
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.put('/income-tax-componants/:id', authController.protect, commonController.updateIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/common/income-tax-componants/{id}:
 *   delete:
 *     summary: Delete an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Common Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     responses:
 *       204:
 *         description: Income Tax Componant successfully deleted
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/income-tax-componants/:id', authController.protect, commonController.deleteIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/common/income-tax-componants-list:
 *   post:
 *     summary: Get all Income Tax Componants by company
 *     security:
 *       - bearerAuth: []
 *     tags: [Common Management]
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
 *         description: Successful response with Income Tax Componants
 *       404:
 *         description: Income Tax Componants not found
 *       500:
 *         description: Internal server error
 */
router.post('/income-tax-componants-list', authController.protect, commonController.getIncomeTaxComponantsByCompany);

/**
 * @swagger
 * /api/v1/common/generate-otp:
 *   post:
 *     summary: Add a new generate otp
 *     tags: [Common Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully generated a new OTP
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/generate-otp',  userController.generateOTP);


/**
 * @swagger
 *  /api/v1/common/verify-otp:
 *   put:
 *     summary: Verify otp
 *     tags: [Common Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated verified otp
 */
router.put('/verify-otp', userController.verifyOTP)

/**
 * @swagger
 *  /api/v1/common/cancel-otp:
 *   put:
 *     summary: cancel otp
 *     tags: [Common Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated cancel otp
 */
router.put('/cancel-otp', userController.cancelOTP)
module.exports = router;