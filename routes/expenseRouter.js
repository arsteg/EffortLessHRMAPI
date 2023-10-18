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
 *               fieldName:
 *                 type: string
 *                 description: Name of the field
 *                 required: true
 *               fieldType:
 *                 type: string
 *                 description: Type of the field (e.g., text, number, date)
 *                 required: true
 *               isMandatory:
 *                 type: boolean
 *                 description: Whether the field is mandatory or not
 *                 required: true
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
 * /api/v1/expense/expense-application-fields/{id}:
 *   get:
 *     summary: Get an expense application field by ID
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
 *       200:
 *         description: Successful response with the expense application field
 *       404:
 *         description: Expense application field not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-application-fields/:id', authController.protect, expenseController.getExpenseApplicationField);

/**
 * @swagger
 * /api/v1/expense/expense-application-fields/{id}:
 *   put:
 *     summary: Update an expense application field by ID
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
 *     requestBody:
 *       description: New expense application field details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *               fieldType:
 *                 type: string
 *               isMandatory:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated expense application field
 *       404:
 *         description: Expense application field not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-application-fields/:id', authController.protect, expenseController.updateExpenseApplicationField);

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
 * /api/v1/expense/expense-application-fields-by-expence-category/{expenseCategoryId}:
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
router.get('/expense-application-fields-by-expence-category/:expenseCategoryId', authController.protect, expenseController.getExpenseApplicationFieldsByCategory);

/**
 * @swagger
 * /api/v1/expense/expense-application-field-values:
 *   post:
 *     summary: Add a new ExpenseApplicationFieldValue
 *     tags: [Expense Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: ExpenseApplicationFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseApplicationField:
 *                 type: string
 *                 required: true
 *               Name:
 *                 type: string
 *               Type:
 *                 type: string
 *               Value:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: ExpenseApplicationFieldValue successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-application-field-values', authController.protect, expenseController.createExpenseApplicationFieldValue);

/**
 * @swagger
 * /api/v1/expense/expense-application-field-values/{id}:
 *   get:
 *     summary: Get an ExpenseApplicationFieldValue by ID
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
 *       200:
 *         description: Successful response with the ExpenseApplicationFieldValue
 *       404:
 *         description: ExpenseApplicationFieldValue not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-application-field-values/:id', authController.protect, expenseController.getExpenseApplicationFieldValue);

/**
 * @swagger
 * /api/v1/expense/expense-application-field-values/{id}:
 *   put:
 *     summary: Update an ExpenseApplicationFieldValue by ID
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
 *     requestBody:
 *       description: New ExpenseApplicationFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Type:
 *                 type: string
 *               Value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated ExpenseApplicationFieldValue
 *       404:
 *         description: ExpenseApplicationFieldValue not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-application-field-values/:id', authController.protect, expenseController.updateExpenseApplicationFieldValue);

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
 *               expenseCategory:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: ExpenseTemplateApplicableCategories successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/expense-template-applicable-categories', authController.protect, expenseController.createExpenseTemplateApplicableCategories);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories/{id}:
 *   get:
 *     summary: Get an ExpenseTemplateApplicableCategories by ID
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
 *         description: ID of the ExpenseTemplateApplicableCategories
 *     responses:
 *       200:
 *         description: Successful response with the ExpenseTemplateApplicableCategories
 *       404:
 *         description: ExpenseTemplateApplicableCategories not found
 *       500:
 *         description: Internal server error
 */
router.get('/expense-template-applicable-categories/:id',authController.protect, expenseController.getExpenseTemplateApplicableCategoriesById);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories/{id}:
 *   put:
 *     summary: Update an ExpenseTemplateApplicableCategories by ID
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
 *         description: ID of the ExpenseTemplateApplicableCategories
 *     requestBody:
 *       description: New ExpenseTemplateApplicableCategories details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expenseTemplate:
 *                 type: string
 *               expenseCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated ExpenseTemplateApplicableCategories
 *       404:
 *         description: ExpenseTemplateApplicableCategories not found
 *       500:
 *         description: Internal server error
 */
router.put('/expense-template-applicable-categories/:id',authController.protect, expenseController.updateExpenseTemplateApplicableCategories);

/**
 * @swagger
 * /api/v1/expense/expense-template-applicable-categories/{id}:
 *   delete:
 *     summary: Delete an ExpenseTemplateApplicableCategories by ID
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
 *         description: ID of the ExpenseTemplateApplicableCategories
 *     responses:
 *       204:
 *         description: ExpenseTemplateApplicableCategories successfully deleted
 *       404:
 *         description: ExpenseTemplateApplicableCategories not found
 *       500:
 *         description: Internal server error
 */
router.delete('/expense-template-applicable-categories/:id',authController.protect, expenseController.deleteExpenseTemplateApplicableCategories);

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
 *               approver:
 *                 type: string
 *                 required: true
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
 * /api/v1/expense/employee-expense-assignments/{id}:
 *   get:
 *     summary: Get an EmployeeExpenseAssignment by ID
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
 *       200:
 *         description: Successful response with the EmployeeExpenseAssignment
 *       404:
 *         description: EmployeeExpenseAssignment not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-expense-assignments/:id', authController.protect, expenseController.getEmployeeExpenseAssignment);

/**
 * @swagger
 * /api/v1/expense/employee-expense-assignments/{id}:
 *   put:
 *     summary: Update an EmployeeExpenseAssignment by ID
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
 *     requestBody:
 *       description: New EmployeeExpenseAssignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               expenseTemplate:
 *                 type: string
 *               approver:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated EmployeeExpenseAssignment
 *       404:
 *         description: EmployeeExpenseAssignment not found
 *       500:
 *         description: Internal server error
 */
router.put('/employee-expense-assignments/:id', authController.protect, expenseController.updateEmployeeExpenseAssignment);

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

module.exports = router;
