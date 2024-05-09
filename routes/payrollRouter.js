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

module.exports = router;
