const express = require('express');
const commonController = require('../controllers/commonController');
const authController = require('../controllers/authController');
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
 *     tags: [Email Templates]
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
 *  /api/v1/common/emailTemplates/{id}:
 *   put:
 *     summary: Update an existing email template
 *     tags: [Email Templates]
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
router.put('/emailTemplates/:id',  authController.protect, commonController.updateEmailTemplate)

/**
 * @swagger
 * /api/v1/common/emailTemplates/{id}:
 *   delete:
 *     summary: Delete an email template
 *     tags: [Email Templates]
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
 *     tags: [Email Templates]
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
 *     tags: [Email Templates] 
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
 *     tags: [Task Status]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               Status:
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
  * /api/v1/common/taskstatus:
  *  get:
  *      tags: [Task Status]
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
router.get('/taskstatus/', authController.protect, commonController.getTaskStatus);

/**
 * @swagger
 * /api/v1/common/taskpriority:
 *   post:
 *     summary: Add a new task Priority
 *     tags: [Task Priority]
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               Priority:
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
  * /api/v1/common/taskpriority:
  *  get:
  *      tags: [Task Priority]
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
router.get('/taskpriority/', authController.protect, commonController.getTaskPriority);
module.exports = router;