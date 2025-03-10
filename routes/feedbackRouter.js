const express = require('express');
const { Router } = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('../controllers/authController');
const router = express.Router();

// Feedback Field Routes
/**
 * @swagger
 * /api/v1/feedback/fields/create:
 *  post:
 *      tags:
 *          - Feedback Management
 *      summary: "Create a new feedback field"
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
 *                          dataType:
 *                              type: string
 *                              enum: ['string', 'number', 'rating', 'date', 'boolean']
 *                          isRequired:
 *                              type: boolean
 *      produces:
 *          - application/json
 *      responses:
 *          201:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
router.post('/fields/create', authController.protect, feedbackController.createFeedbackField);

/**
 * @swagger
 * /api/v1/feedback/fields/{id}:
 *  get:
 *      tags:
 *          - Feedback Management
 *      summary: "Get feedback field by ID"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Feedback field ID
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
 */
router.get('/fields/:id', authController.protect, feedbackController.getFeedbackFieldById);

/**
 * @swagger
 * /api/v1/feedback/fields:
 *  get:
 *      tags:
 *          - Feedback Management
 *      summary: "Get all feedback fields for the authenticated user's company"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 */
router.get('/fields', authController.protect, feedbackController.getFeedbackFieldsByCompany);

/**
 * @swagger
 * /api/v1/feedback/fields/update/{id}:
 *  patch:
 *      tags:
 *          - Feedback Management
 *      summary: "Update a feedback field"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Feedback field ID
 *         required: true
 *         schema:
 *           type: string
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
 *                          dataType:
 *                              type: string
 *                              enum: ['string', 'number', 'rating', 'date', 'boolean']
 *                          isRequired:
 *                              type: boolean
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
router.patch('/fields/update/:id', authController.protect, feedbackController.updateFeedbackField);

/**
 * @swagger
 * /api/v1/feedback/fields/delete/{id}:
 *  delete:
 *      tags:
 *          - Feedback Management
 *      summary: "Delete a feedback field"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Feedback field ID
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
 */
router.delete('/fields/delete/:id', authController.protect, feedbackController.deleteFeedbackField);

// Feedback Submission Routes
/**
 * @swagger
 * /api/feedback/submit:
 *   post:
 *     summary: Submit feedback
 *     description: Allows a user to submit feedback for a specific company/store, including feedback values based on predefined fields.
 *     tags: [Feedback Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
 *               storeId:
 *                 type: string
 *                 description: ID of the store where feedback is submitted.
 *                 example: "store456"
 *               tableId:
 *                 type: string
 *                 description: ID of the table (optional).
 *                 example: "table789"
 *               provider:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     description: Email of the feedback provider (optional).
 *                     example: "customer@example.com"
 *                   phoneNumber:
 *                     type: string
 *                     description: Phone number of the provider (optional).
 *                     example: "+1234567890"
 *                   name:
 *                     type: string
 *                     description: Name of the provider (optional).
 *                     example: "John Doe"
 *               feedbackValues:
 *                 type: array
 *                 description: Array of feedback values corresponding to feedback fields.
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       description: ID of the feedback field.
 *                       example: "field123"
 *                     value:
 *                       type: any
 *                       description: Value for the feedback field (type depends on field.dataType).
 *                       example: 4
 *                 required:
 *                   - field
 *     responses:
 *       201:
 *         description: Feedback submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "feedback789"
 *                     company:
 *                       type: string
 *                       example: "company123"
 *                     storeId:
 *                       type: string
 *                       example: "store456"
 *                     tableId:
 *                       type: string
 *                       example: "table789"
 *                     provider:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: "customer@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+1234567890"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     feedbackValues:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: "field123"
 *                           value:
 *                             type: any
 *                             example: 4
 *       400:
 *         description: Bad request due to invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failure"
 *                 message:
 *                   type: string
 *                   example: "Value for required field 'Rating' is missing"
 *     security:
 *       - cookieAuth: []
 */
router.post('/submit', feedbackController.submitFeedback);
//router.get('/:id', authController.protect, feedbackController.getFeedbackById);
router.get('/store/:storeId', authController.protect, feedbackController.getFeedbackByStore);
/**
 * @swagger
 * /api/v1/feedback:
 *  get:
 *      tags:
 *          - Feedback Management
 *      summary: Get all feedback entries for the authenticated user's company
 *      description: Retrieves feedback entries filtered by company ID (from cookies) and optional date range
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: startDate
 *            schema:
 *                type: string
 *                format: date
 *            description: Start date for filtering feedback (e.g., 2025-01-01)
 *            required: false
 *          - in: query
 *            name: endDate
 *            schema:
 *                type: string
 *                format: date
 *            description: End date for filtering feedback (e.g., 2025-03-06)
 *            required: false
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successfully retrieved feedback entries
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  example: success
 *                              data:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          _id:
 *                                              type: string
 *                                          company:
 *                                              type: string
 *                                          submittedAt:
 *                                              type: string
 *                                              format: date-time
 *                                          feedbackValues:
 *                                              type: array
 *                                              items:
 *                                                  type: object
 *                                                  properties:
 *                                                      field:
 *                                                          type: object
 *                                                          properties:
 *                                                              _id:
 *                                                                  type: string
 *                                                              name:
 *                                                                  type: string
 *                                                      value:
 *                                                          type: string
 *                                      example:
 *                                          _id: "123"
 *                                          company: "456"
 *                                          submittedAt: "2025-03-06T10:00:00Z"
 *                                          feedbackValues:
 *                                              - field:
 *                                                  _id: "789"
 *                                                  name: "rating"
 *                                                value: "5"
 *          404:
 *              description: No feedback found for this company
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  example: failure
 *                              message:
 *                                  type: string
 *                                  example: No feedback found for this company
 *          400:
 *              description: Bad request or server error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  example: failure
 *                              message:
 *                                  type: string
 *                                  example: Error message from server
 */
router.get('/', authController.protect, feedbackController.getFeedbackByCompany);
router.delete('/delete/:id', authController.protect, feedbackController.deleteFeedback);

//barcode API's
// Barcode Routes
/**
 * @swagger
 * /api/feedback/qrcodes:
 *   post:
 *     summary: Create a feedback QRcode
 *     tags: [Feedback Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string 
 *               storeId:
 *                 type: string
 *               tableId:
 *                 type: string
 *               url:
 *                 type: string
 *             required:
 *               - companyId
 *               - storeId
 *               - tableId
 *               - url
 *     responses:
 *       201:
 *         description: Barcode created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post('/qrcodes', authController.protect, feedbackController.createBarcode);

/**
 * @swagger
 * /api/v1/feedback/qrcodes:
 *  get:
 *      tags:
 *          - Feedback Management
 *      summary: "Get all QRcodes for the authenticated user's company"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: "Success"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 *      security:
 *          - cookieAuth: []
 */
router.get('/qrcodes', authController.protect, feedbackController.getBarcodesByCompany);

/**
 * @swagger
 * /api/v1/feedback/qrcodes/{id}:
 *  get:
 *      tags:
 *          - Feedback Management
 *      summary: "Get QRcode by ID"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Barcode ID
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
 *      security:
 *          - cookieAuth: []
 */
router.get('/qrcodes/:id', authController.protect, feedbackController.getBarcodeById);

/**
 * @swagger
 * /api/v1/feedback/qrcodes/{id}:
 *  patch:
 *      tags:
 *          - Feedback Management
 *      summary: "Update a QRCode"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Barcode ID
 *         required: true
 *         schema:
 *           type: string
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          storeId:
 *                              type: string
 *                          tableId:
 *                              type: string
 *                          url:
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
 *      security:
 *          - cookieAuth: []
 */
router.patch('/qrcodes/:id', authController.protect, feedbackController.updateBarcode);

/**
 * @swagger
 * /api/v1/feedback/qrcodes/delete/{id}:
 *  delete:
 *      tags:
 *          - Feedback Management
 *      summary: "Delete a QRCode"
 *      parameters:
 *       - name: id
 *         in: path
 *         description: Barcode ID
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
 *      security:
 *          - cookieAuth: []
 */
router.delete('/qrcodes/:id', authController.protect, feedbackController.deleteBarcode);


module.exports = router;