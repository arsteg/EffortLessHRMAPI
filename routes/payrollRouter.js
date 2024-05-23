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
 *               isAllowTDSFromProH2R:
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
 *               isAllowTDSFromProH2R:
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
 * /api/v1/payroll/rounding-rules:
 *   get:
 *     summary: Get all rounding rules
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     tags: [Payroll Management]
 *     responses:
 *       200:
 *         description: Successful response with rounding rules
 *       500:
 *         description: Internal server error
 */
router.get('/rounding-rules', authController.protect, payrollController.getAllRoundingRules);

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
 *               type:
 *                 type: string
 *                 required: true
 *               isArrearsAffect:
 *                 type: boolean
 *                 default: false
 *               calculatedBy:
 *                 type: string
 *                 required: true
 *               isTaxEnabledOnce:
 *                 type: boolean
 *                 default: false
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
 *               isAttendanceToEffectTheEligibility:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: FixedAllowances successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/fixed-allowances',authController.protect, payrollController.createFixedAllowances);

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
router.get('/fixed-allowances/:id',authController.protect, payrollController.getFixedAllowancesById);

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
router.put('/fixed-allowances/:id',authController.protect, payrollController.updateFixedAllowances);

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
router.delete('/fixed-allowances/:id',authController.protect, payrollController.deleteFixedAllowances);

/**
 * @swagger
 * /api/v1/payroll/fixed-allowances:
 *   get:
 *     summary: Get all FixedAllowances
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with FixedAllowances
 *       500:
 *         description: Internal server error
 */
router.get('/fixed-allowances', authController.protect,payrollController.getAllFixedAllowances);

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
router.post('/fixed-contribution',authController.protect, payrollController.createFixedContribution);

/**
 * @swagger
 * /api/v1/payroll/fixed-contribution:
 *   get:
 *     summary: Get all FixedContributions
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with FixedAllowances
 *       500:
 *         description: Internal server error
 */
router.get('/fixed-contribution',authController.protect, payrollController.getAllFixedContributions);

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
 *               fixedContribution:
 *                 type: string
 *                 required: true
 *               fromAmount:
 *                 type: number
 *                 required: true
 *               toAmount:
 *                 type: number
 *                 required: true
 *               employeePercent:
 *                 type: number
 *                 required: true
 *               employeeAmount:
 *                 type: number
 *                 required: true
 *               employerPercentage:
 *                 type: number
 *                 required: true
 *               employerAmount:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Fixed Contribution Slab successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-contribution-slabs', authController.protect,payrollController.createFixedContributionSlab);

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
router.get('/lwf-fixed-contribution-slabs/:id',authController.protect, payrollController.getFixedContributionSlab);

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
 *               fromAmount:
 *                 type: number
 *               toAmount:
 *                 type: number
 *               employeePercent:
 *                 type: number
 *               employeeAmount:
 *                 type: number
 *               employerPercentage:
 *                 type: number
 *               employerAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Fixed Contribution Slab
 *       404:
 *         description: Fixed Contribution Slab not found
 *       500:
 *         description: Internal server error
 */
router.put('/lwf-fixed-contribution-slabs/:id',authController.protect, payrollController.updateFixedContributionSlab);

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
router.delete('/lwf-fixed-contribution-slabs/:id',authController.protect, payrollController.deleteFixedContributionSlab);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-slabs:
 *   get:
 *     summary: Get all Fixed Contribution Slabs
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Fixed Contribution Slabs
 *       500:
 *         description: Internal server error
 */
router.get('/lwf-fixed-contribution-slabs',authController.protect, payrollController.getAllFixedContributionSlabs);
// routes/payrollRoutes.js


/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-months: 
 *   post:
 *     summary: Add a LWFFixedContributionMonth
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: LWFFixedContributionMonth details
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
 *         description: LWFFixedContributionMonth successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/lwf-fixed-contribution-months',authController.protect, payrollController.createLWFFixedContributionMonth);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-months-update:
 *   put:
 *     summary: Update a LWFFixedContributionMonth
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: New LWFFixedContributionMonth details
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
router.put('/lwf-fixed-contribution-months-update/',authController.protect, payrollController.updateLWFFixedContributionMonth);

/**
 * @swagger
 * /api/v1/payroll/lwf-fixed-contribution-months:
 *   get:
 *     summary: Get all LWFFixedContributionMonths
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with LWFFixedContributionMonths
 *       500:
 *         description: Internal server error
 */
router.get('/lwf-fixed-contribution-months',authController.protect, payrollController.getAllLWFFixedContributionMonths);

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
router.put('/pt-eligible-states/',authController.protect, payrollController.addUpdatePTEligibleStates);

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
router.get('/pt-eligible-states',authController.protect, payrollController.getAllPTEligibleStates);

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

// Get all PTSlabs
/**
 * @swagger
 * /api/v1/payroll/pt-slabs:
 *   get:
 *     summary: Get all PTSlabs
 *     tags: [Payroll Management]
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with PTSlabs
 *       500:
 *         description: Internal server error
 */
router.get('/pt-slabs', authController.protect, payrollController.getAllPTSlabs);

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
 *               defaultValue:
 *                 type: number
 *                 required: true
 *               maxAmount:
 *                 type: number
 *                 required: true
 *               company:
 *                 type: string
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
 *   get:
 *     summary: Get all CeilingAmounts by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with CeilingAmounts
 *       404:
 *         description: CeilingAmounts not found
 *       500:
 *         description: Internal server error
 */
router.get('/esic-ceilingAmounts-by-company', authController.protect, payrollController.getCeilingAmountsByCompany);

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
 *               defaultValue:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *               company:
 *                 type: string
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
 *               fromAmount:
 *                 type: number
 *                 required: true
 *               toAmount:
 *                 type: number
 *                 required: true
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
router.post('/esicContributions',authController.protect, payrollController.addESICContribution);

/**
 * @swagger
 * /api/v1/payroll/esicContributions-by-company:
 *   get:
 *     summary: Get all ESIC contributions by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with ESIC contributions
 *       404:
 *         description: ESIC contributions not found
 *       500:
 *         description: Internal server error
 */
router.get('/esicContributions-by-company',authController.protect, payrollController.getAllESICContributionsByCompany);

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
 *               fromAmount:
 *                 type: number
 *               toAmount:
 *                 type: number
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
router.put('/esicContributions/:id',authController.protect, payrollController.updateESICContribution);

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
router.get('/esicContributions/:id', authController.protect,payrollController.getESICContributionById);

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
router.delete('/esicContributions/:id',authController.protect, payrollController.deleteESICContribution);

/**
 * @swagger
 * /api/v1/payroll/variableAllowances:
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
 *               deductIncomeTaxAllowance:
 *                 type: string
 *                 required: true
 *               taxRegime:
 *                 type: string
 *                 required: true
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
router.post('/variableAllowances', authController.protect, payrollController.createVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/variableAllowances-by-company:
 *   get:
 *     summary: Get all variable allowances by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with variable allowances
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get('/variableAllowances-by-company', authController.protect, payrollController.getAllVariableAllowancesByCompany);

/**
 * @swagger
 * /api/v1/payroll/variableAllowances/{id}:
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
router.get('/variableAllowances/:id', authController.protect, payrollController.getVariableAllowanceById);

/**
 * @swagger
 * /api/v1/payroll/variableAllowances/{id}:
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
 *               deductIncomeTaxAllowance:
 *                 type: string
 *               taxRegime:
 *                 type: string
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
router.put('/variableAllowances/:id', authController.protect, payrollController.updateVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/variableAllowances/{id}:
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
router.delete('/variableAllowances/:id', authController.protect, payrollController.deleteVariableAllowance);

/**
 * @swagger
 * /api/v1/payroll/fixedDeductions:
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
router.post('/fixedDeductions', authController.protect, payrollController.createFixedDeduction);

/**
 * @swagger
 * /api/v1/payroll/fixedDeductions-by-company:
 *   get:
 *     summary: Get all Fixed Deductions by company
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with the Fixed Deductions
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/fixedDeductions-by-company', authController.protect, payrollController.getAllFixedDeductionsByCompany);

/**
 * @swagger
 * /api/v1/payroll/fixedDeductions/{id}:
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
router.get('/fixedDeductions/:id', authController.protect, payrollController.getFixedDeductionById);

/**
 * @swagger
 * /api/v1/payroll/fixedDeductions/{id}:
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
router.put('/fixedDeductions/:id', authController.protect, payrollController.updateFixedDeduction);

/**
 * @swagger
 * /api/v1/payroll/fixedDeductions/{id}:
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
router.delete('/fixedDeductions/:id', authController.protect, payrollController.deleteFixedDeduction);


/**
 * @swagger
 * /api/v1/payroll/variableDeductions:
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
 *                 type: boolean
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
 *                 required: true
 *               deductionStopYear:
 *                 type: string
 *                 required: true
 *               amountEnterForThisVariableDeduction:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *                 required: true
 *               percentage:
 *                 type: number
 *                 required: true
 *               isAttendanceToAffectEligibility:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: Variable deduction successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/variableDeductions', payrollController.createVariableDeduction);

/**
 * @swagger
 * /api/v1/payroll/variableDeductions:
 *   get:
 *     summary: Get all Variable Deductions
 *     tags: [Payroll Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with variable deductions
 *       500:
 *         description: Internal server error
 */
router.get('/variableDeductions', payrollController.getAllVariableDeductions);

/**
 * @swagger
 * /api/v1/payroll/variableDeductions/{id}:
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
router.get('/variableDeductions/:id', payrollController.getVariableDeductionById);

/**
 * @swagger
 * /api/v1/payroll/variableDeductions/{id}:
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
 *                 type: boolean
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
 *     responses:
 *       200:
 *         description: Successful response with the updated variable deduction
 *       404:
 *         description: Variable deduction not found
 *       500:
 *         description: Internal server error
 */
router.put('/variableDeductions/:id', payrollController.updateVariableDeduction);

/**
 * @swagger
 * /api/v1/payroll/variableDeductions/{id}:
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
router.delete('/variableDeductions/:id', payrollController.deleteVariableDeduction);

module.exports = router;
