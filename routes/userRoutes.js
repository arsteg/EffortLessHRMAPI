const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

// Auth routes
/**
 * @swagger
 * /api/v1/users/signup:
 *  post:
 *      tags:
 *          - Registration
 *      summary: "Register New User"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                          lastName:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                          passwordConfirm:
 *                              type: string
 *                          role:
 *                              type: string
 *                          companyId:
 *                              type: string
 *                          mobile:
 *                              type: string
 *                          emergancyContactName:
 *                              type: string
 *                          emergancyContactNumber:
 *                              type: string
 *                          Gender:
 *                              type: string
 *                          DOB:
 *                              type: string
 *                              format: date-time
 *                          MaritalStatus:
 *                              type: string
 *                          MarraigeAniversary:
 *                              type: string
 *                              format: date-time
 *                          PassportDetails:
 *                              type: string
 *                          Pancard:
 *                              type: string
 *                          AadharNumber:
 *                              type: string
 *                          Disability:
 *                              type: string
 *                          FatherHusbandName:
 *                              type: string
 *                          NoOfChildren:
 *                              type: string
 *                          BankName:
 *                              type: string
 *                          BankAccountNumber:
 *                              type: string
 *                          BankIFSCCode:
 *                              type: string
 *                          BankBranch:
 *                              type: string
 *                          BankAddress:
 *                              type: string 
 *              
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
router.post('/signup', authController.signup);

// Auth routes
/**
 * @swagger
 * /api/v1/users/websignup:
 *  post:
 *      tags:
 *          - Registration
 *      summary: "Register New User from web application , here company also created with default data"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                          lastName:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                          passwordConfirm:
 *                              type: string
 *                          companyName:
 *                              type: string
 *              
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
router.post('/websignup', authController.webSignup);
/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *      tags:
 *          - Authorization
 *      summary: "Login & Returns Authorization Token"
 *      description: "Authorizes default users with username and password set as root to use the endpoints"

 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: 
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *              
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Authorization token"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
router.post('/login', authController.login);
/**
 * @swagger
 * /api/v1/users/getUsersByCompany/{companyId}:
 *  get:
 *      tags:
 *          - User Management
 *      summary: "Get all User Based On CompanyId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: companyId
 *         in: path
 *         description: Company Id
 *         required: true
 *         schema:
 *           type: string
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
router.get('/getUsersByCompany/:companyId',authController.protect,userController.getUsersByCompany);
/**
 * @swagger
 * /api/v1/users/getusers:
 *  post:
 *      tags:
 *          - User Management
 *      summary: "Get User by userId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:                   
 *                          userId:
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
router.post('/getusers',userController.getUsers);
/**
 * @swagger
 * /api/v1/users/forgotPassword:
 *  post:
 *      tags:
 *          - Registration
 *      summary: "forgot Password"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:                   
 *                          email:
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
router.post('/forgotPassword', authController.forgotPassword);
/**
 * @swagger
 * /api/v1/users/resetPassword/{token}:
 *  patch:
 *      tags:
 *          - Registration
 *      summary: "Reset Password"   
 *      parameters:
 *       - name: token
 *         in: path
 *         description: Token
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *           
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          password:
 *                              type: string
 *                          passwordConfirm:
 *                              type: string
 *  
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
router.patch('/resetPassword/:token', authController.resetPassword);
/**
 * @swagger
 * /api/v1/users/inviteUser:
 *  post:
 *      tags:
 *          - User Management
 *      summary: "Create User and Invite on email to update profile"   
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                          lastName:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                          passwordConfirm:
 *                              type: string
 *                          role:
 *                              type: string
 *                          phone:
 *                              type: string
 *                          mobile:
 *                              type: string
 *                          emergancyContactName:
 *                              type: string
 *                          emergancyContactNumber:
 *                              type: string
 *                          Gender:
 *                              type: string
 *                          DOB:
 *                              type: string
 *                              format: date-time
 *                          MaritalStatus:
 *                              type: string
 *                          MarraigeAniversary:
 *                              type: string
 *                              format: date-time
 *                          PassportDetails:
 *                              type: string
 *                          Pancard:
 *                              type: string
 *                          AadharNumber:
 *                              type: string
 *                          Disability:
 *                              type: string
 *                          FatherHusbandName:
 *                              type: string
 *                          NoOfChildren:
 *                              type: string
 *                          BankName:
 *                              type: string
 *                          BankAccountNumber:
 *                              type: string
 *                          BankIFSCCode:
 *                              type: string
 *                          BankBranch:
 *                              type: string
 *                          BankAddress:
 *                              type: string
 *              
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
router.post('/inviteUser', authController.CreateUser);
router.patch(
  '/updateMyPassword',  
  authController.updatePassword
);
router.patch(
  '/updateUserbyinvitation',  
  authController.updateUserbyinvitation
);

// Protect all routes from now on
//router.use(authController.protect);
/**
 * @swagger
 * /api/v1/users/me:
 *  post:
 *      tags:
 *          - User Management
 *      summary: "Get User By Id"   
 *      security: [{
 *         bearerAuth: []
 *     }]
  *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
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
router.post('/me',authController.protect,userController.getUser);
/**
 * @swagger
 * /api/v1/users/updateuser/{id}:
 *  patch:
 *      tags:
 *          - User Management
 *      summary: "Update User"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                          lastName:
 *                              type: string
 *                          jobTitle:
 *                              type: string
 *                          address:
 *                              type: string
 *                          city:
 *                              type: string
 *                          state:
 *                              type: string
 *                          pincode:
 *                              type: string
 *                          phone:
 *                              type: string
 *                          extraDetails:
 *                              type: string
 *                          role:
 *                              type: string
 *                          mobile:
 *                              type: string
 *                          emergancyContactName:
 *                              type: string
 *                          emergancyContactNumber:
 *                              type: string
 *                          Gender:
 *                              type: string
 *                          DOB:
 *                              type: string
 *                              format: date-time
 *                          MaritalStatus:
 *                              type: string
 *                          MarraigeAniversary:
 *                              type: string
 *                              format: date-time
 *                          PassportDetails:
 *                              type: string
 *                          Pancard:
 *                              type: string
 *                          AadharNumber:
 *                              type: string
 *                          Disability:
 *                              type: string
 *                          FatherHusbandName:
 *                              type: string
 *                          NoOfChildren:
 *                              type: string
 *                          BankName:
 *                              type: string
 *                          BankAccountNumber:
 *                              type: string
 *                          BankIFSCCode:
 *                              type: string
 *                          BankBranch:
 *                              type: string
 *                          BankAddress:
 *                              type: string
 *                          
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
router.patch('/updateuser/:id',authController.protect, userController.updateUser);

/**
 * @swagger
 * /api/v1/users/deleteuser/{id}:
 *  delete:
 *      tags:
 *          - User Management
 *      summary: "Update User"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
router.delete('/deleteuser/:id',userController.deleteUser);

// Only admins are able to use routes below
//router.use(authController.restrictTo('admin'));
/**
 * @swagger
 * /api/v1/users:
 *  get:
 *      tags:
 *          - User Management
 *      summary: "Get All Users"   
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
router.get('/',authController.protect, userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/getUserManagers/{id}:
 *  get:
 *      tags:
 *          - User Management
 *      summary: "Get Managers By UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *        - name: id
 *          in: path
 *          description: User Id
 *          required: true 
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
router.route('/getUserManagers/:id').get(userController.getUserManagers);
/**
 * @swagger
 * /api/v1/users/getUserProjects/{id}:
 *  get:
 *      tags:
 *          - User Management
 *      summary: "Get all projects Based On UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: User Id
 *         required: true
 *         schema:
 *           type: string
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
 router.get('/getUserProjects/:id',authController.protect,userController.getUserProjects);

/**
 * @swagger
 * /api/v1/users/user-employment:
 *   post:
 *     summary: Add a new user employment record
 *     tags: 
 *          - User Management
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     requestBody:
 *       description: User employment details to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID of the user associated with the employment
 *                 required: true
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of employment
 *                 required: true
 *               location:
 *                 type: string
 *                 description: Location of employment
 *                 required: true
 *               designation:
 *                 type: string
 *                 description: ID of the designation
 *               employmentType:
 *                 type: string
 *                 description: Type of employment (e.g., full-time, part-time)
 *                 required: true
 *               reportingSupervisor:
 *                 type: string
 *                 description: ID of the reporting supervisor
 *               department:
 *                 type: string
 *                 description: ID of the department
 *               band:
 *                 type: string
 *                 description: ID of the band
 *               subDepartments:
 *                 type: string
 *                 description: ID of the sub-department
 *               employmentStatusEffectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of employment status
 *               zone:
 *                 type: string
 *                 description: ID of the zone
 *               noticePeriod:
 *                 type: string
 *                 description: Notice period details
 *     responses:
 *       201:
 *         description: User employment record successfully added
 *       400:
 *         description: Bad request, invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/user-employment',authController.protect, userController.createUserEmployment);

/**
 * @swagger
 * /api/v1/users/user-employment/{id}:
 *   get:
 *     summary: Get a user employment record by ID
 *     tags: 
 *          - User Management
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user employment record
 *     responses:
 *       200:
 *         description: Successful response with the user employment record
 *       404:
 *         description: User employment record not found
 *       500:
 *         description: Internal server error
 */
router.get('/user-employment/:id',authController.protect, userController.getUserEmployment);

/**
 * @swagger
 * /api/v1/users/user-employment/{id}:
 *   put:
 *     summary: Update a user employment record by ID
 *     tags: 
 *          - User Management
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user employment record
 *     requestBody:
 *       description: New user employment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of employment
 *                 required: true
 *               location:
 *                 type: string
 *                 description: Location of employment
 *                 required: true
 *               designation:
 *                 type: string
 *                 description: ID of the designation
 *               employmentType:
 *                 type: string
 *                 description: Type of employment (e.g., full-time, part-time)
 *                 required: true
 *               reportingSupervisor:
 *                 type: string
 *                 description: ID of the reporting supervisor
 *               department:
 *                 type: string
 *                 description: ID of the department
 *               band:
 *                 type: string
 *                 description: ID of the band
 *               subDepartments:
 *                 type: string
 *                 description: ID of the sub-department
 *               employmentStatusEffectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of employment status
 *               zone:
 *                 type: string
 *                 description: ID of the zone
 *               noticePeriod:
 *                 type: string
 *                 description: Notice period details
 *     responses:
 *       200:
 *         description: Successful response with the updated user employment record
 *       404:
 *         description: User employment record not found
 *       500:
 *         description: Internal server error
 */
router.put('/user-employment/:id',authController.protect, userController.updateUserEmployment);

/**
 * @swagger
 * /api/v1/users/user-employment/{id}:
 *   delete:
 *     summary: Delete a user employment record by ID
 *     tags: 
 *          - User Management
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user employment record
 *     responses:
 *       204:
 *         description: User employment record successfully deleted
 *       404:
 *         description: User employment record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/user-employment/:id',authController.protect, userController.deleteUserEmployment);

/**
 * @swagger
 * /api/v1/users/user-employment-by-userId/{userId}:
 *   get:
 *     summary: Get a user employment record by ID
 *     tags: 
 *          - User Management
 *     security: [{
 *        bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user employment record
 *     responses:
 *       200:
 *         description: Successful response with the user employment record
 *       404:
 *         description: User employment record not found
 *       500:
 *         description: Internal server error
 */
router.get('/user-employment-by-userId/:userId',authController.protect, userController.getUserEmploymentByUser);

/**
 * @swagger
 * /api/v1/users/salary-details:
 *   post:
 *     summary: Add a new employee salary details record
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee salary details to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID of the employee associated with the salary details
 *                 required: true
 *               payrollEffectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the salary details
 *                 required: true
 *               actualEffectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the salary details
 *                 required: true
 *               frequencyToEnterCTC:
 *                 type: string
 *                 description: Basic salary amount
 *                 required: true
 *               CTCTemplate:
 *                 type: string
 *                 description: Total allowances amount
 *               isEmployerPartInclusiveInSalaryStructure:
 *                 type: boolean
 *               enteringAmount:
 *                 type: string
 *                 required: true
 *               Amount:
 *                 type: number
 *                 required: true
 *               totalCTCExcludingVariableAndOtherBenefits:
 *                 type: number
 *                 required: true
 *               totalCTCIncludingVariable:
 *                 type: number
 *                 required: true
 *               employeeSalaryTaxAndStatutorySetting:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     isVariableAllowancePartOfCTC:
 *                       type: boolean 
 *                     isPFDeduction:
 *                       type: boolean
 *                     isProvidentPensionDeduction:
 *                       type: boolean
 *                     isEmployeeProvidentFundCappedAtPFCeiling:
 *                       type: boolean
 *                     isEmployerProvidentFundCappedAtPFCeiling:
 *                       type: boolean 
 *                     fixedAmountForProvidentFundWage:
 *                       type: number 
 *                     pfTemplate:
 *                       type: string
 *                     isESICDeduction:
 *                       type: boolean  
 *                     isPTDeduction:
 *                       type: boolean
 *                     isLWFDeduction:
 *                       type: boolean
 *                     isGratuityApplicable:
 *                       type: boolean
 *                     gratuityTemplate:
 *                       type: string
 *                     isIncomeTaxDeduction:
 *                       type: boolean 
 *                     isPFChargesApplicable:
 *                       type: boolean
 *                     isRoundOffApplicable:
 *                       type: boolean
 *               salaryComponentFixedAllowance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     fixedAllowance:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentOtherBenefits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     otherBenefits:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentEmployerContribution:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     employerContribution:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentFixedDeduction:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     fixedDeduction:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentVariableAllowance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     variableAllowance:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentVariableDeduction:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     variableDeduction:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentPFCharge:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     pfCharge:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *     responses:
 *       '201':
 *         description: Employee salary details record successfully added
 *       '400':
 *         description: Bad request, invalid input
 *       '500':
 *         description: Internal server error
 */
router.post('/salary-details', authController.protect, userController.createEmployeeSalaryDetails);

/**
 * @swagger
 * /api/v1/users/salary-details/{id}:
 *   get:
 *     summary: Get employee salary details by ID
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee salary details record
 *     responses:
 *       '200':
 *         description: Successful response with the employee salary details
 *       '404':
 *         description: Employee salary details not found
 *       '500':
 *         description: Internal server error
 */
router.get('/salary-details/:id', authController.protect, userController.getEmployeeSalaryDetails);

/**
 * @swagger
 * /api/v1/users/salary-details/{id}:
 *   put:
 *     summary: Update employee salary details by ID
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee salary details record
 *     requestBody:
 *       description: New employee salary details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollEffectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the salary details
 *                 required: true
 *               actualEffectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the salary details
 *                 required: true
 *               frequencyToEnterCTC:
 *                 type: string
 *                 description: Basic salary amount
 *                 required: true
 *               CTCTemplate:
 *                 type: string
 *                 description: Total allowances amount
 *               isEmployerPartInclusiveInSalaryStructure:
 *                 type: boolean
 *               enteringAmount:
 *                 type: string
 *                 required: true
 *               Amount:
 *                 type: number
 *                 required: true
 *               totalCTCExcludingVariableAndOtherBenefits:
 *                 type: number
 *                 required: true
 *               totalCTCIncludingVariable:
 *                 type: number
 *                 required: true
 *               employeeSalaryTaxAndStatutorySetting:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     isVariableAllowancePartOfCTC:
 *                       type: boolean 
 *                     isPFDeduction:
 *                       type: boolean
 *                     isProvidentPensionDeduction:
 *                       type: boolean
 *                     isEmployeeProvidentFundCappedAtPFCeiling:
 *                       type: boolean
 *                     isEmployerProvidentFundCappedAtPFCeiling:
 *                       type: boolean 
 *                     fixedAmountForProvidentFundWage:
 *                       type: number 
 *                     pfTemplate:
 *                       type: string
 *                     isESICDeduction:
 *                       type: boolean  
 *                     isPTDeduction:
 *                       type: boolean
 *                     isLWFDeduction:
 *                       type: boolean
 *                     isGratuityApplicable:
 *                       type: boolean
 *                     gratuityTemplate:
 *                       type: string
 *                     isIncomeTaxDeduction:
 *                       type: boolean 
 *                     isPFChargesApplicable:
 *                       type: boolean
 *                     isRoundOffApplicable:
 *                       type: boolean
 *               salaryComponentFixedAllowance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     fixedAllowance:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentOtherBenefits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     otherBenefits:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentEmployerContribution:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     employerContribution:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentFixedDeduction:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     fixedDeduction:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentVariableAllowance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     variableAllowance:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentVariableDeduction:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     variableDeduction:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *               salaryComponentPFCharge:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     pfCharge:
 *                       type: string 
 *                       required: true
 *                     monthlyAmount:
 *                       type: number
 *                       required: true
 *                     yearlyAmount:
 *                       type: number
 *                       required: true
 *     responses:
 *       '200':
 *         description: Successful response with the updated employee salary details
 *       '404':
 *         description: Employee salary details not found
 *       '500':
 *         description: Internal server error
 */
router.put('/salary-details/:id', authController.protect, userController.updateEmployeeSalaryDetails);

/**
 * @swagger
 * /api/v1/users/salary-details/{id}:
 *   delete:
 *     summary: Delete employee salary details by ID
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee salary details record to delete
 *     responses:
 *       '204':
 *         description: Employee salary details successfully deleted
 *       '404':
 *         description: Employee salary details not found
 *       '500':
 *         description: Internal server error
 */
router.delete('/salary-details/:id', authController.protect, userController.deleteEmployeeSalaryDetails);

/**
 * @swagger
 * /api/v1/users/salary-details-by-userId/{userId}:
 *   get:
 *     summary: Get employee salary details by ID
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee salary details record
 *     responses:
 *       '200':
 *         description: Successful response with the employee salary details
 *       '404':
 *         description: Employee salary details not found
 *       '500':
 *         description: Internal server error
 */
router.get('/salary-details-by-userId/:userId', authController.protect, userController.getEmployeeSalaryDetailsByUser);


/**
 * @swagger
 * /api/v1/users/employee-salary-tax-salutaory-settings:
 *   post:
 *     summary: Create a new Employee Salary and Salutary Setting
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee Salary and Salutary Setting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeSalaryDetails:
 *                 type: string
 *                 required: true
 *               isVariableAllowancePartOfCTC:
 *                 type: boolean
 *               isPFDeduction:
 *                 type: boolean
 *               isProvidentPensionDeduction:
 *                 type: boolean
 *               isEmployeeProvidentFundCappedAtPFCeiling:
 *                 type: boolean
 *               isEmployerProvidentFundCappedAtPFCeiling:
 *                 type: boolean
 *               fixedAmountForProvidentFundWage:
 *                 type: number
 *               pfTemplate:
 *                 type: string
 *               isESICDeduction:
 *                 type: boolean
 *               isPTDeduction:
 *                 type: boolean
 *               isLWFDeduction:
 *                 type: boolean
 *               isGratuityApplicable:
 *                 type: boolean
 *               gratuityTemplate:
 *                 type: string
 *               isIncomeTaxDeduction:
 *                 type: boolean
 *               isPFChargesApplicable:
 *                 type: boolean
 *               isRoundOffApplicable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Employee Salary and Salutary Setting successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-salary-tax-salutaory-settings', authController.protect, userController.createEmployeeTaxAndSalutaorySetting);

/**
 * @swagger
 * /api/v1/users/employee-salary-tax-salutaory-settings/{id}:
 *   get:
 *     summary: Get Employee Salary and Salutary Setting by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salary and Salutary Setting
 *     responses:
 *       200:
 *         description: Successful response with the Employee Salary and Salutary Setting
 *       404:
 *         description: Employee Salary and Salutary Setting not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-salary-tax-salutaory-settings/:id', authController.protect, userController.getEmployeeTaxAndSalutaorySetting);

/**
 * @swagger
 * /api/v1/users/employee-salary-tax-salutaory-settings/{id}:
 *   put:
 *     summary: Update Employee Salary and Salutary Setting by ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salary and Salutary Setting
 *     requestBody:
 *       description: New Employee Salary and Salutary Setting details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVariableAllowancePartOfCTC:
 *                 type: boolean
 *               isPFDeduction:
 *                 type: boolean
 *               isProvidentPensionDeduction:
 *                 type: boolean
 *               isEmployeeProvidentFundCappedAtPFCeiling:
 *                 type: boolean
 *               isEmployerProvidentFundCappedAtPFCeiling:
 *                 type: boolean
 *               fixedAmountForProvidentFundWage:
 *                 type: number
 *               pfTemplate:
 *                 type: string
 *               isESICDeduction:
 *                 type: boolean
 *               isPTDeduction:
 *                 type: boolean
 *               isLWFDeduction:
 *                 type: boolean
 *               isGratuityApplicable:
 *                 type: boolean
 *               gratuityTemplate:
 *                 type: string
 *               isIncomeTaxDeduction:
 *                 type: boolean
 *               isPFChargesApplicable:
 *                 type: boolean
 *               isRoundOffApplicable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Employee Salary and Salutary Setting
 *       404:
 *         description: Employee Salary and Salutary Setting not found
 *       500:
 *         description: Internal server error
 */
router.put('/employee-salary-tax-salutaory-settings/:id', authController.protect, userController.updateEmployeeTaxAndSalutaorySetting);

/**
 * @swagger
 * /api/v1/users/employee-salary-tax-salutaory-settings/{id}:
 *   delete:
 *     summary: Delete Employee Salary and Salutary Setting by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salary and Salutary Setting
 *     responses:
 *       204:
 *         description: Employee Salary and Salutary Setting successfully deleted
 *       404:
 *         description: Employee Salary and Salutary Setting not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-salary-tax-salutaory-settings/:id', authController.protect, userController.deleteEmployeeTaxAndSalutaorySetting);

/**
 * @swagger
 * /api/v1/users/employee-salutatory-details:
 *   post:
 *     summary: Add a new Employee Salutatory Details
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee Salutatory Details object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               isEmployeeEligibleForProvidentFundDeduction:
 *                 type: boolean
 *               willEmployeeProvidentFundContributionCappedAtProvidentFundCeiling:
 *                 type: boolean
 *               willEmployerProvidentFundContributionBeCappedAtProvidentFundCeiling:
 *                 type: boolean
 *               providentFundJoiningDate:
 *                 type: string
 *                 format: date
 *               providentFundNumber:
 *                 type: number
 *               UANNumber:
 *                 type: number
 *               fixedAmountForYourProvidentFundWage:
 *                 type: number
 *               additionalPFContributionInPercentage:
 *                 type: number
 *               isESICDeductedFromSalary:
 *                 type: boolean
 *               ESICNumber:
 *                 type: string
 *               isTaxDeductedFromPlayslip:
 *                 type: boolean
 *               isLWFDeductedFromPlayslip:
 *                 type: boolean
 *               isIncomeTaxDeducted:
 *                 type: boolean
 *               isGratuityEligible:
 *                 type: boolean
 *               isComeUnderGratuityPaymentAct:
 *                 type: boolean
 *               taxRegime:
 *                 type: boolean
 *               taxRegimeUpdated:
 *                 type: string
 *                 format: date
 *               taxRegimeUpdatedBy:
 *                 type: string
 *               roundOffApplicable:
 *                 type: boolean
 *               dailyWageApplicable:
 *                 type: boolean
 *               eligibleForOvertime:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Employee Salutatory Details successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-salutatory-details', authController.protect, userController.createEmployeeSalutatoryDetails);

/**
 * @swagger
 * /api/v1/users/employee-salutatory-details/{id}:
 *   get:
 *     summary: Get Employee Salutatory Details by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salutatory Details
 *     responses:
 *       200:
 *         description: Successful response with the Employee Salutatory Details
 *       404:
 *         description: Employee Salutatory Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-salutatory-details/:id', authController.protect, userController.getEmployeeSalutatoryDetails);

/**
 * @swagger
 * /api/v1/users/employee-salutatory-details-by-user/{userId}:
 *   get:
 *     summary: Get Employee Salutatory Details by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: user Id
 *     responses:
 *       200:
 *         description: Successful response with the Employee Salutatory Details
 *       404:
 *         description: Employee Salutatory Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-salutatory-details-by-user/:userId', authController.protect, userController.getEmployeeSalutatoryDetailsByUser);

/**
 * @swagger
 * /api/v1/users/employee-salutatory-details/{id}:
 *   put:
 *     summary: Update Employee Salutatory Details by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salutatory Details
 *     requestBody:
 *       description: New Employee Salutatory Details object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
*               isEmployeeEligibleForProvidentFundDeduction:
 *                 type: boolean
 *               willEmployeeProvidentFundContributionCappedAtProvidentFundCeiling:
 *                 type: boolean
 *               willEmployerProvidentFundContributionBeCappedAtProvidentFundCeiling:
 *                 type: boolean
 *               providentFundJoiningDate:
 *                 type: string
 *                 format: date
 *               providentFundNumber:
 *                 type: number
 *               UANNumber:
 *                 type: number
 *               fixedAmountForYourProvidentFundWage:
 *                 type: number
 *               additionalPFContributionInPercentage:
 *                 type: number
 *               isESICDeductedFromSalary:
 *                 type: boolean
 *               ESICNumber:
 *                 type: string
 *               isTaxDeductedFromPlayslip:
 *                 type: boolean
 *               isLWFDeductedFromPlayslip:
 *                 type: boolean
 *               isIncomeTaxDeducted:
 *                 type: boolean
 *               isGratuityEligible:
 *                 type: boolean
 *               isComeUnderGratuityPaymentAct:
 *                 type: boolean
 *               taxRegime:
 *                 type: boolean
 *               taxRegimeUpdated:
 *                 type: string
 *                 format: date
 *               taxRegimeUpdatedBy:
 *                 type: string
 *               roundOffApplicable:
 *                 type: boolean
 *               dailyWageApplicable:
 *                 type: boolean
 *               eligibleForOvertime:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successful response with the updated Employee Salutatory Details
 *       404:
 *         description: Employee Salutatory Details not found
 *       500:
 *         description: Internal server error
 */
router.put('/employee-salutatory-details/:id', authController.protect, userController.updateEmployeeSalutatoryDetails);

/**
 * @swagger
 * /api/v1/users/employee-salutatory-details/{id}:
 *   delete:
 *     summary: Delete Employee Salutatory Details by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Salutatory Details
 *     responses:
 *       204:
 *         description: Employee Salutatory Details successfully deleted
 *       404:
 *         description: Employee Salutatory Details not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-salutatory-details/:id', authController.protect, userController.deleteEmployeeSalutatoryDetails);

/**
 * @swagger
 * /api/v1/users/income-tax-componants:
 *   post:
 *     summary: Add a new Income Tax Componant
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User Management
 *     requestBody:
 *       description: Income Tax Componant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               componantName:
 *                 type: string
 *                 required: true
 *               section:
 *                 type: string
 *                 required: true
 *               maximumAmount:
 *                 type: number
 *                 required: true
 *               order:
 *                 type: number
 *                 required: true
 *     responses:
 *       201:
 *         description: Income Tax Componant successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/income-tax-componants', authController.protect, userController.createIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/users/income-tax-componants/{id}:
 *   get:
 *     summary: Get an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     responses:
 *       200:
 *         description: Successful response with the Income Tax Componant
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.get('/income-tax-componants/:id', authController.protect, userController.getIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/users/income-tax-componants/{id}:
 *   put:
 *     summary: Update an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     requestBody:
 *       description: New Income Tax Componant details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               componantName:
 *                 type: string
 *               section:
 *                 type: string
 *               maximumAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated Income Tax Componant
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.put('/income-tax-componants/:id', authController.protect, userController.updateIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/users/income-tax-componants/{id}:
 *   delete:
 *     summary: Delete an Income Tax Componant by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Income Tax Componant
 *     responses:
 *       204:
 *         description: Income Tax Componant successfully deleted
 *       404:
 *         description: Income Tax Componant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/income-tax-componants/:id', authController.protect, userController.deleteIncomeTaxComponant);

/**
 * @swagger
 * /api/v1/users/income-tax-componants-list:
 *   post:
 *     summary: Get all Income Tax Componants by company
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - User Management
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
 *         description: Successful response with Income Tax Componants
 *       404:
 *         description: Income Tax Componants not found
 *       500:
 *         description: Internal server error
 */
router.post('/income-tax-componants-list', authController.protect, userController.getIncomeTaxComponantsByCompany);

// EmployeeLoanadvance routes

/**
 * @swagger
 * /api/v1/users/employee-loan-advance:
 *   post:
 *     summary: Add a new Employee Loan Advance
 *     tags: 
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee Loan Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 required: true
 *               loanAdvancesCategory:
 *                 type: string
 *                 required: true
 *               amount:
 *                 type: number
 *                 required: true
 *               repaymentFrequency:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Employee Loan Advance successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-loan-advance', authController.protect, userController.createEmployeeLoanAdvance);

/**
 * @swagger
 * /api/v1/users/employee-loan-advance/{id}:
 *   get:
 *     summary: Get an Employee Loan Advance by ID
 *     tags: 
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Loan Advance
 *     responses:
 *       200:
 *         description: Successful response with the Employee Loan Advance
 *       404:
 *         description: Employee Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-loan-advance/:id', authController.protect, userController.getEmployeeLoanAdvance);

/**
 * @swagger
 * /api/v1/users/employee-loan-advance/{id}:
 *   put:
 *     summary: Update an Employee Loan Advance by ID
 *     tags: 
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Loan Advance
 *     requestBody:
 *       description: New Employee Loan Advance details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanAdvancesCategory:
 *                 type: string
 *               amount:
 *                 type: number
 *               repaymentFrequency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Employee Loan Advance
 *       404:
 *         description: Employee Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.put('/employee-loan-advance/:id', authController.protect, userController.updateEmployeeLoanAdvance);

/**
 * @swagger
 * /api/v1/users/employee-loan-advance/{id}:
 *   delete:
 *     summary: Delete an Employee Loan Advance by ID
 *     tags: 
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Loan Advance
 *     responses:
 *       204:
 *         description: Employee Loan Advance successfully deleted
 *       404:
 *         description: Employee Loan Advance not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-loan-advance/:id', authController.protect, userController.deleteEmployeeLoanAdvance);

/**
 * @swagger
 * /api/v1/users/employee-loan-advance-by-company:
 *   post:
 *     summary: Get all Employee Loan Advances by company ID
 *     tags: 
 *       - User Management
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
 *     responses:
 *       200:
 *         description: Successful response with all Employee Loan Advances
 *       404:
 *         description: Employee Loan Advances not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-loan-advance-by-company', authController.protect, userController.getAllEmployeeLoanAdvancesByCompany);

/**
 * @swagger
 * /api/v1/users/employee-loan-advance-by-user/{userId}:
 *   post:
 *     summary: Get all Employee Loan Advances by company ID
 *     tags: 
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Employee Loan Advance
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
 *         description: Successful response with all Employee Loan Advances
 *       404:
 *         description: Employee Loan Advances not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-loan-advance-by-user/:userId', authController.protect, userController.getAllEmployeeLoanAdvancesByUser);


// Add Employee Income Tax Declaration
/**
 * @swagger
 * /api/v1/users/employee-income-tax-declarations:
 *   post:
 *     summary: Add a new employee income tax declaration
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee income tax declaration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               financialYear:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               employeeIncomeTaxDeclarationComponent:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     incomeTaxComponent:
 *                       type: string 
 *                       required: true
 *                     section:
 *                       type: string 
 *                       required: true
 *                     maximumAmount:
 *                       type: number
 *                       required: true
 *                     appliedAmount:
 *                       type: number
 *                       required: true
 *                     approvedAmount:
 *                       type: number
 *                       required: true
 *                     approvalStatus:
 *                       type: string
 *                       required: true
 *                     remark:
 *                       type: string
 *                       required: true
 *                     employeeIncomeTaxDeclarationAttachments:
 *                        type: array
 *                        items:
 *                          type: string
 *                          example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *               employeeIncomeTaxDeclarationHRA:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     rentDeclared:
 *                       type: number 
 *                       required: true
 *                     month:
 *                       type: string 
 *                       required: true
 *                     verifiedAmount:
 *                       type: number
 *                       required: true
 *                     cityType:
 *                       type: string
 *                       required: true
 *                     landlordName:
 *                       type: string
 *                       required: true
 *                     landlordPan:
 *                       type: string
 *                       required: true
 *                     landlordAddress:
 *                       type: string
 *                       required: true
 *                     approvalStatus:
 *                       type: string
 *                       required: true
 *                     employeeIncomeTaxDeclarationHRAAttachments:
 *                        type: array
 *                        items:
 *                          type: string
 *                          example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *     responses:
 *       201:
 *         description: Employee income tax declaration successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/employee-income-tax-declarations', authController.protect, userController.createEmployeeIncomeTaxDeclaration);

// Get All Employee Income Tax Declarations by Company
/**
 * @swagger
 * /api/v1/users/employee-income-tax-declarations-by-company:
 *   post:
 *     summary: Get all employee income tax declarations by company ID
 *     tags: [User Management]
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
 *     responses:
 *       200:
 *         description: Successful response with employee income tax declarations
 *       404:
 *         description: Declarations not found
 *       500:
 *         description: Internal server error
 */
router.post('/employee-income-tax-declarations-by-company', authController.protect, userController.getAllEmployeeIncomeTaxDeclarationsByCompany);

// Update Employee Income Tax Declaration
/**
 * @swagger
 * /api/v1/users/employee-income-tax-declarations/{id}:
 *   put:
 *     summary: Update an employee income tax declaration by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee income tax declaration
 *     requestBody:
 *       description: Updated employee income tax declaration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               financialYear:
 *                 type: string
 *                 required: true
 *               employeeIncomeTaxDeclarationComponent:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     incomeTaxComponent:
 *                       type: string 
 *                       required: true
 *                     section:
 *                       type: string 
 *                       required: true
 *                     maximumAmount:
 *                       type: number
 *                       required: true
 *                     appliedAmount:
 *                       type: number
 *                       required: true
 *                     approvedAmount:
 *                       type: number
 *                       required: true
 *                     approvalStatus:
 *                       type: string
 *                       required: true
 *                     remark:
 *                       type: string
 *                       required: true
 *                     employeeIncomeTaxDeclarationAttachments:
 *                        type: array
 *                        items:
 *                          type: string
 *                          example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *               employeeIncomeTaxDeclarationHRA:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     rentDeclared:
 *                       type: number 
 *                       required: true
 *                     month:
 *                       type: string 
 *                       required: true
 *                     verifiedAmount:
 *                       type: number
 *                       required: true
 *                     cityType:
 *                       type: string
 *                       required: true
 *                     landlordName:
 *                       type: string
 *                       required: true
 *                     landlordPan:
 *                       type: string
 *                       required: true
 *                     landlordAddress:
 *                       type: string
 *                       required: true
 *                     approvalStatus:
 *                       type: string
 *                       required: true
 *                     employeeIncomeTaxDeclarationHRAAttachments:
 *                        type: array
 *                        items:
 *                          type: string
 *                          example: {"attachmentType",attachmentName,attachmentSize,extention,file}
 *     responses:
 *       200:
 *         description: Successful response with the updated employee income tax declaration
 *       404:
 *         description: Employee income tax declaration not found
 *       500:
 *         description: Internal server error
 */
router.put('/employee-income-tax-declarations/:id', authController.protect, userController.updateEmployeeIncomeTaxDeclaration);

// Get Employee Income Tax Declaration by ID
/**
 * @swagger
 * /api/v1/users/employee-income-tax-declarations/{id}:
 *   get:
 *     summary: Get an employee income tax declaration by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee income tax declaration
 *     responses:
 *       200:
 *         description: Successful response with the employee income tax declaration
 *       404:
 *         description: Employee income tax declaration not found
 *       500:
 *         description: Internal server error
 */
router.get('/employee-income-tax-declarations/:id', authController.protect, userController.getEmployeeIncomeTaxDeclarationById);

// Delete Employee Income Tax Declaration
/**
 * @swagger
 * /api/v1/users/employee-income-tax-declarations/{id}:
 *   delete:
 *     summary: Delete an employee income tax declaration by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee income tax declaration
 *     responses:
 *       204:
 *         description: Employee income tax declaration successfully deleted
 *       404:
 *         description: Employee income tax declaration not found
 *       500:
 *         description: Internal server error
 */
router.delete('/employee-income-tax-declarations/:id', authController.protect, userController.deleteEmployeeIncomeTaxDeclaration);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);   

module.exports = router;