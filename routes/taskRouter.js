const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');
const router = express.Router();

// Country Router
/**
 * @swagger
 * /api/v1/task/tasklist:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Get all task"
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
router.post('/tasklist',authController.protect,taskController.getTaskList);

/**
 * @swagger
 * /api/v1/task/tasklistbyparenttask/{taskId}:
 *  get:
 *      tags:
 *          - Task Management
 *      summary: "Get Task List based on ProjectId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: taskId
 *         in: path
 *         description: Task Id
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
router.get('/tasklistbyparenttask/:taskId',authController.protect,taskController.getTaskListByParentTask);

/**
 * @swagger
 * /api/v1/task/tasklistbyproject/{projectId}:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Get Task List based on ProjectId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: projectId
 *         in: path
 *         description: Project Id
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
 router.route('/tasklistbyproject/:projectId').post(authController.protect,taskController.getTaskListByProject);
/**
 * @swagger
 * /api/v1/task/{id}:
 *  get:
 *      tags:
 *          - Task Management
 *      summary: "Get Task based on TaskId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Id
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
router.route('/:id').get(authController.protect,taskController.getTask);
/**
 * @swagger
 * /api/v1/task/newtask:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create New Task"   
 *      security: [{
 *         bearerAuth: []
 *     }]      
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          taskName:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
 *                          startTime:
 *                              type: string
 *                          description:
 *                              type: string
 *                          comment:
 *                              type: string
 *                          priority:
 *                              type: string
 *                          project:
 *                              type: string
 *                          title:
 *                              type: string 
 *                          parentTask:
 *                              type: string  
 *                          estimate:
 *                              type: number
 *                          timeTaken:
 *                              type: number 
 *                          user:
 *                              type: string                             
 *                          taskAttachments:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"attachmentType",attachmentName,attachmentSize,extention,file}                            
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
router.post('/newtask',authController.protect,taskController.addTask);
/**
 * @swagger
 * /api/v1/task/update/{id}:
 *  patch:
 *      tags:
 *          - Task Management
 *      summary: "Update Task based on TaskId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Id
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
 *                          taskName:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
 *                          startTime:
 *                              type: string
 *                          description:
 *                              type: string
 *                          comment:
 *                              type: string
 *                          priority:
 *                              type: string
 *                          project:
 *                              type: string
 *                          title:
 *                              type: string 
 *                          parentTask:
 *                              type: string  
 *                          estimate:
 *                              type: number
 *                          timeTaken:
 *                              type: number 
 *                          status:
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
 router.patch('/update/:id',authController.protect,taskController.updateTask);
/**
 * @swagger
 * /api/v1/task/update/{id}:
 *  put:
 *      tags:
 *          - Task Management
 *      summary: "Update Task based on TaskId"   
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Id
 *         required: true
 *         schema:
 *           type: string
 *           format: int64 *           
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          taskName:
 *                              type: string
 *                          startDate:
 *                              type: string
 *                              format: date
 *                          endDate:
 *                              type: string
 *                              format: date
 *                          startTime:
 *                              type: string
 *                          description:
 *                              type: string
 *                          comment:
 *                              type: string
 *                          priority:
 *                              type: string
 *                          project:
 *                              type: string
 *                          title:
 *                              type: string 
 *                          parentTask:
 *                              type: string  
 *                          estimate:
 *                              type: number
 *                          timeTaken:
 *                              type: number 
 *                          status:
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
router.put('/update/:id',authController.protect,taskController.updateFlex);

 /**
 * @swagger
 * /api/v1/task/{id}:
 *  delete:
 *      tags:
 *          - Task Management
 *      summary: "Delete Task based on TaskId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Id
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
router.route('/:id').delete(authController.protect,taskController.deleteTask);


/**
 * @swagger
 * /api/v1/task/gettaskuserslist/{id}:
 *  get:
 *      tags:
 *          - Task Management
 *      summary: "Get Task Users based on TaskId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task ID
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
 router.get('/gettaskuserslist/:id',authController.protect,taskController.getTaskUsers);
/**
 * @swagger
 * /api/v1/task/gettaskuser/{id}:
 *  get:
 *      tags:
 *          - Task Management
 *      summary: "Get a Task User based on TaskUserId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task User Id
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
 router.get('/gettaskuser/:id',authController.protect,taskController.getTaskUser);
 /**
 * @swagger
 * /api/v1/task/newtaskuser:
 *  post:
 *      tags:
 *          - Task Management
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
 *                          task:
 *                              type: string
 *                          user:
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
router.post('/newtaskuser',authController.protect,taskController.addTaskUser);

/**
 * @swagger
 * /api/v1/task/taskuser/{id}:
 *  delete:
 *      tags:
 *          - Task Management
 *      summary: "Delete Task User Based on TaskUserId"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task User Id
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
router.route('/taskuser/:id').delete(authController.protect,taskController.deleteTaskUser);


/**
 * @swagger
 * /api/v1/task/gettaskattachmentslist/{id}:
 *  get:
 *      tags:
 *          - Task Management
 *      summary: "Get All Task Attachment based on TaskID"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task ID
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
 router.get('/gettaskattachmentslist/:id',authController.protect,taskController.getTaskAttachments);
 /**
  * @swagger
  * /api/v1/task/gettaskattachment/{id}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get Task Attachment based on TaskAttachmentId"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
  *       - name: id
  *         in: path
  *         description: Task Attachment Id
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
 router.get('/gettaskattachment/:id',authController.protect,taskController.getTaskAttachment); 
/**
 * @swagger
 * /api/v1/task/new/taskattachment:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create Attachment for Task"  
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          taskId:
 *                              type: string
 *                          comment:
 *                              type: string 
 *                              format: int64 
 *                          taskAttachments:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: {"attachmentType",attachmentName,attachmentSize,extention,file}
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
router.post('/new/taskattachment',authController.protect,taskController.addTaskAttachment);

 /**
 * @swagger
 * /api/v1/task/taskattachment/{id}:
 *  delete:
 *      tags:
 *          - Task Management
 *      summary: "Delete Task Attachment"
 *      security: [{
 *         bearerAuth: []
 *     }]
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Attachment Id
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
 router.route('/taskattachment/:id').delete(authController.protect,taskController.deleteTaskAttachment);

 /**
 * @swagger
 * /api/v1/task/tasklistbyuser:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Get Task List By UserId"   
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
  router.post('/tasklistbyuser',authController.protect,taskController.getTaskListByUser);

  /**
 * @swagger
 * /api/v1/task/getUserTaskListByProject:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Get Task List By Project and UserId"   
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
 *                          projectId:
 *                              type: string  
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
  router.post('/getUserTaskListByProject',authController.protect,taskController.getUserTaskListByProject);

  //Task Tag functionality
/**
 * @swagger
 * /api/v1/task/tag/Add:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create a new tag"   
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
 *                          title:
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
  router.post('/Tag/Add',authController.protect,taskController.addTag);

/**
 * @swagger
 * /api/v1/task/tag/Update:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create a new tag"   
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
 *                          title:
 *                              type: string  
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
router.post('/Tag/Update',authController.protect,taskController.updateTag);
// Delete a taskTag by ID
/**
  * @swagger
  * /api/v1/task/Tag/{id}:
  *  delete:
  *      tags:
  *          - Task Management
  *      summary: "Delete tag"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
router.delete('/Tag/:id', authController.protect, taskController.deleteTagById);

// Get a single Tag by ID
/**
  * @swagger
  * /api/v1/task/Tag/{id}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get tag by Id"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
router.get('/Tag/:id', authController.protect, taskController.getTagById);

// Get Tags by TaskID
/**
  * @swagger
  * /api/v1/task/Tags/{taskId}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get tags by taskId"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: taskId
 *         in: path
 *         description: Task tag Id 
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
router.get('/Tags/:taskId', authController.protect, taskController.getTagsByTaskId);

//END of Task Tag functionality


  //Task Tag routes

// Create a new taskTag
/**
 * @swagger
 * /api/v1/task/taskTag:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create a new task tag"   
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
 *                          task:
 *                              type: string 
 *                          tag:
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
router.post('/TaskTag/', authController.protect, taskController.createTaskTag);

// Get all taskTags
/**
  * @swagger
  * /api/v1/task/taskTag:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get all tasktags"
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
router.get('/TaskTag/', authController.protect, taskController.getAllTaskTags);

// Get a single taskTag by ID
/**
  * @swagger
  * /api/v1/task/taskTag/{id}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get all tasktags"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
router.get('/TaskTag/:id', authController.protect, taskController.getTaskTagById);

// Update a taskTag by ID
/**
  * @swagger
  * /api/v1/task/taskTag/{id}:
  *  put:
  *      tags:
  *          - Task Management
  *      summary: "Update tasktag"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
 *                          task:
 *                              type: string
 *                              format: int64
 *                          tag:
 *                              type: string   
 *                              format: int64 
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
router.put('/TaskTag/:id', authController.protect, taskController.updateTaskTagById);

// Delete a taskTag by ID
/**
  * @swagger
  * /api/v1/task/taskTag/{id}:
  *  delete:
  *      tags:
  *          - Task Management
  *      summary: "Update tasktag"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
router.delete('/TaskTag/:id', authController.protect, taskController.deleteTaskTagById);

//END of Task Tag routes

//Comment Routes

//Create a new comment
/**
 * @swagger
 * /api/v1/task/comment:
 *  post:
 *      tags:
 *          - Task Management
 *      summary: "Create a new comment"   
 *      security: [{
 *         bearerAuth: []
 *     }]           
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          content:
 *                              type: string  
 *                          author:
 *                              type: string
 *                              format: int64
 *                          task:
 *                              type: string
 *                              format: int64 
 *                          commentedAt:
 *                              type: Date
 *                          parent:
 *                              type: string
 *                              format: int64 
 *                          status:
 *                              type: string
 *                          commentType:
 *                              type: string
 *                          taskAttachments:
 *                              type: array
 *                               
 *                              items:
 *                                type: string
 *                                example: {"attachmentType",attachmentName,attachmentSize,extention,file}    
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
router.post('/comment/', authController.protect, taskController.createComment);

// Get all Comments
/**
  * @swagger
  * /api/v1/task/taskTag:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get all tasktags"
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
router.get('/Comment/', authController.protect, taskController.getCommentsByTaskId);

// Get a single taskTag by ID
/**
  * @swagger
  * /api/v1/task/taskTag/{id}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get all tasktags"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task tag Id
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
router.get('/TaskTag/:id', authController.protect, taskController.getTaskTagById);

// Update a comment by ID
/**
  * @swagger
  * /api/v1/task/Comment/{id}:
  *  put:
  *      tags:
  *          - Task Management
  *      summary: "Update Comment"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Comment Id
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
 *                          content:
 *                              type: string  
 *                          author:
 *                              type: string
 *                              format: int64
 *                          task:
 *                              type: string
 *                              format: int64 
 *                          commentedAt:
 *                              type: Date
 *                          parent:
 *                              type: string
 *                              format: int64 
 *                          status:
 *                              type: string
 *                          commentType:
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
router.put('/Comment/:id', authController.protect, taskController.updateComment);

// Delete a Comment
/**
  * @swagger
  * /api/v1/task/Comment/{id}:
  *  delete:
  *      tags:
  *          - Task Management
  *      summary: "Delete a comment"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Comment Id
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
router.delete('/Comment/:id', authController.protect, taskController.deleteComment);

// Get all the comments of a task
/**
  * @swagger
  * /api/v1/task/Comments/{id}:
  *  get:
  *      tags:
  *          - Task Management
  *      summary: "Get all comments"
  *      security: [{
  *         bearerAuth: []
  *     }]
  *      parameters:
 *       - name: id
 *         in: path
 *         description: Task Id
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
router.get('/Comments/:id', authController.protect, taskController.getAllComments);

//END of Task Tag routes


module.exports = router;