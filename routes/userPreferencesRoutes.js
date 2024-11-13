const express = require('express');
const userPreferencesController = require('./../controllers/userPreferencesController');
const authController = require('../controllers/authController');
const router = express.Router();
module.exports = router;

// User Preferences routes
/**
 * @swagger
 * /api/v1/userPreferences/preference-categories/{id}:
 *   get:
 *     summary: Get a preference category by Name
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: name
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
router.get('/preference-categories/:name',  authController.protect,  userPreferencesController.getPreferenceCategory);


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
 * /api/v1/userPreferences/preferences/{id}:
 *   post:
 *     summary: Add a new user preference
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema:
 *           type: string
 *         description: ID of the user preference
 *     requestBody:
 *       description: User preference details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: 
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
router.post('/preferences/:id',  userPreferencesController.createUserPreference);
/**
 * @swagger
 * /api/v1/userPreferences/preferences/{categoryId}:
 *   get:
 *     summary: Get a user preference by ID
 *     tags: [User Preferences Management]
 *     parameters: 
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: category Id of the user preference
 *     responses:
 *       200:
 *         description: Successful response with the user preference
 *       404:
 *         description: User preference not found
 *       500:
 *         description: Internal server error
 */
router.get('/preferences/:categoryId',  userPreferencesController.getUserPreference);

/**
 * @swagger
 * /api/v1/userPreferences/getUserPreferenceByKey/{key}:
 *   get:
 *     summary: Get a user preference by key
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key ID of the user preference
 *     responses:
 *       200:
 *         description: Successful response with the user preference
 *       404:
 *         description: User preference not found
 *       500:
 *         description: Internal server error
 */
router.get('/getUserPreferenceByKey/:key', userPreferencesController.getUserPreferenceByKey);


/**
 * @swagger
 * /api/v1/userPreferences/preferences/{id}:
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
router.put('/preferences/:id', authController.protect,  userPreferencesController.updateUserPreference);

/**
 * @swagger
 * /api/v1/userPreferences/preferences/{id}:
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
router.delete('/preferences/:id', userPreferencesController.deleteUserPreference);


