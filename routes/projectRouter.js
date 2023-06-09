const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const router = express.Router();

// Country Router
/**
 * @swagger
 * /api/v1/project/projectlist:
 *  post:
 *      tags:
 *          - Project Management
 *      summary: "Get all Project"
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

router.post('/projectlist',authController.protect,projectController.getProjectList);
//router.patch('/updateCompany',companyController.saveCoutry);

/**
 * @swagger
 * /api/v1/project/newproject:
 *  post:
 *      tags:
 *          - Project Management
 *      summary: "Create New Project"   
 *      security: [{
 *         bearerAuth: []
 *     }]      
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          projectName:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
 *                          notes:
 *                              type: string
 *                          estimatedTime:
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
router.post('/newproject',authController.protect,projectController.addProject);
/**
 * @swagger
 * /api/v1/project/{id}:
 *  get:
 *      tags:
 *          - Project Management
 *      summary: "Get Project Based On ProjectId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Project ID
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
router.get('/:id',authController.protect,projectController.getProject);
/**
 * @swagger
 * /api/v1/project/{id}:
 *  patch:
 *      tags:
 *          - Project Management
 *      summary: "Update Project based on ProjectId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Project Id
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
 *                          projectName:
 *                              type: string  
 *                          notes:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
 *                          estimatedTime:
 *                              type: string
 *                              format: int
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
router.patch('/:id',authController.protect,projectController.updateProject);
/**
 * @swagger
 * /api/v1/project/{id}:
 *  delete:
 *      tags:
 *          - Project Management
 *      summary: "Delete Project based on ProjectId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Project Id
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
router.delete('/:id',authController.protect,projectController.deleteProject);
/**
 * @swagger
 * /api/v1/project/newprojectuser:
 *  post:
 *      tags:
 *          - Project Management
 *      summary: "Apply New User to Task"    
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          projectId:
 *                              type: string
 *                          projectUsers:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"user"}
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
router.post('/newprojectuser',authController.protect,projectController.addProjectUser);
/**
 * @swagger
 * /api/v1/project/update/projectuser/{id}:
 *  patch:
 *      tags:
 *          - Project Management
 *      summary: "Update Project User based on ProjectUserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Project User Id
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
 *                          user:
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
router.patch('/update/projectuser/:id',authController.protect,projectController.updateProjectUser);
/**
  * @swagger
  * /api/v1/project/projectuser/{id}:
  *  delete:
  *      tags:
  *          - Project Management
  *      summary: "Delete Project User Based on ProjectUserId"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
  *       - name: id
  *         in: path
  *         description: Project User Id
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
router.route('/projectuser/:id').delete(authController.protect,projectController.deleteProjectUser);
 
/**
 * @swagger
 * /api/v1/project/getprojectuserslist/{id}:
 *  get:
 *      tags:
 *          - Project Management
 *      summary: "Get Project Users based on ProjectId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Project ID
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
 router.get('/getprojectuserslist/:id',authController.protect,projectController.getProjectUsers);

 /**
 * @swagger
 * /api/v1/project/projectlistbyuser:
 *  post:
 *      tags:
 *          - Project Management
 *      summary: "Get Project List By UserId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *           
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
router.post('/projectlistbyuser',authController.protect,projectController.getProjectListByUser);
module.exports = router;