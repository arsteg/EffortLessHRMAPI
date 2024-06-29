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
 *               totalCTCExcludingVariableAndOtherBenefits:
 *                 type: number
 *                 description: Total CTC excluding variable and other benefits
 *               totalCTCIncludingVariable:
 *                 type: number
 *                 description: Total CTC including variable
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
 *               totalCTCExcludingVariableAndOtherBenefits:
 *                 type: number
 *                 description: Total CTC excluding variable and other benefits
 *               totalCTCIncludingVariable:
 *                 type: number
 *                 description: Total CTC including variable
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
 *                 type: number
 *                 required: true
 *               CTCAmount:
 *                 type: number
 *                 required: true
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
 *                 type: number
 *                 required: true
 *               CTCAmount:
 *                 type: number
 *                 required: true
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


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);   

module.exports = router;