const express = require('express');
const attendanceController = require('./../controllers/attendanceController');
const authController = require('../controllers/authController');
const attendanceRouter = express.Router();

// General Setting Routes
/**
 * @swagger
 * /api/v1/attendance/general-settings:
 *   post:
 *     summary: Create a new GeneralSettings
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: GeneralSettings details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canSelectRegularizationReason:
 *                 type: boolean
 *               canSelectOnDutyReason:
 *                 type: boolean
 *               shiftAssignmentsBasedOnRoster:
 *                 type: boolean 
 *               IsRegularizationandLeaveBlockedForUser:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: GeneralSettings successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/general-settings',authController.protect,attendanceController.createGeneralSettings);

/**
 * @swagger
 * /api/v1/attendance/general-settings-by-company:
 *   get:
 *     summary: Get a GeneralSettings by ID
 *     tags: [Attendance Management] 
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSettings
 *       404:
 *         description: GeneralSettings not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/general-settings-by-company',authController.protect, attendanceController.getGeneralSettings);

/**
 * @swagger
 * /api/v1/attendance/general-settings/{id}:
 *   put:
 *     summary: Update a GeneralSettings by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the GeneralSettings
 *     requestBody:
 *       description: New GeneralSettings details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canSelectRegularizationReason:
 *                 type: boolean
 *               canSelectOnDutyReason:
 *                 type: boolean
 *               shiftAssignmentsBasedOnRoster:
 *                 type: boolean
 *               regularizationRequestandLeaveApplicationBlockedForUser:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated GeneralSettings
 *       404:
 *         description: GeneralSettings not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/general-settings/:id', authController.protect, attendanceController.updateGeneralSettings);


//Regularization Reasons

/**
 * @swagger
 * /api/v1/attendance/regularization-reasons:
 *   post:
 *     summary: Create a new Regularization Reason
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Regularization Reason details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true 
 *               isFrequecyRestriction:
 *                 type: boolean
 *                 required: true 
 *               limit:
 *                 type: number
 *                 required: true 
 *               frequency:
 *                 type: string
 *                 required: true 
 *               applicableEmployee:
 *                 type: string
 *                 required: true
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       201:
 *         description: Regularization Reason successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/regularization-reasons', authController.protect, attendanceController.createRegularizationReason);

/**
 * @swagger
 * /api/v1/attendance/regularization-reasons/{id}:
 *   get:
 *     summary: Get a Regularization Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Regularization Reason
 *     responses:
 *       200:
 *         description: Successful response with the Regularization Reason
 *       404:
 *         description: Regularization Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/regularization-reasons/:id', authController.protect, attendanceController.getRegularizationReason);

/**
 * @swagger
 * /api/v1/attendance/regularization-reasons/{id}:
 *   put:
 *     summary: Update a Regularization Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Regularization Reason
 *     requestBody:
 *       description: New Regularization Reason details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true 
 *               isFrequecyRestriction:
 *                 type: boolean
 *                 required: true 
 *               limit:
 *                 type: number
 *                 required: true 
 *               frequency:
 *                 type: string
 *                 required: true 
 *               applicableEmployee:
 *                 type: string
 *                 required: true
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       200:
 *         description: Successful response with the updated Regularization Reason
 *       404:
 *         description: Regularization Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/regularization-reasons/:id', authController.protect, attendanceController.updateRegularizationReason);

/**
 * @swagger
 * /api/v1/attendance/regularization-reasons/{id}:
 *   delete:
 *     summary: Delete a Regularization Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Regularization Reason
 *     responses:
 *       204:
 *         description: Regularization Reason successfully deleted
 *       404:
 *         description: Regularization Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/regularization-reasons/:id', authController.protect, attendanceController.deleteRegularizationReason);

/**
 * @swagger
 * /api/v1/attendance/regularization-reasons:
 *   get:
 *     summary: Get all Regularization Reasons
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Regularization Reasons
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/regularization-reasons', authController.protect, attendanceController.getAllRegularizationReasons);

//Duty Reasons

/**
 * @swagger
 * /api/v1/attendance/duty-reasons:
 *   post:
 *     summary: Create a new Duty Reason
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Duty Reason details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true 
 *               applicableEmployee:
 *                 type: string
 *                 required: true
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       201:
 *         description: Duty Reason successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/duty-reasons', authController.protect, attendanceController.createOnDutyReason);

/**
 * @swagger
 * /api/v1/attendance/duty-reasons/{id}:
 *   get:
 *     summary: Get a Duty Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duty Reason
 *     responses:
 *       200:
 *         description: Successful response with the Duty Reason
 *       404:
 *         description: Duty Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/duty-reasons/:id', authController.protect, attendanceController.getOnDutyReason);

/**
 * @swagger
 * /api/v1/attendance/duty-reasons/{id}:
 *   put:
 *     summary: Update a Duty Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duty Reason
 *     requestBody:
 *       description: New Duty Reason details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 required: true 
 *               applicableEmployee:
 *                 type: string
 *                 required: true
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       200:
 *         description: Successful response with the updated Duty Reason
 *       404:
 *         description: Duty Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/duty-reasons/:id', authController.protect, attendanceController.updateOnDutyReason);

/**
 * @swagger
 * /api/v1/attendance/duty-reasons/{id}:
 *   delete:
 *     summary: Delete a Duty Reason by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Duty Reason
 *     responses:
 *       204:
 *         description: Duty Reason successfully deleted
 *       404:
 *         description: Duty Reason not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/duty-reasons/:id', authController.protect, attendanceController.deleteOnDutyReason);

/**
 * @swagger
 * /api/v1/attendance/duty-reasons:
 *   get:
 *     summary: Get all Duty Reasons
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Duty Reasons
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/duty-reasons', authController.protect, attendanceController.getAllOnDutyReasons);

//Attendance Template
/**
 * @swagger
 * /api/v1/attendance/attendance-templates:
 *   post:
 *     summary: Create a new Attendance Template
 *     tags: [Attendance Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Attendance Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the attendance template.
 *                 example: My Attendance Template
 *               attendanceMode:
 *                 type: string
 *                 description: The mode of attendance.
 *                 example: Online
 *               missingCheckInCheckoutHandlingMode:
 *                 type: string
 *                 description: The mode of handling missing check-ins and check-outs.
 *                 example: Manual
 *               missingCheckinCheckoutAttendanceProcessMode:
 *                 type: string
 *                 description: The mode of processing missing check-ins and check-outs.
 *                 example: Automatic
 *               minimumHoursRequiredPerWeek:
 *                 type: number
 *                 description: The minimum number of hours required per week.
 *                 example: 40
 *               notifyEmployeeMinHours:
 *                 type: boolean
 *                 description: Whether to notify employees if minimum hours are not met.
 *                 example: true
 *               isShortTimeLeaveDeductible:
 *                 type: boolean
 *                 description: Whether short time leave is deductible.
 *                 example: true
 *               weeklyOfDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week for weekly offs.
 *                 example: ["Monday", "Wednesday"]
 *               weklyofHalfDay:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week for weekly half days.
 *                 example: ["Friday"]
 *               alternateWeekOffRoutine:
 *                 type: string
 *                 description: Alternate week off routine.
 *                 example: Routine A
 *               daysForAlternateWeekOffRoutine:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days for alternate week off routine.
 *                 example: ["Sunday", "Thursday"]
 *               isNotificationToSupervisors:
 *                 type: boolean
 *                 description: Whether to send notifications to supervisors.
 *                 example: true
 *               isCommentMandatoryForRegularisation:
 *                 type: boolean
 *                 description: Whether comment is mandatory for regularization.
 *                 example: false
 *               departmentDesignations:
 *                 type: string
 *                 description: Department designations.
 *                 example: Designation A
 *               approversType:
 *                 type: string
 *                 description: Type of approvers.
 *                 example: Type A
 *               approvalLevel:
 *                 type: string
 *                 description: Approval level.
 *                 example: Level A
 *               primaryApprover:
 *                 type: string
 *                 description: Primary approver.
 *                 example: null
 *               secondaryApprover:
 *                 type: string
 *                 description: Secondary approver.
 *                 example: null
 *               leveCategoryHierarchyForAbsentHalfDay:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Leave category hierarchy for absent half day.
 *                 example: ["Category A", "Category B"]
 *     responses:
 *       201:
 *         description: Attendance Template successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

attendanceRouter.post('/attendance-templates', authController.protect, attendanceController.createAttendanceTemplate);

/**
 * @swagger
 * /api/v1/attendance/attendance-templates/{id}:
 *   put:
 *     summary: Update an Attendance Template by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template
 *     requestBody:
 *       description: Attendance Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the attendance template.
 *                 example: My Attendance Template
 *               attendanceMode:
 *                 type: string
 *                 description: The mode of attendance.
 *                 example: Online
 *               missingCheckInCheckoutHandlingMode:
 *                 type: string
 *                 description: The mode of handling missing check-ins and check-outs.
 *                 example: Manual
 *               missingCheckinCheckoutAttendanceProcessMode:
 *                 type: string
 *                 description: The mode of processing missing check-ins and check-outs.
 *                 example: Automatic
 *               minimumHoursRequiredPerWeek:
 *                 type: number
 *                 description: The minimum number of hours required per week.
 *                 example: 40
 *               notifyEmployeeMinHours:
 *                 type: boolean
 *                 description: Whether to notify employees if minimum hours are not met.
 *                 example: true
 *               isShortTimeLeaveDeductible:
 *                 type: boolean
 *                 description: Whether short time leave is deductible.
 *                 example: true
 *               weeklyOfDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week for weekly offs.
 *                 example: ["Monday", "Wednesday"]
 *               weklyofHalfDay:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week for weekly half days.
 *                 example: ["Friday"]
 *               alternateWeekOffRoutine:
 *                 type: string
 *                 description: Alternate week off routine.
 *                 example: Routine A
 *               daysForAlternateWeekOffRoutine:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days for alternate week off routine.
 *                 example: ["Sunday", "Thursday"]
 *               isNotificationToSupervisors:
 *                 type: boolean
 *                 description: Whether to send notifications to supervisors.
 *                 example: true
 *               isCommentMandatoryForRegularisation:
 *                 type: boolean
 *                 description: Whether comment is mandatory for regularization.
 *                 example: false
 *               departmentDesignations:
 *                 type: string
 *                 description: Department designations.
 *                 example: Designation A
 *               approversType:
 *                 type: string
 *                 description: Type of approvers.
 *                 example: Type A
 *               approvalLevel:
 *                 type: string
 *                 description: Approval level.
 *                 example: Level A
 *               primaryApprover:
 *                 type: string
 *                 description: Primary approver.
 *                 example: null
 *               secondaryApprover:
 *                 type: string
 *                 description: Secondary approver.
 *                 example: null
 *               leveCategoryHierarchyForAbsentHalfDay:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Leave category hierarchy for absent half day.
 *                 example: ["Category A", "Category B"]
 *     responses:
 *       200:
 *         description: Successful response with the updated Attendance Template
 *       404:
 *         description: Attendance Template not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/attendance-templates/:id', authController.protect, attendanceController.updateAttendanceTemplate);

/**
 * @swagger
 * /api/v1/attendance/attendance-templates/{id}:
 *   delete:
 *     summary: Delete an Attendance Template by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template
 *     responses:
 *       204:
 *         description: Attendance Template successfully deleted
 *       404:
 *         description: Attendance Template not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/attendance-templates/:id', authController.protect, attendanceController.deleteAttendanceTemplate);

/**
 * @swagger
 * /api/v1/attendance/attendance-templates:
 *   get:
 *     summary: Get all Attendance Templates
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Attendance Templates
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-templates', authController.protect, attendanceController.getAllAttendanceTemplates);

/**
 * @swagger
 * /api/v1/attendance/attendance-templates/{id}:
 *   get:
 *     summary: Get an Attendance Template by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template
 *     responses:
 *       200:
 *         description: Successful response with the Attendance Template
 *       404:
 *         description: Attendance Template not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-templates/:id', authController.protect, attendanceController.getAttendanceTemplate);


//Attdance Template Regulrization
/**
 * @swagger
 * /api/v1/attendance/regularizations:
 *   post:
 *     summary: Add a new Attendance Regularization
 *     tags: [Attendance Management]
 *     requestBody:
 *       description: Attendance Regularization details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canEmpRegularizeOwnAttendance:
 *                 type: string
 *               canSupervisorsRegularizeSubordinatesAttendance:
 *                 type: string
 *               canAdminEditRegularizeAttendance:
 *                 type: string
 *               isIPrestrictedEmployeeCheckInCheckOut:
 *                 type: string
 *               IPDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     IP:
 *                       type: string
 *                       required: true 
 *               shouldWeeklyEmailNotificationToBeSent:
 *                 type: string
 *               whoReceiveWeeklyEmailNotification:
 *                 type: array
 *                 items:
 *                   type: string
 *               isRestrictLocationForCheckInCheckOutUsingMobile:
 *                 type: string
 *               restrictLocationDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     Location:
 *                       type: string
 *                       required: true 
 *                     Latitude:
 *                       type: string
 *                       required: true 
 *                     Longitude:
 *                       type: string
 *                       required: true 
 *                     Radius:
 *                       type: string
 *                       required: true  
 *               howAssignLocationsForEachEmployee:
 *                 type: string
 *               enableLocationCaptureFromMobile:
 *                 type: string
 *               geoLocationAPIProvider:
 *                 type: string
 *               googleAPIKey:
 *                 type: string
 *               isFacialFingerprintRecognitionFromMobile:
 *                 type: string
 *               attendanceTemplate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance Regularization successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/regularizations', attendanceController.addAttendanceRegularization);

/**
 * @swagger
 * /api/v1/attendance/regularizations/{id}:
 *   get:
 *     summary: Get an Attendance Regularization by ID
 *     tags: [Attendance Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Regularization
 *     responses:
 *       200:
 *         description: Successful response with the Attendance Regularization
 *       404:
 *         description: Attendance Regularization not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/regularizations/:id', attendanceController.getAttendanceRegularization);

/**
 * @swagger
 * /api/v1/attendance/regularizations/{id}:
 *   put:
 *     summary: Update an Attendance Regularization by ID
 *     tags: [Attendance Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Regularization
 *     requestBody:
 *       description: Attendance Regularization details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canEmpRegularizeOwnAttendance:
 *                 type: string
 *               canSupervisorsRegularizeSubordinatesAttendance:
 *                 type: string
 *               canAdminEditRegularizeAttendance:
 *                 type: string 
 *               isIPrestrictedEmployeeCheckInCheckOut:
 *                 type: string
 *               IPDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     IP:
 *                       type: string
 *                       required: true 
 *               shouldWeeklyEmailNotificationToBeSent:
 *                 type: string
 *               whoReceiveWeeklyEmailNotification:
 *                 type: array
 *                 items:
 *                   type: string
 *               isRestrictLocationForCheckInCheckOutUsingMobile:
 *                 type: string
 *               restrictLocationDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     Location:
 *                       type: string
 *                       required: true 
 *                     Latitude:
 *                       type: string
 *                       required: true 
 *                     Longitude:
 *                       type: string
 *                       required: true 
 *                     Radius:
 *                       type: string
 *                       required: true  
 *               howAssignLocationsForEachEmployee:
 *                 type: string
 *               enableLocationCaptureFromMobile:
 *                 type: string
 *               geoLocationAPIProvider:
 *                 type: string
 *               googleAPIKey:
 *                 type: string
 *               isFacialFingerprintRecognitionFromMobile:
 *                 type: string
 *               attendanceTemplate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Attendance Regularization
 *       404:
 *         description: Attendance Regularization not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/regularizations/:id', attendanceController.updateAttendanceRegularization);

/**
 * @swagger
 * /api/v1/attendance/regularizations-by-company:
 *   get:
 *     summary: Get all Attendance Regularizations by Company ID
 *     tags: [Attendance Management]
 *     responses:
 *       200:
 *         description: Successful response with Attendance Regularizations
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/regularizations-by-company', attendanceController.getAllAttendanceRegularizationsByCompany);

/**
 * @swagger
 * /api/v1/attendance/regularizations/{id}:
 *   delete:
 *     summary: Delete an Attendance Regularization by ID
 *     tags: [Attendance Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Regularization
 *     responses:
 *       204:
 *         description: Attendance Regularization successfully deleted
 *       404:
 *         description: Attendance Regularization not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/regularizations/:id', attendanceController.deleteAttendanceRegularization);

//Attandance Assignment

/**
 * @swagger
 * /api/v1/attendance/attendance-assignments:
 *   post:
 *     summary: Create a new Attendance Template Assignment
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Attendance Template Assignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *                 required: true
 *               attandanceTemplate:
 *                 type: string
 *                 required: true
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *                 required: true
 *               primaryApprover:
 *                 type: string
 *               secondaryApprover:
 *                 type: string 
 *     responses:
 *       201:
 *         description: Attendance Template Assignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/attendance-assignments', authController.protect, attendanceController.createAttendanceAssignment);

/**
 * @swagger
 * /api/v1/attendance/attendance-assignments/{id}:
 *   get:
 *     summary: Get an Attendance Template Assignment by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template Assignment
 *     responses:
 *       200:
 *         description: Successful response with the Attendance Template Assignment
 *       404:
 *         description: Attendance Template Assignment not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-assignments/:id', authController.protect, attendanceController.getAttendanceAssignment);

/**
 * @swagger
 * /api/v1/attendance/attendance-assignments/{id}:
 *   put:
 *     summary: Update an Attendance Template Assignment by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template Assignment
 *     requestBody:
 *       description: New Attendance Template Assignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primaryApprovar:
 *                 type: string
 *               secondaryApprovar:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Successful response with the updated Attendance Template Assignment
 *       404:
 *         description: Attendance Template Assignment not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/attendance-assignments/:id', authController.protect, attendanceController.updateAttendanceAssignment);

/**
 * @swagger
 * /api/v1/attendance/attendance-assignments/{id}:
 *   delete:
 *     summary: Delete an Attendance Template Assignment by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Attendance Template Assignment
 *     responses:
 *       204:
 *         description: Attendance Template Assignment successfully deleted
 *       404:
 *         description: Attendance Template Assignment not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/attendance-assignments/:id', authController.protect, attendanceController.deleteAttendanceAssignment);

/**
 * @swagger
 * /api/v1/attendance/attendance-assignments:
 *   get:
 *     summary: Get all Attendance Template Assignments
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Attendance Template Assignments
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-assignments', authController.protect, attendanceController.getAllAttendanceAssignments);

//Rounding Information
/**
 * @swagger
 * /api/v1/attendance/rounding-information:
 *   post:
 *     summary: Create a new rounding information
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Rounding information details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roundingPatternName:
 *                 type: string
 *                 required: true
 *               roundingPatternCode:
 *                 type: string
 *                 required: true
 *               shift:
 *                 type: string
 *                 required: true
 *               roundingPatternMethod:
 *                 type: string
 *                 required: true
 *               roundingPattern:
 *                 type: string
 *                 required: true
 *               roundingValue:
 *                 type: number
 *                 required: true
 *               OTtypeApplicable:
 *                 type: string
 *                 required: true  
 *               OTtypeApplicablePreOT:
 *                 type: string
 *                 required: true
 *               PreOTValueMinutes:
 *                 type: string
 *               PreOTValueHour:
 *                 type: string
 *               OTtypeApplicablePostOT:
 *                 type: string
 *                 required: true
 *               PostOTValueHour:
 *                 type: string
 *               PostOTValueMinutes:
 *                 type: string
 *               OTtypeApplicableWeekOFf:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Rounding information successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/rounding-information',authController.protect,attendanceController.createRoundingInformation);

/**
 * @swagger
 * /api/v1/attendance/rounding-information/{id}:
 *   get:
 *     summary: Get a rounding information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding information
 *     responses:
 *       200:
 *         description: Successful response with the rounding information
 *       404:
 *         description: Rounding information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/rounding-information/:id',authController.protect,attendanceController.getRoundingInformation);

/**
 * @swagger
 * /api/v1/attendance/rounding-information/{id}:
 *   put:
 *     summary: Update a rounding information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding information
 *     requestBody:
 *       description: New rounding information details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roundingPatternName:
 *                 type: string
 *               roundingPatternCode:
 *                 type: string
 *               shift:
 *                 type: string
 *               roundingPatternMethod:
 *                 type: string
 *               roundingPattern:
 *                 type: string
 *               roundingValue:
 *                 type: number
 *               OTtypeApplicable:
 *                 type: string   
 *               OTtypeApplicablePreOT:
 *                 type: string
 *                 required: true
 *               PreOTValueMinutes:
 *                 type: string
 *               PreOTValueHour:
 *                 type: string
 *               OTtypeApplicablePostOT:
 *                 type: string
 *                 required: true
 *               PostOTValueHour:
 *                 type: string
 *               PostOTValueMinutes:
 *                 type: string
 *               OTtypeApplicableWeekOFf:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated rounding information
 *       404:
 *         description: Rounding information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/rounding-information/:id',authController.protect,attendanceController.updateRoundingInformation);

/**
 * @swagger
 * /api/v1/attendance/rounding-information/{id}:
 *   delete:
 *     summary: Delete a rounding information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rounding information
 *     responses:
 *       204:
 *         description: Rounding information successfully deleted
 *       404:
 *         description: Rounding information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/rounding-information/:id',authController.protect,attendanceController.deleteRoundingInformation);

//Overtime Information

/**
 * @swagger
 * /api/v1/attendance/overtime-information:
 *   post:
 *     summary: Create a new Overtime Information
 *     tags: [Attendance Management]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       description: Overtime Information details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 required: true
 *               OvertimeInformation:
 *                 type: string
 *                 required: true
 *               BaseType:
 *                 type: string
 *               AttandanceShift:
 *                 type: string
 *               FromTimeHour:
 *                 type: string
 *                 required: true
 *               FromTimeMinutes:
 *                 type: string
 *                 required: true
 *               FromTimeTT:
 *                 type: string
 *                 required: true
 *               ToTimeHour:
 *                 type: string
 *                 required: true
 *               ToTimeMinutes:
 *                 type: string
 *                 required: true
 *               ToTimeTT:
 *                 type: string
 *                 required: true
 *               CutomMultiplier:
 *                 type: number
 *                 required: true
 *               CalculationType:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Overtime Information successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/overtime-information', authController.protect, attendanceController.createOvertimeInformation);

/**
 * @swagger
 * /api/v1/attendance/overtime-information/{id}:
 *   get:
 *     summary: Get an Overtime Information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Overtime Information
 *     responses:
 *       200:
 *         description: Successful response with the Overtime Information
 *       404:
 *         description: Overtime Information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/overtime-information/:id', authController.protect, attendanceController.getOvertimeInformation);

/**
 * @swagger
 * /api/v1/attendance/overtime-information/{id}:
 *   put:
 *     summary: Update an Overtime Information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Overtime Information
 *     requestBody:
 *       description: New Overtime Information details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 required: true
 *               OvertimeInformation:
 *                 type: string
 *                 required: true
 *               BaseType:
 *                 type: string
 *               AttandanceShift:
 *                 type: string
 *               FromTimeHour:
 *                 type: string
 *                 required: true
 *               FromTimeMinutes:
 *                 type: string
 *                 required: true
 *               FromTimeTT:
 *                 type: string
 *                 required: true
 *               ToTimeHour:
 *                 type: string
 *                 required: true
 *               ToTimeMinutes:
 *                 type: string
 *                 required: true
 *               ToTimeTT:
 *                 type: string
 *                 required: true
 *               CutomMultiplier:
 *                 type: number
 *                 required: true
 *               CalculationType:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated Overtime Information
 *       404:
 *         description: Overtime Information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/overtime-information/:id', authController.protect, attendanceController.updateOvertimeInformation);

/**
 * @swagger
 * /api/v1/attendance/overtime-information/{id}:
 *   delete:
 *     summary: Delete an Overtime Information by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Overtime Information
 *     responses:
 *       204:
 *         description: Overtime Information successfully deleted
 *       404:
 *         description: Overtime Information not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/overtime-information/:id', authController.protect, attendanceController.deleteOvertimeInformation);

/**
 * @swagger
 * /api/v1/attendance/overtime-information:
 *   get:
 *     summary: Get all Overtime Information
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with Overtime Information
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/overtime-information', authController.protect, attendanceController.getAllOvertimeInformation);


// UserOnDutyTemplate routes
/**
 * @swagger
 * /api/v1/attendance/user-on-duty-templates:
 *   post:
 *     summary: Add a UserOnDutyTemplate
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: UserOnDutyTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 format: uuid
 *                 required: true
 *               onDutyTemplate:
 *                 type: string
 *                 format: uuid
 *                 required: true
 *     responses:
 *       201:
 *         description: UserOnDutyTemplate added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/user-on-duty-templates', authController.protect, attendanceController.createUserOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/user-on-duty-templates/{id}:
 *   get:
 *     summary: Get a UserOnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the UserOnDutyTemplate
 *     responses:
 *       200:
 *         description: Successful response with the UserOnDutyTemplate
 *       404:
 *         description: UserOnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/user-on-duty-templates/:id', authController.protect, attendanceController.getUserOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/user-on-duty-templates/{id}:
 *   put:
 *     summary: Update a UserOnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the UserOnDutyTemplate
 *     requestBody:
 *       description: New UserOnDutyTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 format: uuid
 *               onDutyTemplate:
 *                 type: string
 *                 format: uuid 
 *     responses:
 *       200:
 *         description: Successful response with the updated UserOnDutyTemplate
 *       404:
 *         description: UserOnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/user-on-duty-templates/:id', authController.protect, attendanceController.updateUserOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/user-on-duty-templates/{id}:
 *   delete:
 *     summary: Delete a UserOnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the UserOnDutyTemplate
 *     responses:
 *       204:
 *         description: UserOnDutyTemplate successfully deleted
 *       404:
 *         description: UserOnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/user-on-duty-templates/:id', authController.protect, attendanceController.deleteUserOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/user-on-duty-templates:
 *   get:
 *     summary: Get all UserOnDutyTemplates
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with UserOnDutyTemplates
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/user-on-duty-templates', authController.protect, attendanceController.getAllUserOnDutyTemplates);


// AttendanceMode routes
/**
 * @swagger
 * /api/v1/attendance/attendance-modes:
 *   post:
 *     summary: Create a new attendance mode
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Attendance mode details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 required: true 
 *     responses:
 *       201:
 *         description: Attendance mode successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/attendance-modes', authController.protect, attendanceController.createAttendanceMode);

/**
 * @swagger
 * /api/v1/attendance/attendance-modes/{id}:
 *   get:
 *     summary: Get an attendance mode by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the attendance mode
 *     responses:
 *       200:
 *         description: Successful response with the attendance mode
 *       404:
 *         description: Attendance mode not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-modes/:id', authController.protect, attendanceController.getAttendanceMode);

/**
 * @swagger
 * /api/v1/attendance/attendance-modes/{id}:
 *   put:
 *     summary: Update an attendance mode by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the attendance mode
 *     requestBody:
 *       description: New attendance mode details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Successful response with the updated attendance mode
 *       404:
 *         description: Attendance mode not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/attendance-modes/:id', authController.protect, attendanceController.updateAttendanceMode);

/**
 * @swagger
 * /api/v1/attendance/attendance-modes/{id}:
 *   delete:
 *     summary: Delete an attendance mode by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the attendance mode
 *     responses:
 *       204:
 *         description: Attendance mode successfully deleted
 *       404:
 *         description: Attendance mode not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/attendance-modes/:id', authController.protect, attendanceController.deleteAttendanceMode);

/**
 * @swagger
 * /api/v1/attendance/attendance-modes:
 *   get:
 *     summary: Get all attendance modes
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with attendance modes
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/attendance-modes', authController.protect, attendanceController.getAllAttendanceModes);


// OnDutyTemplate routes
/**
 * @swagger
 * /api/v1/attendance/onDutyTemplates:
 *   post:
 *     summary: Create a new OnDutyTemplate
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: OnDutyTemplate details
 *       required: true
 *       content:

*         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               isCommentMandatory:
 *                 type: boolean
 *                 required: true
 *               canSubmitForMultipleDays:
 *                 type: boolean
 *                 required: true 
 *     responses:
 *       201:
 *         description: OnDutyTemplate successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/', authController.protect, attendanceController.createOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/onDutyTemplates/{id}:
 *   get:
 *     summary: Get an OnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the OnDutyTemplate
 *     responses:
 *       200:
 *         description: Successful response with the OnDutyTemplate
 *       404:
 *         description: OnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/:id', authController.protect, attendanceController.getOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/onDutyTemplates/{id}:
 *   put:
 *     summary: Update an OnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the OnDutyTemplate
 *     requestBody:
 *       description: New OnDutyTemplate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isCommentMandatory:
 *                 type: boolean
 *               canSubmitForMultipleDays:
 *                 type: boolean 
 *     responses:
 *       200:
 *         description: Successful response with the updated OnDutyTemplate
 *       404:
 *         description: OnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/:id', authController.protect, attendanceController.updateOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/onDutyTemplates/{id}:
 *   delete:
 *     summary: Delete an OnDutyTemplate by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the OnDutyTemplate
 *     responses:
 *       204:
 *         description: OnDutyTemplate successfully deleted
 *       404:
 *         description: OnDutyTemplate not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/:id', authController.protect, attendanceController.deleteOnDutyTemplate);

/**
 * @swagger
 * /api/v1/attendance/onDutyTemplates:
 *   get:
 *     summary: Get all OnDutyTemplates
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with OnDutyTemplates
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/', authController.protect, attendanceController.getAllOnDutyTemplates);

/**
 * @swagger
 * tags:
 *   name: Attendance Management
 */

/**
 * @swagger
 * /api/v1/attendance/regularizationRequests:
 *   post:
 *     summary: Create a new Regularization Request
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Regularization Request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               regularizationDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               requestType:
 *                 type: string
 *                 required: true
 *               shift:
 *                 type: string
 *                 required: true
 *               reason:
 *                 type: string
 *                 required: true
 *               comment:
 *                 type: string 
 *               user:
 *                 type: string
 *     responses:
 *       201:
 *         description: Regularization Request successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post(
    '/regularizationRequests',
    authController.protect,
    attendanceController.createRegularizationRequest
  );
  
  /**
   * @swagger
   * /api/v1/attendance/regularizationRequests/{id}:
   *   get:
   *     summary: Get a Regularization Request by ID
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the Regularization Request
   *     responses:
   *       200:
   *         description: Successful response with the Regularization Request
   *       404:
   *         description: Regularization Request not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.get(
    '/regularizationRequests/:id',
    authController.protect,
    attendanceController.getRegularizationRequest
  );
  
  /**
   * @swagger
   * /api/v1/attendance/regularizationRequests/{id}:
   *   put:
   *     summary: Update a Regularization Request by ID
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the Regularization Request
   *     requestBody:
   *       description: New Regularization Request details
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               regularizationDate:
   *                 type: string
   *                 format: date
   *               requestType:
   *                 type: string
   *               shift:
   *                 type: string
   *               reason:
   *                 type: string
   *               comment:
   *                 type: string   
   *               user:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful response with the updated Regularization Request
   *       404:
   *         description: Regularization Request not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.put(
    '/regularizationRequests/:id',
    authController.protect,
    attendanceController.updateRegularizationRequest
  );
  
  /**
   * @swagger
   * /api/v1/attendance/regularizationRequests/{id}:
   *   delete:
   *     summary: Delete a Regularization Request by ID
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the Regularization Request
   *     responses:
   *       204:
   *         description: Regularization Request successfully deleted
   *       404:
   *         description: Regularization Request not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.delete(
    '/regularizationRequests/:id',
    authController.protect,
    attendanceController.deleteRegularizationRequest
  );
  
  /**
   * @swagger
   * /api/v1/attendance/regularizationRequests:
   *   get:
   *     summary: Get all Regularization Requests
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     responses:
   *       200:
   *         description: Successful response with Regularization Requests
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.get(
    '/regularizationRequests',
    authController.protect,
    attendanceController.getAllRegularizationRequests
  );
    
/**
 * @swagger
 * tags:
 *   name: Attendance Management
 *   description: API endpoints for managing shifts
 */

/**
 * @swagger
 * /api/v1/attendance/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Attendance Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Shift details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       201:
 *         description: Shift successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/shifts', authController.protect, attendanceController.createShift);

/**
 * @swagger
 * /api/v1/attendance/shifts/{id}:
 *   get:
 *     summary: Get a shift by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shift
 *     responses:
 *       200:
 *         description: Successful response with the shift
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/shifts/:id', authController.protect, attendanceController.getShift);

/**
 * @swagger
 * /api/v1/attendance/shifts/{id}:
 *   put:
 *     summary: Update a shift by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shift
 *     requestBody:
 *       description: New shift details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       200:
 *         description: Successful response with the updated shift
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/shifts/:id', authController.protect, attendanceController.updateShift);

/**
 * @swagger
 * /api/v1/attendance/shifts/{id}:
 *   delete:
 *     summary: Delete a shift by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shift
 *     responses:
 *       204:
 *         description: Shift successfully deleted
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/shifts/:id', authController.protect, attendanceController.deleteShift);

/**
 * @swagger
 * /api/v1/attendance/shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with shifts
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/shifts', authController.protect, attendanceController.getAllShifts);


// Swagger annotation: Define the Tag and URL prefix
/**
 * @swagger
 * tags:
 *   name: Attendance Management
 *   description: API endpoints for Shift Template Assignments
 * /api/v1/attendance/shift-template-assignments:
 */

/**
 * @swagger
 * /api/v1/attendance/shift-template-assignments:
 *   post:
 *     summary: Create a new ShiftTemplateAssignment
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: ShiftTemplateAssignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *     responses:
 *       201:
 *         description: ShiftTemplateAssignment successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post(
    '/',
    authController.protect,
    attendanceController.createShiftTemplateAssignment
  );
  
  /**
   * @swagger
   * /api/v1/attendance/shift-template-assignments/{id}:
   *   get:
   *     summary: Get a ShiftTemplateAssignment by ID
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the ShiftTemplateAssignment
   *     responses:
   *       200:
   *         description: Successful response with the ShiftTemplateAssignment
   *       404:
   *         description: ShiftTemplateAssignment not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.get('/:id', authController.protect, attendanceController.getShiftTemplateAssignment);
  
  /**
   * @swagger
   * /api/v1/attendance/shift-template-assignments/{id}:
   *   put:
   *     summary: Update a ShiftTemplateAssignment by ID
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the ShiftTemplateAssignment
   *     requestBody:
   *       description: New ShiftTemplateAssignment details
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               template:
   *                 type: string
   *               user:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Successful response with the updated ShiftTemplateAssignment
   *       404:
   *         description: ShiftTemplateAssignment not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.put('/:id', authController.protect, attendanceController.updateShiftTemplateAssignment);
  
  /**
   * @swagger
   * /api/v1/attendance/shift-template-assignments/{id}:
   *   delete:
   *     summary: Delete a ShiftTemplateAssignment by ID
   *     tags: [Attendance Management]
   *     security: [{
   *          bearerAuth: []
   *     }]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the ShiftTemplateAssignment
   *     responses:
   *       204:
   *         description: ShiftTemplateAssignment successfully deleted
   *       404:
   *         description: ShiftTemplateAssignment not found
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.delete('/:id', authController.protect, attendanceController.deleteShiftTemplateAssignment);
  
  /**
   * @swagger
   * /api/v1/attendance/shift-template-assignments:
   *   get:
   *     summary: Get all ShiftTemplateAssignments
   *     tags: [Attendance Management]
   *     security: [{
   *         bearerAuth: []
   *     }]
   *     responses:
   *       200:
   *         description: Successful response with ShiftTemplateAssignments
   *       500:
   *         description: Internal server error
   */
  attendanceRouter.get('/', authController.protect, attendanceController.getAllShiftTemplateAssignments);
  
// DutyRequest routes
/**
 * @swagger
 * /api/v1/attendance/duty-requests:
 *   post:
 *     summary: Create a new DutyRequest
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: DutyRequest details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               onDutyReason:
 *                 type: string
 *                 required: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               endDate:
 *                 type: string
 *                 format: date
 *                 required: true
 *               comment:
 *                 type: string
 *               user:
 *                 type: string 
 *     responses:
 *       201:
 *         description: DutyRequest successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
attendanceRouter.post('/duty-requests', authController.protect, attendanceController.createDutyRequest);

/**
 * @swagger
 * /api/v1/attendance/duty-requests/{id}:
 *   get:
 *     summary: Get a DutyRequest by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DutyRequest
 *     responses:
 *       200:
 *         description: Successful response with the DutyRequest
 *       404:
 *         description: DutyRequest not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/duty-requests/:id', authController.protect, attendanceController.getDutyRequest);

/**
 * @swagger
 * /api/v1/attendance/duty-requests/{id}:
 *   put:
 *     summary: Update a DutyRequest by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DutyRequest
 *     requestBody:
 *       description: New DutyRequest details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               onDutyReason:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               comment:
 *                 type: string
 *               user:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Successful response with the updated DutyRequest
 *       404:
 *         description: DutyRequest not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.put('/duty-requests/:id', authController.protect, attendanceController.updateDutyRequest);

/**
 * @swagger
 * /api/v1/attendance/duty-requests/{id}:
 *   delete:
 *     summary: Delete a DutyRequest by ID
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DutyRequest
 *     responses:
 *       204:
 *         description: DutyRequest successfully deleted
 *       404:
 *         description: DutyRequest not found
 *       500:
 *         description: Internal server error
 */
attendanceRouter.delete('/duty-requests/:id', authController.protect, attendanceController.deleteDutyRequest);

/**
 * @swagger
 * /api/v1/attendance/duty-requests:
 *   get:
 *     summary: Get all DutyRequests
 *     tags: [Attendance Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with DutyRequests
 *       500:
 *         description: Internal server error
 */
attendanceRouter.get('/duty-requests', authController.protect, attendanceController.getAllDutyRequests);  

 
module.exports = attendanceRouter;