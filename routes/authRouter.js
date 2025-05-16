var express = require('express');
const User =  require('./../models/permissions/userModel');
const authController =  require('../controllers/authController');
const recruitmentController = require('../controllers/recruitmentController');
const commonController =  require('../controllers/commonController');
var authRouter = express.Router();


authRouter
  .route('/signup')
  .post(authController.signup);
/**
 * @swagger
 * /api/v1/auth/role:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Create Role"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          description:
 *                              type: string
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Role added successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
  authRouter.route('/role').post(authController.protect,authController.addRole);
/**
 * @swagger
 * /api/v1/auth/role/{id}:
 *  delete:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Delete Role Based on Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Role ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
  authRouter.route('/role/:id').delete(authController.protect,authController.deleteRole);
/**
 * @swagger
 * /api/v1/auth/role/update/{id}:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Update Role based on RoleId"
 *      operationId: updateRole
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Role ID
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                  description:
 *                    type: string
 *      responses:
 *          200:
 *              description: "Role updated successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
  authRouter.route('/role/update/:id').post(authController.protect,authController.updateRole);
/**
 * @swagger
 * /api/v1/auth/role/{id}:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get Role Based On Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Role ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
  authRouter.route('/role/:id').get(authController.protect,authController.getRole);
/**
 * @swagger
 * /api/v1/auth/roles:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get all Role"
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
  authRouter.route('/roles').get(authController.protect,authController.getRoles);
/**
 * @swagger
 * /api/v1/auth/roles/addSubordinate:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Create Team Member"
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
 *                          subordinateUserId:
 *                              type: string
 *    
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Team Member added successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
  authRouter.route('/roles/addSubordinate').post(authController.protect,authController.addSubordinate);
  /**
 * @swagger
 * /api/v1/auth/roles/getSubordinates/{id}:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get team member Based On UserId"
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
  authRouter.route('/roles/getSubordinates/:id').get(authController.protect,authController.getSubordinates);
/**
 * @swagger
 * /api/v1/auth/roles/deleteSubordinate/{userId}/{subordinateUserId}:
 *  delete:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Delete Team Member"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: userId
 *         in: path
 *         description: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *       - name: subordinateUserId
 *         in: path
 *         description: subordinateUserId
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
  authRouter.route('/roles/deleteSubordinate/:userId/:subordinateUserId').delete(authController.protect,authController.deleteSubordinates);
  
//#region User
authRouter.get('/user/:id',recruitmentController.getSkill);
authRouter.get('/user/All',recruitmentController.getAllSkills);
authRouter.post('/user/create',recruitmentController.createSkill);
authRouter.post('/user/update/:id',recruitmentController.updateSkill);
authRouter.delete('/user/delete/:id',recruitmentController.deleteSkill);
  
//#endregion

//#region Permission
/**
 * @swagger
 * /api/v1/auth/permission/{id}:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get Permission Based On Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Permission ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
authRouter.get('/permission/:id',authController.protect,commonController.getPermission);
/**
 * @swagger
 * /api/v1/auth/permissions:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get all Permission"
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
authRouter.get('/permissions',authController.protect,commonController.getPermissionList);
/**
 * @swagger
 * /api/v1/auth/permission/create:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Create Permission"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          permissionName:
 *                              type: string
 *                          permissionDetails:
 *                              type: string
 *                          resource:
 *                              type: string
 *                          action:
 *                              type: string
 *                          uiElement:
 *                              type: string
 *                          parentPermission:
 *                              type: string
 *      responses:
 *          200:
 *              description: "Permission added successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
authRouter.post('/permission/create', authController.protect, commonController.savePermission);
/**
 * @swagger
 * /api/v1/auth/permission/update/{id}:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Update Permission based on PermissionId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Permission ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          permissionName:
 *                              type: string
 *                          permissionDetails:
 *                              type: string
 *                          resource:
 *                              type: string
 *                          action:
 *                              type: string
 *                          uiElement:
 *                              type: string
 *                          parentPermission:
 *                              type: string
 *      responses:
 *          200:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
authRouter.post('/permission/update/:id', authController.protect, commonController.updatePermission);
/**
 * @swagger
 * /api/v1/auth//permission/delete/{id}:
 *  delete:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Delete Permission Based on Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Permission ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
authRouter.delete('/permission/delete/:id',authController.protect,commonController.deletePermission);

//#endregion

//#region UserRole
authRouter.get('/userRole/:id',recruitmentController.getRole);
authRouter.get('/userRoles',recruitmentController.getAllRoles);
authRouter.post('/userRole/create',recruitmentController.createRole);
authRouter.post('/userRole/update/:id',recruitmentController.updateRole);
authRouter.delete('/userRole/delete/:id',recruitmentController.deleteRole);

//#endregion

//#region Role Permission
/**
 * @swagger
 * /api/v1/auth/rolePermission/{id}:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get Role Permission Based On Role Permission Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Role Permission ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
authRouter.get('/rolePermission/:id',authController.protect,authController.getRolePermission);
/**
 * @swagger
 * /api/v1/auth/rolePermissions:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get all Permission"
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
authRouter.get('/rolePermissions',authController.protect,authController.getAllRolePermissions);
/**
 * @swagger
 * /api/v1/auth/rolePermission/create:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Create Role Permission"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          roleId:
 *                              type: string
 *                          permissionId:
 *                              type: string
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Role Permission added successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *
 */
authRouter.post('/rolePermission/create',authController.protect,authController.createRolePermission);
/**
 * @swagger
 * /api/v1/auth/rolePermission/update/{id}:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Update Role Permission based on RolePermissionId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Role Permission ID
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
 *                          roleId:
 *                              type: string
 *                          permissionId:
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
authRouter.post('/rolePermission/update/:id',authController.protect,authController.updateRolePermission);
/**
 * @swagger
 * /api/v1/auth/rolePermission/delete/{id}:
 *  delete:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Delete Role Permission Based on Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Role Permission ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
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
authRouter.delete('/rolePermission/delete/:id',authController.protect,authController.deleteRolePermission);

//#endregion


//#region UserRole
/**
 * @swagger
 * /api/v1/auth/userRole/{id}:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get UserRole Based On UserRole Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: UserRole ID
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
 */
authRouter.get('/userRole/:id', authController.protect, authController.getUserRole);

/**
 * @swagger
 * /api/v1/auth/userRolesv1:
 *  get:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Get all UserRoles"
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
 */
authRouter.get('/userRolesv1', authController.protect, authController.getAllUserRoles);

/**
 * @swagger
 * /api/v1/auth/userRole/createuserrolev1:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Create UserRole"
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
 *                          roleId:
 *                              type: string
 *      produces:
 *          - application/json
 *      responses:
 *          201:
 *              description: "UserRole added successfully"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
authRouter.post('/userRole/createuserrolev1', authController.protect, authController.createUserRole);

/**
 * @swagger
 * /api/v1/auth/userRole/updateuserrole/{id}:
 *  post:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Update UserRole based on UserRoleId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: UserRole ID
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
 *                          userId:
 *                              type: string
 *                          roleId:
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
 */
authRouter.post('/userRole/updateuserrole/:id', authController.protect, authController.updateUserRole);

/**
 * @swagger
 * /api/v1/auth/userRole/deleteuserrole/{id}:
 *  delete:
 *      tags:
 *          - Role-Based Access Control
 *      summary: "Delete UserRole Based on Id"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: UserRole ID
 *         required: true
 *         schema:
 *           type: string
 *           format: int64
 *      produces:
 *          - application/json
 *      responses:
 *          204:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
authRouter.delete('/userRole/deleteuserrole/:id', authController.protect, authController.deleteUserRole);

//#endregion


  module.exports = authRouter;


