const express = require('express');
const commonController = require('../controllers/commonController');
const authController = require('../controllers/authController');
const settingsController = require('../controllers/settingsController');
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
 *     tags: [common]
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
 *     tags: [common]
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
 * /api/v1/common/emailTemplates/{id}:
 *   delete:
 *     summary: Delete an email template
 *     tags: [common]
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
 *     tags: [common]
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
 *     tags: [common] 
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
 *     tags: [common]
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
  *      tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
  *      tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
 *     tags: [common]
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
 * /api/v1/common/GetUserUIState/{key}:
 *   get:
 *     summary: Retrieve the state value for a specific user and key
 *     tags: [common]
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
router.get('/GetUserUIState/:key', commonController.getUserUiState);



module.exports = router;