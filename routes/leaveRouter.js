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
 *               fullDayMinMinutes:
 *                 type: number
 *               halfDayMinMinutes:
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
 *               fullDayMinMinutes:
 *                 type: number
 *               halfDayMinMinutes:
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
 *               isEmployeeAccrualLeaveInAdvance:
 *                 type: boolean
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
 *               isEmployeeAccrualLeaveInAdvance:
 *                 type: boolean
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
 * /api/v1/leave/leave-categories-list:
 *   post:
 *     summary: Get all Leave Category
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
 *     tags: [Leave Management]
 *     responses:
 *       200:
 *         description: Successful response with Leave Category
 *       500:
 *         description: Internal server error
 */
router.post('/leave-categories-list', authController.protect, leaveController.getAllLeaveCategory);

/**
 * @swagger
 * /api/v1/leave/leave-categories-by-user/{userId}:
 *   get:
 *     summary: Get a leave category by UserId
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: userId
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
router.get('/leave-categories-by-user/:userId', authController.protect, leaveController.getAllLeaveCategoryByUser);

/**
 * @swagger
 * /api/v1/leave/leave-categories-by-userv1/{userId}:
 *   get:
 *     summary: Get a leave category by UserId
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: userId
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
router.get('/leave-categories-by-userv1/:userId', authController.protect, leaveController.getAllLeaveCategoryByUserV1);

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
 * /api/v1/leave/leave-templates-list:
 *   post:
 *     summary: Get all LeaveTemplates
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
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
 *         description: Successful response with LeaveTemplates
 *       500:
 *         description: Internal server error
 */
router.post('/leave-templates-list', authController.protect, leaveController.getAllLeaveTemplates);

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
 *             type: object
 *             properties:
 *               leaveTemplate:
 *                 type: string
 *                 required: true
 *                 description: ID of the leave template
 *               leaveCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      leaveCategory:
 *                        type: string
 *                        description: ID of the leave category
 *                      limitNumberOfTimesApply:
 *                        type: boolean
 *                        description: Whether there's a limit on the number of times the employee can apply for leave
 *                      maximumNumbersEmployeeCanApply:
 *                        type: integer
 *                        description: Maximum number of times an employee can apply for leave
 *                      maximumNumbersEmployeeCanApplyType:
 *                        type: string
 *                        description: Type of maximum number of times an employee can apply for leave
 *                      dealWithNewlyJoinedEmployee:
 *                        type: string
 *                        description: Method to deal with newly joined employees regarding leave
 *                      daysToCompleteToBecomeEligibleForLeave:
 *                        type: integer
 *                        description: Number of days required to become eligible for leave
 *                      isEmployeeGetCreditedTheEntireAmount:
 *                        type: boolean
 *                        description: Whether the employee gets credited the entire amount of leave
 *                      extendLeaveCategory:
 *                        type: boolean
 *                        description: Whether leave category can be extended
 *                      extendMaximumDayNumber:
 *                        type: integer
 *                        description: Maximum number of days leave category can be extended
 *                      extendFromCategory:
 *                        type: string
 *                        description: Category from which leave can be extended
 *                      negativeBalanceCap:
 *                        type: integer
 *                        description: Negative balance cap for leave
 *                      accrualRatePerPeriod:
 *                        type: integer
 *                        description: Annual accrual rate per period for leave
 *                      categoryApplicable:
 *                        type: string
 *                        description: Applicable category for leave
 *                      users:
 *                        type: array
 *                        items:
 *                            type: object
 *                            required: true
 *                            properties:
 *                              user:
 *                                type: string
 *                                required: true 
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
 * /api/v1/leave/leave-template-categories-by-template/{leaveTemplateId}:
 *   get:
 *     summary: Get a LeaveTemplateCategory by ID
 *     security: [{
 *         bearerAuth: []
 *     }] 
 *     tags: [Leave Management]
 *     parameters:
 *       - in: path
 *         name: leaveTemplateId
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
router.get('/leave-template-categories-by-template/:leaveTemplateId',authController.protect, leaveController.getLeaveTemplateCategoryByTemplate);

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

/**
 * @swagger
 * /api/v1/Leave/employee-leave-assignments:
 *   post:
 *     summary: Create a new EmployeeLeaveAssignment
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: EmployeeLeaveAssignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               leaveTemplate:
 *                 type: string
 *                 required: true
 *               primaryApprover:
 *                 type: string
 *                 required: false
 *               secondaryApprover:
 *                 type: string
 *                 required: false
 *     responses:
 *       201:
 *         description: EmployeeLeaveAssignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-assignments', authController.protect, leaveController.createEmployeeLeaveAssignment);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-assignments-by-user/{userId}:
 *   get:
 *     summary: Get an EmployeeLeaveAssignment by ID
 *     tags: [Leave Management]
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
 *         description: Successful response with the EmployeeLeaveAssignment
 *       404:
 *         description: EmployeeLeaveAssignment not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-leave-assignments-by-user/:userId', authController.protect, leaveController.getEmployeeLeaveAssignmentByUser);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-assignments/{id}:
 *   delete:
 *     summary: Delete an EmployeeLeaveAssignment by ID
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
 *         description: ID of the EmployeeLeaveAssignment
 *     responses:
 *       204:
 *         description: EmployeeLeaveAssignment successfully deleted
 *       404:
 *         description: EmployeeLeaveAssignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-leave-assignments/:id', authController.protect, leaveController.deleteEmployeeLeaveAssignment);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-assignments-list:
 *   post:
 *     summary: Get all EmployeeLeaveAssignments
 *     tags: [Leave Management]
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
 *         description: Successful response with EmployeeLeaveAssignments
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-assignments-list', authController.protect, leaveController.getAllEmployeeLeaveAssignments);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant:
 *   post:
 *     summary: Create a new EmployeeLeaveGrant
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: EmployeeLeaveGrant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true
 *               status:
 *                 type: string
 *                 required: true
 *               level1Reason:
 *                 type: string
 *                 required: true
 *               level2Reason:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: false
 *               comment:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: EmployeeLeaveAssignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-grant', authController.protect, leaveController.createEmployeeLeaveGrant);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant-by-user/{userId}:
 *   get:
 *     summary: Get an Employee Leave Grant by ID
 *     tags: [Leave Management]
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
 *         description: Successful response with the Employee Leave Grant
 *       404:
 *         description: Employee Leave Grant not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-leave-grant-by-user/:userId', authController.protect, leaveController.getEmployeeLeaveGrantByUser);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant-by-team:
 *   post:
 *     summary: Get an Employee Leave Grant by Team
 *     tags: [Leave Management]
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
 *                         status:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with the Employee Leave Grant
 *       404:
 *         description: Employee Leave Grant not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-grant-by-team', authController.protect, leaveController.getEmployeeLeaveGrantByTeam);


/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant/{id}:
 *   delete:
 *     summary: Delete an Employee Leave Grant by ID
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
 *         description: ID of the Employee Leave Grant
 *     responses:
 *       204:
 *         description: Employee Leave Grant successfully deleted
 *       404:
 *         description: Employee Leave Grant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-leave-grant/:id', authController.protect, leaveController.deleteEmployeeLeaveGrant);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant/{id}:
 *   put:
 *     summary: Update a new EmployeeLeaveGrant
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
 *         description: ID of the Employee Leave Grant
 *     requestBody:
 *       description: EmployeeLeaveGrant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *               level1Reason:
 *                 type: string
 *                 required: true
 *               level2Reason:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: false
 *               comment:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: EmployeeLeaveAssignment successfully updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/employee-leave-grant/:id', authController.protect, leaveController.updateEmployeeLeaveGrant);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant-list:
 *   post:
 *     summary: Get all Employee Leave Grant
 *     tags: [Leave Management]
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
 *                         status:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with Employee Leave Grant
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-grant-list', authController.protect, leaveController.getAllEmployeeLeaveGrant);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-grant/{id}:
 *   get:
 *     summary: Get an Employee Leave Grant by ID
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
 *         description: id of the Leave Grant
 *     responses:
 *       200:
 *         description: Successful response with the Leave Grant
 *       404:
 *         description: Leave Grant not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-leave-grant/:id', authController.protect, leaveController.getEmployeeLeaveGrant);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-application:
 *   post:
 *     summary: Create a new EmployeeLeaveApplication
 *     tags: [Leave Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: EmployeeLeaveApplication details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                type: string
 *                required: true
 *               leaveCategory:
 *                 type: string
 *                 required: true
 *               level1Reason:
 *                 type: string
 *                 required: true
 *               level2Reason:
 *                 type: string
 *                 required: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 required: false
 *               endDate:
 *                 type: string
 *                 format: date
 *                 required: false
 *               comment:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *               isHalfDayOption:
 *                 type: boolean
 *                 required: true
 *               haldDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       required: true
 *                     dayHalf:
 *                       type: string
 *                       required: true
 *     responses:
 *       201:
 *         description: EmployeeLeaveApplication successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-application', authController.protect, leaveController.createEmployeeLeaveApplication);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-application/{id}:
 *   put:
 *     summary: Create a new EmployeeLeaveApplication
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
 *         description: ID of the Employee Leave Application
 *     requestBody:
 *       description: EmployeeLeaveApplication details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                type: string
 *                required: true
 *               leaveCategory:
 *                 type: string
 *                 required: true
 *               level1Reason:
 *                 type: string
 *                 required: true
 *               level2Reason:
 *                 type: string
 *                 required: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 required: false
 *               endDate:
 *                 type: string
 *                 format: date
 *                 required: false
 *               comment:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *               isHalfDayOption:
 *                 type: boolean
 *                 required: true
 *               haldDays:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       required: true
 *                     dayHalf:
 *                       type: string
 *                       required: true 
 *     responses:
 *       201:
 *         description: EmployeeLeaveApplication successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/employee-leave-application/:id', authController.protect, leaveController.updateEmployeeLeaveApplication);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-application-by-user/{userId}:
 *   post:
 *     summary: Get an Employee Leave Application by ID
 *     tags: [Leave Management]
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
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: userId of the User
 *     responses:
 *       200:
 *         description: Successful response with the Employee Leave Grant
 *       404:
 *         description: Employee Leave Entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-application-by-user/:userId', authController.protect, leaveController.getEmployeeLeaveApplicationByUser);


/**
 * @swagger
 * /api/v1/Leave/employee-leave-application-by-team:
 *   post:
 *     summary: Get an Employee Leave Application by ID
 *     tags: [Leave Management]
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
 *         description: Successful response with the Employee Leave Grant
 *       404:
 *         description: Employee Leave Entry not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-application-by-team', authController.protect, leaveController.getEmployeeLeaveApplicationByTeam);


/**
 * @swagger
 * /api/v1/Leave/employee-leave-application/{id}:
 *   delete:
 *     summary: Delete an Employee Leave Application by ID
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
 *         description: ID of the Employee Leave Application
 *     responses:
 *       204:
 *         description: Employee Leave Application successfully deleted
 *       404:
 *         description: Employee Leave Application not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-leave-application/:id', authController.protect, leaveController.deleteEmployeeLeaveApplication);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-application-list:
 *   post:
 *     summary: Get all Employee Leave Entry
 *     tags: [Leave Management]
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
 *                         status:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with Employee Leave Entry
 *       500:
 *         description: Internal server error
 */
router.post('/employee-leave-application-list', authController.protect, leaveController.getAllEmployeeLeaveApplication);

/**
 * @swagger
 * /api/v1/Leave/employee-leave-application/{id}:
 *   get:
 *     summary: Get an Employee Leave Application by ID
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
 *         description: id of the Leave Application
 *     responses:
 *       200:
 *         description: Successful response with the Leave Application
 *       404:
 *         description: Leave Entry not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-leave-application/:id', authController.protect, leaveController.getEmployeeLeaveApplication);


/**
 * @swagger
 * /api/v1/leave/short-leave:
 *   post:
 *     summary: Add a ShortLeave
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       description: ShortLeave details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 required: true
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *               durationInMinutes:
 *                 type: number
 *                 required: true
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *                 required: true
 *               level1Reason:
 *                 type: string
 *               level2Reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: ShortLeave successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/short-leave', authController.protect, leaveController.addShortLeave);

/**
 * @swagger
 * /api/v1/leave/short-leave/{id}:
 *   get:
 *     summary: Get a ShortLeave by ID
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ShortLeave
 *     responses:
 *       200:
 *         description: Successful response with the ShortLeave
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.get('/short-leave/:id', authController.protect, leaveController.getShortLeave);

/**
 * @swagger
 * /api/v1/leave/short-leave/{id}:
 *   put:
 *     summary: Update a ShortLeave by ID
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ShortLeave
 *     requestBody:
 *       description: New ShortLeave details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               durationInMinutes:
 *                 type: number
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *               level1Reason:
 *                 type: string
 *               level2Reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated ShortLeave
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.put('/short-leave/:id', authController.protect, leaveController.updateShortLeave);

/**
 * @swagger
 * /api/v1/leave/short-leave/{id}:
 *   delete:
 *     summary: Delete a ShortLeave by ID
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ShortLeave
 *     responses:
 *       204:
 *         description: ShortLeave successfully deleted
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.delete('/short-leave/:id', authController.protect, leaveController.deleteShortLeave);

/**
 * @swagger
 * /api/v1/leave/short-leave-by-user/{userId}:
 *   post:
 *     summary: Get a ShortLeave by User ID
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the User
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
 *         description: Successful response with the ShortLeave
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.post('/short-leave-by-user/:userId', authController.protect, leaveController.getShortLeaveByUser);


/**
 * @swagger
 * /api/v1/leave/short-leave-by-team:
 *   post:
 *     summary: Get a ShortLeave by Team
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
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
 *                         status:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with the ShortLeave
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.post('/short-leave-by-team', authController.protect, leaveController.getShortLeaveByTeam);


/**
 * @swagger
 * /api/v1/leave/short-leave:
 *   post:
 *     summary: Get a ShortLeave
 *     tags: [Leave Management]
 *     security: 
 *       - bearerAuth: []
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
 *                         status:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with the ShortLeave
 *       404:
 *         description: ShortLeave not found
 *       500:
 *         description: Internal server error
 */
router.post('/short-leave', authController.protect, leaveController.getAllShortLeave);

/**
 * @swagger
 * /api/v1/leave/get-leave-balance:
 *  post:
 *      tags: [Leave Management]
 *      summary: "Get Leave Balance"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         user:
 *                              type: string
 *                              required: true
 *                         cycle:
 *                              type: string
 *                              required: true
 *                         category:
 *                              type: string
 *                              required: true    
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
router.post('/get-leave-balance', authController.protect, leaveController.getLeaveBalance);

/**
 * @swagger
 * /api/v1/leave/get-leave-balance-by-team:
 *  post:
 *      tags: [Leave Management]
 *      summary: "Get Leave Balance"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          skip:
 *                              type: string
 *                          next:
 *                              type: string 
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
router.post('/get-leave-balance-by-team', authController.protect, leaveController.getLeaveBalanceByTeam);

module.exports = router;