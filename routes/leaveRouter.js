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
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 * /api/v1/leave/general-settings-by-company:
 *   get:
 *     summary: Get a GeneralSetting by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSetting
 *       404:
 *         description: GeneralSetting not found
 *       500:
 *         description: Internal server error
 */
router.get('/general-settings-by-company', authController.protect, leaveController.getGeneralSettingByCompany);

/**
 * @swagger
 * /api/v1/leave/general-settings/{id}:
 *   put:
 *     summary: Update a GeneralSetting by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 *     security: [{
 *         bearerAuth: []
 *     }] 
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
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Successful response with Leave Category
 *       500:
 *         description: Internal server error
 */
router.get('/leave-categories', authController.protect, leaveController.getAllLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-categories/{id}:
 *   delete:
 *     summary: Delete an Leave Category by ID
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Leave Category
 *     responses:
 *       204:
 *         description: Leave Category successfully deleted
 *       404:
 *         description: Leave Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/leave-categories/:id', authController.protect, leaveController.deleteLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-templates:
 *   post:
 *     summary: Create a new LeaveTemplate
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     requestBody:
 *       description: LeaveTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true
 *               approvalLevel:
 *                 type: string
 *                 required: true
 *               approvalType:
 *                 type: string
 *                 required: true
 *               primaryApprover:
 *                 type: string
 *                 required: true
 *               secondaryApprover:
 *                 type: string
 *                 required: true
 *               isCommentMandatory:
 *                 type: boolean
 *                 required: true
 *               clubbingRestrictions:
 *                 type: boolean
 *                 required: true
 *               weeklyOffClubTogether:
 *                 type: boolean
 *                 required: true
 *               holidayClubTogether:
 *                 type: boolean
 *                 required: true
 *               leaveCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     leaveCategory:
 *                       type: string
 *                       required: true
 *               cubbingRestrictionCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     leaveCategory:
 *                       type: string
 *                       required: true
 *                     restrictedclubbedLeaveCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       201:
 *         description: LeaveTemplate successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/leave-templates', authController.protect, leaveController.createLeaveTemplate);

/**
 * @swagger
 * /api/v1/leave/leave-templates/{id}:
 *   get:
 *     summary: Get a LeaveTemplate by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the LeaveTemplate
 *     responses:
 *       200:
 *         description: Successful response with the LeaveTemplate
 *       404:
 *         description: LeaveTemplate not found
 *       500:
 *         description: Internal server error
 */
router.get('/leave-templates/:id', authController.protect, leaveController.getLeaveTemplate);

/**
 * @swagger
 * /api/v1/leave/leave-templates/{id}:
 *   put:
 *     summary: Update a LeaveTemplate by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the LeaveTemplate
 *     requestBody:
 *       description: New LeaveTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               approvalLevel:
 *                 type: string
 *               approvalType:
 *                 type: string
 *               primaryApprover:
 *                 type: string
 *               secondaryApprover:
 *                 type: string
 *               isCommentMandatory:
 *                 type: boolean
 *               clubbingRestrictions:
 *                 type: boolean
 *               weeklyOffClubTogether:
 *                 type: boolean
 *               holidayClubTogether:
 *                 type: boolean
 *               leaveCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     leaveCategory:
 *                       type: string
 *                       required: true
 *               cubbingRestrictionCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     leaveCategory:
 *                       type: string
 *                       required: true
 *                     restrictedclubbedLeaveCategory:
 *                       type: string
 *                       required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated LeaveTemplate
 *       404:
 *         description: LeaveTemplate not found
 *       500:
 *         description: Internal server error
 */
router.put('/leave-templates/:id', authController.protect, leaveController.updateLeaveTemplate);

/**
 * @swagger
 * /api/v1/leave/leave-templates:
 *   get:
 *     summary: Get all LeaveTemplates
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Successful response with LeaveTemplates
 *       500:
 *         description: Internal server error
 */
router.get('/leave-templates', authController.protect, leaveController.getAllLeaveTemplates);

/**
 * @swagger
 * /api/v1/leave/leave-template/{id}:
 *   delete:
 *     summary: Delete an Leave Template by ID
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Leave Template
 *     responses:
 *       204:
 *         description: Leave Template successfully deleted
 *       404:
 *         description: Leave Template not found
 *       500:
 *         description: Internal server error
 */
router.delete('/leave-template/:id', authController.protect, leaveController.deleteLeaveTemplate);

/**
 * @swagger
 * /api/v1/leave/leave-template-categories:
 *   post:
 *     summary: Create a new LeaveTemplateCategory
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     requestBody:
 *       description: LeaveTemplateCategory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveTemplateCategory'
 *     responses:
 *       201:
 *         description: LeaveTemplateCategory successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/leave-template-categories',authController.protect, leaveController.createLeaveTemplateCategory);

/**
 * @swagger
 * /api/v1/leave/leave-template-categories/{id}:
 *   get:
 *     summary: Get a LeaveTemplateCategory by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the LeaveTemplateCategory
 *     responses:
 *       200:
 *         description: Successful response with the LeaveTemplateCategory
 *       404:
 *         description: LeaveTemplateCategory not found
 *       500:
 *         description: Internal server error
 */
router.get('/leave-template-categories/:id',authController.protect, leaveController.getLeaveTemplateCategory);

/**
 * @swagger
 * /api/v1/leave/leave-template-categories/{id}:
 *   put:
 *     summary: Update a LeaveTemplateCategory by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the LeaveTemplateCategory
 *     requestBody:
 *       description: New LeaveTemplateCategory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveTemplateCategory'
 *     responses:
 *       200:
 *         description: Successful response with the updated LeaveTemplateCategory
 *       404:
 *         description: LeaveTemplateCategory not found
 *       500:
 *         description: Internal server error
 */
router.put('/leave-template-categories/:id',authController.protect, leaveController.updateLeaveTemplateCategory);

/**
 * @swagger
 * /api/v1/leave/leave-template-categories:
 *   get:
 *     summary: Get all LeaveTemplateCategories
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Successful response with LeaveTemplateCategories
 *       500:
 *         description: Internal server error
 */
router.get('/leave-template-categories',authController.protect, leaveController.getAllLeaveTemplateCategories);

module.exports = router;