const express = require('express');
const userPreferencesController = require('./../controllers/userPreferencesController');
const authController = require('../controllers/authController');
const router = express.Router();
module.exports = router;

/**
 * @swagger
 * /api/v1/userpreferences/structure:
 *   get:
 *     summary: Get all user preferences
 *     tags: [User Preferences Management]
 *     responses:
 *       200:
 *         description: Successful response with all user preferences
 *       500:
 *         description: Internal server error
 */
router.get('/structure', userPreferencesController.GetAllUserPreferences);

/**
 * @swagger
 * /api/v1/userPreferences/create:
 *   post:
 *     summary: Create or update a user preference
 *     tags: [User Preferences Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - preferenceKey
 *               - preferenceValue
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *               preferenceKey:
 *                 type: string
 *                 description: Key of the preference
 *               preferenceValue:
 *                 type: string
 *                 description: Value of the preference
 *     responses:
 *       201:
 *         description: Preference created or updated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/create', authController.protect, userPreferencesController.createOrUpdatePreference);

/**
 * @swagger
 * /api/v1/userPreferences/preference-key/{preferenceKey}:
 *   get:
 *     summary: Get preferences by preference key
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: preferenceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Preference key
 *     responses:
 *       200:
 *         description: Successful response with preferences
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */
router.get('/preference-key/:preferenceKey', authController.protect, userPreferencesController.getPreferenceByKey);

/**
 * @swagger
 * /api/v1/userPreferences/user/{userId}:
 *   get:
 *     summary: Get preferences by user ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response with user preferences
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId', authController.protect, userPreferencesController.getPreferencesByUserId);

/**
 * @swagger
 * /api/v1/userPreferences/user/{userId}:
 *   delete:
 *     summary: Delete preferences by user ID
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Preferences deleted successfully
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */
router.delete('/user/:userId', authController.protect, userPreferencesController.deletePreferencesByUserId);

/**
 * @swagger
 * /api/v1/userPreferences/preference-key/{preferenceKey}:
 *   delete:
 *     summary: Delete preferences by preference key
 *     tags: [User Preferences Management]
 *     parameters:
 *       - in: path
 *         name: preferenceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Preference key
 *     responses:
 *       200:
 *         description: Preferences deleted successfully
 *       404:
 *         description: Preferences not found
 *       500:
 *         description: Internal server error
 */
router.delete('/preference-key/:preferenceKey', authController.protect, userPreferencesController.deletePreferencesByKey);
