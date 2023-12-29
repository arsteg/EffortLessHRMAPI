const express = require('express');
const pricingController = require('../controllers/pricingController');
const authController = require('../controllers/authController');
const router = express.Router();

 /**
 * @swagger
 * /api/v1/pricing/software:
 *   post:
 *     summary: Create a new software entry
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Software details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               accessLink:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Software entry successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/software', authController.protect, pricingController.createSoftware);

/**
 * @swagger
 * /api/v1/pricing/software/{id}:
 *   get:
 *     summary: Get an Software Details by ID
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Software Details
 *     responses:
 *       200:
 *         description: Successful response with the Software Details
 *       404:
 *         description: Software Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/software/:id', authController.protect, pricingController.getSoftware);

/**
 * @swagger
 * /api/v1/pricing/software/{id}:
 *   put:
 *     summary: Update an software by ID
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Software
 *     requestBody:
 *       description: New software details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               accessLink:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Successful response with the updated software
 *       404:
 *         description: Software not found
 *       500:
 *         description: Internal server error
 */
router.put('/software/:id', authController.protect, pricingController.updateSoftware);

/**
 * @swagger
 * /api/v1/pricing/software/{id}:
 *   delete:
 *     summary: Delete an Software Details by ID
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Software Details
 *     responses:
 *       204:
 *         description: Software Details successfully deleted
 *       404:
 *         description: Software Details not found
 *       500:
 *         description: Internal server error
 */
router.delete('/software/:id', authController.protect, pricingController.deleteSoftware);

/**
 * @swagger
 * /api/v1/pricing/software:
 *   get:
 *     summary: Get all software details
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with softwares
 *       500:
 *         description: Internal server error
 */
router.get('/software', authController.protect, pricingController.getAllSoftware);

 /**
 * @swagger
 * /api/v1/pricing/option:
 *   post:
 *     summary: Create a new option entry
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: option details
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
 *         description: Option entry successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
 router.post('/option', authController.protect, pricingController.createOption);

 /**
  * @swagger
  * /api/v1/pricing/option/{id}:
  *   get:
  *     summary: Get an Option Details by ID
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: ID of the Option Details
  *     responses:
  *       200:
  *         description: Successful response with the Option Details
  *       404:
  *         description: Option Details not found
  *       500:
  *         description: Internal server error
  */
 router.get('/option/:id', authController.protect, pricingController.getOption);
 
 /**
  * @swagger
  * /api/v1/pricing/option/{id}:
  *   put:
  *     summary: Update an option by ID
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: ID of the Option
  *     requestBody:
  *       description: New option details
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
  *       200:
  *         description: Successful response with the updated option
  *       404:
  *         description: Software not found
  *       500:
  *         description: Internal server error
  */
 router.put('/option/:id', authController.protect, pricingController.updateOption);
 
 /**
  * @swagger
  * /api/v1/pricing/option/{id}:
  *   delete:
  *     summary: Delete an Option Details by ID
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: ID of the Option Details
  *     responses:
  *       204:
  *         description: Option Details successfully deleted
  *       404:
  *         description: Option Details not found
  *       500:
  *         description: Internal server error
  */
 router.delete('/option/:id', authController.protect, pricingController.deleteOption);
 
 /**
  * @swagger
  * /api/v1/pricing/option:
  *   get:
  *     summary: Get all option details
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     responses:
  *       200:
  *         description: Successful response with option
  *       500:
  *         description: Internal server error
  */
 router.get('/option', authController.protect, pricingController.getAllOption);
 
module.exports = router;