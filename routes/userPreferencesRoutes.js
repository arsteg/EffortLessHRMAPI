const express = require('express');
const userPreferencesController = require('./../controllers/userPreferencesController');
const authController = require('../controllers/authController');
const router = express.Router();
module.exports = router;

// User Preferences routes
/**
 * @swagger
 * /api/v1/userPreferences/preference-categories: 
 *   post:
 *     summary: Create a new preference category
 *     tags: [User Preferences Management]
 *     requestBody:
 *       description: Preference category details
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
 *     responses:
 *       201:
 *         description: Preference category successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/preference-categories',   userPreferencesController.createPreferenceCategory);
/**
 * @swagger
 * /api/v1/userPreferences/preference-categories/{id}:
 *   get:
 *     summary: Get a preference category by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference category
 *     responses:
 *       200:
 *         description: Successful response with the preference category
 *       404:
 *         description: Preference category not found
 *       500:
 *         description: Internal server error
 */
router.get('/preference-categories/:id',  authController.protect,  userPreferencesController.getPreferenceCategory);
/**
 * @swagger
 * /api/v1/userPreferences/preference-categories/{id}:
 *   put:
 *     summary: Update a preference category by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference category
 *     requestBody:
 *       description: New preference category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated preference category
 *       404:
 *         description: Preference category not found
 *       500:
 *         description: Internal server error
 */
router.put('/preference-categories/:id', authController.protect,   userPreferencesController.updatePreferenceCategory);

/**
 * @swagger
 * /api/v1/userPreferences/preference-categories/{id}:
 *   delete:
 *     summary: Delete a preference category by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference category
 *     responses:
 *       204:
 *         description: Preference category successfully deleted
 *       404:
 *         description: Preference category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/preference-categories/:id',  authController.protect,  userPreferencesController.deletePreferenceCategory);
/**
 * @swagger
 * /api/v1/userPreferences/preference-categories:
 *   get:
 *     summary: Get all preference categories
 *     tags: [User Preferences Management]
 *     responses:
 *       200:
 *         description: Successful response with preference categories
 *       500:
 *         description: Internal server error
 */
router.get('/preference-categories', userPreferencesController.getAllPreferenceCategories);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptions:
 *   post:
 *     summary: Add a new preference option
 *     tags: [User Preferences Management]
 *     requestBody:
 *       description: Preference option details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 required: true
 *               name:
 *                 type: string
 *                 required: true 
 *               description:
 *                 type: string
 *                 required: true
 *               dataType:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Preference option successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/preferenceOptions',  userPreferencesController.createPreferenceOption);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptions/{id}:
 *   get:
 *     summary: Get a preference option by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference option
 *     responses:
 *       200:
 *         description: Successful response with the preference option
 *       404:
 *         description: Preference option not found
 *       500:
 *         description: Internal server error
 */
router.get('/preferenceOptions/:id', authController.protect,  userPreferencesController.getPreferenceOption);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptionsByCategory/{categoryId}:
 *   get:
 *     summary: Get preference options by Group Id
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference option
 *     responses:
 *       200:
 *         description: Successful response with the preference option
 *       404:
 *         description: Preference option not found
 *       500:
 *         description: Internal server error
 */
router.get('/preferenceOptionsByCategory/:categoryId',  userPreferencesController.getPreferenceOptionByCategory);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptions/{id}:
 *   put:
 *     summary: Update a preference option by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference option
 *     requestBody:
 *       description: New preference option details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               dataType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated preference option
 *       404:
 *         description: Preference option not found
 *       500:
 *         description: Internal server error
 */
router.put('/preferenceOptions/:id',  userPreferencesController.updatePreferenceOption);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptions/{id}:
 *   delete:
 *     summary: Delete a preference option by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the preference option
 *     responses:
 *       204:
 *         description: Preference option successfully deleted
 *       404:
 *         description: Preference option not found
 *       500:
 *         description: Internal server error
 */
router.delete('/preferenceOptions/:id', authController.protect,  userPreferencesController.deletePreferenceOption);

/**
 * @swagger
 * /api/v1/userPreferences/preferenceOptions:
 *   get:
 *     summary: Get all preference options
 *     tags: [User Preferences Management]
 *     responses:
 *       200:
 *         description: Successful response with preference options
 *       500:
 *         description: Internal server error
 */
router.get('/preferenceOptions', authController.protect, userPreferencesController.getAllPreferenceOptions);

/**
 * @swagger
 * /api/v1/userPreferences:
 *   post:
 *     summary: Add a new user preference
 *     tags: [User Preferences Management]
 *     requestBody:
 *       description: User preference details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 required: true
 *               user:
 *                 type: string
 *                 required: true
 *               preference:
 *                 type: string
 *                 required: true
 *               preferenceValue:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: User preference successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/userPreferences', authController.protect,  userPreferencesController.createUserPreference);
/**
 * @swagger
 * /api/v1/userPreferences/{id}:
 *   get:
 *     summary: Get a user preference by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user preference
 *     responses:
 *       200:
 *         description: Successful response with the user preference
 *       404:
 *         description: User preference not found
 *       500:
 *         description: Internal server error
 */
router.get('/userPreferences/:id',  userPreferencesController.getUserPreference);

/**
 * @swagger
 * /api/v1/userPreferences/{id}:
 *   put:
 *     summary: Update a user preference by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user preference
 *     requestBody:
 *       description: New user preference details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               user:
 *                 type: string
 *               preference:
 *                 type: string
 *               preferenceValue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated user preference
 *       404:
 *         description: User preference not found
 *       500:
 *         description: Internal server error
 */
router.put('/userPreferences/:id', authController.protect,  userPreferencesController.updateUserPreference);

/**
 * @swagger
 * /api/v1/userPreferences/{id}:
 *   delete:
 *     summary: Delete a user preference by ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user preference
 *     responses:
 *       204:
 *         description: User preference successfully deleted
 *       404:
 *         description: User preference not found
 *       500:
 *         description: Internal server error
 */
router.delete('/userPreferences/:id', authController.protect, userPreferencesController.deleteUserPreference);

/**
 * @swagger
 * /api/v1/userPreferences:
 *   get:
 *     summary: Get all user preferences
 *     tags: [User Preferences Management]
 *     responses:
 *       200:
 *         description: Successful response with user preferences
 *       500:
 *         description: Internal server error
 */
router.get('/userPreferences', authController.protect, userPreferencesController.getAllUserPreferences);


