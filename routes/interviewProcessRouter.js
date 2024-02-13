const express = require('express');
const { Router } = require('express');
const app = require('../app');
const router = express.Router();
module.exports = router;
const interviewProcessController = require('../controllers/interviewProcessController')
const authController = require('../controllers/authController');
/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for Interview Process
 */

/**
 * @swagger
 * /api/v1/interviews/application-status:
 *   post:
 *     summary: Create a new application status
 *     tags: [Interview Process]
 *     requestBody:
 *       description: Application status details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true 
 *     responses:
 *       201:
 *         description: Application status successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/application-status', authController.protect, interviewProcessController.createApplicationStatus);
router.post('/application-status', interviewProcessController.createApplicationStatus);

/**
 * @swagger
 * /api/v1/interviews/application-status/{id}:
 *   get:
 *     summary: Get an application status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the application status
 *     responses:
 *       200:
 *         description: Successful response with the application status
 *       404:
 *         description: Application status not found
 *       500:
 *         description: Internal server error
 */
//router.get('/application-status/:id', authController.protect, interviewProcessController.getApplicationStatus);
router.get('/application-status/:id', interviewProcessController.getApplicationStatus);
/**
 * @swagger
 * /api/v1/interviews/application-status/{id}:
 *   put:
 *     summary: Update an application status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the application status
 *     requestBody:
 *       description: New application status details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated application status
 *       404:
 *         description: Application status not found
 *       500:
 *         description: Internal server error
 */
//router.put('/application-status/:id', authController.protect, interviewProcessController.updateApplicationStatus);
router.put('/application-status/:id', interviewProcessController.updateApplicationStatus);
/**
 * @swagger
 * /api/v1/interviews/application-status/{id}:
 *   delete:
 *     summary: Delete an application status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the application status
 *     responses:
 *       204:
 *         description: Application status successfully deleted
 *       404:
 *         description: Application status not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/application-status/:id', authController.protect, interviewProcessController.deleteApplicationStatus);
router.delete('/application-status/:id', interviewProcessController.deleteApplicationStatus);

/**
 * @swagger
 * /api/v1/interviews/application-status:
 *   get:
 *     summary: Get all application statuses for a company
 *     tags: [Interview Process] 
 *     responses:
 *       200:
 *         description: Successful response with application statuses
 *       500:
 *         description: Internal server error
 */
//router.get('/application-status', authController.protect, interviewProcessController.getAllApplicationStatusForCompany);
router.get('/application-status', interviewProcessController.getAllApplicationStatusForCompany);

/**
 * @swagger
 * /api/v1/interviews/candidates:
 *   post:
 *     summary: Add a new candidate
 *     tags: [Interview Process]
 *     requestBody:
 *       description: Candidate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *               phoneNumber:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Candidate successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/candidates', authController.protect, interviewProcessController.addCandidate);
router.post('/candidates', interviewProcessController.addCandidate);

/**
 * @swagger
 * /api/v1/interviews/candidates/{id}:
 *   get:
 *     summary: Get a candidate by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       200:
 *         description: Successful response with the candidate
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidates/:id', authController.protect, interviewProcessController.getCandidate);
router.get('/candidates/:id', interviewProcessController.getCandidate);

/**
 * @swagger
 * /api/v1/interviews/candidates/{id}:
 *   put:
 *     summary: Update a candidate by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     requestBody:
 *       description: New candidate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated candidate
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Internal server error
 */
//router.put('/candidates/:id', authController.protect, interviewProcessController.updateCandidate);
router.put('/candidates/:id', interviewProcessController.updateCandidate);

/**
 * @swagger
 * /api/v1/interviews/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       204:
 *         description: Candidate successfully deleted
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/candidates/:id', authController.protect, interviewProcessController.deleteCandidate);
router.delete('/candidates/:id', interviewProcessController.deleteCandidate);

/**
 * @swagger
 * /api/v1/interviews/candidates:
 *   get:
 *     summary: Get all candidates for a company
 *     tags: [Interview Process]
 *     responses:
 *       200:
 *         description: Successful response with candidates
 *       500:
 *         description: Internal server error
 */
//router.get('/candidates', authController.protect, interviewProcessController.getAllCandidates);
router.get('/candidates', interviewProcessController.getAllCandidates);

/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for Candidate Application Status
 */

/**
 * @swagger
 * /api/v1/interviews/candidate-application-status:
 *   post:
 *     summary: Add a Candidate Application Status
 *     tags: [Interview Process]
 *     requestBody:
 *       description: Candidate Application Status details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *                 required: true
 *               createdBy:
 *                 type: string
 *                 required: true
 *               updatedBy:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Candidate Application Status successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/candidate-application-status', authController.protect, interviewProcessController.createCandidateApplicationStatus);
router.post('/candidate-application-status', interviewProcessController.createCandidateApplicationStatus);
/**
 * @swagger
 * /api/v1/interviews/candidate-application-status/{id}:
 *   get:
 *     summary: Get a Candidate Application Status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Candidate Application Status
 *     responses:
 *       200:
 *         description: Successful response with the Candidate Application Status
 *       404:
 *         description: Candidate Application Status not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-application-status/:id', authController.protect, interviewProcessController.getCandidateApplicationStatus);
router.get('/candidate-application-status/:id',interviewProcessController.getCandidateApplicationStatus);

/**
 * @swagger
 * /api/v1/interviews/candidate-application-status/{id}:
 *   put:
 *     summary: Update a Candidate Application Status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Candidate Application Status
 *     requestBody:
 *       description: New Candidate Application Status details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate:
 *                 type: string
 *               status:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Candidate Application Status
 *       404:
 *         description: Candidate Application Status not found
 *       500:
 *         description: Internal server error
 */
//router.put('/candidate-application-status/:id', authController.protect, interviewProcessController.updateCandidateApplicationStatus);
router.put('/candidate-application-status/:id',  interviewProcessController.updateCandidateApplicationStatus);

/**
 * @swagger
 * /api/v1/interviews/candidate-application-status/{id}:
 *   delete:
 *     summary: Delete a Candidate Application Status by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Candidate Application Status
 *     responses:
 *       204:
 *         description: Candidate Application Status successfully deleted
 *       404:
 *         description: Candidate Application Status not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/candidate-application-status/:id', authController.protect, interviewProcessController.deleteCandidateApplicationStatus);
router.delete('/candidate-application-status/:id', interviewProcessController.deleteCandidateApplicationStatus);

/**
 * @swagger
 * /api/v1/interviews/candidate-application-status/company/{companyId}:
 *   get:
 *     summary: Get all Candidate Application Status for a company
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with Candidate Application Status for the company
 *       404:
 *         description: Candidate Application Status not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-application-status/company/:companyId', authController.protect, interviewProcessController.getAllCandidateApplicationStatusForCompany);
router.get('/candidate-application-status/company/:companyId', interviewProcessController.getAllCandidateApplicationStatusForCompany);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-fields:
 *   post:
 *     summary: Add a CandidateDataField
 *     tags: [Interview Process]
 *     requestBody:
 *       description: CandidateDataField details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *                 required: true
 *               fieldType:
 *                 type: string
 *                 required: true
 *               subType:
 *                 type: string
 *               isRequired:
 *                 type: boolean
 *                 required: true 
 *             example:
 *               fieldName: "Experience"
 *               fieldType: "Number"
 *               subType: "Years"
 *               isRequired: true
 *               company: "606a3f17a33e5d4c87a6ea1f"
 *     responses:
 *       201:
 *         description: CandidateDataField successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/candidate-data-fields', authController.protect, interviewProcessController.addCandidateDataField);
router.post('/candidate-data-fields', interviewProcessController.addCandidateDataField);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-fields/{id}:
 *   get:
 *     summary: Get a CandidateDataField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataField
 *     responses:
 *       200:
 *         description: Successful response with the CandidateDataField
 *       404:
 *         description: CandidateDataField not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-data-fields/:id', authController.protect, interviewProcessController.getCandidateDataField);
router.get('/candidate-data-fields/:id', interviewProcessController.getCandidateDataField);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-fields/{id}:
 *   put:
 *     summary: Update a CandidateDataField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataField
 *     requestBody:
 *       description: New CandidateDataField details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *               fieldType:
 *                 type: string
 *               subType:
 *                 type: string
 *               isRequired:
 *                 type: boolean 
 *             example:
 *               fieldName: "Updated Experience"
 *               fieldType: "Number"
 *               subType: "Months"
 *               isRequired: false
 *               company: "606a3f17a33e5d4c87a6ea1f"
 *     responses:
 *       200:
 *         description: Successful response with the updated CandidateDataField
 *       404:
 *         description: CandidateDataField not found
 *       500:
 *         description: Internal server error
 */
//router.put('/candidate-data-fields/:id', authController.protect, interviewProcessController.updateCandidateDataField);
router.put('/candidate-data-fields/:id', interviewProcessController.updateCandidateDataField);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-fields/{id}:
 *   delete:
 *     summary: Delete a CandidateDataField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataField
 *     responses:
 *       204:
 *         description: CandidateDataField successfully deleted
 *       404:
 *         description: CandidateDataField not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/candidate-data-fields/:id', authController.protect, interviewProcessController.deleteCandidateDataField);
router.delete('/candidate-data-fields/:id', interviewProcessController.deleteCandidateDataField);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-fields/:
 *   get:
 *     summary: Get all CandidateDataFields for a company
 *     tags: [Interview Process] 
 *     responses:
 *       200:
 *         description: Successful response with CandidateDataFields
 *       404:
 *         description: No CandidateDataFields found for the company
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-data-fields/company/:companyId', authController.protect, interviewProcessController.getAllCandidateDataFieldsByCompany);
router.get('/candidate-data-fields/', interviewProcessController.getAllCandidateDataFieldsByCompany);

/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for managing CandidateDataFieldValues
 */

/**
 * @swagger
 * /api/v1/interviews/candidate-data-field-values:
 *   post:
 *     summary: Add a new CandidateDataFieldValue record
 *     tags: [Interview Process]
 *     requestBody:
 *       description: CandidateDataFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateDataField:
 *                 type: string
 *                 required: true
 *               fieldValue:
 *                 type: string
 *                 required: true
 *               fieldType:
 *                 type: string
 *                 required: true
 *               candidate:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *               createdBy:
 *                 type: string
 *                 required: true
 *               updatedBy:
 *                 type: string
 *                 required: true
 *             example:
 *               candidateDataField: "606a3f17a33e5d4c87a6ea1f"
 *               fieldValue: "Some value"
 *               fieldType: "String"
 *               candidate: "606a3f17a33e5d4c87a6ea2f"
 *               company: "606a3f17a33e5d4c87a6ea3f"
 *               createdBy: "606a3f17a33e5d4c87a6ea4f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea4f"
 *     responses:
 *       201:
 *         description: CandidateDataFieldValue successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/candidate-data-field-values', authController.protect, interviewProcessController.addCandidateDataFieldValue);
router.post('/candidate-data-field-values', interviewProcessController.addCandidateDataFieldValue);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-field-values/{id}:
 *   get:
 *     summary: Get a CandidateDataFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataFieldValue
 *     responses:
 *       200:
 *         description: Successful response with the CandidateDataFieldValue
 *       404:
 *         description: CandidateDataFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-data-field-values/:id', authController.protect, interviewProcessController.getCandidateDataFieldValue);
router.get('/candidate-data-field-values/:id', interviewProcessController.getCandidateDataFieldValue);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-field-values/{id}:
 *   put:
 *     summary: Update a CandidateDataFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataFieldValue
 *     requestBody:
 *       description: New CandidateDataFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateDataField:
 *                 type: string
 *               fieldValue:
 *                 type: string
 *               fieldType:
 *                 type: string
 *               candidate:
 *                 type: string
 *               company:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *             example:
 *               candidateDataField: "606a3f17a33e5d4c87a6ea1f"
 *               fieldValue: "Updated value"
 *               fieldType: "String"
 *               candidate: "606a3f17a33e5d4c87a6ea2f"
 *               company: "606a3f17a33e5d4c87a6ea3f"
 *               createdBy: "606a3f17a33e5d4c87a6ea4f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea4f"
 *     responses:
 *       200:
 *         description: Successful response with the updated CandidateDataFieldValue
 *       404:
 *         description: CandidateDataFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.put('/candidate-data-field-values/:id', authController.protect, interviewProcessController.updateCandidateDataFieldValue);
router.put('/candidate-data-field-values/:id', interviewProcessController.updateCandidateDataFieldValue);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-field-values/{id}:
 *   delete:
 *     summary: Delete a CandidateDataFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateDataFieldValue
 *     responses:
 *       204:
 *         description: CandidateDataFieldValue successfully deleted
 *       404:
 *         description: CandidateDataFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/candidate-data-field-values/:id', authController.protect, interviewProcessController.deleteCandidateDataFieldValue);
router.delete('/candidate-data-field-values/:id', interviewProcessController.deleteCandidateDataFieldValue);

/**
 * @swagger
 * /api/v1/interviews/candidate-data-field-values/company/{companyId}:
 *   get:
 *     summary: Get all CandidateDataFieldValues for a company
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with CandidateDataFieldValues
 *       404:
 *         description: No CandidateDataFieldValues found for the company
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-data-field-values/company/:companyId', authController.protect, interviewProcessController.getAllCandidateDataFieldValuesByCompany);
router.get('/candidate-data-field-values/company/:companyId', interviewProcessController.getAllCandidateDataFieldValuesByCompany);

/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for managing CandidateInterviewDetails
 */

/**
 * @swagger
 * /api/v1/interviews/candidate-interview-details:
 *   post:
 *     summary: Add a new CandidateInterviewDetails record
 *     tags: [Interview Process]
 *     requestBody:
 *       description: CandidateInterviewDetails details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate:
 *                 type: string
 *                 required: true
 *               interviewDateTime:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *               scheduledBy:
 *                 type: string
 *                 required: true
 *               zoomLink:
 *                 type: string
 *               interviewer:
 *                 type: string
 *                 required: true
 *               createdBy:
 *                 type: string
 *                 required: true
 *               updatedBy:
 *                 type: string
 *                 required: true
 *             example:
 *               candidate: "606a3f17a33e5d4c87a6ea2f"
 *               interviewDateTime: "2024-02-08T12:00:00Z"
 *               scheduledBy: "606a3f17a33e5d4c87a6ea4f"
 *               zoomLink: "https://zoom.us/example"
 *               interviewer: "606a3f17a33e5d4c87a6ea5f"
 *               createdBy: "606a3f17a33e5d4c87a6ea6f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea6f"
 *     responses:
 *       201:
 *         description: CandidateInterviewDetails successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/candidate-interview-details', authController.protect, interviewProcessController.addCandidateInterviewDetails);
router.post('/candidate-interview-details', interviewProcessController.addCandidateInterviewDetails);

/**
 * @swagger
 * /api/v1/interviews/candidate-interview-details/{id}:
 *   get:
 *     summary: Get a CandidateInterviewDetails by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateInterviewDetails
 *     responses:
 *       200:
 *         description: Successful response with the CandidateInterviewDetails
 *       404:
 *         description: CandidateInterviewDetails not found
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-interview-details/:id', authController.protect, interviewProcessController.getCandidateInterviewDetails);
router.get('/candidate-interview-details/:id', interviewProcessController.getCandidateInterviewDetails);

/**
 * @swagger
 * /api/v1/interviews/candidate-interview-details/{id}:
 *   put:
 *     summary: Update a CandidateInterviewDetails by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateInterviewDetails
 *     requestBody:
 *       description: New CandidateInterviewDetails details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate:
 *                 type: string
 *               interviewDateTime:
 *                 type: string
 *                 format: date-time
 *               scheduledBy:
 *                 type: string
 *               zoomLink:
 *                 type: string
 *               interviewer:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *             example:
 *               candidate: "606a3f17a33e5d4c87a6ea2f"
 *               interviewDateTime: "2024-02-08T15:00:00Z"
 *               scheduledBy: "606a3f17a33e5d4c87a6ea4f"
 *               zoomLink: "https://zoom.us/updated-example"
 *               interviewer: "606a3f17a33e5d4c87a6ea5f"
 *               createdBy: "606a3f17a33e5d4c87a6ea6f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea6f"
 *     responses:
 *       200:
 *         description: Successful response with the updated CandidateInterviewDetails
 *       404:
 *         description: CandidateInterviewDetails not found
 *       500:
 *         description: Internal server error
 */
router.put('/candidate-interview-details/:id', authController.protect, interviewProcessController.updateCandidateInterviewDetails);
router.put('/candidate-interview-details/:id', interviewProcessController.updateCandidateInterviewDetails);

/**
 * @swagger
 * /api/v1/interviews/candidate-interview-details/{id}:
 *   delete:
 *     summary: Delete a CandidateInterviewDetails by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CandidateInterviewDetails
 *     responses:
 *       204:
 *         description: CandidateInterviewDetails successfully deleted
 *       404:
 *         description: CandidateInterviewDetails not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/candidate-interview-details/:id', authController.protect, interviewProcessController.deleteCandidateInterviewDetails);
router.delete('/candidate-interview-details/:id', interviewProcessController.deleteCandidateInterviewDetails);

/**
 * @swagger
 * /api/v1/interviews/candidate-interview-details/company/{companyId}:
 *   get:
 *     summary: Get all CandidateInterviewDetails for a company
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with CandidateInterviewDetails
 *       404:
 *         description: No CandidateInterviewDetails found for the company
 *       500:
 *         description: Internal server error
 */
//router.get('/candidate-interview-details/company/:companyId', authController.protect, interviewProcessController.getAllCandidateInterviewDetailsByCompany);
router.get('/candidate-interview-details/company/:companyId', interviewProcessController.getAllCandidateInterviewDetailsByCompany);

/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for managing FeedbackField
 */

/**
 * @swagger
 * /api/v1/interviews/feedback-fields:
 *   post:
 *     summary: Add a new FeedbackField record
 *     tags: [Interview Process]
 *     requestBody:
 *       description: FeedbackField details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *                 required: true
 *               fieldType:
 *                 type: string
 *                 required: true
 *               subType:
 *                 type: string
 *               isRequired:
 *                 type: boolean
 *               company:
 *                 type: string
 *                 required: true
 *               createdBy:
 *                 type: string
 *                 required: true
 *               updatedBy:
 *                 type: string
 *                 required: true
 *             example:
 *               fieldName: "Example Field"
 *               fieldType: "Text"
 *               subType: "Single Line"
 *               isRequired: true
 *               company: "606a3f17a33e5d4c87a6ea2f"
 *               createdBy: "606a3f17a33e5d4c87a6ea4f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea5f"
 *     responses:
 *       201:
 *         description: FeedbackField successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/feedback-fields', authController.protect, interviewProcessController.addFeedbackField);
router.post('/feedback-fields', interviewProcessController.addFeedbackField);

/**
 * @swagger
 * /api/v1/interviews/feedback-fields/{id}:
 *   get:
 *     summary: Get a FeedbackField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackField
 *     responses:
 *       200:
 *         description: Successful response with the FeedbackField
 *       404:
 *         description: FeedbackField not found
 *       500:
 *         description: Internal server error
 */
//router.get('/feedback-fields/:id', authController.protect, interviewProcessController.getFeedbackField);
router.get('/feedback-fields/:id', interviewProcessController.getFeedbackField);

/**
 * @swagger
 * /api/v1/interviews/feedback-fields/{id}:
 *   put:
 *     summary: Update a FeedbackField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackField
 *     requestBody:
 *       description: New FeedbackField details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *               fieldType:
 *                 type: string
 *               subType:
 *                 type: string
 *               isRequired:
 *                 type: boolean
 *               company:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *             example:
 *               fieldName: "Updated Example Field"
 *               fieldType: "Text"
 *               subType: "Multi Line"
 *               isRequired: false
 *               company: "606a3f17a33e5d4c87a6ea2f"
 *               createdBy: "606a3f17a33e5d4c87a6ea4f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea5f"
 *     responses:
 *       200:
 *         description: Successful response with the updated FeedbackField
 *       404:
 *         description: FeedbackField not found
 *       500:
 *         description: Internal server error
 */
//router.put('/feedback-fields/:id', authController.protect, interviewProcessController.updateFeedbackField);
router.put('/feedback-fields/:id', interviewProcessController.updateFeedbackField);

/**
 * @swagger
 * /api/v1/interviews/feedback-fields/{id}:
 *   delete:
 *     summary: Delete a FeedbackField by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackField
 *     responses:
 *       204:
 *         description: FeedbackField successfully deleted
 *       404:
 *         description: FeedbackField not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/feedback-fields/:id', authController.protect, interviewProcessController.deleteFeedbackField);
router.delete('/feedback-fields/:id', interviewProcessController.deleteFeedbackField);

/**
 * @swagger
 * /api/v1/interviews/feedback-fields/company/{companyId}:
 *   get:
 *     summary: Get all FeedbackFields for a company
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with FeedbackFields
 *       404:
 *         description: No FeedbackFields found for the company
 *       500:
 *         description: Internal server error
 */
//router.get('/feedback-fields/company/:companyId', authController.protect, interviewProcessController.getAllFeedbackFieldsByCompany);
router.get('/feedback-fields/company/:companyId', interviewProcessController.getAllFeedbackFieldsByCompany);

/**
 * @swagger
 * tags:
 *   name: Interview Process
 *   description: API endpoints for managing FeedbackFieldValue
 */

/**
 * @swagger
 * /api/v1/interviews/feedback-field-values:
 *   post:
 *     summary: Add a new FeedbackFieldValue record
 *     tags: [Interview Process]
 *     requestBody:
 *       description: FeedbackFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedbackField:
 *                 type: string
 *                 required: true
 *               fieldValue:
 *                 type: string
 *                 required: true
 *               fieldType:
 *                 type: string
 *               company:
 *                 type: string
 *                 required: true
 *               createdBy:
 *                 type: string
 *                 required: true
 *               updatedBy:
 *                 type: string
 *                 required: true
 *             example:
 *               feedbackField: "606a3f17a33e5d4c87a6ea2f"
 *               fieldValue: "Example Value"
 *               fieldType: "Text"
 *               company: "606a3f17a33e5d4c87a6ea2f"
 *               createdBy: "606a3f17a33e5d4c87a6ea4f"
 *               updatedBy: "606a3f17a33e5d4c87a6ea5f"
 *     responses:
 *       201:
 *         description: FeedbackFieldValue successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
//router.post('/feedback-field-values', authController.protect, interviewProcessController.addFeedbackFieldValue);
router.post('/feedback-field-values', interviewProcessController.addFeedbackFieldValue);

/**
 * @swagger
 * /api/v1/interviews/feedback-field-values/{id}:
 *   get:
 *     summary: Get a FeedbackFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackFieldValue
 *     responses:
 *       200:
 *         description: Successful response with the FeedbackFieldValue
 *       404:
 *         description: FeedbackFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.get('/feedback-field-values/:id', authController.protect, interviewProcessController.getFeedbackFieldValue);
router.get('/feedback-field-values/:id', interviewProcessController.getFeedbackFieldValue);

/**
 * @swagger
 * /api/v1/interviews/feedback-field-values/{id}:
 *   put:
 *     summary: Update a FeedbackFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackFieldValue
 *     requestBody:
 *       description: New FeedbackFieldValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedbackField:
 *                 type: string
 *               fieldValue:
 *                 type: string
 *               fieldType:
 *                 type: string
 *               company:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *             example:
 *               feedbackField: "Updated Field ID"
 *               fieldValue: "Updated Example Value"
 *               fieldType: "Updated Text"
 *               company: "Updated Company ID"
 *               createdBy: "Updated User ID"
 *               updatedBy: "Updated User ID"
 *     responses:
 *       200:
 *         description: Successful response with the updated FeedbackFieldValue
 *       404:
 *         description: FeedbackFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.put('/feedback-field-values/:id', authController.protect, interviewProcessController.updateFeedbackFieldValue);
router.put('/feedback-field-values/:id', interviewProcessController.updateFeedbackFieldValue);

/**
 * @swagger
 * /api/v1/interviews/feedback-field-values/{id}:
 *   delete:
 *     summary: Delete a FeedbackFieldValue by ID
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the FeedbackFieldValue
 *     responses:
 *       204:
 *         description: FeedbackFieldValue successfully deleted
 *       404:
 *         description: FeedbackFieldValue not found
 *       500:
 *         description: Internal server error
 */
//router.delete('/feedback-field-values/:id', authController.protect, interviewProcessController.deleteFeedbackFieldValue);
router.delete('/feedback-field-values/:id', interviewProcessController.deleteFeedbackFieldValue);

/**
 * @swagger
 * /api/v1/interviews/feedback-field-values/company/{companyId}:
 *   get:
 *     summary: Get all FeedbackFieldValues for a company
 *     tags: [Interview Process]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Successful response with FeedbackFieldValues
 *       404:
 *         description: No FeedbackFieldValues found for the company
 *       500:
 *         description: Internal server error
 */
//router.get('/feedback-field-values/company/:companyId', authController.protect, interviewProcessController.getAllFeedbackFieldValuesByCompany);
router.get('/feedback-field-values/company/:companyId', interviewProcessController.getAllFeedbackFieldValuesByCompany);

module.exports = router;