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
router.delete('/deleteuser/:id',userController.deleteMe);

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


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
    


module.exports = router;