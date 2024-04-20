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
 *         description: ID of the Holiday
 *     requestBody:
 *       description: New Holiday details
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


/**
 * @swagger
 * /api/v1/company/locations:
 *   post:
 *     summary: Add a new location
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
  *     requestBody:
 *       description: Location details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationCode:
 *                 type: string
 *                 description: The code of the location
 *                 required: true
 *               country:
 *                 type: string
 *                 description: The country of the location
 *                 required: true
 *               state:
 *                 type: string
 *                 description: The state of the location
 *                 required: true
 *               city:
 *                 type: string
 *                 description: The city of the location
 *                 required: true
 *               organization:
 *                 type: string
 *                 description: The organization of the location
 *                 required: true
 *               providentFundRegistrationCode:
 *                 type: string
 *                 description: The provident fund registration code of the location
 *               esicRegistrationCode:
 *                 type: string
 *                 description: The ESIC registration code of the location
 *               professionalTaxRegistrationCode:
 *                 type: string
 *                 description: The professional tax registration code of the location
 *               lwfRegistrationCode:
 *                 type: string
 *                 description: The LWF registration code of the location
 *               taxDeclarationApprovers:
 *                 type: array
 *                 description: The IDs of users who can approve tax declarations
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Location successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/locations', authController.protect, companyController.addLocation);

/**
 * @swagger
 * /api/v1/company/locations/{id}:
 *   get:
 *     summary: Get a location by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the location
 *     responses:
 *       200:
 *         description: Successful response with the location
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get('/locations/:id', authController.protect, companyController.getLocation);

/**
 * @swagger
 * /api/v1/company/locations/{id}:
 *   put:
 *     summary: Update a location by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the location
 *     requestBody:
 *       description: New location details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationCode:
 *                 type: string
 *                 description: The code of the location
 *                 required: true
 *               country:
 *                 type: string
 *                 description: The country of the location
 *                 required: true
 *               state:
 *                 type: string
 *                 description: The state of the location
 *                 required: true
 *               city:
 *                 type: string
 *                 description: The city of the location
 *                 required: true
 *               organization:
 *                 type: string
 *                 description: The organization of the location
 *                 required: true
 *               providentFundRegistrationCode:
 *                 type: string
 *                 description: The provident fund registration code of the location
 *               esicRegistrationCode:
 *                 type: string
 *                 description: The ESIC registration code of the location
 *               professionalTaxRegistrationCode:
 *                 type: string
 *                 description: The professional tax registration code of the location
 *               lwfRegistrationCode:
 *                 type: string
 *                 description: The LWF registration code of the location
 *               taxDeclarationApprovers:
 *                 type: array
 *                 description: The IDs of users who can approve tax declarations
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated location
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.put('/locations/:id', authController.protect, companyController.updateLocation);

/**
 * @swagger
 * /api/v1/company/locations-by-company:
 *   get:
 *     summary: Get all locations by companyId
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with locations
 *       500:
 *         description: Internal server error
 */
router.get('/locations-by-company', authController.protect, companyController.getAllLocationsByCompanyId);

/**
 * @swagger
 * /api/v1/company/locations/{id}:
 *   delete:
 *     summary: Delete a location by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the location
 *     responses:
 *       204:
 *         description: Location successfully deleted
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.delete('/locations/:id', authController.protect, companyController.deleteLocation);

/**
 * @swagger
 * /api/v1/company/departments:
 *   post:
 *     summary: Add a new department
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Department details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *               departmentCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/departments', authController.protect, companyController.createDepartment);

/**
 * @swagger
 * /api/v1/company/departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the department
 *     responses:
 *       200:
 *         description: Successful response with the department
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get('/departments/:id', authController.protect, companyController.getDepartment);

/**
 * @swagger
 * /api/v1/company/departments/{id}:
 *   put:
 *     summary: Update a department by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the department
 *     requestBody:
 *       description: New department details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *               departmentCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated department
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.put('/departments/:id', authController.protect, companyController.updateDepartment);

/**
 * @swagger
 * /api/v1/company/departments-by-company:
 *   get:
 *     summary: Get all departments
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with departments
 *       500:
 *         description: Internal server error
 */
router.get('/departments-by-company', authController.protect, companyController.getAllDepartmentsByCompanyId);

/**
 * @swagger
 * /api/v1/company/departments/{id}:
 *   delete:
 *     summary: Delete a department by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the department
 *     responses:
 *       204:
 *         description: Department successfully deleted
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.delete('/departments/:id', authController.protect, companyController.deleteDepartment);


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