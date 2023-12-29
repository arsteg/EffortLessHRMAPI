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
 
 /**
 * @swagger
 * /api/v1/pricing/plan:
 *   post:
 *     summary: Create a new plan entry
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: plan details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               software:
 *                 type: string
 *                 required: true
 *               currentprice:
 *                 type: number
 *                 required: true
 *               IsActive:
 *                 type: boolean
 *                 required: true
 *     responses:
 *       201:
 *         description: Plan entry successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
 router.post('/plan', authController.protect, pricingController.createPlan);

 /**
  * @swagger
  * /api/v1/pricing/plan/{id}:
  *   get:
  *     summary: Get an Plan Details by ID
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
  *         description: Successful response with the Plan Details
  *       404:
  *         description: Plan Details not found
  *       500:
  *         description: Internal server error
  */
 router.get('/plan/:id', authController.protect, pricingController.getPlan);
 
 /**
  * @swagger
  * /api/v1/pricing/plan/{id}:
  *   put:
  *     summary: Update an plan by ID
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
  *         description: ID of the Plan
  *     requestBody:
  *       description: New plan details
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               name:
  *                 type: string
  *                 required: true
  *               software:
  *                 type: string
  *                 required: true
  *               currentprice:
  *                 type: number
  *                 required: true
  *               IsActive:
  *                 type: boolean
  *                 required: true
  *     responses:
  *       200:
  *         description: Successful response with the updated plan
  *       404:
  *         description: plan not found
  *       500:
  *         description: Internal server error
  */
 router.put('/plan/:id', authController.protect, pricingController.updatePlan);
 
 /**
  * @swagger
  * /api/v1/pricing/plan/{id}:
  *   delete:
  *     summary: Delete an Plan Details by ID
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
  *         description: ID of the Plan Details
  *     responses:
  *       204:
  *         description: Plan Details successfully deleted
  *       404:
  *         description: Plan Details not found
  *       500:
  *         description: Internal server error
  */
 router.delete('/plan/:id', authController.protect, pricingController.deletePlan);
 
 /**
  * @swagger
  * /api/v1/pricing/plan:
  *   get:
  *     summary: Get all plan details
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     responses:
  *       200:
  *         description: Successful response with plan
  *       500:
  *         description: Internal server error
  */
 router.get('/plan', authController.protect, pricingController.getAllPlan);
 
 /**
 * @swagger
 * /api/v1/pricing/option-included:
 *   post:
 *     summary: Add an option to a plan
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Option inclusion details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               option:
 *                 type: string
 *                 description: ID of the option
 *                 required: true
 *               dateAdded:
 *                 type: string
 *                 format: date
 *                 description: Date when the option was added
 *                 required: true
 *               dateRemoved:
 *                 type: string
 *                 format: date
 *                 description: Date when the option was removed
 *                 required: true
 *     responses:
 *       201:
 *         description: Option successfully added to the plan
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/option-included', authController.protect, pricingController.addOptionInclusionDetails);

/**
 * @swagger
 * /api/v1/pricing/option-included/{id}:
 *   delete:
 *     summary: Remove an option from a plan
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
 *         description: ID of the Option Inclusion Details
 *     responses:
 *       204:
 *         description: Option successfully removed from the plan
 *       404:
 *         description: Option Inclusion Details not found
 *       500:
 *         description: Internal server error
 */
router.delete('/option-included/:id', authController.protect, pricingController.removeOptionInclusionDetails);

/**
 * @swagger
 * /api/v1/pricing/option-included/{id}:
 *   get:
 *     summary: Get Option Inclusion Details by ID
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
 *         description: ID of the Option Inclusion Details
 *     responses:
 *       200:
 *         description: Successful response with the Option Inclusion Details
 *       404:
 *         description: Option Inclusion Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/option-included/:id', authController.protect, pricingController.getOptionInclusionDetails);

/**
 * @swagger
 * /api/v1/pricing/option-included/{id}:
 *   put:
 *     summary: Update option inclusion details by ID
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
 *         description: ID of the Option Inclusion Details
 *     requestBody:
 *       description: New option inclusion details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               option:
 *                 type: string
 *               dateAdded:
 *                 type: string
 *                 format: date
 *               dateRemoved:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Successful response with the updated Option Inclusion Details
 *       404:
 *         description: Option Inclusion Details not found
 *       500:
 *         description: Internal server error
 */
router.put('/option-included/:id', authController.protect, pricingController.updateOptionInclusionDetails);

/**
 * @swagger
 * /api/v1/pricing/option-included:
 *   get:
 *     summary: Get all option inclusion details
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with all option inclusion details
 *       500:
 *         description: Internal server error
 */
router.get('/option-included', authController.protect, pricingController.getAllOptionInclusionDetails);

 /**
 * @swagger
 * /api/v1/pricing/offer:
 *   post:
 *     summary: Add an offer
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Offer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               description:
 *                 type: string
 *                 description: ID of the option
 *                 required: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the option was added
 *                 required: true
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the option was removed
 *                 required: true
 *               discountPercentage:
 *                 type: number
 *                 description: ID of the option
 *                 required: true
 *               discountAmount:
 *                 type: number
 *                 description: ID of the option
 *                 required: true
 *     responses:
 *       201:
 *         description: Offer successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
 router.post('/offer', authController.protect, pricingController.addOffer);

 /**
  * @swagger
  * /api/v1/pricing/offer/{id}:
  *   delete:
  *     summary: Remove an Offer
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
  *         description: ID of the Offer Details
  *     responses:
  *       204:
  *         description: Offer successfully removed
  *       404:
  *         description: Offer Inclusion Details not found
  *       500:
  *         description: Internal server error
  */
 router.delete('/offer/:id', authController.protect, pricingController.removeOffer);
 
 /**
  * @swagger
  * /api/v1/pricing/Offer/{id}:
  *   get:
  *     summary: Get Offer Inclusion Details by ID
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
  *         description: ID of the Offer Inclusion Details
  *     responses:
  *       200:
  *         description: Successful response with the Offer Inclusion Details
  *       404:
  *         description: Offer Inclusion Details not found
  *       500:
  *         description: Internal server error
  */
 router.get('/offer/:id', authController.protect, pricingController.getOfferDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/offer/{id}:
  *   put:
  *     summary: Update offer inclusion details by ID
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
  *         description: ID of the Offer Inclusion Details
  *     requestBody:
  *       description: New offer inclusion details
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               name:
  *                 type: string
  *                 description: ID of the plan
  *                 required: true
  *               description:
  *                 type: string
  *                 description: ID of the option
  *                 required: true
  *               startDate:
  *                 type: string
  *                 format: date
  *                 description: Date when the option was added
  *                 required: true
  *               endDate:
  *                 type: string
  *                 format: date
  *                 description: Date when the option was removed
  *                 required: true
  *               discountPercentage:
  *                 type: number
  *                 description: ID of the option
  *                 required: true
  *               discountAmount:
  *                 type: number
  *                 description: ID of the option
  *                 required: true
  *     responses:
  *       200:
  *         description: Successful response with the updated Offer Inclusion Details
  *       404:
  *         description: Offer Inclusion Details not found
  *       500:
  *         description: Internal server error
  */
 router.put('/offer/:id', authController.protect, pricingController.updateOfferDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/offer:
  *   get:
  *     summary: Get all offer inclusion details
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     responses:
  *       200:
  *         description: Successful response with all offer inclusion details
  *       500:
  *         description: Internal server error
  */
 router.get('/offer', authController.protect, pricingController.getAllOfferDetails);

 /**
 * @swagger
 * /api/v1/pricing/include:
 *   post:
 *     summary: Add a plan to an offer
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Include details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               offer:
 *                 type: string
 *                 description: ID of the offer
 *                 required: true
 *     responses:
 *       201:
 *         description: Plan successfully added to the offer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/include', authController.protect, pricingController.addIncludeDetails);

/**
 * @swagger
 * /api/v1/pricing/include/{id}:
 *   delete:
 *     summary: Remove a plan from an offer
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
 *         description: ID of the Include Details
 *     responses:
 *       204:
 *         description: Plan successfully removed from the offer
 *       404:
 *         description: Include Details not found
 *       500:
 *         description: Internal server error
 */
router.delete('/include/:id', authController.protect, pricingController.removeIncludeDetails);

/**
 * @swagger
 * /api/v1/pricing/include/{id}:
 *   get:
 *     summary: Get Include Details by ID
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
 *         description: ID of the Include Details
 *     responses:
 *       200:
 *         description: Successful response with the Include Details
 *       404:
 *         description: Include Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/include/:id', authController.protect, pricingController.getIncludeDetails);

/**
 * @swagger
 * /api/v1/pricing/include/{id}:
 *   put:
 *     summary: Update include details by ID
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
 *         description: ID of the Include Details
 *     requestBody:
 *       description: New include details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               offer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Include Details
 *       404:
 *         description: Include Details not found
 *       500:
 *         description: Internal server error
 */
router.put('/include/:id', authController.protect, pricingController.updateIncludeDetails);

/**
 * @swagger
 * /api/v1/pricing/include:
 *   get:
 *     summary: Get all include details
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with all include details
 *       500:
 *         description: Internal server error
 */
router.get('/include', authController.protect, pricingController.getAllIncludeDetails);

/**
 * @swagger
 * /api/v1/pricing/user-group-type:
 *   post:
 *     summary: Add a user group type
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: User group type details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *                 description: Name of the user group type
 *                 required: true
 *               membersMin:
 *                 type: number
 *                 description: Minimum number of members for the user group type
 *                 required: true
 *               membersMax:
 *                 type: number
 *                 description: Maximum number of members for the user group type
 *                 required: true
 *     responses:
 *       201:
 *         description: User group type successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/user-group-type', authController.protect, pricingController.addUserGroupType);

/**
 * @swagger
 * /api/v1/pricing/user-group-type/{id}:
 *   delete:
 *     summary: Remove a user group type
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
 *         description: ID of the User Group Type
 *     responses:
 *       204:
 *         description: User group type successfully removed
 *       404:
 *         description: User Group Type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/user-group-type/:id', authController.protect, pricingController.removeUserGroupType);

/**
 * @swagger
 * /api/v1/pricing/user-group-type/{id}:
 *   get:
 *     summary: Get User Group Type by ID
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
 *         description: ID of the User Group Type
 *     responses:
 *       200:
 *         description: Successful response with the User Group Type
 *       404:
 *         description: User Group Type not found
 *       500:
 *         description: Internal server error
 */
router.get('/user-group-type/:id', authController.protect, pricingController.getUserGroupType);

/**
 * @swagger
 * /api/v1/pricing/user-group-type/{id}:
 *   put:
 *     summary: Update user group type by ID
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
 *         description: ID of the User Group Type
 *     requestBody:
 *       description: New user group type details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *               membersMin:
 *                 type: number
 *               membersMax:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful response with the updated User Group Type
 *       404:
 *         description: User Group Type not found
 *       500:
 *         description: Internal server error
 */
router.put('/user-group-type/:id', authController.protect, pricingController.updateUserGroupType);

/**
 * @swagger
 * /api/v1/pricing/user-group-type:
 *   get:
 *     summary: Get all user group types
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with all user group types
 *       500:
 *         description: Internal server error
 */
router.get('/user-group-type', authController.protect, pricingController.getAllUserGroupTypes);


 /**
 * @swagger
 * /api/v1/pricing/prerequisites:
 *   post:
 *     summary: Add a Prerequisites 
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Prerequisites details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               offer:
 *                 type: string
 *                 description: ID of the offer
 *                 required: true
 *     responses:
 *       201:
 *         description: Prerequisites successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
 router.post('/prerequisites', authController.protect, pricingController.addPrerequisites);

 /**
  * @swagger
  * /api/v1/pricing/prerequisites/{id}:
  *   delete:
  *     summary: Remove a Prerequisites
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
  *         description: ID of the Prerequisites Details
  *     responses:
  *       204:
  *         description: Plan successfully removed from the offer
  *       404:
  *         description: Prerequisites Details not found
  *       500:
  *         description: Internal server error
  */
 router.delete('/prerequisites/:id', authController.protect, pricingController.removePrerequisites);
 
 /**
  * @swagger
  * /api/v1/pricing/prerequisites/{id}:
  *   get:
  *     summary: Get Prerequisites Details by ID
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
  *         description: ID of the Prerequisites Details
  *     responses:
  *       200:
  *         description: Successful response with the Prerequisites Details
  *       404:
  *         description: Prerequisites Details not found
  *       500:
  *         description: Internal server error
  */
 router.get('/prerequisites/:id', authController.protect, pricingController.getPrerequisitesDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/prerequisites/{id}:
  *   put:
  *     summary: Update prerequisites details by ID
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
  *         description: ID of the Prerequisites Details
  *     requestBody:
  *       description: New Prerequisites details
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               plan:
  *                 type: string
  *               offer:
  *                 type: string
  *     responses:
  *       200:
  *         description: Successful response with the updated Prerequisites Details
  *       404:
  *         description: Prerequisites Details not found
  *       500:
  *         description: Internal server error
  */
 router.put('/prerequisites/:id', authController.protect, pricingController.updatePrerequisitesDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/prerequisites:
  *   get:
  *     summary: Get all prerequisites details
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     responses:
  *       200:
  *         description: Successful response with all Prerequisites details
  *       500:
  *         description: Internal server error
  */
 router.get('/prerequisites', authController.protect, pricingController.getAllPrerequisitesDetails);

 
 /**
 * @swagger
 * /api/v1/pricing/company-plan:
 *   post:
 *     summary: Add a CompanyPlan 
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: CompanyPlan details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               company:
 *                 type: string
 *                 description: ID of the company
 *                 required: true
 *     responses:
 *       201:
 *         description: CompanyPlan successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
 router.post('/company-plan', authController.protect, pricingController.addCompanyPlan);

 /**
  * @swagger
  * /api/v1/pricing/company-plan/{id}:
  *   delete:
  *     summary: Remove a CompanyPlan
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
  *         description: ID of the CompanyPlan Details
  *     responses:
  *       204:
  *         description: Plan successfully removed from the offer
  *       404:
  *         description: CompanyPlan Details not found
  *       500:
  *         description: Internal server error
  */
 router.delete('/company-plan/:id', authController.protect, pricingController.removeCompanyPlan);
 
 /**
  * @swagger
  * /api/v1/pricing/company-plan/{id}:
  *   get:
  *     summary: Get CompanyPlan Details by ID
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
  *         description: ID of the CompanyPlan Details
  *     responses:
  *       200:
  *         description: Successful response with the CompanyPlan Details
  *       404:
  *         description: CompanyPlan Details not found
  *       500:
  *         description: Internal server error
  */
 router.get('/company-plan/:id', authController.protect, pricingController.getCompanyPlanDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/company-plan/{id}:
  *   put:
  *     summary: Update CompanyPlan details by ID
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
  *         description: ID of the CompanyPlan Details
  *     requestBody:
  *       description: New CompanyPlan details
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               plan:
  *                 type: string
  *               copany:
  *                 type: string
  *     responses:
  *       200:
  *         description: Successful response with the updated CompanyPlan Details
  *       404:
  *         description: CompanyPlan Details not found
  *       500:
  *         description: Internal server error
  */
 router.put('/company-plan/:id', authController.protect, pricingController.updateCompanyPlanDetails);
 
 /**
  * @swagger
  * /api/v1/pricing/company-plan:
  *   get:
  *     summary: Get all CompanyPlan details
  *     tags: [Pricing Management]
  *     security: [{
  *         bearerAuth: []
  *     }]
  *     responses:
  *       200:
  *         description: Successful response with all CompanyPlan details
  *       500:
  *         description: Internal server error
  */
 router.get('/company-plan', authController.protect, pricingController.getAllCompanyPlan);

 
 /**
 * @swagger
 * /api/v1/pricing/plan-offer:
 *   post:
 *     summary: Add a plan to an offer
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *       description: Plan Offer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 description: ID of the plan
 *                 required: true
 *               offer:
 *                 type: string
 *                 description: ID of the offer
 *                 required: true
 *     responses:
 *       201:
 *         description: Plan successfully added to the offer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/plan-offer', authController.protect, pricingController.addPlanToOffer);

/**
 * @swagger
 * /api/v1/pricing/plan-offer/{id}:
 *   delete:
 *     summary: Remove a plan from an offer
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
 *         description: ID of the Plan Offer Details
 *     responses:
 *       204:
 *         description: Plan successfully removed from the offer
 *       404:
 *         description: Plan Offer Details not found
 *       500:
 *         description: Internal server error
 */
router.delete('/plan-offer/:id', authController.protect, pricingController.removePanFromOffer);

/**
 * @swagger
 * /api/v1/pricing/include/{id}:
 *   get:
 *     summary: Get Include Details by ID
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
 *         description: ID of the Plan Offer Details
 *     responses:
 *       200:
 *         description: Successful response with the Plan Offer Details
 *       404:
 *         description: Plan Offer Details not found
 *       500:
 *         description: Internal server error
 */
router.get('/plan-offer/:id', authController.protect, pricingController.getPlanOfferDetails);

/**
 * @swagger
 * /api/v1/pricing/plan-offer/{id}:
 *   put:
 *     summary: Update plan offer details by ID
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
 *         description: ID of the Plan Offer Details
 *     requestBody:
 *       description: New plan offer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               offer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated Plan Offer Details
 *       404:
 *         description: Plan Offer Details not found
 *       500:
 *         description: Internal server error
 */
router.put('/plan-offer/:id', authController.protect, pricingController.updatePlanOfferDetails);

/**
 * @swagger
 * /api/v1/pricing/plan-offer:
 *   get:
 *     summary: Get all plan offer details
 *     tags: [Pricing Management]
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     responses:
 *       200:
 *         description: Successful response with all plan offer details
 *       500:
 *         description: Internal server error
 */
router.get('/plan-offer', authController.protect, pricingController.getAllPlanOfferDetails);


module.exports = router;