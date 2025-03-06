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
router.post('/submit', feedbackController.submitFeedback);
router.get('/:id', authController.protect, feedbackController.getFeedbackById);
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

module.exports = router;