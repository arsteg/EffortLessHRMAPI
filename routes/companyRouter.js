const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/company/holiday:
 *   post:
 *     summary: Add a Holiday
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       description: Holiday details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               isHolidayOccurEveryYearOnSameDay:
 *                 type: boolean
 *               isMandatoryForFlexiHoliday:
 *                 type: boolean
 *               holidaysAppliesFor:
 *                 type: string
 *               year:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       201:
 *         description: ShortLeave successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/holiday', authController.protect, companyController.createHoliday);

/**
 * @swagger
 * /api/v1/company/holiday/{id}:
 *   get:
 *     summary: Get a Holiday by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Holiday
 *     responses:
 *       200:
 *         description: Successful response with the Holiday
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Internal server error
 */
router.get('/holiday/:id', authController.protect, companyController.getHoliday);

/**
 * @swagger
 * /api/v1/company/holiday/{id}:
 *   put:
 *     summary: Update a Holiday by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ShortLeave
 *     requestBody:
 *       description: New ShortLeave details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               isHolidayOccurEveryYearOnSameDay:
 *                 type: boolean
 *               isMandatoryForFlexiHoliday:
 *                 type: boolean
 *               holidaysAppliesFor:
 *                 type: string
 *               year:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     user:
 *                       type: string
 *                       required: true 
 *     responses:
 *       200:
 *         description: Successful response with the updated Holiday
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Internal server error
 */
router.put('/holiday/:id', authController.protect, companyController.updateHoliday);

/**
 * 
 * @swagger
 * /api/v1/company/holiday/{id}:
 *   delete:
 *     summary: Delete a Holiday by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Holiday
 *     responses:
 *       204:
 *         description: Holiday successfully deleted
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Internal server error
 */
router.delete('/holiday/:id', authController.protect, companyController.deleteHoliday);

/**
 * @swagger
 * /api/v1/company/holiday-by-year:
 *   get:
 *     summary: Get a Holiday by Year
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year of the Holidays
 *     responses:
 *       200:
 *         description: Successful response with the Holiday
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Internal server error
 */
router.get('/holiday-by-year', authController.protect, companyController.getAllHolidaysByYear);
  
/**
 * @swagger
 * /api/v1/company/zones:
 *   post:
 *     summary: Add a new zone
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       description: Zone details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               zoneCode:
 *                 type: string
 *               zoneName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Zone successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/zones',authController.protect, companyController.createZone);

/**
 * @swagger
 * /api/v1/company/zones/{id}:
 *   get:
 *     summary: Get a zone by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the zone
 *     responses:
 *       200:
 *         description: Successful response with the zone
 *       404:
 *         description: Zone not found
 *       500:
 *         description: Internal server error
 */
router.get('/zones/:id',authController.protect, companyController.getZone);

/**
 * @swagger
 * /api/v1/company/zones/{id}:
 *   put:
 *     summary: Update a zone by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the zone
 *     requestBody:
 *       description: New zone details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               zoneCode:
 *                 type: string
 *               zoneName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated zone
 *       404:
 *         description: Zone not found
 *       500:
 *         description: Internal server error
 */
router.put('/zones/:id',authController.protect, companyController.updateZone);

/**
 * @swagger
 * /api/v1/company/zones:
 *   get:
 *     summary: Get all zones by companyId
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with zones
 *       500:
 *         description: Internal server error
 */
router.get('/zones',authController.protect, companyController.getZonesByCompanyId);

/**
 * @swagger
 * /api/v1/company/zones/{id}:
 *   delete:
 *     summary: Delete a zone by ID
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the zone
 *     responses:
 *       204:
 *         description: Zone successfully deleted
 *       404:
 *         description: Zone not found
 *       500:
 *         description: Internal server error
 */
router.delete('/zones/:id',authController.protect, companyController.deleteZone);

// Country Router
router.get('/companylist',authController.protect,companyController.getCompanyList);
//router.patch('/updateCompany',companyController.saveCoutry);

router
  .route('/:id')
  .get(authController.protect,companyController.getCompany)
  .patch(   
    companyController.updateCompany
  )
  .delete(
    companyController.deleteCompany
  );

module.exports = router;