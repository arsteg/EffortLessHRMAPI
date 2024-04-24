const express = require('express');
const expenseController = require('../controllers/expenseController');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expense Management
 *   description: API endpoints for managing expenses
 */

/**
 * @swagger
 * /api/v1/expense/expense-categories:
 *   post:
 *     summary: Create a new expense category
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Expense category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 required: true
 *               label:
 *                 type: string
 *                 required: true
 *               isMandatory:
 *                 type: boolean
 *                 description: Whether the field is mandatory or not
 *                 required: true
 *     responses:
 *       201:
 *         description: Expense category successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-categories', authController.protect, expenseController.createExpenseCategory);

/**
 * @swagger
 * /api/v1/expense/expense-categories/{id}:
 *   get:
 *     summary: Get an expense category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense category
 *     responses:
 *       200:
 *         description: Successful response with the expense category
 *       404:
 *         description: Expense category not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-categories/:id', authController.protect, expenseController.getExpenseCategory);

/**
 * @swagger
 * /api/v1/expense/expense-categories-by-employee/{userId}:
 *   get:
 *     summary: Get an expense category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense category
 *     responses:
 *       200:
 *         description: Successful response with the expense category
 *       404:
 *         description: Expense category not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-categories-by-employee/:userId', authController.protect, expenseController.getExpenseCategoryByEmployee);

/**
 * @swagger
 * /api/v1/expense/expense-categories/{id}:
 *   put:
 *     summary: Update an expense category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense category
 *     requestBody:
 *       description: New expense category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               label:
 *                 type: string
 *               isMandatory:
 *                 type: boolean
 *                 description: Whether the field is mandatory or not
 *                 required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated expense category
 *       404:
 *         description: Expense category not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-categories/:id', authController.protect, expenseController.updateExpenseCategory);

/**
 * @swagger
 * /api/v1/expense/expense-categories/{id}:
 *   delete:
 *     summary: Delete an expense category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense category
 *     responses:
 *       204:
 *         description: Expense category successfully deleted
 *       404:
 *         description: Expense category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-categories/:id', authController.protect, expenseController.deleteExpenseCategory);

/**
 * @swagger
 * /api/v1/expense/expense-categories:
 *   get:
 *     summary: Get all expense categories
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with expense categories
 *       500:
 *         description: Internal server error
 */
router.get('/expense-categories', authController.protect, expenseController.getAllExpenseCategories);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields:
 *   post:
 *     summary: Add a new expense application field
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
*     requestBody:
 *       description: Expense application field details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseCategory:
 *                 type: string
 *                 description: ID of the expense category
 *                 required: true
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fieldName:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     fieldType:
 *                       type: string
 *                       description: Type of the field (e.g., text, number, date)
 *                       required: true
 *                     expenseApplicationFieldValues :
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             description: Field value
 *                             required: true
  *                       description: Array of field values
 *                 required: true
 *                 description: Array of field objects
 *     responses:
 *       201:
 *         description: Expense application field successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-application-fields', authController.protect, expenseController.addExpenseApplicationField);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields:
 *   put:
 *     summary: Update an expense application field by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: New expense application field details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     expenseCategory:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     fieldName:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     fieldType:
 *                       type: string
 *                       description: Type of the field (e.g., text, number, date)
 *                       required: true
 *                     expenseApplicationFieldValues :
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Name of the field
 *                             required: true
 *                           value:
 *                             type: string
 *                             description: Field value
 *                             required: true
  *                       description: Array of field values
 *                 required: true
 *                 description: Array of field objects
 *     responses:
 *       200:
 *         description: Successful response with the updated expense application field
 *       404:
 *         description: Expense application field not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-application-fields', authController.protect, expenseController.updateExpenseApplicationField);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields-by-expense-category/{expenseCategoryId}:
 *   get:
 *     summary: Get all expense application fields by category ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: expenseCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense category
 *     responses:
 *       200:
 *         description: Successful response with expense application fields
 *       404:
 *         description: Expense application fields not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-application-fields-by-expense-category/:expenseCategoryId', authController.protect, expenseController.getExpenseApplicationFieldsByCategory);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields/{id}:
 *   delete:
 *     summary: Delete an expense application field by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense application field
 *     responses:
 *       204:
 *         description: Expense application field successfully deleted
 *       404:
 *         description: Expense application field not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-application-fields/:id', authController.protect, expenseController.deleteExpenseApplicationField);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields-values-by-field/{expenseApplicationFieldId}:
 *   get:
 *     summary: Get all ExpenseApplicationFieldValues based on ExpenseApplicationField
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: expenseApplicationFieldId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseApplicationField
 *     responses:
 *       200:
 *         description: Successful response with ExpenseApplicationFieldValues
 *       404:
 *         description: ExpenseApplicationField not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-application-fields-values-by-field/:expenseApplicationFieldId', authController.protect, expenseController.getExpenseApplicationFieldValuesByFieldId);

/**
 * @swagger
 * /api/v1/expense/expense-application-field-values/{id}:
 *   delete:
 *     summary: Delete an ExpenseApplicationFieldValue by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseApplicationFieldValue
 *     responses:
 *       204:
 *         description: ExpenseApplicationFieldValue successfully deleted
 *       404:
 *         description: ExpenseApplicationFieldValue not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-application-field-values/:id', authController.protect, expenseController.deleteExpenseApplicationFieldValue);

/**
 * @swagger
 * /api/v1/expense/expense-templates:
 *   post:
 *     summary: Create a new Expense Template
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Expense Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyLabel:
 *                 type: string
 *                 required: true
 *               approvalLevel:
 *                 type: string
 *                 required: true
 *               firstApprovalEmployee:
 *                 type: string
 *                 required: false
 *               secondApprovalEmployee:
 *                 type: string
 *                 required: false
 *               approvalType:
 *                 type: string
 *                 required: true
 *               downloadableFormats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 required: true
 *               advanceAmount:
 *                 type: boolean
 *               applyforSameCategorySamedate:
 *                 type: boolean
 *               expenseCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     expenseCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       201:
 *         description: Expense Template successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-templates', authController.protect, expenseController.createExpenseTemplate);

/**
 * @swagger
 * /api/v1/expense/expense-templates/{id}:
 *   get:
 *     summary: Get an Expense Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Template
 *     responses:
 *       200:
 *         description: Successful response with the Expense Template
 *       404:
 *         description: Expense Template not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-templates/:id', authController.protect, expenseController.getExpenseTemplate);

/**
 * @swagger
 * /api/v1/expense/expense-templates/{id}:
 *   put:
 *     summary: Update an Expense Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Template
 *     requestBody:
 *       description: New Expense Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyLabel:
 *                 type: string
 *               approvalLevel:
 *                 type: string
 *                 required: true
 *               firstApprovalEmployee:
 *                 type: string
 *                 required: false
 *               secondApprovalEmployee:
 *                 type: string
 *                 required: false
 *               approvalType:
 *                 type: string
 *               downloadableFormats:
 *                 type: array
 *                 items:
 *                   type: string
 *               advanceAmount:
 *                 type: boolean
 *               applyforSameCategorySamedate:
 *                 type: boolean
 *               expenseCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     expenseCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated Expense Template
 *       404:
 *         description: Expense Template not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-templates/:id', authController.protect, expenseController.updateExpenseTemplate);

/**
 * @swagger
 * /api/v1/expense/expense-templates/{id}:
 *   delete:
 *     summary: Delete an Expense Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Template
 *     responses:
 *       204:
 *         description: Expense Template successfully deleted
 *       404:
 *         description: Expense Template not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-templates/:id', authController.protect, expenseController.deleteExpenseTemplate);

/**
 * @swagger
 * /api/v1/expense/expense-templates:
 *   get:
 *     summary: Get all Expense Templates
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Expense Templates
 *       500:
 *         description: Internal server error
 */
router.get('/expense-templates', authController.protect, expenseController.getAllExpenseTemplates);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories:
 *   post:
 *     summary: Create a new ExpenseTemplateApplicableCategories
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: ExpenseTemplateApplicableCategories details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseTemplate:
 *                 type: string
 *                 required: true
 *               expenseCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     expenseCategory:
 *                       type: string
 *                       required: true
 *                     isMaximumAmountPerExpenseSet:
 *                       type: boolean
 *                       required: true
 *                       default: false
 *                     maximumAmountPerExpense:
 *                       type: number
 *                     isMaximumAmountWithoutReceiptSet:
 *                       type: boolean
 *                       required: true
 *                       default: false
 *                     maximumAmountWithoutReceipt:
 *                       type: number
 *                     maximumExpensesCanApply:
 *                       type: number
 *                     isTimePeroidSet:
 *                       type: boolean
 *                       required: true
 *                       default: false
 *                     timePeroid:
 *                       type: string
 *                     expiryDay:
 *                       type: number
 *                     isEmployeeCanAddInTotalDirectly:
 *                       type: boolean
 *                       required: true
 *                       default: false
 *                     ratePerDay:
 *                       type: number
 *                     fields:
 *                       type: array
 *                       items:
 *                        type: object
 *                        required: true
 *                        properties:
 *                           label:
 *                             type: string
 *                             required: true 
 *                           type:
 *                             type: string
 *                             required: true 
 *                           rate:
 *                             type: number
 *                             required: false 
 *                 description: Array of field objects
 *                 required: true
 *     responses:
 *       201:
 *         description: ExpenseTemplateApplicableCategories successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-template-applicable-categories', authController.protect, expenseController.createExpenseTemplateCategories);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories-by-template/{expenseTemplateId}:
 *   get:
 *     summary: Get an ExpenseTemplateApplicableCategories by expenseTemplateId
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: expenseTemplateId
 *         required: true
 *         schema:
 *           type: string
 *         description: expenseTemplateId of the ExpenseTemplateApplicableCategories
 *     responses:
 *       200:
 *         description: Successful response with the ExpenseTemplateApplicableCategories
 *       404:
 *         description: ExpenseTemplateApplicableCategories not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-template-applicable-categories-by-template/:expenseTemplateId',authController.protect, expenseController.getAllApplicableCategoriesByTemplateId);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories:
 *   get:
 *     summary: Get all ExpenseTemplateApplicableCategories
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with ExpenseTemplateApplicableCategories
 *       500:
 *         description: Internal server error
 */
router.get('/expense-template-applicable-categories', authController.protect, expenseController.getAllExpenseTemplateApplicableCategories);

/**
 * @swagger
 * /api/v1/expense/employee-expense-assignments:
 *   post:
 *     summary: Create a new EmployeeExpenseAssignment
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: EmployeeExpenseAssignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               expenseTemplate:
 *                 type: string
 *                 required: true
 *               primaryApprover:
 *                 type: string
 *                 required: false
 *               secondaryApprover:
 *                 type: string
 *                 required: false
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: EmployeeExpenseAssignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-expense-assignments', authController.protect, expenseController.createEmployeeExpenseAssignment);

/**
 * @swagger
 * /api/v1/expense/employee-expense-assignments-by-user/{userId}:
 *   get:
 *     summary: Get an EmployeeExpenseAssignment by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: userId of the User
 *     responses:
 *       200:
 *         description: Successful response with the EmployeeExpenseAssignment
 *       404:
 *         description: EmployeeExpenseAssignment not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-expense-assignments-by-user/:userId', authController.protect, expenseController.getEmployeeExpenseAssignmentByUser);

/**
 * @swagger
 * /api/v1/expense/employee-expense-applicable-setting/{userId}:
 *   get:
 *     summary: Get an Employee Expense Applicable Setting by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: userId of the User
 *     responses:
 *       200:
 *         description: Successful response with the Employee Expense Aplicable Setting
 *       404:
 *         description: Employee Expense Applicable Setting not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-expense-applicable-setting/:userId', authController.protect, expenseController.getApplicableExpenseSettingByUser);

/**
 * @swagger
 * /api/v1/expense/employee-expense-assignments/{id}:
 *   delete:
 *     summary: Delete an EmployeeExpenseAssignment by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the EmployeeExpenseAssignment
 *     responses:
 *       204:
 *         description: EmployeeExpenseAssignment successfully deleted
 *       404:
 *         description: EmployeeExpenseAssignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-expense-assignments/:id', authController.protect, expenseController.deleteEmployeeExpenseAssignment);

/**
 * @swagger
 * /api/v1/expense/employee-expense-assignments:
 *   get:
 *     summary: Get all EmployeeExpenseAssignments
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with EmployeeExpenseAssignments
 *       500:
 *         description: Internal server error
 */
router.get('/employee-expense-assignments', authController.protect, expenseController.getAllEmployeeExpenseAssignments);

/**
 * @swagger
 * /api/v1/expense/expense-reports:
 *   post:
 *     summary: Create a new ExpenseReport
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: ExpenseReport details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 required: true
 *               title:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string 
 *               expenseReportExpenses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     expenseCategory:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     incurredDate:
 *                       type: string
 *                       format: date
 *                       required: true
 *                     expenseTemplateCategoryFieldValues:
 *                       type: string
 *                       required: true
 *                     quantity:
 *                       type: number
 *                       description: quantity
 *                       required: true
 *                     type:
 *                       type: number
 *                       description: type
 *                       required: true
 *                     amount:
 *                       type: number
 *                       description: Name of the field
 *                       required: true
 *                     isReimbursable:
 *                       type: boolean
 *                       description: Name of the field
 *                       required: true
 *                     isBillable:
 *                       type: boolean
 *                       description: Name of the field
 *                       required: true
 *                     reason:
 *                       type: string
 *                       description: Name of the field
 *                       required: true
 *                     expenseAttachments:
 *                        type: array
 *                        items:
 *                          type: string
 *                          example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *                     expenseReportExpenseFields :
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           expenseApplicationField:
 *                             type: string
 *                             description: Field value
 *                             required: true
 *                           type:
 *                             type: string
 *                             description: Field value
 *                           value:
 *                             type: string
 *                             description: Field value
 *                             required: true
 *                       description: Array of field values
 *                 required: true
 *                 description: Array of field objects
 *     responses:
 *       201:
 *         description: ExpenseReport successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-reports', authController.protect, expenseController.createExpenseReport);

/**
 * @swagger
 * /api/v1/expense/expense-reports/{id}:
 *   get:
 *     summary: Get an ExpenseReport by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseReport
 *     responses:
 *       200:
 *         description: Successful response with the ExpenseReport
 *       404:
 *         description: ExpenseReport not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-reports/:id', authController.protect, expenseController.getExpenseReport);

/**
 * @swagger
 * /api/v1/expense/expense-reports-by-user/{userId}:
 *   get:
 *     summary: Get an ExpenseReport by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseReport
 *     responses:
 *       200:
 *         description: Successful response with the ExpenseReport
 *       404:
 *         description: ExpenseReport not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-reports-by-user/:userId', authController.protect, expenseController.getExpenseReportsByUser);


/**
 * @swagger
 * /api/v1/expense/expense-reports-by-team:
 *   get:
 *     summary: Get an ExpenseReport by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with the ExpenseReport
 *       404:
 *         description: ExpenseReport not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-reports-by-team', authController.protect, expenseController.getExpenseReportsByTeam);


/**
 * @swagger
 * /api/v1/expense/expense-reports/{id}:
 *   put:
 *     summary: Update an ExpenseReport by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseReport
 *     requestBody:
 *       description: New ExpenseReport details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string 
 *               primaryApprovalReason:
 *                 type: string 
 *               secondaryApprovalReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated ExpenseReport
 *       404:
 *         description: ExpenseReport not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-reports/:id', authController.protect, expenseController.updateExpenseReport);

/**
 * @swagger
 * /api/v1/expense/expense-reports/{id}:
 *   delete:
 *     summary: Delete an ExpenseReport by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseReport
 *     responses:
 *       204:
 *         description: ExpenseReport successfully deleted
 *       404:
 *         description: ExpenseReport not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-reports/:id', authController.protect, expenseController.deleteExpenseReport);

/**
 * @swagger
 * /api/v1/expense/expense-reports:
 *   get:
 *     summary: Get all ExpenseReports
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with ExpenseReports
 *       500:
 *         description: Internal server error
 */
router.get('/expense-reports', authController.protect, expenseController.getAllExpenseReports);

/**
 * @swagger
 * /api/v1/expense/expenseReportExpenses:
 *   post:
 *     summary: Create a new Expense Report Expense
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Expense Report Expense details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseReport:
 *                 type: string
 *                 description: ID of the expense report
 *               expenseCategory:
 *                 type: string
 *                 description: ID of the expense category
 *               incurredDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the expense was incurred
 *               expenseTemplateCategoryFieldValues:
 *                 type: string
 *                 required: true
 *               quantity:
 *                 type: number
 *                 description: quantity
 *                 required: true
 *               type:
 *                 type: number
 *                 description: type
 *                 required: true
 *               amount:
 *                 type: number
 *                 description: Name of the field
 *                 required: true
 *               isReimbursable:
 *                 type: boolean
 *                 description: Whether the expense is reimbursable or not
 *               isBillable:
 *                 type: boolean
 *                 description: Whether the expense is billable or not
 *               reason:
 *                 type: string
 *                 description: Reason for the expense
 *               expenseAttachments:
 *                  type: array
 *                  items:
 *                     type: string
 *                     example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *               expenseReportExpenseFields :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       expenseApplicationField:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       type:
 *                         type: string
 *                         description: Field value
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       201:
 *         description: Expense Report Expense successfully created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.post('/expenseReportExpenses', authController.protect, expenseController.createExpenseReportExpense);

/**
 * @swagger
 * /api/v1/expense/expenseReportExpenses/{id}:
 *   get:
 *     summary: Get an Expense Report Expense by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Report Expense
 *     responses:
 *       200:
 *         description: Successful response with the Expense Report Expense
 *       404:
 *         description: Expense Report Expense not found
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.get('/expenseReportExpenses/:id', authController.protect, expenseController.getExpenseReportExpense);

/**
 * @swagger
 * /api/v1/expense/expenseReportExpenses/{id}:
 *   put:
 *     summary: Update an Expense Report Expense by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Report Expense
 *     requestBody:
 *       description: New Expense Report Expense details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseCategory:
 *                 type: string
 *               incurredDate:
 *                 type: string
 *                 format: date
 *               expenseTemplateCategoryFieldValues:
 *                type: string
 *                 required: true
 *               quantity:
 *                 type: number
 *                 description: quantity
 *                 required: true
 *               type:
 *                 type: number
 *                 description: type
 *                 required: true
 *               amount:
 *                 type: number
 *                 description: Name of the field
 *                 required: true
 *               isReimbursable:
 *                 type: boolean
 *               isBillable:
 *                 type: boolean
 *               reason:
 *                 type: string
 *               expenseAttachments:
 *                  type: array
 *                  items:
 *                     type: string
 *                     example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *               expenseReportExpenseFields :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       expenseApplicationField:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       type:
 *                         type: string
 *                         description: Field value
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Successful response with the updated Expense Report Expense
 *       404:
 *         description: Expense Report Expense not found
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.put('/expenseReportExpenses/:id', authController.protect, expenseController.updateExpenseReportExpense);

/**
 * @swagger
 * /api/v1/expense/expenseReportExpenses/{id}:
 *   delete:
 *     summary: Delete an Expense Report Expense by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Report Expense
 *     responses:
 *       204:
 *         description: Expense Report Expense successfully deleted
 *       404:
 *         description: Expense Report Expense not found
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.delete('/expenseReportExpenses/:id', authController.protect, expenseController.deleteExpenseReportExpense);

/**
 * @swagger
 * /api/v1/expense/expenseReportExpenses:
 *   get:
 *     summary: Get all Expense Report Expenses
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Expense Report Expenses
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.get('/expenseReportExpenses', authController.protect, expenseController.getAllExpenseReportExpenses);


/**
 * @swagger
 * /api/v1/expense/expenseReportExpensesByExpenseReport/{expenseReportId}:
 *   get:
 *     summary: Get an Expense Report Expenses by expense Report Id
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: expenseReportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Expense Report
 *     responses:
 *       200:
 *         description: Successful response with the Expense Report Expense
 *       404:
 *         description: Expense Report Expense not found
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.get('/expenseReportExpensesByExpenseReport/:expenseReportId', authController.protect, expenseController.getAllExpenseReportExpensesByExpenseReport);


/**
 * @swagger
 * /api/v1/expense/advance:
 *   post:
 *     summary: Add a new Advance
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 required: true
 *               category:
 *                 type: string
 *                 description: ID of the expense category associated with the advance
 *               amount:
 *                 type: number
 *                 description: Amount of the advance
 *               comment:
 *                 type: string
 *                 description: Additional comments about the advance
 *     responses:
 *       201:
 *         description: Advance successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/advance', authController.protect, expenseController.createAdvance);

/**
 * @swagger
 * /api/v1/expense/advance/{id}:
 *   get:
 *     summary: Get an Advance by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Advance
 *     responses:
 *       200:
 *         description: Successful response with the Advance
 *       404:
 *         description: Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/advance/:id', authController.protect, expenseController.getAdvance);

/**
 * @swagger
 * /api/v1/expense/advance/{id}:
 *   put:
 *     summary: Update an Advance by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Advance
 *     requestBody:
 *       description: New Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 required: true
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               comment:
 *                 type: string
 *               Status:
 *                 type: string 
 *               primaryApprovalReason:
 *                 type: string 
 *               secondaryApprovalReason:
 *                 type: string                 
 *     responses:
 *       200:
 *         description: Successful response with the updated ExpenseAdvance
 *       404:
 *         description: ExpenseAdvance not found
 *       500:
 *         description: Internal server error
 */
router.put('/advance/:id', authController.protect, expenseController.updateAdvance);

/**
 * @swagger
 * /api/v1/expense/advance/{id}:
 *   delete:
 *     summary: Delete an ExpenseAdvance by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ExpenseAdvance
 *     responses:
 *       204:
 *         description: ExpenseAdvance successfully deleted
 *       404:
 *         description: ExpenseAdvance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/advance/:id', authController.protect, expenseController.deleteAdvance);

/**
 * @swagger
 * /api/v1/expense/advance:
 *   get:
 *     summary: Get all Advances
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with ExpenseAdvances
 *       500:
 *         description: Internal server error
 */
router.get('/advance', authController.protect, expenseController.getAllAdvances);

/**
 * @swagger
 * /api/v1/expense/advance-summary-by-employee/{userId}:
 *   get:
 *     summary: Get Advances Summary By Employee
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee
 *     responses:
 *       200:
 *         description: Successful response with advances
 *       500:
 *         description: Internal server error
 */
router.get('/advance-summary-by-employee/:userId', authController.protect, expenseController.getAdvanceSummaryByEmployee);

/**
 * @swagger
 * /api/v1/expense/advance-categories:
 *   post:
 *     summary: Create a new advance category
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Advance category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Advance category successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/advance-categories', authController.protect, expenseController.createAdvanceCategory);

/**
 * @swagger
 * /api/v1/expense/advance-categories/{id}:
 *   get:
 *     summary: Get an advance category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the advance category
 *     responses:
 *       200:
 *         description: Successful response with the advance category
 *       404:
 *         description: Advance category not found
 *       500:
 *         description: Internal server error
 */
router.get('/advance-categories/:id', authController.protect, expenseController.getAdvanceCategory);

/**
 * @swagger
 * /api/v1/expense/advance-categories-by-user/{userId}:
 *   get:
 *     summary: Get an advance category by employee ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the advance category
 *     responses:
 *       200:
 *         description: Successful response with the advance category
 *       404:
 *         description: Advance category not found
 *       500:
 *         description: Internal server error
 */
router.get('/advance-categories-by-user/:userId', authController.protect, expenseController.getAdvanceCategoryByEmployee);

/**
 * @swagger
 * /api/v1/expense/advance-categories/{id}:
 *   put:
 *     summary: Update an advance category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the advance category
 *     requestBody:
 *       description: New advance category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated advance category
 *       404:
 *         description: Advance category not found
 *       500:
 *         description: Internal server error
 */
router.put('/advance-categories/:id', authController.protect, expenseController.updateAdvanceCategory);

/**
 * @swagger
 * /api/v1/expense/advance-categories/{id}:
 *   delete:
 *     summary: Delete an advance category by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the advance category
 *     responses:
 *       204:
 *         description: Advance category successfully deleted
 *       404:
 *         description: Advance category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/advance-categories/:id', authController.protect, expenseController.deleteAdvanceCategory);

/**
 * @swagger
 * /api/v1/expense/advance-categories:
 *   get:
 *     summary: Get all advance categories
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with advance categories
 *       500:
 *         description: Internal server error
 */
router.get('/advance-categories', authController.protect, expenseController.getAllAdvanceCategories);

/**
 * @swagger
 * /api/v1/expense/advance-templates:
 *   post:
 *     summary: Create a new advance Template
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: advance Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyLabel:
 *                 type: string
 *                 required: true
 *               approvalLevel:
 *                 type: string
 *                 required: true
 *               firstApprovalEmployee:
 *                 type: string
 *                 required: false
 *               secondApprovalEmployee:
 *                 type: string
 *                 required: false
 *               approvalType:
 *                 type: string
 *                 required: true
 *               advanceCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     advanceCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       201:
 *         description: Advance Template successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/advance-templates', authController.protect, expenseController.createAdvanceTemplate);

/**
 * @swagger
 * /api/v1/expense/advance-templates/{id}:
 *   get:
 *     summary: Get an Advance Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Advance Template
 *     responses:
 *       200:
 *         description: Successful response with the Advance Template
 *       404:
 *         description: Advance Template not found
 *       500:
 *         description: Internal server error
 */
router.get('/advance-templates/:id', authController.protect, expenseController.getAdvanceTemplate);

/**
 * @swagger
 * /api/v1/expense/advance-templates/{id}:
 *   put:
 *     summary: Update an Advance Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Advance Template
 *     requestBody:
 *       description: New Advance Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyLabel:
 *                 type: string
 *               approvalLevel:
 *                 type: string
 *                 required: true
 *               firstApprovalEmployee:
 *                 type: string
 *                 required: false
 *               secondApprovalEmployee:
 *                 type: string
 *                 required: false
 *               approvalType:
 *                 type: string
 *               advanceCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     advanceCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated Advance Template
 *       404:
 *         description: Advance Template not found
 *       500:
 *         description: Internal server error
 */
router.put('/advance-templates/:id', authController.protect, expenseController.updateAdvanceTemplate);

/**
 * @swagger
 * /api/v1/expense/advance-templates/{id}:
 *   delete:
 *     summary: Delete an Advance Template by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Advance Template
 *     responses:
 *       204:
 *         description: Advance Template successfully deleted
 *       404:
 *         description: Advance Template not found
 *       500:
 *         description: Internal server error
 */
router.delete('/advance-templates/:id', authController.protect, expenseController.deleteAdvanceTemplate);

/**
 * @swagger
 * /api/v1/expense/advance-templates:
 *   get:
 *     summary: Get all Advance Templates
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Expense Templates
 *       500:
 *         description: Internal server error
 */
router.get('/advance-templates', authController.protect, expenseController.getAllAdvanceTemplates);

/**
 * @swagger
 * /api/v1/expense/employee-advance-assignments:
 *   post:
 *     summary: Create a new EmployeeAdvanceAssignment
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: EmployeeAdvanceAssignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               advanceTemplate:
 *                 type: string
 *                 required: true
 *               primaryApprover:
 *                 type: string
 *                 required: false
 *               secondaryApprover:
 *                 type: string
 *                 required: false
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: AdvanceExpenseAssignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-advance-assignments', authController.protect, expenseController.createEmployeeAdvanceAssignment);

/**
 * @swagger
 * /api/v1/expense/employee-advance-assignments-by-user/{userId}:
 *   get:
 *     summary: Get an EmployeeadvanceAssignment by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: userId of the User
 *     responses:
 *       200:
 *         description: Successful response with the EmployeeAdvanceAssignment
 *       404:
 *         description: EmployeeAdvanceAssignment not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-advance-assignments-by-user/:userId', authController.protect, expenseController.getEmployeeAdvanceAssignmentByUser);

/**
 * @swagger
 * /api/v1/expense/employee-advance-assignments/{id}:
 *   delete:
 *     summary: Delete an EmployeeAdvanceAssignment by ID
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the EmployeeAdvanceAssignment
 *     responses:
 *       204:
 *         description: EmployeeAdvanceAssignment successfully deleted
 *       404:
 *         description: EmployeeAdvanceAssignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-advance-assignments/:id', authController.protect, expenseController.deleteEmployeeAdvanceAssignment);

/**
 * @swagger
 * /api/v1/expense/employee-advance-assignments:
 *   get:
 *     summary: Get all EmployeeAdvanceAssignments
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with EmployeeAdvanceAssignments
 *       500:
 *         description: Internal server error
 */
router.get('/employee-advance-assignments', authController.protect, expenseController.getAllEmployeeAdvanceAssignments);

module.exports = router;
