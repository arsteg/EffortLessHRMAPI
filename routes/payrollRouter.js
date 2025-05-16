const express = require('express');
const payrollController = require('../controllers/payrollController');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/payroll/general-settings:
 *   post:
 *     summary: Add a GeneralSetting
 *     tags: [Payroll Management]
 *     requestBody:
 *       description: GeneralSetting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfMonthToRunPayroll:
 *                 type: number
 *               payrollApprovar:
 *                 type: string
 *               attendanceCycle:
 *                 type: string
 *               dayOfMonthToStartAttendanceCycle:
 *                 type: number
 *               password:
 *                 type: string
 *               isPasswordForSalaryRegister:
 *                 type: boolean
 *               isGraduityEligible:
 *                 type: boolean
 *               percentageForGraduity:
 *                 type: string
 *               leaveEncashment:
 *                 type: array
 *                 items:
 *                   type: string
 *               graduityComponentsGraduitycalculation:
 *                 type: array
 *                 items:
 *                   type: string
 *               denominatorForCalculatingTheEncashment:
 *                 type: string
 *               payoutRolloverLeaveEncashmentForEmployees:
 *                 type: array
 *                 items:
 *                   type: string
 *               calculateLeaveRecovery:
 *                 type: array
 *                 items:
 *                   type: string
 *               denominatorForCalculatingTheLeaveRecovery:
 *                 type: array
 *                 items:
 *                   type: string
 *               recoverOutstandingIncomeTaxOfEmployees:
 *                 type: array
 *                 items:
 *                   type: string
 *               isNoticePeriodRecoveryApplicable:
 *                 type: boolean
 *               denominatorForCalculatingTheNoticeRecovery:
 *                 type: string
 *               isAllowTDSFromEffortlessHRM:
 *                 type: boolean
 *               isAllowNcpDaysApplicableInPF:
 *                 type: boolean
 *               isAllowToCalculateOvertime:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: GeneralSetting successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/general-settings', payrollController.createGeneralSetting);

/**
 * @swagger
 * /api/v1/payroll/general-settings/{companyId}:
 *   get:
 *     summary: Get a GeneralSetting by companyId
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSetting
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.get('/general-settings/:companyId', payrollController.getGeneralSettingByCompanyId);

/**
 * @swagger
 * /api/v1/payroll/general-settings/{companyId}:
 *   put:
 *     summary: Update a GeneralSetting
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     requestBody:
 *       description: New GeneralSetting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfMonthToRunPayroll:
 *                 type: number
 *               payrollApprovar:
 *                 type: string
 *               attendanceCycle:
 *                 type: string
 *               dayOfMonthToStartAttendanceCycle:
 *                 type: number
 *               password:
 *                 type: string
 *               isPasswordForSalaryRegister:
 *                 type: boolean
 *               isGraduityEligible:
 *                 type: boolean
 *               percentageForGraduity:
 *                 type: string
 *               leaveEncashment:
 *                 type: array
 *                 items:
 *                   type: string
 *               graduityComponentsGraduitycalculation:
 *                 type: array
 *                 items:
 *                   type: string
 *               denominatorForCalculatingTheEncashment:
 *                 type: string
 *               payoutRolloverLeaveEncashmentForEmployees:
 *                 type: array
 *                 items:
 *                   type: string
 *               calculateLeaveRecovery:
 *                 type: array
 *                 items:
 *                   type: string
 *               denominatorForCalculatingTheLeaveRecovery:
 *                 type: array
 *                 items:
 *                   type: string
 *               recoverOutstandingIncomeTaxOfEmployees:
 *                 type: array
 *                 items:
 *                   type: string
 *               isNoticePeriodRecoveryApplicable:
 *                 type: boolean
 *               denominatorForCalculatingTheNoticeRecovery:
 *                 type: string
 *               isAllowTDSFromEffortlessHRM:
 *                 type: boolean
 *               isAllowNcpDaysApplicableInPF:
 *                 type: boolean
 *               isAllowToCalculateOvertime:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated GeneralSetting
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.put('/general-settings/:companyId', payrollController.updateGeneralSetting);

/**
 * @swagger
 * /api/v1/payroll/general-settings/{companyId}:
 *   delete:
 *     summary: Delete a GeneralSetting
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       204:
 *         description: GeneralSetting successfully deleted
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.delete('/general-settings/:companyId', payrollController.deleteGeneralSetting);

/**
 * @swagger
 * /api/v1/payroll/rounding-rules:
 *   post:
 *     summary: Add a new rounding rule
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Rounding rule details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               generalSetting:
 *                 type: string
 *                 required: true
 *               name:
 *                 type: string
 *                 required: true
 *               roundingType:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Rounding rule successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/rounding-rules', authController.protect, payrollController.createRoundingRule);

/**
 * @swagger
 * /api/v1/payroll/rounding-rules/{id}:
 *   get:
 *     summary: Get a rounding rule by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding rule
 *     responses:
 *       200:
 *         description: Successful response with the rounding rule
 *       404:
 *         description: Rounding rule not found
 *       500:
 *         description: Internal server error
 */
router.get('/rounding-rules/:id', authController.protect, payrollController.getRoundingRuleById);

/**
 * @swagger
 * /api/v1/payroll/rounding-rules/{id}:
 *   put:
 *     summary: Update a rounding rule by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding rule
 *     requestBody:
 *       description: New rounding rule details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               generalSetting:
 *                 type: string
 *               name:
 *                 type: string
 *               roundingType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated rounding rule
 *       404:
 *         description: Rounding rule not found
 *       500:
 *         description: Internal server error
 */
router.put('/rounding-rules/:id', authController.protect, payrollController.updateRoundingRule);

/**
 * @swagger
 * /api/v1/payroll/rounding-rules/{id}:
 *   delete:
 *     summary: Delete a rounding rule by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding rule
 *     responses:
 *       204:
 *         description: Rounding rule successfully deleted
 *       404:
 *         description: Rounding rule not found
 *       500:
 *         description: Internal server error
 */
router.delete('/rounding-rules/:id', authController.protect, payrollController.deleteRoundingRule);

/**
 * @swagger
 * /api/v1/payroll/rounding-rules-list:
 *   post:
 *     summary: Get all rounding rules
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *     tags: [Payroll Management]
 *     responses:
 *       200:
 *         description: Successful response with rounding rules
 *       500:
 *         description: Internal server error
 */
router.post('/rounding-rules-list', authController.protect, payrollController.getAllRoundingRules);

/**
 * @swagger
 * /api/v1/payroll/pf-templates:
 *   post:
 *     summary: Add a PF Template
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PF Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *                 required: true
 *               allowanceApplicable:
 *                 type: array
 *                 items:
 *                   type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: PF Template successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/pf-templates', payrollController.createPFTemplate);

/**
 * @swagger
 * /api/v1/payroll/pf-templates/{id}:
 *   get:
 *     summary: Get a PF Template by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PF Template
 *     responses:
 *       200:
 *         description: Successful response with the PF Template
 *       404:
 *         description: PF Template not found
 *       500:
 *         description: Internal server error
 */
router.get('/pf-templates/:id', authController.protect, payrollController.getPFTemplate);

/**
 * @swagger
 * /api/v1/payroll/pf-templates/{id}:
 *   put:
 *     summary: Update a PF Template by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PF Template
 *     requestBody:
 *       description: New PF Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *               allowanceApplicable:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated PF Template
 *       404:
 *         description: PF Template not found
 *       500:
 *         description: Internal server error
 */
router.put('/pf-templates/:id', authController.protect, payrollController.updatePFTemplate);

/**
 * @swagger
 * /api/v1/payroll/pf-templates/{id}:
 *   delete:
 *     summary: Delete a PF Template by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PF Template
 *     responses:
 *       204:
 *         description: PF Template successfully deleted
 *       404:
 *         description: PF Template not found
 *       500:
 *         description: Internal server error
 */
router.delete('/pf-templates/:id', authController.protect, payrollController.deletePFTemplate);

/**
 * @swagger
 * /api/v1/payroll/pf-templates-by-company:
 *   post:
 *     summary: Get all PF Templates by company
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *         description: Successful response with PF Templates
 *       500:
 *         description: Internal server error
 */
router.post('/pf-templates-by-company', authController.protect, payrollController.getAllPFTemplatesByCompany);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances:
 *   post:
 *     summary: Add a new FixedAllowances
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: FixedAllowances details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               
 *               isProvidentFundAffected:
 *                 type: boolean
 *                 default: false
 *               isESICAffected:
 *                 type: boolean
 *                 default: false
 *               isGratuityFundAffected:
 *                 type: boolean
 *                 default: false
 *               isLWFAffected:
 *                 type: boolean
 *                 default: false
 *               isProfessionalTaxAffected:
 *                 type: boolean
 *                 default: false
 *               isTDSAffected:
 *                 type: boolean
 *                 default: false
 *              
 *     responses:
 *       201:
 *         description: FixedAllowances successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-allowances', authController.protect, payrollController.createFixedAllowances);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances/{id}:
 *   get:
 *     summary: Get a FixedAllowances by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FixedAllowances
 *     responses:
 *       200:
 *         description: Successful response with the FixedAllowances
 *       404:
 *         description: FixedAllowances not found
 *       500:
 *         description: Internal server error
 */
router.get('/fixed-allowances/:id', authController.protect, payrollController.getFixedAllowancesById);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances/{id}:
 *   put:
 *     summary: Update a FixedAllowances by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FixedAllowances
 *     requestBody:
 *       description: New FixedAllowances details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FixedAllowances'
 *     responses:
 *       200:
 *         description: Successful response with the updated FixedAllowances
 *       404:
 *         description: FixedAllowances not found
 *       500:
 *         description: Internal server error
 */
router.put('/fixed-allowances/:id', authController.protect, payrollController.updateFixedAllowances);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances/{id}:
 *   delete:
 *     summary: Delete a FixedAllowances by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FixedAllowances
 *     responses:
 *       204:
 *         description: FixedAllowances successfully deleted
 *       404:
 *         description: FixedAllowances not found
 *       500:
 *         description: Internal server error
 */
router.delete('/fixed-allowances/:id', authController.protect, payrollController.deleteFixedAllowances);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances-list:
 *   post:
 *     summary: Get all FixedAllowances
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *         description: Successful response with FixedAllowances
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-allowances-list', authController.protect, payrollController.getAllFixedAllowances);

/**
 * @swagger
 * /api/v1/payroll/fixed-contribution:
 *   post:
 *     summary: Add a new FixedContributions
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: FixedContributions details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               shortName:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: FixedContributions successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-contribution', authController.protect, payrollController.createFixedContribution);

/**
 * @swagger
 * /api/v1/payroll/fixed-contribution-list:
 *   post:
 *     summary: Get all FixedContributions
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *         description: Successful response with FixedAllowances
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-contribution-list', authController.protect, payrollController.getAllFixedContributions);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs:
 *   post:
 *     summary: Add a new Fixed Contribution Slab
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Fixed Contribution Slab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *               fixedContribution:
 *                 type: string
 *                 required: true
 *               employeeAmount:
 *                 type: number
 *                 required: true
 *               employerAmount:
 *                 type: number
 *                 required: true
 *               employeePercentage:
 *                 type: number
 *               employerPercentage:
 *                 type: number
 *               maxContribution:
 *                 type: number
 *               minAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Fixed Contribution Slab successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-contribution-slabs', authController.protect, payrollController.createFixedContributionSlab);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs/{id}:
 *   get:
 *     summary: Get a Fixed Contribution Slab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Contribution Slab
 *     responses:
 *       200:
 *         description: Successful response with the Fixed Contribution Slab
 *       404:
 *         description: Fixed Contribution Slab not found
 *       500:
 *         description: Internal server error
 */
router.get('/lwf-fixed-contribution-slabs/:id', authController.protect, payrollController.getFixedContributionSlab);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs/{id}:
 *   put:
 *     summary: Update a Fixed Contribution Slab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Contribution Slab
 *     requestBody:
 *       description: New Fixed Contribution Slab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fixedContribution:
 *                 type: string
 *               employeeAmount:
 *                 type: number
 *               employerAmount:
 *                 type: number
 *               employeePercentage:
 *                 type: number
 *               employerPercentage:
 *                 type: number
 *               maxContribution:
 *                 type: number
 *               minAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Fixed Contribution Slab
 *       404:
 *         description: Fixed Contribution Slab not found
 *       500:
 *         description: Internal server error
 */
router.put('/lwf-fixed-contribution-slabs/:id', authController.protect, payrollController.updateFixedContributionSlab);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs/{id}:
 *   delete:
 *     summary: Delete a Fixed Contribution Slab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Contribution Slab
 *     responses:
 *       204:
 *         description: Fixed Contribution Slab successfully deleted
 *       404:
 *         description: Fixed Contribution Slab not found
 *       500:
 *         description: Internal server error
 */
router.delete('/lwf-fixed-contribution-slabs/:id', authController.protect, payrollController.deleteFixedContributionSlab);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs-list:
 *   post:
 *     summary: Get all Fixed Contribution Slabs
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *         description: Successful response with Fixed Contribution Slabs
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-contribution-slabs-list', authController.protect, payrollController.getAllFixedContributionSlabs);
// routes/payrollRoutes.js

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs-list-by-state:
 *   post:
 *     summary: Get all Fixed Contribution Slabs
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *                         state:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with Fixed Contribution Slabs
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-contribution-slabs-list-by-state', authController.protect, payrollController.getAllFixedContributionSlabsByState);
// routes/payrollRoutes.js


/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-deduction-months: 
 *   post:
 *     summary: Add a LWFFixedDeductionnMonth
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: LWFFixedDeductionMonth details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMonth:
 *                 type: string
 *                 required: true
 *               processMonth:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: LWFFixedDeductionMonth successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-deduction-months', authController.protect, payrollController.createLWFFixedDeductionMonth);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-deduction-months-update:
 *   put:
 *     summary: Update a LWFFixedDeductionMonth
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: New LWFFixedDeductionMonth details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               months :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       paymentMonth:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       processMonth:
 *                         type: boolean
 *                         description: Field value
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Successful response with the updated LWFFixedContributionMonth
 *       404:
 *         description: LWFFixedContributionMonth not found
 *       500:
 *         description: Internal server error
 */
router.put('/lwf-fixed-deduction-months-update/', authController.protect, payrollController.saveLWFFixedDeductionMonth);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-deduction-months:
 *   get:
 *     summary: Get all LWFFixedDeductionMonths
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with LWFFixedDeductionMonths
 *       500:
 *         description: Internal server error
 */
router.get('/lwf-fixed-deduction-months', authController.protect, payrollController.getAllLWFFixedDeductionMonths);

/**
 * @swagger
 * /api/v1/payroll/pt-configure-states:
 *   post:
 *     summary: Create a new PTConfigureState
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PTConfigureState details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *               frequency:
 *                 type: string
 *     responses:
 *       201:
 *         description: PTConfigureState successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/pt-configure-states', authController.protect, payrollController.createPTConfigureState);

/**
 * @swagger
 * /api/v1/payroll/pt-configure-states/{id}:
 *   get:
 *     summary: Get a PTConfigureState by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTConfigureState
 *     responses:
 *       200:
 *         description: Successful response with the PTConfigureState
 *       404:
 *         description: PTConfigureState not found
 *       500:
 *         description: Internal server error
 */
router.get('/pt-configure-states/:id', authController.protect, payrollController.getPTConfigureState);

/**
 * @swagger
 * /api/v1/payroll/pt-configure-states/{id}:
 *   put:
 *     summary: Update a PTConfigureState by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTConfigureState
 *     requestBody:
 *       description: New PTConfigureState details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *               frequency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated PTConfigureState
 *       404:
 *         description: PTConfigureState not found
 *       500:
 *         description: Internal server error
 */
router.put('/pt-configure-states/:id', authController.protect, payrollController.updatePTConfigureState);

/**
 * @swagger
 * /api/v1/payroll/pt-configure-states/{id}:
 *   delete:
 *     summary: Delete a PTConfigureState by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTConfigureState
 *     responses:
 *       204:
 *         description: PTConfigureState successfully deleted
 *       404:
 *         description: PTConfigureState not found
 *       500:
 *         description: Internal server error
 */
router.delete('/pt-configure-states/:id', authController.protect, payrollController.deletePTConfigureState);

/**
 * @swagger
 * /api/v1/payroll/pt-configure-states-by-company:
 *   get:
 *     summary: Get all PTConfigureStates by company ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with PTConfigureStates
 *       404:
 *         description: PTConfigureStates not found
 *       500:
 *         description: Internal server error
 */
router.get('/pt-configure-states-by-company', authController.protect, payrollController.getAllPTConfigureStatesByCompany);

/**
 * @swagger
 * /api/v1/payroll/pt-eligible-states:
 *   put:
 *     summary: Update a PTEligibleStates
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: New PTEligibleStates details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               states :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       state:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       isEligible:
 *                         type: boolean
 *                         description: Field value
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Successful response with the updated PTEligibleStates
 *       404:
 *         description: PTEligibleStates not found
 *       500:
 *         description: Internal server error
 */
router.put('/pt-eligible-states/', authController.protect, payrollController.addUpdatePTEligibleStates);

/**
 * @swagger
 * /api/v1/payroll/pt-eligible-states:
 *   get:
 *     summary: Get all PTEligibleStates
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with PTEligibleStates
 *       500:
 *         description: Internal server error
 */
router.get('/pt-eligible-states', authController.protect, payrollController.getAllPTEligibleStates);

// Add a PTSlab
/**
 * @swagger
 * /api/v1/payroll/pt-slabs:
 *   post:
 *     summary: Add a PTSlab
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PTSlab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 required: true
 *               fromAmount:
 *                 type: string
 *                 required: true
 *               toAmount:
 *                 type: string
 *                 required: true
 *               employeePercentage:
 *                 type: number
 *                 required: true
 *               employeeAmount:
 *                 type: number
 *                 required: true
 *               twelfthMonthValue:
 *                 type: number
 *                 required: true
 *               twelfthMonthAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: PTSlab successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/pt-slabs', authController.protect, payrollController.addPTSlab);

// Get all state-wise pt slabs
router.get('/state-wise-pt-slabs', authController.protect, payrollController.getStateWisePTSlabs);

// Get all PTSlabs
/**
 * @swagger
 * /api/v1/payroll/pt-slabs-list:
 *   post:
 *     summary: Get all PTSlabs
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
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
 *         description: Successful response with PTSlabs
 *       500:
 *         description: Internal server error
 */
router.post('/pt-slabs-list', authController.protect, payrollController.getAllPTSlabs);

// Update PTSlab
/**
 * @swagger
 * /api/v1/payroll/pt-slabs/{id}:
 *   put:
 *     summary: Update a PTSlab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTSlab
 *     requestBody:
 *       description: New PTSlab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAmount:
 *                 type: string
 *               toAmount:
 *                 type: string
 *               employeePercentage:
 *                 type: number
 *               employeeAmount:
 *                 type: number
 *               twelfthMonthValue:
 *                 type: number
 *               twelfthMonthAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated PTSlab
 *       404:
 *         description: PTSlab not found
 *       500:
 *         description: Internal server error
 */
router.put('/pt-slabs/:id', authController.protect, payrollController.updatePTSlab);

// Get PTSlab by ID
/**
 * @swagger
 * /api/v1/payroll/pt-slabs/{id}:
 *   get:
 *     summary: Get a PTSlab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTSlab
 *     responses:
 *       200:
 *         description: Successful response with the PTSlab
 *       404:
 *         description: PTSlab not found
 *       500:
 *         description: Internal server error
 */
router.get('/pt-slabs/:id', authController.protect, payrollController.getPTSlabById);

// Delete PTSlab
/**
 * @swagger
 * /api/v1/payroll/pt-slabs/{id}:
 *   delete:
 *     summary: Delete a PTSlab by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PTSlab
 *     responses:
 *       204:
 *         description: PTSlab successfully deleted
 *       404:
 *         description: PTSlab not found
 *       500:
 *         description: Internal server error
 */
router.delete('/pt-slabs/:id', authController.protect, payrollController.deletePTSlab);

// Add a PTDeductionMonth
/**
 * @swagger
 * /api/v1/payroll/pt-deduction-months:
 *   post:
 *     summary: Add a new PT Deduction Month
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PT Deduction Month details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 required: true
 *               paymentMonth:
 *                 type: string
 *                 required: true
 *               processMonth:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: PT Deduction Month successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/pt-deduction-months', authController.protect, payrollController.addPTDeductionMonth);

// GetAll PTDeductionMonth
/**
 * @swagger
 * /api/v1/payroll/pt-deduction-months:
 *   get:
 *     summary: Get all PT Deduction Months
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with PT Deduction Months
 *       500:
 *         description: Internal server error
 */
router.get('/pt-deduction-months', authController.protect, payrollController.getAllPTDeductionMonths);

// GetbyId PTDeductionMonth
/**
 * @swagger
 * /api/v1/payroll/pt-deduction-months/{id}:
 *   get:
 *     summary: Get a PT Deduction Month by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PT Deduction Month
 *     responses:
 *       200:
 *         description: Successful response with the PT Deduction Month
 *       404:
 *         description: PT Deduction Month not found
 *       500:
 *         description: Internal server error
 */
router.get('/pt-deduction-months/:id', authController.protect, payrollController.getPTDeductionMonthById);

// Update PTDeductionMonth
/**
 * @swagger
 * /api/v1/payroll/pt-deduction-months/{id}:
 *   put:
 *     summary: Update a PT Deduction Month by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PT Deduction Month
 *     requestBody:
 *       description: New PT Deduction Month details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *               paymentMonth:
 *                 type: string
 *               processMonth:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated PT Deduction Month
 *       404:
 *         description: PT Deduction Month not found
 *       500:
 *         description: Internal server error
 */
router.put('/pt-deduction-months/:id', authController.protect, payrollController.updatePTDeductionMonth);

// delete PTDeductionMonth
/**
 * @swagger
 * /api/v1/payroll/pt-deduction-months/{id}:
 *   delete:
 *     summary: Delete a PT Deduction Month by ID
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PT Deduction Month
 *     responses:
 *       204:
 *         description: PT Deduction Month successfully deleted
 *       404:
 *         description: PT Deduction Month not found
 *       500:
 *         description: Internal server error
 */
router.delete('/pt-deduction-months/:id', authController.protect, payrollController.deletePTDeductionMonth);

/**
 * @swagger
 * /api/v1/payroll/esic-ceilingAmounts:
 *   post:
 *     summary: Add a CeilingAmount
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: CeilingAmount details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeCount:
 *                 type: number
 *                 required: true
 *               maxGrossAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: CeilingAmount successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/esic-ceilingAmounts', authController.protect, payrollController.createCeilingAmount);

/**
 * @swagger
 * /api/v1/payroll/esic-ceilingAmounts-by-company:
 *   post:
 *     summary: Get all CeilingAmounts by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with CeilingAmounts
 *       404:
 *         description: CeilingAmounts not found
 *       500:
 *         description: Internal server error
 */
router.post('/esic-ceilingAmounts-by-company', authController.protect, payrollController.getCeilingAmountsByCompany);

/**
 * @swagger
 * /api/v1/payroll/esic-ceilingAmounts/{id}:
 *   put:
 *     summary: Update a CeilingAmount
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CeilingAmount
 *     requestBody:
 *       description: New CeilingAmount details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeCount:
 *                 type: number
 *               maxGrossAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated CeilingAmount
 *       404:
 *         description: CeilingAmount not found
 *       500:
 *         description: Internal server error
 */
router.put('/esic-ceilingAmounts/:id', authController.protect, payrollController.updateCeilingAmount);

/**
 * @swagger
 * /api/v1/payroll/esic-ceilingAmounts/{id}:
 *   get:
 *     summary: Get a CeilingAmount by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CeilingAmount
 *     responses:
 *       200:
 *         description: Successful response with the CeilingAmount
 *       404:
 *         description: CeilingAmount not found
 *       500:
 *         description: Internal server error
 */
router.get('/esic-ceilingAmounts/:id', authController.protect, payrollController.getCeilingAmountById);

/**
 * @swagger
 * /api/v1/payroll/esic-ceilingAmounts/{id}:
 *   delete:
 *     summary: Delete a CeilingAmount
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CeilingAmount
 *     responses:
 *       204:
 *         description: CeilingAmount successfully deleted
 *       404:
 *         description: CeilingAmount not found
 *       500:
 *         description: Internal server error
 */
router.delete('/esic-ceilingAmounts/:id', authController.protect, payrollController.deleteCeilingAmount);

/**
 * @swagger
 * /api/v1/payroll/esicContributions:
 *   post:
 *     summary: Add a new ESIC contribution
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: ESIC contribution details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeePercentage:
 *                 type: number
 *                 required: true
 *               employerPercentage:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: ESIC contribution successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/esicContributions', authController.protect, payrollController.addESICContribution);

/**
 * @swagger
 * /api/v1/payroll/esicContributions-by-company:
 *   post:
 *     summary: Get all ESIC contributions by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with ESIC contributions
 *       404:
 *         description: ESIC contributions not found
 *       500:
 *         description: Internal server error
 */
router.post('/esicContributions-by-company', authController.protect, payrollController.getAllESICContributionsByCompany);

/**
 * @swagger
 * /api/v1/payroll/esicContributions/{id}:
 *   put:
 *     summary: Update an ESIC contribution by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ESIC contribution
 *     requestBody:
 *       description: New ESIC contribution details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeePercentage:
 *                 type: number
 *               employerPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated ESIC contribution
 *       404:
 *         description: ESIC contribution not found
 *       500:
 *         description: Internal server error
 */
router.put('/esicContributions/:id', authController.protect, payrollController.updateESICContribution);

/**
 * @swagger
 * /api/v1/payroll/esicContributions/{id}:
 *   get:
 *     summary: Get an ESIC contribution by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ESIC contribution
 *     responses:
 *       200:
 *         description: Successful response with the ESIC contribution
 *       404:
 *         description: ESIC contribution not found
 *       500:
 *         description: Internal server error
 */
router.get('/esicContributions/:id', authController.protect, payrollController.getESICContributionById);

/**
 * @swagger
 * /api/v1/payroll/esicContributions/{id}:
 *   delete:
 *     summary: Delete an ESIC contribution by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ESIC contribution
 *     responses:
 *       204:
 *         description: ESIC contribution successfully deleted
 *       404:
 *         description: ESIC contribution not found
 *       500:
 *         description: Internal server error
 */
router.delete('/esicContributions/:id', authController.protect, payrollController.deleteESICContribution);

/**
 * @swagger
 * /api/v1/payroll/variable-allowances:
 *   post:
 *     summary: Create a new variable allowance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Variable allowance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               allowanceRatePerDay:
 *                 type: number
 *                 required: true
 *               isPayrollEditable:
 *                 type: boolean
 *                 required: true
 *               isProvidentFundAffected:
 *                 type: boolean
 *                 required: true
 *               isESICAffected:
 *                 type: boolean
 *                 required: true
 *               isLWFAffected:
 *                 type: boolean
 *                 required: true
 *               isIncomeTaxAffected:
 *                 type: boolean
 *                 required: true
 *               isProfessionalTaxAffected:
 *                 type: boolean
 *                 required: true
 *               deductIncomeTaxAllowance:
 *                 type: string
 *                 required: true
 *               taxRegime:
 *                 type: array
 *                 items:
 *                   type: string
 *               isShowInCTCStructure:
 *                 type: boolean
 *                 required: true
 *               paidAllowanceFrequently:
 *                 type: string
 *                 required: true
 *               allowanceEffectiveFromMonth:
 *                 type: string
 *                 required: true
 *               allowanceEffectiveFromYear:
 *                 type: string
 *                 required: true
 *               isEndingPeriod:
 *                 type: boolean
 *                 required: true
 *               allowanceStopMonth:
 *                 type: string
 *               allowanceStopYear:
 *                 type: string
 *               amountEnterForThisVariableAllowance:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *               percentage:
 *                 type: number
 *               isAttandanceToAffectEligibility:
 *                 type: boolean
 *                 required: true
 *               variableAllowanceApplicableEmployee :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employee:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       201:
 *         description: Variable allowance successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/variable-allowances', authController.protect, payrollController.createVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/variable-allowances-by-company:
 *   post:
 *     summary: Get all variable allowances by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with variable allowances
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post('/variable-allowances-by-company', authController.protect, payrollController.getAllVariableAllowancesByCompany);

/**
 * @swagger
 * /api/v1/payroll/variable-allowances/{id}:
 *   get:
 *     summary: Get a variable allowance by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable allowance
 *     responses:
 *       200:
 *         description: Successful response with the variable allowance
 *       404:
 *         description: Variable allowance not found
 *       500:
 *         description: Internal server error
 */
router.get('/variable-allowances/:id', authController.protect, payrollController.getVariableAllowanceById);

/**
 * @swagger
 * /api/v1/payroll/variable-allowances/{id}:
 *   put:
 *     summary: Update a variable allowance by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable allowance
 *     requestBody:
 *       description: Updated variable allowance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               allowanceRatePerDay:
 *                 type: number
 *               isPayrollEditable:
 *                 type: boolean
 *               isProvidentFundAffected:
 *                 type: boolean
 *               isESICAffected:
 *                 type: boolean
 *               isLWFAffected:
 *                 type: boolean
 *               isIncomeTaxAffected:
 *                 type: boolean
 *               isProfessionalTaxAffected:
 *                 type: boolean
 *                 required: true
 *               deductIncomeTaxAllowance:
 *                 type: string
 *               taxRegime:
 *                 type: array
 *                 items:
 *                   type: string
 *               isShowInCTCStructure:
 *                 type: boolean
 *               paidAllowanceFrequently:
 *                 type: string
 *               allowanceEffectiveFromMonth:
 *                 type: string
 *               allowanceEffectiveFromYear:
 *                 type: string
 *               isEndingPeriod:
 *                 type: boolean
 *               allowanceStopMonth:
 *                 type: string
 *               allowanceStopYear:
 *                 type: string
 *               amountEnterForThisVariableAllowance:
 *                 type: string
 *               amount:
 *                 type: number
 *               percentage:
 *                 type: number
 *               isAttandanceToAffectEligibility:
 *                 type: boolean
 *               variableAllowanceApplicableEmployee :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employee:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Variable allowance successfully updated
 *       404:
 *         description: Variable allowance not found
 *       500:
 *         description: Internal server error
 */
router.put('/variable-allowances/:id', authController.protect, payrollController.updateVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/variable-allowances/{id}:
 *   delete:
 *     summary: Delete a variable allowance by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable allowance
 *     responses:
 *       204:
 *         description: Variable allowance successfully deleted
 *       404:
 *         description: Variable allowance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/variable-allowances/:id', authController.protect, payrollController.deleteVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/fixed-deductions:
 *   post:
 *     summary: Create a new Fixed Deduction
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Fixed Deduction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               isEffectAttendanceOnEligibility:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: Fixed Deduction successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-deductions', authController.protect, payrollController.createFixedDeduction);

/**
 * @swagger
 * /api/v1/payroll/fixed-deductions-by-company:
 *   post:
 *     summary: Get all Fixed Deductions by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with the Fixed Deductions
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-deductions-by-company', authController.protect, payrollController.getAllFixedDeductionsByCompany);

/**
 * @swagger
 * /api/v1/payroll/fixed-deductions/{id}:
 *   get:
 *     summary: Get a Fixed Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Deduction
 *     responses:
 *       200:
 *         description: Successful response with the Fixed Deduction
 *       404:
 *         description: Fixed Deduction not found
 *       500:
 *         description: Internal server error
 */
router.get('/fixed-deductions/:id', authController.protect, payrollController.getFixedDeductionById);

/**
 * @swagger
 * /api/v1/payroll/fixed-deductions/{id}:
 *   put:
 *     summary: Update a Fixed Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Deduction
 *     requestBody:
 *       description: New Fixed Deduction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               isEffectAttendanceOnEligibility:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Fixed Deduction
 *       404:
 *         description: Fixed Deduction not found
 *       500:
 *         description: Internal server error
 */
router.put('/fixed-deductions/:id', authController.protect, payrollController.updateFixedDeduction);

/**
 * @swagger
 * /api/v1/payroll/fixed-deductions/{id}:
 *   delete:
 *     summary: Delete a Fixed Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Fixed Deduction
 *     responses:
 *       204:
 *         description: Fixed Deduction successfully deleted
 *       404:
 *         description: Fixed Deduction not found
 *       500:
 *         description: Internal server error
 */
router.delete('/fixed-deductions/:id', authController.protect, payrollController.deleteFixedDeduction);


/**
 * @swagger
 * /api/v1/payroll/variable-deductions:
 *   post:
 *     summary: Add a new Variable Deduction
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Variable Deduction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               isShowINCTCStructure:
 *                 type: boolean
 *                 required: true
 *               paidDeductionFrequently:
 *                 type: string
 *                 required: true
 *               deductionEffectiveFromMonth:
 *                 type: string
 *                 required: true
 *               deductionEffectiveFromYear:
 *                 type: string
 *                 required: true
 *               isEndingPeriod:
 *                 type: boolean
 *                 required: true
 *               deductionStopMonth:
 *                 type: string
 *               deductionStopYear:
 *                 type: string
 *               amountEnterForThisVariableDeduction:
 *                 type: string
 *               amount:
 *                 type: number
 *                 required: true
 *               percentage:
 *                 type: number
 *                 required: true
 *               isAttendanceToAffectEligibility:
 *                 type: boolean
 *                 required: true
 *               variableDeductionApplicableEmployee :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employee:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       201:
 *         description: Variable deduction successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/variable-deductions', authController.protect, payrollController.createVariableDeduction);

/**
 * @swagger
 * /api/v1/payroll/variable-deductions-list:
 *   post:
 *     summary: Get all Variable Deductions
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with variable deductions
 *       500:
 *         description: Internal server error
 */
router.post('/variable-deductions-list', authController.protect, payrollController.getAllVariableDeductions);

/**
 * @swagger
 * /api/v1/payroll/variable-deductions/{id}:
 *   get:
 *     summary: Get a Variable Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable deduction
 *     responses:
 *       200:
 *         description: Successful response with the variable deduction
 *       404:
 *         description: Variable deduction not found
 *       500:
 *         description: Internal server error
 */
router.get('/variable-deductions/:id', authController.protect, payrollController.getVariableDeductionById);

/**
 * @swagger
 * /api/v1/payroll/variable-deductions/{id}:
 *   put:
 *     summary: Update a Variable Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable deduction
 *     requestBody:
 *       description: Updated variable deduction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               isShowINCTCStructure:
 *                 type: boolean
 *               paidDeductionFrequently:
 *                 type: string
 *               deductionEffectiveFromMonth:
 *                 type: string
 *               deductionEffectiveFromYear:
 *                 type: string
 *               isEndingPeriod:
 *                 type: boolean
 *               deductionStopMonth:
 *                 type: string
 *               deductionStopYear:
 *                 type: string
 *               amountEnterForThisVariableDeduction:
 *                 type: string
 *               amount:
 *                 type: number
 *               percentage:
 *                 type: number
 *               isAttendanceToAffectEligibility:
 *                 type: boolean
 *               variableDeductionApplicableEmployee :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employee:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Successful response with the updated variable deduction
 *       404:
 *         description: Variable deduction not found
 *       500:
 *         description: Internal server error
 */
router.put('/variable-deductions/:id', authController.protect, payrollController.updateVariableDeduction);

/**
 * @swagger
 * /api/v1/payroll/variable-deductions/{id}:
 *   delete:
 *     summary: Delete a Variable Deduction by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the variable deduction
 *     responses:
 *       204:
 *         description: Variable deduction successfully deleted
 *       404:
 *         description: Variable deduction not found
 *       500:
 *         description: Internal server error
 */
router.delete('/variable-deductions/:id', authController.protect, payrollController.deleteVariableDeduction);

/**
 * @swagger
 * /api/v1/payroll/other-benefits:
 *   post:
 *     summary: Add a new OtherBenefits
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: OtherBenefits details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               isEffectAttendanceOnEligibility:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: OtherBenefits successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/other-benefits', authController.protect, payrollController.createOtherBenefits);

/**
 * @swagger
 * /api/v1/payroll/other-benefits-by-company:
 *   post:
 *     summary: Get all OtherBenefits by Company ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with OtherBenefits
 *       404:
 *         description: OtherBenefits not found
 *       500:
 *         description: Internal server error
 */
router.post('/other-benefits-by-company', authController.protect, payrollController.getAllOtherBenefitsByCompany);

/**
 * @swagger
 * /api/v1/payroll/other-benefits/{id}:
 *   put:
 *     summary: Update OtherBenefits by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OtherBenefits ID
 *     requestBody:
 *       description: Updated OtherBenefits details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               isEffectAttendanceOnEligibility:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with updated OtherBenefits
 *       404:
 *         description: OtherBenefits not found
 *       500:
 *         description: Internal server error
 */
router.put('/other-benefits/:id', authController.protect, payrollController.updateOtherBenefits);

/**
 * @swagger
 * /api/v1/payroll/other-benefits/{id}:
 *   get:
 *     summary: Get OtherBenefits by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OtherBenefits ID
 *     responses:
 *       200:
 *         description: Successful response with OtherBenefits
 *       404:
 *         description: OtherBenefits not found
 *       500:
 *         description: Internal server error
 */
router.get('/other-benefits/:id', authController.protect, payrollController.getOtherBenefitsById);

/**
 * @swagger
 * /api/v1/payroll/other-benefits/{id}:
 *   delete:
 *     summary: Delete OtherBenefits by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OtherBenefits ID
 *     responses:
 *       204:
 *         description: OtherBenefits successfully deleted
 *       404:
 *         description: OtherBenefits not found
 *       500:
 *         description: Internal server error
 */
router.delete('/other-benefits/:id', authController.protect, payrollController.deleteOtherBenefits);

/**
 * @swagger
 * /api/v1/payroll/loan-advances-category:
 *   post:
 *     summary: Add a Loan Advances Category
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Loan Advances Category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Loan Advances Category successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/loan-advances-category', authController.protect, payrollController.addLoanAdvancesCategory);

/**
 * @swagger
 * /api/v1/payroll/loan-advances-category-by-company:
 *   post:
 *     summary: Get all Loan Advances Categories by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with Loan Advances Categories
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post('/loan-advances-category-by-company', authController.protect, payrollController.getAllLoanAdvancesCategoriesByCompany);

/**
 * @swagger
 * /api/v1/payroll/loan-advances-category/{id}:
 *   get:
 *     summary: Get a Loan Advances Category by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Loan Advances Category
 *     responses:
 *       200:
 *         description: Successful response with the Loan Advances Category
 *       404:
 *         description: Loan Advances Category not found
 *       500:
 *         description: Internal server error
 */
router.get('/loan-advances-category/:id', authController.protect, payrollController.getLoanAdvancesCategoryById);

/**
 * @swagger
 * /api/v1/payroll/loan-advances-category/{id}:
 *   put:
 *     summary: Update a Loan Advances Category by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Loan Advances Category
 *     requestBody:
 *       description: Updated Loan Advances Category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Loan Advances Category
 *       404:
 *         description: Loan Advances Category not found
 *       500:
 *         description: Internal server error
 */
router.put('/loan-advances-category/:id', authController.protect, payrollController.updateLoanAdvancesCategory);

/**
 * @swagger
 * /api/v1/payroll/loan-advances-category/{id}:
 *   delete:
 *     summary: Delete a Loan Advances Category by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Loan Advances Category
 *     responses:
 *       204:
 *         description: Loan Advances Category successfully deleted
 *       404:
 *         description: Loan Advances Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/loan-advances-category/:id', authController.protect, payrollController.deleteLoanAdvancesCategory);

// Swagger annotations
/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-category:
 *   post:
 *     summary: Add a new FlexiBenefitsCategory
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: FlexiBenefitsCategory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: FlexiBenefitsCategory successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/flexi-benefits-category', authController.protect, payrollController.createFlexiBenefitsCategory);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-category-by-company:
 *   post:
 *     summary: Get all FlexiBenefitsCategory by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with FlexiBenefitsCategories
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post('/flexi-benefits-category-by-company', authController.protect, payrollController.getAllFlexiBenefitsCategoryByCompany);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-category/{id}:
 *   put:
 *     summary: Update a FlexiBenefitsCategory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FlexiBenefitsCategory
 *     requestBody:
 *       description: New FlexiBenefitsCategory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated FlexiBenefitsCategory
 *       404:
 *         description: FlexiBenefitsCategory not found
 *       500:
 *         description: Internal server error
 */
router.put('/flexi-benefits-category/:id', authController.protect, payrollController.updateFlexiBenefitsCategory);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-category/{id}:
 *   get:
 *     summary: Get a FlexiBenefitsCategory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FlexiBenefitsCategory
 *     responses:
 *       200:
 *         description: Successful response with the FlexiBenefitsCategory
 *       404:
 *         description: FlexiBenefitsCategory not found
 *       500:
 *         description: Internal server error
 */
router.get('/flexi-benefits-category/:id', authController.protect, payrollController.getFlexiBenefitsCategoryById);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-category/{id}:
 *   delete:
 *     summary: Delete a FlexiBenefitsCategory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FlexiBenefitsCategory
 *     responses:
 *       204:
 *         description: FlexiBenefitsCategory successfully deleted
 *       404:
 *         description: FlexiBenefitsCategory not found
 *       500:
 *         description: Internal server error
 */
router.delete('/flexi-benefits-category/:id', authController.protect, payrollController.deleteFlexiBenefitsCategory);

/**
 * @swagger
 * /api/v1/payroll/pf-charge:
 *   post:
 *     summary: Add a new PF Charge
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PF Charge details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               frequency:
 *                 type: string
 *                 required: true
 *                 enum: ['monthly', 'quarterly', 'annually']
 *               percentage:
 *                 type: number
 *                 required: true
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       201:
 *         description: PF Charge successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/pf-charge', authController.protect, payrollController.createPFCharge);

/**
 * @swagger
 * /api/v1/payroll/pf-charge-by-company:
 *   post:
 *     summary: Get all PF Charges by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with all PF Charges
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.post('/pf-charge-by-company', authController.protect, payrollController.getPFChargesByCompany);

/**
 * @swagger
 * /api/v1/payroll/ctc-templates:
 *   post:
 *     summary: Create a new CTCTemplate
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: New CTCTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ctcTemplateFixedAllowance:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedAllowance:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateFixedDeduction:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateVariableAllowance:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       variableAllowance:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateVariableDeduction:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       variableDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateEmployerContribution:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedContribution:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateOtherBenefitAllowance:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       otherBenefit:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateEmployeeDeduction:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employeeDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       201:
 *         description: CTCTemplate successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/ctc-templates', authController.protect, payrollController.createCTCTemplate);

/**
 * @swagger
 * /api/v1/payroll/ctc-templates-by-company:
 *   post:
 *     summary: Get all CTCTemplates by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *         description: Successful response with CTCTemplates
 *       500:
 *         description: Internal server error
 */
router.post('/ctc-templates-by-company', authController.protect, payrollController.getAllCTCTemplatesByCompany);

/**
 * @swagger
 * /api/v1/payroll/ctc-templates/{id}:
 *   get:
 *     summary: Get a CTCTemplate by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CTCTemplate
 *     responses:
 *       200:
 *         description: Successful response with the CTCTemplate
 *       404:
 *         description: CTCTemplate not found
 *       500:
 *         description: Internal server error
 */
router.get('/ctc-templates/:id', authController.protect, payrollController.getCTCTemplateById);

/**
 * @swagger
 * /api/v1/payroll/ctc-templates/{id}:
 *   put:
 *     summary: Update a CTCTemplate by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CTCTemplate
 *     requestBody:
 *       description: New CTCTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ctcTemplateFixedAllowance :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedAllowance:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: number
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateFixedDeduction :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: number
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateVariableAllowance:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       variableAllowance:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateVariableDeduction:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       variableDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       criteria:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: number
 *                         description: Field value
 *                         required: true
 *                       valueType:
 *                         type: string
 *                         description: Field value
 *                       minimumAmount:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateEmployerContribution :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       fixedContribution:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateOtherBenefitAllowance:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       otherBenefit:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *               ctcTemplateEmployeeDeduction :
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                       employeeDeduction:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                       value:
 *                         type: string
 *                         description: Field value
 *                         required: true
 *                  description: Array of field values
 *     responses:
 *       200:
 *         description: Successful response with the updated CTCTemplate
 *       404:
 *         description: CTCTemplate not found
 *       500:
 *         description: Internal server error
 */
router.put('/ctc-templates/:id', authController.protect, payrollController.updateCTCTemplateById);

/**
 * @swagger
 * /api/v1/payroll/ctc-templates/{id}:
 *   delete:
 *     summary: Delete a CTCTemplate by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CTCTemplate
 *     responses:
 *       204:
 *         description: CTCTemplate successfully deleted
 *       404:
 *         description: CTCTemplate not found
 *       500:
 *         description: Internal server error
 */
router.delete('/ctc-templates/:id', authController.protect, payrollController.deleteCTCTemplateById);

/**
 * @swagger
 * /api/v1/payroll:
 *   post:
 *     summary: Add a new payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: ['InProgress', 'Complete Approval Pending', 'OnHold', 'Processed']
 *               month:
 *                 type: string
 *               year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payroll successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', authController.protect, payrollController.addPayroll);

/**
 * @swagger
 * /api/v1/payroll/{id}:
 *   get:
 *     summary: Get payroll by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Payroll found
 *       404:
 *         description: Payroll not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authController.protect, payrollController.getPayroll);

/**
 * @swagger
 * /api/v1/payroll/{id}:
 *   put:
 *     summary: Update payroll by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     requestBody:
 *       description: Updated payroll details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updatedOnDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: ['InProgress', 'Complete Approval Pending', 'OnHold', 'Processed']
 *                 required: true
 *     responses:
 *       200:
 *         description: Payroll updated successfully
 *       404:
 *         description: Payroll not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authController.protect, payrollController.updatePayroll);

/**
 * @swagger
 * /api/v1/payroll/{id}:
 *   delete:
 *     summary: Delete payroll by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       204:
 *         description: Payroll successfully deleted
 *       404:
 *         description: Payroll not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authController.protect, payrollController.deletePayroll);

/**
 * @swagger
 * /api/v1/payroll/payroll-by-company:
 *   post:
 *     summary: Get all payrolls by company ID
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     tags: [Payroll Management]
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
 *         description: Payrolls retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-by-company', authController.protect, payrollController.getPayrollsByCompany);

/**
 * @swagger
 * /api/v1/payroll/users:
 *   post:
 *     summary: Add a PayrollUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PayrollUser details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payroll:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               totalFlexiBenefits:
 *                 type: number
 *                 required: true
 *               totalCTC:
 *                 type: number
 *                 required: true
 *               totalGrossSalary:
 *                 type: number
 *                 required: true
 *               totalTakeHome:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: [Active, OnHold, Processed]
 *                 required: true
 *     responses:
 *       201:
 *         description: PayrollUser successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/users', authController.protect, payrollController.createPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/users/{id}:
 *   get:
 *     summary: Get a PayrollUser by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollUser
 *     responses:
 *       200:
 *         description: Successful response with the PayrollUser
 *       404:
 *         description: PayrollUser not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id', authController.protect, payrollController.getPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/users/{id}:
 *   put:
 *     summary: Update a PayrollUser by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:  
 *           type: string
 *         description: ID of the PayrollUser
 *     requestBody:
 *       description: New PayrollUser details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payroll:
 *                 type: string
 *               user:
 *                 type: string
 *               totalFlexiBenefits:
 *                  type: number
 *                  required: true
 *               totalCTC:
 *                  type: number
 *                  required: true
 *               totalGrossSalary:
 *                  type: number
 *                  required: true
 *               totalTakeHome:
 *                  type: number
 *                  required: true
 *               status:
 *                  type: string
 *                  enum: [Active, OnHold, Processed]
 *                  required: true
 *               totalFixedAllowance:
 *                  type: number
 *               totalOtherBenefits:
 *                  type: number
 *               totalEmployeeStatutoryDeduction:
 *                  type: number
 *               totalEmployeeStatutoryContribution:
 *                  type: number
 *               totalFixedDeduction:
 *                  type: number
 *               totalVariableDeduction:
 *                  type: number
 *               totalLoan:
 *                  type: number
 *               totalAdvance:
 *                  type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated PayrollUser
 *       404:
 *         description: PayrollUser not found
 *       500:
 *         description: Internal server error
 */
router.put('/users/:id', authController.protect, payrollController.updatePayrollUser);

/**
 * @swagger
 * /api/v1/payroll/users/{id}:
 *   delete:
 *     summary: Delete a PayrollUser by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollUser
 *     responses:
 *       204:
 *         description: PayrollUser successfully deleted
 *       404:
 *         description: PayrollUser not found
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:id', authController.protect, payrollController.deletePayrollUser);

/**
 * @swagger
 * /api/v1/payroll/users-by-payroll:
 *   post:
 *     summary: Get all PayrollUsers by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *                         payroll:
 *                             type: string 
 *     responses:
 *       200:
 *         description: Successful response with PayrollUsers
 *       500:
 *         description: Internal server error
 */
router.post('/users-by-payroll', authController.protect, payrollController.getAllPayrollUsersByPayroll);

/**
 * @swagger
 * /api/v1/payroll/payrolluser-attendance-summary:
 *   post:
 *     summary: Add a PayrollAttendanceSummary
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Attendance Summary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *                 required: true
 *               totalDays:
 *                 type: number
 *                 required: true
 *               lopDays:
 *                 type: number
 *                 required: true
 *               payableDays:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: PayrollAttendanceSummary successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payrolluser-attendance-summary', authController.protect, payrollController.addPayrollAttendanceSummary);

/**
 * @swagger
 * /api/v1/payroll/payrolluser-attendance-summary-by-payrollUser/{payrollUser}:
 *   get:
 *     summary: Get a PayrollAttendanceSummary by payrollUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payrollUser
 *     responses:
 *       200:
 *         description: Successful response with the payroll attendance summary
 *       404:
 *         description: PayrollAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.get('/payrolluser-attendance-summary-by-payrollUser/:payrollUser', authController.protect, payrollController.getPayrollAttendanceSummaryByUser);

/**
 * @swagger
 * /api/v1/payroll/payrolluser-attendance-summary-by-payroll/{payroll}:
 *   get:
 *     summary: Get a PayrollAttendanceSummary by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payrollUser
 *     responses:
 *       200:
 *         description: Successful response with the payroll attendance summary
 *       404:
 *         description: PayrollAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.get('/payrolluser-attendance-summary-by-payroll/:payroll', authController.protect, payrollController.getPayrollAttendanceSummaryByPayroll);

/**
 * @swagger
 * /api/v1/payroll/payrolluser-attendance-summary/{id}:
 *   put:
 *     summary: Update a PayrollAttendanceSummary by Id
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Id
 *     requestBody:
 *       description: Updated Payroll Attendance Summary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalDays:
 *                 type: number
 *               lopDays:
 *                 type: number
 *               payableDays:
 *                 type: number
 *     responses:
 *       200:
 *         description: PayrollAttendanceSummary successfully updated
 *       404:
 *         description: PayrollAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.put('/payrolluser-attendance-summary/:id', authController.protect, payrollController.updatePayrollAttendanceSummary);

/**
 * @swagger
 * /api/v1/payroll/payroll-variable-pay:
 *   post:
 *     summary: Add a new Payroll Variable Pay
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Variable Pay details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *                 required: true
 *               variableDeduction:
 *                 type: string
 *               variableAllowance:
 *                 type: string
 *               amount:
 *                 type: number
 *                 required: true
 *               month:
 *                 type: string
 *                 required: true
 *               year:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Variable Pay successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-variable-pay', payrollController.addPayrollVariablePay);

/**
 * @swagger
 * /api/v1/payroll/payroll-variable-pay-by-payrolluser/{payrollUser}:
 *   get:
 *     summary: Get a Payroll Variable Pay by payrollUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: PayrollUser ID for which the Variable Pay is being retrieved
 *     responses:
 *       200:
 *         description: Successful response with Payroll Variable Pay
 *       404:
 *         description: Payroll Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-variable-pay-by-payrolluser/:payrollUser', payrollController.getPayrollVariablePayByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-variable-pay-by-payroll/{payroll}:
 *   get:
 *     summary: Get a Payroll Variable Pay by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Variable Pay
 *       404:
 *         description: Payroll Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-variable-pay-by-payroll/:payroll', authController.protect, payrollController.getPayrollVariablePayByPayroll);

/**
 * @swagger
 * /api/v1/payroll/payroll-variable-pay/{id}:
 *   put:
 *     summary: Update a Payroll Variable Pay by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Variable Pay
 *     requestBody:
 *       description: Updated Payroll Variable Pay details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *               variableDeduction:
 *                 type: string
 *               variableAllowance:
 *                 type: string
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *               year:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll Variable Pay
 *       404:
 *         description: Payroll Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-variable-pay/:id', payrollController.updatePayrollVariablePay);

/**
 * @swagger
 * /api/v1/payroll/payroll-variable-pay/{id}:
 *   delete:
 *     summary: Delete a Payroll Variable Pay by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Variable Pay
 *     responses:
 *       204:
 *         description: Payroll Variable Pay successfully deleted
 *       404:
 *         description: Payroll Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-variable-pay/:id', payrollController.deletePayrollVariablePay);

// Payroll Manual Arrears routes
/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears:
 *   post:
 *     summary: Create a new Payroll Manual Arrears entry
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Manual Arrears details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *                 required: true
 *               manualArrears:
 *                 type: number
 *                 required: true
 *               arrearDays:
 *                 type: number
 *                 required: true
 *               lopReversalDays:
 *                 type: number
 *                 required: true
 *               salaryRevisionDays:
 *                 type: number
 *                 required: true
 *               lopReversalArrears:
 *                 type: number
 *                 required: true
 *               totalArrears:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Manual Arrears successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-manual-arrears/', authController.protect, payrollController.createPayrollManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears/{id}:
 *   get:
 *     summary: Get Payroll Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Manual Arrears
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Manual Arrears details
 *       404:
 *         description: Payroll Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-manual-arrears/:id', authController.protect, payrollController.getPayrollManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears-by-payrolluser/{payrollUser}:
 *   get:
 *     summary: Get all Payroll Manual Arrears
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Manual Arrears
 *     responses:
 *       200:
 *         description: Successful response with Payroll Manual Arrears entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-manual-arrears-by-payrolluser/:payrollUser', authController.protect, payrollController.getAllPayrollManualArrearsByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears-by-payroll/{payroll}:
 *   get:
 *     summary: Get a Payroll Payroll Manual Arrears
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Manual Arrears
 *       404:
 *         description: Payroll Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-manual-arrears-by-payroll/:payroll', authController.protect, payrollController.getAllPayrollManualArrearsByPayroll);

/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears/{id}:
 *   put:
 *     summary: Update Payroll Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Manual Arrears
 *     requestBody:
 *       description: New Payroll Manual Arrears details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *               manualArrears:
 *                 type: number
 *               arrearDays:
 *                 type: number
 *               lopReversalDays:
 *                 type: number
 *               salaryRevisionDays:
 *                 type: number
 *               lopReversalArrears:
 *                 type: number
 *               totalArrears:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll Manual Arrears
 *       404:
 *         description: Payroll Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-manual-arrears/:id', authController.protect, payrollController.updatePayrollManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-manual-arrears/{id}:
 *   delete:
 *     summary: Delete Payroll Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Manual Arrears
 *     responses:
 *       204:
 *         description: Payroll Manual Arrears successfully deleted
 *       404:
 *         description: Payroll Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-manual-arrears/:id', authController.protect, payrollController.deletePayrollManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-loan-advance:
 *   post:
 *     summary: Add a new Payroll Loan/Advance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Loan/Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *                 required: true
 *               loanAndAdvance:
 *                 type: string
 *                 required: true
 *               type:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *                 required: true
 *               disbursementAmount:
 *                 type: number
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: [Pending, Approved]
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Loan/Advance successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-loan-advance/', authController.protect, payrollController.addPayrollLoanAdvance);

/**
 * @swagger
 * /api/v1/payroll/payroll-loan-advance-by-payrolluser/{payrollUser}:
 *   get:
 *     summary: Get Payroll Loan/Advance by payrollUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll user
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Loan/Advance details
 *       404:
 *         description: Payroll Loan/Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-loan-advance-by-payrolluser/:payrollUser', authController.protect, payrollController.getPayrollLoanAdvanceByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-loan-advance-by-payroll/{payroll}:
 *   get:
 *     summary: Get a payroll loan advance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the payroll loan advance
 *       404:
 *         description: payroll loan advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-loan-advance-by-payroll/:payroll', authController.protect, payrollController.getPayrollLoanAdvanceByPayroll);

/**
 * @swagger
 * /api/v1/payroll/payroll-loan-advance/{id}:
 *   delete:
 *     summary: Delete a Payroll Loan/Advance by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Loan/Advance
 *     responses:
 *       204:
 *         description: Payroll Loan/Advance successfully deleted
 *       404:
 *         description: Payroll Loan/Advance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-loan-advance/:id', authController.protect, payrollController.deletePayrollLoanAdvance);


/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax:
 *   post:
 *     summary: Create a new Payroll Flexi Benefits and PF Tax record
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Flexi Benefits and PF Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser1:
 *                 type: string
 *                 required: true
 *               TotalFlexiBenefitAmount:
 *                 type: number
 *                 required: true
 *               TotalProfessionalTaxAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Flexi Benefits and PF Tax record successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/flexi-benefits-pf-tax/', authController.protect, payrollController.createFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax/{id}:
 *   get:
 *     summary: Get a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     responses:
 *       200:
 *         description: Successful response with the record details
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.get('/flexi-benefits-pf-tax/:id', authController.protect, payrollController.getFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax-by-payrolluser/{payrollUser}:
 *   get:
 *     summary: Get all Payroll Flexi Benefits and PF Tax records
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll user
 *     responses:
 *       200:
 *         description: Successful response with all records
 *       500:
 *         description: Internal server error
 */
router.get('/flexi-benefits-pf-tax-by-payrolluser/:payrollUser', authController.protect, payrollController.getAllFlexiBenefitsAndPFTaxByPyrollUser);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax-by-payroll/{payroll}:
 *   get:
 *     summary: Get a flexi-benefits-pf-tax by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the flexi-benefits-pf-tax
 *       404:
 *         description: flexi-benefits-pf-tax not found
 *       500:
 *         description: Internal server error
 */
router.get('/flexi-benefits-pf-tax-by-payroll/:payroll', authController.protect, payrollController.getAllFlexiBenefitsAndPFTaxByPyroll);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax/{id}:
 *   put:
 *     summary: Update a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     requestBody:
 *       description: Updated Flexi Benefits and PF Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TotalFlexiBenefitAmount:
 *                 type: number
 *               TotalProfessionalTaxAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated record
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.put('/flexi-benefits-pf-tax/:id', authController.protect, payrollController.updateFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/flexi-benefits-pf-tax/{id}:
 *   delete:
 *     summary: Delete a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     responses:
 *       204:
 *         description: Record successfully deleted
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/flexi-benefits-pf-tax/:id', authController.protect, payrollController.deleteFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/overtime:
 *   post:
 *     summary: Add a new Payroll Overtime entry
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Overtime details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser2:
 *                 type: string
 *                 required: true
 *               LateComing:
 *                 type: string
 *                 required: true
 *               EarlyGoing:
 *                 type: string
 *                 required: true
 *               FinalOvertime:
 *                 type: string
 *                 required: true
 *               OvertimeAmount:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Overtime successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/overtime/', authController.protect, payrollController.createPayrollOvertime);

/**
 * @swagger
 * /api/v1/payroll/overtime/{id}:
 *   get:
 *     summary: Get Payroll Overtime by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime details
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.get('/overtime/:id', authController.protect, payrollController.getPayrollOvertime);

/**
 * @swagger
 * /api/v1/payroll/overtime/{id}:
 *   put:
 *     summary: Update Payroll Overtime by ID
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     requestBody:
 *       description: Updated Payroll Overtime details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               LateComing:
 *                 type: string
 *               EarlyGoing:
 *                 type: string
 *               FinalOvertime:
 *                 type: string
 *               OvertimeAmount:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll Overtime successfully updated
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.put('/overtime/:id', authController.protect, payrollController.updatePayrollOvertime);

/**
 * @swagger
 * /api/v1/payroll/overtime/{id}:
 *   delete:
 *     summary: Delete Payroll Overtime by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     responses:
 *       204:
 *         description: Payroll Overtime successfully deleted
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.delete('/overtime/:id', authController.protect, payrollController.deletePayrollOvertime);

/**
 * @swagger
 * /api/v1/payroll/overtime-by-payrollUser/{payrollUser}:
 *   get:
 *     summary: Get all Payroll Overtime entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll User
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime entries
 *       500:
 *         description: Internal server error
 */
router.get('/overtime-by-payrollUser/:payrollUser', authController.protect, payrollController.getAllPayrollOvertimeByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/overtime-by-payroll/{payroll}:
 *   get:
 *     summary: Get all Payroll Overtime entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime entries
 *       500:
 *         description: Internal server error
 */
router.get('/overtime-by-payroll/:payroll', authController.protect, payrollController.getAllPayrollOvertimeByPayroll);


// Payroll Income Tax routes

/**
 * @swagger
 * /api/v1/payroll/incomeTax:
 *   post:
 *     summary: Create a new Payroll Income Tax record
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Income Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser3:
 *                 type: string
 *                 required: true
 *               TaxCalculatedMethod:
 *                 type: string
 *                 required: true
 *               TaxCalculated:
 *                 type: number
 *                 required: true
 *               TDSCalculated:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Income Tax record successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/incomeTax/', authController.protect, payrollController.createPayrollIncomeTax);

/**
 * @swagger
 * /api/v1/payroll/incomeTax/{id}:
 *   get:
 *     summary: Get a Payroll Income Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Income Tax record
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.get('/incomeTax/:id', authController.protect, payrollController.getPayrollIncomeTaxById);

/**
 * @swagger
 * /api/v1/payroll/incomeTax-by-payrollUser/{payrollUser}:
 *   get:
 *     summary: Get all Payroll Income Tax records
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       200:
 *         description: Successful response with Payroll Income Tax records
 *       500:
 *         description: Internal server error
 */
router.get('/incomeTax-by-payrollUser/:payrollUser', authController.protect, payrollController.getAllPayrollIncomeTaxByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/incomeTax-by-payroll/{payroll}:
 *   get:
 *     summary: Get all Payroll incomeTax entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll
 *     responses:
 *       200:
 *         description: Successful response with Payroll incomeTax entries
 *       500:
 *         description: Internal server error
 */
router.get('/incomeTax-by-payroll/:payroll', authController.protect, payrollController.getAllPayrollIncomeTaxByPayroll);

/**
 * @swagger
 * /api/v1/payroll/incomeTax/{id}:
 *   put:
 *     summary: Update a Payroll Income Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     requestBody:
 *       description: New Payroll Income Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser:
 *                 type: string
 *               TaxCalculatedMethod:
 *                 type: string
 *               TaxCalculated:
 *                 type: number
 *               TDSCalculated:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll Income Tax record
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.put('/incomeTax/:id', authController.protect, payrollController.updatePayrollIncomeTax);

/**
 * @swagger
 * /api/v1/payroll/incomeTax/{id}:
 *   delete:
 *     summary: Delete a Payroll Income Tax record by ID
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       204:
 *         description: Payroll Income Tax record successfully deleted
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/incomeTax/:id', authController.protect, payrollController.deletePayrollIncomeTax);

/**
 * @swagger
 * /api/v1/payroll/generatedPayroll-by-company:
 *   post:
 *     summary: Get a generatedPayroll by company
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with the generatedPayroll
 *       404:
 *         description: generatedPayroll not found
 *       500:
 *         description: Internal server error
 */
router.post('/generatedPayroll-by-company', authController.protect, payrollController.getAllGeneratedPayroll);

/**
 * @swagger
 * /api/v1/payroll/generatedPayroll-by-payroll/{payroll}:
 *   get:
 *     summary: get generated payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll
 *     responses:
 *       200:
 *         description: Successful response with Generated Payroll entries
 *       500:
 *         description: Internal server error
 */
router.get('/generatedPayroll-by-payroll/:payroll', authController.protect, payrollController.getAllGeneratedPayrollByPayrollId);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory:
 *   post:
 *     summary: Add a new payroll statutory entry
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll statutory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollUser:
 *                 type: string
 *                 required: true
 *               fixedContribution:
 *                 type: string
 *               fixedDeduction:
 *                 type: string
 *               ContributorType:
 *                 type: string
 *               StautoryName:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *                 required: true
 *               month:
 *                 type: string
 *                 required: true
 *               year:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll statutory successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-statutory', authController.protect, payrollController.createPayrollStatutory);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory/{id}:
 *   put:
 *     summary: Update a payroll statutory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll statutory
 *     requestBody:
 *       description: Updated payroll statutory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fixedContribution:
 *                 type: string
 *               fixedDeduction:
 *                 type: string
 *               ContributorType:
 *                 type: string
 *               StautoryName:
 *                 type: string
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *               year:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated payroll statutory
 *       404:
 *         description: Payroll statutory not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-statutory/:id', authController.protect, payrollController.updatePayrollStatutory);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory-by-company:
 *   get:
 *     summary: Get all payroll statutory entries by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with payroll statutory entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-statutory-by-company', authController.protect, payrollController.getAllPayrollStatutoryByCompany);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory-by-payrollUser/{payrollUser}:
 *   get:
 *     summary: Get all payroll statutory entries by payroll user
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll user
 *     responses:
 *       200:
 *         description: Successful response with payroll statutory entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-statutory-by-payrollUser/:payrollUser', authController.protect, payrollController.getAllPayrollStatutoryByPayrollUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory/{id}:
 *   get:
 *     summary: Get payroll statutory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll statutory
 *     responses:
 *       200:
 *         description: Successful response with the payroll statutory
 *       404:
 *         description: Payroll statutory not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-statutory/:id', authController.protect, payrollController.getPayrollStatutoryById);

/**
 * @swagger
 * /api/v1/payroll/payroll-statutory/{id}:
 *   delete:
 *     summary: Delete a payroll statutory by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll statutory
 *     responses:
 *       204:
 *         description: Payroll statutory successfully deleted
 *       404:
 *         description: Payroll statutory not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-statutory/:id', authController.protect, payrollController.deletePayrollStatutory);

/**
 * @swagger
 * /api/v1/payroll/fnf:
 *   post:
 *     summary: Add a new payroll FNF
 *     security: [{
 *       bearerAuth: []
 *     }]
 *     tags: [Payroll Management]
 *     requestBody:
 *       description: Payroll FNF details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               month:
 *                 type: string
 *               year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payroll FNF successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fnf/', authController.protect, payrollController.addPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/fnf/{id}:
 *   get:
 *     summary: Get payroll FNF by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF
 *     responses:
 *       200:
 *         description: Payroll FNF found
 *       404:
 *         description: Payroll FNF not found
 *       500:
 *         description: Internal server error
 */
router.get('/fnf/:id', authController.protect, payrollController.getPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/fnf/{id}:
 *   put:
 *     summary: Update payroll FNF by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF
 *     requestBody:
 *       description: Updated payroll FNF details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updatedOnDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               status:
 *                 type: string
 *                 enum: ['InProgress', 'Pending', 'OnHold', 'Processed','Approved','Paid','Cleared','Rejected','Finilized','Exit Interview Completed']
 *                 required: true
 *     responses:
 *       200:
 *         description: Payroll updated successfully
 *       404:
 *         description: Payroll not found
 *       500:
 *         description: Internal server error
 */
router.put('/fnf/:id', authController.protect, payrollController.updatePayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/fnf/{id}:
 *   delete:
 *     summary: Delete payroll FNF by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF
 *     responses:
 *       204:
 *         description: Payroll successfully deleted
 *       404:
 *         description: Payroll not found
 *       500:
 *         description: Internal server error
 */
router.delete('/fnf/:id', authController.protect, payrollController.deletePayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/fnf/payroll-by-company:
 *   post:
 *     summary: Get all FNF payrolls by company ID
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     tags: [Payroll Management]
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
 *         description: FNF Payrolls retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.post('/fnf/payroll-by-company', authController.protect, payrollController.getPayrollFNFByCompany);

/**
 * @swagger
 * /api/v1/payroll/fnf/users:
 *   post:
 *     summary: Add a PayrollFNFUsers for Payroll FNF
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PayrollFNFUsers details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNF:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               totalFlexiBenefits:
 *                 type: number
 *                 required: true
 *               totalCTC:
 *                 type: number
 *                 required: true
 *               totalGrossSalary:
 *                 type: number
 *                 required: true
 *               totalTakeHome:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: PayrollFNFUsers successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fnf/users', authController.protect, payrollController.createPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/fnf/users/{id}:
 *   get:
 *     summary: Get a PayrollFNFUsers by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFUsers
 *     responses:
 *       200:
 *         description: Successful response with the PayrollFNFUsers
 *       404:
 *         description: PayrollFNFUsers not found
 *       500:
 *         description: Internal server error
 */
router.get('/fnf/users/:id', authController.protect, payrollController.getPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/fnf/users-by-userId/{userId}:
 *   get:
 *     summary: Get a PayrollFNFUsers by UserID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFUsers
 *     responses:
 *       200:
 *         description: Successful response with the PayrollFNFUsers
 *       404:
 *         description: PayrollFNFUsers not found
 *       500:
 *         description: Internal server error
 */
router.get('/fnf/users-by-userId/:userId', authController.protect, payrollController.getPayrollFNFUserByUserId);

/**
 * @swagger
 * /api/v1/payroll/fnf/users/{id}:
 *   put:
 *     summary: Update a PayrollFNFUsers by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:  
 *           type: string
 *         description: ID of the PayrollFNFUsers
 *     requestBody:
 *       description: New PayrollFNFUsers details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payroll:
 *                 type: string
 *               user:
 *                 type: string
 *               totalFlexiBenefits:
 *                  type: number
 *                  required: true
 *               totalCTC:
 *                  type: number
 *                  required: true
 *               totalGrossSalary:
 *                  type: number
 *                  required: true
 *               totalTakeHome:
 *                  type: number
 *                  required: true
 *               status:
 *                  type: string
 *                  enum: [Active, OnHold, Processed]
 *                  required: true
 *               totalFixedAllowance:
 *                  type: number
 *               totalOtherBenefits:
 *                  type: number
 *               totalEmployeeStatutoryDeduction:
 *                  type: number
 *               totalEmployeeStatutoryContribution:
 *                  type: number
 *               totalFixedDeduction:
 *                  type: number
 *               totalVariableDeduction:
 *                  type: number
 *               totalLoan:
 *                  type: number
 *               totalAdvance:
 *                  type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated PayrollFNFUsers
 *       404:
 *         description: PayrollFNFUsers not found
 *       500:
 *         description: Internal server error
 */
router.put('/fnf/users/:id', authController.protect, payrollController.updatePayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/fnf/users/{id}:
 *   delete:
 *     summary: Delete a PayrollFNFUsers by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFUsers
 *     responses:
 *       204:
 *         description: PayrollFNFUsers successfully deleted
 *       404:
 *         description: PayrollFNFUsers not found
 *       500:
 *         description: Internal server error
 */
router.delete('/fnf/users/:id', authController.protect, payrollController.deletePayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/users-by-payroll-fnf:
 *   post:
 *     summary: Get all PayrollFNFUsers by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
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
 *                         payrollFNF:
 *                             type: string 
 *     responses:
 *       200:
 *         description: Successful response with PayrollFNFUsers
 *       500:
 *         description: Internal server error
 */
router.post('/users-by-payroll-fnf', authController.protect, payrollController.getAllPayrollFNFUsersByPayrollFNF);

// Payroll FNF Attendance Summary routes
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-records:
 *   post:
 *     summary: Add a PayrollFNFAttendanceSummary
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PayrollFNFAttendanceSummary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *                 required: true
 *               payrollFNF:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: PayrollFNFAttendanceSummary fetched successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-attendance-records', authController.protect, payrollController.getPayrollFNFUserAttendanceSummaryRecords);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-summary:
 *   post:
 *     summary: Add a PayrollFNFAttendanceSummary
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: PayrollFNFAttendanceSummary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *                 required: true
 *               totalDays:
 *                 type: number
 *                 required: true
 *               lopDays:
 *                 type: number
 *                 required: true
 *               payableDays:
 *                 type: number
 *                 required: true
 *               leaveEncashmentDays:
 *                 type: number
 *               leaveBalance:
 *                 type: number
 *               adjustedPayableDays:
 *                 type: number
 *               adjustmentReason:
 *                 type: string
 *               overtimeHours:
 *                 type: number
 *               adjustmentDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     reason:
 *                       type: string
 *                     amountAdjusted:
 *                       type: number
 *                     date:
 *                       type: string
 *             example:
 *               payrollFNFUser: "12345abcde"
 *               totalDays: 30
 *               lopDays: 5
 *               payableDays: 25
 *               leaveEncashmentDays: 2
 *               leaveBalance: 10
 *               adjustedPayableDays: 22
 *               adjustmentReason: "Sick Leave"
 *               overtimeHours: 5
 *               adjustmentDetails:
 *                 - reason: "Leave Without Pay"
 *                   amountAdjusted: 200
 *                   date: "2024-01-10"
 *     responses:
 *       201:
 *         description: PayrollFNFAttendanceSummary added successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-attendance-summary', authController.protect, payrollController.addPayrollFNFAttendanceSummary);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-summary-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get a PayrollFNFAttendanceSummary by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payrollFNF
 *     responses:
 *       200:
 *         description: Successful response with the payroll FNF attendance summary
 *       404:
 *         description: PayrollFNFAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-attendance-summary-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getPayrollFNFAttendanceSummaryByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-summary/{payrollFNFUser}:
 *   get:
 *     summary: Get a PayrollFNFAttendanceSummary by payrollFNFUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payrollFNFUser
 *     responses:
 *       200:
 *         description: Successful response with the PayrollFNFAttendanceSummary
 *       404:
 *         description: PayrollFNFAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-attendance-summary/:payrollFNFUser', authController.protect, payrollController.getPayrollFNFAttendanceSummaryByUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-summary/{id}:
 *   put:
 *     summary: Update a PayrollFNFAttendanceSummary by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFAttendanceSummary
 *     requestBody:
 *       description: New PayrollFNFAttendanceSummary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalDays:
 *                 type: number
 *               lopDays:
 *                 type: number
 *               payableDays:
 *                 type: number
 *               leaveEncashmentDays:
 *                 type: number
 *               leaveBalance:
 *                 type: number
 *               adjustedPayableDays:
 *                 type: number
 *               adjustmentReason:
 *                 type: string
 *               overtimeHours:
 *                 type: number
 *               adjustmentDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     reason:
 *                       type: string
 *                     amountAdjusted:
 *                       type: number
 *                     date:
 *                       type: string
 *             example:
 *               totalDays: 30
 *               lopDays: 5
 *               payableDays: 25
 *               leaveEncashmentDays: 2
 *               leaveBalance: 10
 *               adjustedPayableDays: 22
 *               adjustmentReason: "Sick Leave"
 *               overtimeHours: 5
 *               adjustmentDetails:
 *                 - reason: "Leave Without Pay"
 *                   amountAdjusted: 200
 *                   date: "2024-01-10"
 *     responses:
 *       200:
 *         description: PayrollFNFAttendanceSummary updated successfully
 *       404:
 *         description: PayrollFNFAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-attendance-summary/:id', authController.protect, payrollController.updatePayrollFNFAttendanceSummary);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-attendance-summary/{id}:
 *   delete:
 *     summary: Delete a PayrollFNFAttendanceSummary by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFAttendanceSummary
 *     responses:
 *       204:
 *         description: PayrollFNFAttendanceSummary successfully deleted
 *       404:
 *         description: PayrollFNFAttendanceSummary not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-attendance-summary/:id', authController.protect, payrollController.deletePayrollFNFAttendanceSummary);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-variable-pay:
 *   post:
 *     summary: Add a new Payroll FNF Variable Pay
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll FNF Variable Pay details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *                 required: true
 *               variableDeduction:
 *                 type: string
 *               variableAllowance:
 *                 type: string
 *               amount:
 *                 type: number
 *                 required: true
 *               month:
 *                 type: string
 *                 required: true
 *               year:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll FNF Variable Pay successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-variable-pay', payrollController.addPayrollFNFVariablePay);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-variable-pay-by-payrollfnfuser/{payrollFNFUser}:
 *   get:
 *     summary: Get a Payroll FNF Variable Pay by payrollFNFUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: PayrollFNFUser ID for which the Variable Pay is being retrieved
 *     responses:
 *       200:
 *         description: Successful response with Payroll Variable Pay
 *       404:
 *         description: Payroll FNF Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-variable-pay-by-payrollfnfuser/:payrollFNFUser', payrollController.getPayrollFNFVariablePayByPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-variable-pay-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get a Payroll FNF Variable Pay by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Variable Pay
 *       404:
 *         description: Payroll Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-variable-pay-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getPayrollFNFVariablePayByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-variable-pay/{id}:
 *   put:
 *     summary: Update a Payroll FNF Variable Pay by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Variable Pay
 *     requestBody:
 *       description: Updated Payroll FNF Variable Pay details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *               variableDeduction:
 *                 type: string
 *               variableAllowance:
 *                 type: string
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *               year:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll FNF Variable Pay
 *       404:
 *         description: Payroll FNF Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-variable-pay/:id', payrollController.updatePayrollFNFVariablePay);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-variable-pay/{id}:
 *   delete:
 *     summary: Delete a Payroll FNF Variable Pay by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Variable Pay
 *     responses:
 *       204:
 *         description: Payroll FNF Variable Pay successfully deleted
 *       404:
 *         description: Payroll FNF Variable Pay not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-variable-pay/:id', payrollController.deletePayrollFNFVariablePay);

// Payroll FNF Manual Arrears routes
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears:
 *   post:
 *     summary: Create a new Payroll FNF Manual Arrears entry
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll FNF Manual Arrears details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *                 required: true
 *               manualArrears:
 *                 type: number
 *                 required: true
 *               arrearDays:
 *                 type: number
 *                 required: true
 *               lopReversalDays:
 *                 type: number
 *                 required: true
 *               salaryRevisionDays:
 *                 type: number
 *                 required: true
 *               lopReversalArrears:
 *                 type: number
 *                 required: true
 *               totalArrears:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll FNF Manual Arrears successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-manual-arrears/', authController.protect, payrollController.createPayrollFNFManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears/{id}:
 *   get:
 *     summary: Get Payroll FNF Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Manual Arrears
 *     responses:
 *       200:
 *         description: Successful response with the Payroll FNF Manual Arrears details
 *       404:
 *         description: Payroll FNF Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-manual-arrears/:id', authController.protect, payrollController.getPayrollFNFManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears-by-payrollFNFuser/{payrollFNFUser}:
 *   get:
 *     summary: Get all Payroll FNF Manual Arrears
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Manual Arrears
 *     responses:
 *       200:
 *         description: Successful response with Payroll FNF Manual Arrears entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-manual-arrears-by-payrollFNFuser/:payrollFNFUser', authController.protect, payrollController.getAllPayrollFNFManualArrearsByPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get a Payroll Payroll FNF Manual Arrears
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Manual Arrears
 *       404:
 *         description: Payroll Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-manual-arrears-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getAllPayrollFNFManualArrearsByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears/{id}:
 *   put:
 *     summary: Update Payroll FNF Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Manual Arrears
 *     requestBody:
 *       description: New Payroll FNF Manual Arrears details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *               manualArrears:
 *                 type: number
 *               arrearDays:
 *                 type: number
 *               lopReversalDays:
 *                 type: number
 *               salaryRevisionDays:
 *                 type: number
 *               lopReversalArrears:
 *                 type: number
 *               totalArrears:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll FNF Manual Arrears
 *       404:
 *         description: Payroll FNF Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-manual-arrears/:id', authController.protect, payrollController.updatePayrollFNFManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-manual-arrears/{id}:
 *   delete:
 *     summary: Delete Payroll FNF Manual Arrears by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Manual Arrears
 *     responses:
 *       204:
 *         description: Payroll FNF Manual Arrears successfully deleted
 *       404:
 *         description: Payroll FNF Manual Arrears not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-manual-arrears/:id', authController.protect, payrollController.deletePayrollFNFManualArrears);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation:
 *   post:
 *     summary: Add a new Payroll FNF Termination Compensation
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll FNF Termination Compensation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *                 required: true
 *               terminationDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               noticePeriod:
 *                 type: integer
 *                 required: true
 *               yearsOfService:
 *                 type: integer
 *               severancePay:
 *                 type: integer
 *               retirementBenefits:
 *                 type: integer
 *               redeploymentCompensation:
 *                 type: integer
 *               outplacementServices:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Payroll FNF Termination Compensation successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-termination-compensation', authController.protect, payrollController.addPayrollFNFTerminationCompensation);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation/{payrollFNFUser}:
 *   get:
 *     summary: Get a Payroll FNF Termination Compensation by payrollFNFUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF user
 *     responses:
 *       200:
 *         description: Payroll FNF Termination Compensation found
 *       404:
 *         description: Payroll FNF Termination Compensation not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-termination-compensation/:payrollFNFUser', authController.protect, payrollController.getPayrollFNFTerminationCompensationByUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation/{id}:
 *   get:
 *     summary: Get a Payroll FNF Termination Compensation by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF Termination Compensation
 *     responses:
 *       200:
 *         description: Payroll FNF Termination Compensation found
 *       404:
 *         description: Payroll FNF Termination Compensation not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-termination-compensation/:id', authController.protect, payrollController.getPayrollFNFTerminationCompensationById);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation/{id}:
 *   put:
 *     summary: Update a Payroll FNF Termination Compensation
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF Termination Compensation
 *     requestBody:
 *       description: Updated Payroll FNF Termination Compensation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               terminationDate:
 *                 type: string
 *                 format: date
 *               noticePeriod:
 *                 type: integer
 *               yearsOfService:
 *                 type: integer
 *               severancePay:
 *                 type: integer
 *               retirementBenefits:
 *                 type: integer
 *               redeploymentCompensation:
 *                 type: integer
 *               outplacementServices:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Payroll FNF Termination Compensation successfully updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Payroll FNF Termination Compensation not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-termination-compensation/:id', authController.protect, payrollController.updatePayrollFNFTerminationCompensation);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation/{id}:
 *   delete:
 *     summary: Delete a Payroll FNF Termination Compensation by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll FNF Termination Compensation
 *     responses:
 *       204:
 *         description: Payroll FNF Termination Compensation successfully deleted
 *       404:
 *         description: Payroll FNF Termination Compensation not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-termination-compensation/:id', authController.protect, payrollController.deletePayrollFNFTerminationCompensation);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-termination-compensation-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get a Payroll Payroll FNF Termination Compensation
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payrollFNF
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Termination Compensation
 *       404:
 *         description: Payroll Termination Compensation not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-termination-compensation-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getAllPayrollFNFTerminationCompensationByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances:
 *   post:
 *     summary: Add a Payroll FNF Loan Advance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll FNF Loan Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *               loanAndAdvance:
 *                 type: string
 *               LoanAdvanceAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payroll FNF Loan Advance successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-loan-advances', authController.protect, payrollController.addPayrollFNFLoanAdvance);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances/{payrollFNFUser}:
 *   get:
 *     summary: Get Payroll FNF Loan Advance by payrollFNFUser
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFUser
 *     responses:
 *       200:
 *         description: Successful response with the Payroll FNF Loan Advance
 *       404:
 *         description: Payroll FNF Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-loan-advances/:payrollFNFUser', authController.protect, payrollController.getPayrollFNFLoanAdvanceByUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get Payroll FNF Loan Advance by Payroll FNF
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF
 *     responses:
 *       200:
 *         description: Successful response with the Payroll FNF Loan Advance
 *       404:
 *         description: Payroll FNF Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-loan-advances-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getPayrollFNFLoanAdvanceByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances-by-loan-advance/{loanAndAdvance}:
 *   get:
 *     summary: Get Payroll FNF Loan Advance by Loan and Advance ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: loanAndAdvance
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Loan and Advance
 *     responses:
 *       200:
 *         description: Successful response with the Payroll FNF Loan Advance
 *       404:
 *         description: Payroll FNF Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-loan-advances-by-loan-advance/:loanAndAdvance', authController.protect, payrollController.getPayrollFNFLoanAdvanceByLoan);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances/{id}:
 *   put:
 *     summary: Update a Payroll FNF Loan Advance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Loan Advance to update
 *     requestBody:
 *       description: Updated Payroll FNF Loan Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *               loanAndAdvance:
 *                 type: string
 *               LoanAdvanceAmount:
 *                 type: number
 *               finalSettlementAmount:
 *                 type: number
 *               fnfClearanceStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll FNF Loan Advance successfully updated
 *       404:
 *         description: Payroll FNF Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-loan-advances/:id', authController.protect, payrollController.updatePayrollFNFLoanAdvance);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-loan-advances/{id}:
 *   delete:
 *     summary: Delete a Payroll FNF Loan Advance
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Loan Advance to delete
 *     responses:
 *       204:
 *         description: Payroll FNF Loan Advance successfully deleted
 *       404:
 *         description: Payroll FNF Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-loan-advances/:id', authController.protect, payrollController.deletePayrollFNFLoanAdvance);


// Add a PayrollFNFStatutoryBenefits
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-statutory-benefits:
 *   post:
 *     summary: Add a new Payroll FNF Statutory Benefit
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll FNF Statutory Benefit details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollFNFUser:
 *                 type: string
 *               GratuityAmount:
 *                 type: number
 *               ProvidentFundAmount:
 *                 type: number
 *               ProvidentFundPaymentProcess:
 *                 type: string
 *                 enum: [Transfer, Withdraw]
 *               IsProvidentFundWithdrawFormSubmitted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Payroll FNF Statutory Benefit successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-statutory-benefits', authController.protect, payrollController.createPayrollFNFStatutoryBenefits);

// Get a PayrollFNFStatutoryBenefits by payrollFNFUser
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-statutory-benefits/{payrollFNFUserId}:
 *   get:
 *     summary: Get Payroll FNF Statutory Benefit by User ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PayrollFNFUser
 *     responses:
 *       200:
 *         description: Successful response with Payroll FNF Statutory Benefit
 *       404:
 *         description: Payroll FNF Statutory Benefit not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-statutory-benefits/:payrollFNFUserId', authController.protect, payrollController.getPayrollFNFStatutoryBenefitsByUser);

// Get a PayrollFNFStatutoryBenefits by payrollFNF
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-statutory-benefits/payroll/{payrollFNF}:
 *   get:
 *     summary: Get Payroll FNF Statutory Benefit by Payroll FNF ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF
 *     responses:
 *       200:
 *         description: Successful response with Payroll FNF Statutory Benefit
 *       404:
 *         description: Payroll FNF Statutory Benefit not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-statutory-benefits/payroll/:payrollFNF', authController.protect, payrollController.getPayrollFNFStatutoryBenefitsByPayrollFNF);

// Update a PayrollFNFStatutoryBenefits
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-statutory-benefits/{id}:
 *   put:
 *     summary: Update Payroll FNF Statutory Benefit
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Statutory Benefit
 *     requestBody:
 *       description: New details for the Payroll FNF Statutory Benefit
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GratuityAmount:
 *                 type: number
 *               ProvidentFundAmount:
 *                 type: number
 *               ProvidentFundPaymentProcess:
 *                 type: string
 *                 enum: [Transfer, Withdraw]
 *               IsProvidentFundWithdrawFormSubmitted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Payroll FNF Statutory Benefit successfully updated
 *       404:
 *         description: Payroll FNF Statutory Benefit not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-statutory-benefits/:id', authController.protect, payrollController.updatePayrollFNFStatutoryBenefits);

// Delete a PayrollFNFStatutoryBenefits
/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-statutory-benefits/{id}:
 *   delete:
 *     summary: Delete Payroll FNF Statutory Benefit by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Statutory Benefit
 *     responses:
 *       204:
 *         description: Payroll FNF Statutory Benefit successfully deleted
 *       404:
 *         description: Payroll FNF Statutory Benefit not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-statutory-benefits/:id', authController.protect, payrollController.deletePayrollFNFStatutoryBenefits);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax:
 *   post:
 *     summary: Create a new Payroll FNF Flexi Benefits and PF Tax record
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Flexi Benefits and PF Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollFNFUser:
 *                 type: string
 *                 required: true
 *               TotalFlexiBenefitAmount:
 *                 type: number
 *                 required: true
 *               TotalProfessionalTaxAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Flexi Benefits and PF Tax record successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-flexi-benefits-pf-tax/', authController.protect, payrollController.createPayrollFNFFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax/{id}:
 *   get:
 *     summary: Get a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     responses:
 *       200:
 *         description: Successful response with the record details
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-flexi-benefits-pf-tax/:id', authController.protect, payrollController.getPayrollFNFFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax-by-payroll-fnf-user/{payrollFNFUser}:
 *   get:
 *     summary: Get all Payroll Flexi Benefits and PF Tax records
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll user
 *     responses:
 *       200:
 *         description: Successful response with all records
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-flexi-benefits-pf-tax-by-payroll-fnf-user/:payrollFNFUser', authController.protect, payrollController.getAllPayrollFNFFlexiBenefitsAndPFTaxByPyrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get a flexi-benefits-pf-tax by payroll
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payroll
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payroll
 *     responses:
 *       200:
 *         description: Successful response with the flexi-benefits-pf-tax
 *       404:
 *         description: flexi-benefits-pf-tax not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-flexi-benefits-pf-tax-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getAllPayrollFNFFlexiBenefitsAndPFTaxByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax/{id}:
 *   put:
 *     summary: Update a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     requestBody:
 *       description: Updated Flexi Benefits and PF Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TotalFlexiBenefitAmount:
 *                 type: number
 *               TotalProfessionalTaxAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated record
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-flexi-benefits-pf-tax/:id', authController.protect, payrollController.updatePayrollFNFFlexiBenefitsAndPFTax);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-flexi-benefits-pf-tax/{id}:
 *   delete:
 *     summary: Delete a Payroll Flexi Benefits and PF Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record
 *     responses:
 *       204:
 *         description: Record successfully deleted
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-flexi-benefits-pf-tax/:id', authController.protect, payrollController.deletePayrollFNFFlexiBenefitsAndPFTax);


/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime:
 *   post:
 *     summary: Add a new Payroll Overtime entry
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Overtime details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollFNFUser:
 *                 type: string
 *                 required: true
 *               LateComing:
 *                 type: string
 *                 required: true
 *               EarlyGoing:
 *                 type: string
 *                 required: true
 *               FinalOvertime:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Overtime successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-overtime/', authController.protect, payrollController.createPayrollFNFOvertime);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime/{id}:
 *   get:
 *     summary: Get Payroll Overtime by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime details
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-overtime/:id', authController.protect, payrollController.getPayrollFNFOvertime);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime/{id}:
 *   put:
 *     summary: Update Payroll Overtime by ID
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     requestBody:
 *       description: Updated Payroll Overtime details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               LateComing:
 *                 type: string
 *               EarlyGoing:
 *                 type: string
 *               FinalOvertime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll Overtime successfully updated
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-overtime/:id', authController.protect, payrollController.updatePayrollFNFOvertime);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime/{id}:
 *   delete:
 *     summary: Delete Payroll Overtime by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll Overtime ID
 *     responses:
 *       204:
 *         description: Payroll Overtime successfully deleted
 *       404:
 *         description: Payroll Overtime not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-overtime/:id', authController.protect, payrollController.deletePayrollFNFOvertime);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime-by-payroll-fnf-user/{payrollFNFUser}:
 *   get:
 *     summary: Get all Payroll Overtime entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll User
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-overtime-by-payroll-fnf-user/:payrollFNFUser', authController.protect, payrollController.getAllPayrollFNFOvertimeByPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-overtime-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get all Payroll FNF Overtime entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll
 *     responses:
 *       200:
 *         description: Successful response with Payroll Overtime entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-overtime-by-payroll-fnf/:payrollFNF', authController.protect, payrollController.getAllPayrollFNFOvertimeByPayrollFNF);


// Payroll Income Tax routes

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax:
 *   post:
 *     summary: Create a new Payroll Income Tax record
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Payroll Income Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser5:
 *                 type: string
 *                 required: true
 *               TaxCalculatedMethod:
 *                 type: string
 *                 required: true
 *               TaxCalculated:
 *                 type: number
 *                 required: true
 *               TDSCalculated:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Payroll Income Tax record successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/payroll-fnf-income-tax/', authController.protect, payrollController.createPayrollFNFIncomeTax);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax/{id}:
 *   get:
 *     summary: Get a Payroll Income Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       200:
 *         description: Successful response with the Payroll Income Tax record
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-income-tax/:id', authController.protect, payrollController.getPayrollFNFIncomeTaxById);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax-by-payroll-fnf-user/{payrollFNFUser}:
 *   get:
 *     summary: Get all Payroll Income Tax records
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNFUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       200:
 *         description: Successful response with Payroll Income Tax records
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-income-tax-by-payroll-fnf-user/:payrollFNFUser', authController.protect, payrollController.getAllPayrollFNFIncomeTaxByPayrollFNFUser);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax-by-payroll-fnf/{payrollFNF}:
 *   get:
 *     summary: Get all Payroll incomeTax entries
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: payrollFNF
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll
 *     responses:
 *       200:
 *         description: Successful response with Payroll incomeTax entries
 *       500:
 *         description: Internal server error
 */
router.get('/payroll-fnf-income-tax-by-payroll-fnf/:payroll', authController.protect, payrollController.getAllPayrollFNFIncomeTaxByPayrollFNF);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax/{id}:
 *   put:
 *     summary: Update a Payroll FNF Income Tax record by ID
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll FNF Income Tax record
 *     requestBody:
 *       description: New Payroll FNF Income Tax details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PayrollUser7:
 *                 type: string
 *               TaxCalculatedMethod:
 *                 type: string
 *               TaxCalculated:
 *                 type: number
 *               TDSCalculated:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Payroll Income Tax record
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.put('/payroll-fnf-income-tax/:id', authController.protect, payrollController.updatePayrollFNFIncomeTax);

/**
 * @swagger
 * /api/v1/payroll/payroll-fnf-income-tax/{id}:
 *   delete:
 *     summary: Delete a Payroll Income Tax record by ID
 *     tags:  [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Payroll Income Tax record
 *     responses:
 *       204:
 *         description: Payroll Income Tax record successfully deleted
 *       404:
 *         description: Payroll Income Tax record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/payroll-fnf-income-tax/:id', authController.protect, payrollController.deletePayrollFNFIncomeTax);
/**
 * @swagger
 * /api/v1/payroll/get-total-pf-amount/{userId}:
 *   get:
 *     summary: Get total PF Amount  by user ID
 *     tags: [Payroll Management]
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
 *         description: Successful response with  PF Amount details
 *       404:
 *         description:  PF Amount not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/get-total-pf-amount/:userId', authController.protect, payrollController.getTotalPFAmountByUser);

/**
 * @swagger
 * /api/v1/payroll/get-total-gratuity-amount/{userId}:
 *   get:
 *     summary: Get total PF Amount  by user ID
 *     tags: [Payroll Management]
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
 *         description: Successful response with  PF Amount details
 *       404:
 *         description:  PF Amount not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/get-total-gratuity-amount/:userId', authController.protect, payrollController.getTotalGratuityAmountByUser);

/**
 * @swagger
 * /api/v1/payroll/calculate-total-tds-amount/{userId}:
 *   get:
 *     summary: Get total TDS Amount  by user ID
 *     tags: [Payroll Management]
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
 *         description: Successful response with  PF Amount details
 *       404:
 *         description:  PF Amount not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/calculate-total-tds-amount/:userId', authController.protect, payrollController.getTDSAmountByUser);
/**
 * @swagger
 * /api/v1/payroll/calculate-total-fnf-tds-amount/{userId}:
 *   get:
 *     summary: Get total TDS Amount  by user ID
 *     tags: [Payroll Management]
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
 *         description: Successful response with  PF Amount details
 *       404:
 *         description:  PF Amount not found for user
 *       500:
 *         description: Internal server error
 */
router.get('/calculate-total-fnf-tds-amount/:userId', authController.protect, payrollController.getFNFTDSAmountByUser);

module.exports = router;