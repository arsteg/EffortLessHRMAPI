const express = require('express');
const leaveController = require('../controllers/leaveController');
const authController = require('../controllers/authController');
const router = express.Router();

// GeneralSetting routes
/**
 * @swagger
 * /api/v1/leave/general-settings:
 *   post:
 *     summary: Add a GeneralSetting
 *     tags: [Leave Management]
 *     requestBody:
 *       description: GeneralSetting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveCycleStart:
 *                 type: string
 *                 required: true
 *               isAdminAccessLeaveApproveReject:
 *                 type: boolean
 *                 required: true
 *               canSupervisorAddLeaveAdjustment:
 *                 type: boolean
 *                 required: true
 *               isDailyLeaveAccrualsRun:
 *                 type: boolean
 *                 required: true
 *               initialBalanceSetDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               isFreezeInitialBalancesOnceFirstAccrualRun:
 *                 type: boolean
 *                 required: true
 *               shortLeaveApplicationLimit:
 *                 type: number
 *                 required: true
 *               maxDurationForShortLeaveApplicationInMin:
 *                 type: number
 *               band:
 *                 type: string
 *               fullDayMinHour:
 *                 type: number
 *               halfDayMinHour:
 *                 type: number
 *     responses:
 *       201:
 *         description: GeneralSetting successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/general-settings', authController.protect, leaveController.createGeneralSetting);

/**
 * @swagger
 * /api/v1/leave/general-settings/{id}:
 *   get:
 *     summary: Get a GeneralSetting by ID
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the GeneralSetting
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSetting
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.get('/general-settings/:id', authController.protect, leaveController.getGeneralSetting);

/**
 * @swagger
 * /api/v1/leave/general-settings/{id}:
 *   put:
 *     summary: Update a GeneralSetting by ID
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the GeneralSetting
 *     requestBody:
 *       description: New GeneralSetting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveCycleStart:
 *                 type: string
 *               isAdminAccessLeaveApproveReject:
 *                 type: boolean
 *               canSupervisorAddLeaveAdjustment:
 *                 type: boolean
 *               isDailyLeaveAccrualsRun:
 *                 type: boolean
 *               initialBalanceSetDate:
 *                 type: string
 *                 format: date
 *               isFreezeInitialBalancesOnceFirstAccrualRun:
 *                 type: boolean
 *               shortLeaveApplicationLimit:
 *                 type: number
 *               maxDurationForShortLeaveApplicationInMin:
 *                 type: number
 *               band:
 *                 type: string
 *               fullDayMinHour:
 *                 type: number
 *               halfDayMinHour:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated GeneralSetting
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.put('/general-settings/:id', authController.protect, leaveController.updateGeneralSetting);

/**
 * @swagger
 * /api/v1/leave/leave-categories:
 *   post:
 *     summary: Create a new leave category
 *     tags: [Leave Management]
 *     requestBody:
 *       description: Leave category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType:
 *                 type: string
 *                 required: true
 *               label:
 *                 type: string
 *                 required: true
 *               abbreviation:
 *                 type: string
 *                 required: true
 *               canEmployeeApply:
 *                 type: boolean
 *                 required: true
 *               isHalfDayTypeOfLeave:
 *                 type: boolean
 *               submitBefore:
 *                 type: number
 *               displayLeaveBalanceInPayslip:
 *                 type: boolean
 *               leaveAccrualPeriod:
 *                 type: string
 *                 required: true
 *               isAnnualHolidayLeavePartOfNumberOfDaysTaken:
 *                 type: boolean
 *               isWeeklyOffLeavePartOfNumberOfDaysTaken:
 *                 type: boolean
 *               isEligibleForLeaveEncashmentDuringRollover:
 *                 type: boolean
 *               isDocumentRequired:
 *                 type: boolean
 *               isDocumentMandatory:
 *                 type: boolean
 *               isEligibleForEncashmentRecoveryDuringFNF:
 *                 type: boolean
 *                 required: true
 *               isWeeklyOffHolidayPartHalfDayIncludedDaTaken:
 *                 type: boolean
 *               policyWithRegardsToCarryoverLimits:
 *                 type: string
 *                 required: true
 *               isEmployeesAllowedToNegativeLeaveBalance:
 *                 type: boolean
 *                 required: true
 *               isRoundOffLeaveAccrualNearestPointFiveUnit:
 *                 type: boolean
 *                 required: true
 *               isIntraCycleLapseApplicableForThisCategory:
 *                 type: boolean
 *                 required: true
 *               minimumNumberOfDaysAllowed:
 *                 type: number
 *               isProRateFirstMonthAccrualForNewJoinees:
 *                 type: string
 *               maximumNumberConsecutiveLeaveDaysAllowed:
 *                 type: number
 *               dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth:
 *                 type: number
 *               dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth:
 *                 type: number
 *               isPaidLeave:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Leave category successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/leave-categories', authController.protect, leaveController.createLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-categories/{id}:
 *   get:
 *     summary: Get a leave category by ID
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the leave category
 *     responses:
 *       200:
 *         description: Successful response with the leave category
 *       404:
 *         description: Leave category not found
 *       500:
 *         description: Internal server error
 */
router.get('/leave-categories/:id', authController.protect, leaveController.getLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-categories/{id}:
 *   put:
 *     summary: Update a leave category by ID
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the leave category
 *     requestBody:
 *       description: New leave category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType:
 *                 type: string
 *                 required: true
 *               label:
 *                 type: string
 *                 required: true
 *               abbreviation:
 *                 type: string
 *                 required: true
 *               canEmployeeApply:
 *                 type: boolean
 *                 required: true
 *               isHalfDayTypeOfLeave:
 *                 type: boolean
 *               submitBefore:
 *                 type: number
 *               displayLeaveBalanceInPayslip:
 *                 type: boolean
 *               leaveAccrualPeriod:
 *                 type: string
 *                 required: true
 *               isAnnualHolidayLeavePartOfNumberOfDaysTaken:
 *                 type: boolean
 *               isWeeklyOffLeavePartOfNumberOfDaysTaken:
 *                 type: boolean
 *               isEligibleForLeaveEncashmentDuringRollover:
 *                 type: boolean
 *               isDocumentRequired:
 *                 type: boolean
 *               isDocumentMandatory:
 *                 type: boolean
 *               isEligibleForEncashmentRecoveryDuringFNF:
 *                 type: boolean
 *                 required: true
 *               isWeeklyOffHolidayPartHalfDayIncludedDaTaken:
 *                 type: boolean
 *               policyWithRegardsToCarryoverLimits:
 *                 type: string
 *                 required: true
 *               isEmployeesAllowedToNegativeLeaveBalance:
 *                 type: boolean
 *                 required: true
 *               isRoundOffLeaveAccrualNearestPointFiveUnit:
 *                 type: boolean
 *                 required: true
 *               isIntraCycleLapseApplicableForThisCategory:
 *                 type: boolean
 *                 required: true
 *               minimumNumberOfDaysAllowed:
 *                 type: number
 *               isProRateFirstMonthAccrualForNewJoinees:
 *                 type: string
 *               maximumNumberConsecutiveLeaveDaysAllowed:
 *                 type: number
 *               dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth:
 *                 type: number
 *               dayOfMonthEmployeeNeedToResignToGetCreditforTheMonth:
 *                 type: number
 *               isPaidLeave:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated leave category
 *       404:
 *         description: Leave category not found
 *       500:
 *         description: Internal server error
 */
router.put('/leave-categories/:id', authController.protect, leaveController.updateLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-categories:
 *   get:
 *     summary: Get all Leave Category
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Leave Category
 *       500:
 *         description: Internal server error
 */
router.get('/leave-categories', authController.protect, leaveController.getAllLeaveCategory);

module.exports = router;
