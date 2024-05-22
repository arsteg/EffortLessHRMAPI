const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/report/getactivity:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Activity - Please pass UserId in users"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: string
 *                         projects:
 *                              type: string
 *                         startDate:
 *                              type: string
 *                              format: date
 *                         endDate:
 *                              type: string
 *                              format: date
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
router.post('/getactivity', authController.protect, reportController.getActivity);
/**
 * @swagger
 * /api/v1/report/getproductivitybymember:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Activity"   
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
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/getproductivitybymember', authController.protect, reportController.getProductivityByMember);

/**
 * @swagger
 * /api/v1/report/getAppWebsiteByMember:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Activity"   
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
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/getAppWebsiteByMember', authController.protect, reportController.getAppWebsiteByMember);

 /**
 * @swagger
 * /api/v1/report/getproductivity:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Productivity for all members"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""                           
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/getproductivity', authController.protect, reportController.getProductivity);
/**
 * @swagger
 * /api/v1/report/getappwebsite:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Activity"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *                         projects:
 *                              type: array
 *                              items:
 *                                type: object
 *                                example: ""
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/getappwebsite', authController.protect, reportController.getAppWebsite);

 /**
 * @swagger
 * /api/v1/report/getleaves:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Leaves"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/getleaves', authController.protect, reportController.getleaves);

  
 /**
 * @swagger
 * /api/v1/report/gettimesheet:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Timesheet by Users,Projects & Date range - Please pass UserId in users"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *                         projects:
 *                              type: array
 *                              items:
 *                                type: object
 *                                example: ""
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
router.post('/gettimesheet', authController.protect, reportController.gettimesheet);

 /**
 * @swagger
 * /api/v1/report/gettimeline:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get TimeLine by Users,Projects & Date range - Please pass UserId in users"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *                         projects:
 *                              type: array
 *                              items:
 *                                type: object
 *                                example: ""
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
  router.post('/gettimeline', authController.protect, reportController.gettimeline);
/**
 * @swagger
 * /api/v1/report/getattandance:
 *  post:
 *      tags:
 *          - Report Management
 *      summary: "Get Attaindance by Users - Please pass UserId in users"   
 *      security: [{
 *         bearerAuth: []
 *     }]    
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                         users:
 *                              type: array
 *                              items:
 *                                type: string
 *                                example: ""
 *                         fromdate:
 *                              type: string
 *                              format: date
 *                         todate:
 *                              type: string
 *                              format: date
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
 router.post('/getattandance', authController.protect, reportController.getattandance);
 module.exports = router;