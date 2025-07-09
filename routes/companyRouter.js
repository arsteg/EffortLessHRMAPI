const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');

const router = express.Router();
/**
 * @swagger
 * /api/v1/company/All:
 *   get:
 *     summary: Get all companies
 *     tags: [Company Management]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the list of companies
 *       404:
 *         description: Companies not found
 *       500:
 *         description: Internal server error
 */
router.get('/All', authController.protect, companyController.getAllCompanies);
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
 *   post:
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
 *     requestBody:
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         skip:
 *                             type: string
 *                         next:
 *                             type: string
 *                         status:
 *                             type: string
 *                         year:
 *                             type: array
 *                             items:
 *                                 type: string
 *                                 example: "" 
 *     responses:
 *       200:
 *         description: Successful response with the Holiday
 *       404:
 *         description: Holiday not found
 *       500:
 *         description: Internal server error
 */
router.post('/holiday-by-year', authController.protect, companyController.getAllHolidaysByYear);
  
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

/**
 * @swagger
 * /api/v1/company/subDepartments:
 *   post:
 *     summary: Add a new SubDepartment
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: SubDepartment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subDepartmentName:
 *                 type: string
 *                 required: true
 *               subDepartmentCode:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: SubDepartment successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/subDepartments', authController.protect, companyController.createSubDepartment);

/**
 * @swagger
 * /api/v1/company/subDepartments/{id}:
 *   get:
 *     summary: Get a SubDepartment by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SubDepartment
 *     responses:
 *       200:
 *         description: Successful response with the SubDepartment
 *       404:
 *         description: SubDepartment not found
 *       500:
 *         description: Internal server error
 */
router.get('/subDepartments/:id', authController.protect, companyController.getSubDepartment);

/**
 * @swagger
 * /api/v1/company/subDepartments/{id}:
 *   put:
 *     summary: Update a SubDepartment by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SubDepartment
 *     requestBody:
 *       description: New SubDepartment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subDepartmentName:
 *                 type: string
 *               subDepartmentCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated SubDepartment
 *       404:
 *         description: SubDepartment not found
 *       500:
 *         description: Internal server error
 */
router.put('/subDepartments/:id', authController.protect, companyController.updateSubDepartment);

/**
 * @swagger
 * /api/v1/company/subDepartments:
 *   get:
 *     summary: Get all SubDepartments by companyId
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with SubDepartments
 *       500:
 *         description: Internal server error
 */
router.get('/subDepartments', authController.protect, companyController.getAllSubDepartmentsByCompanyId);

/**
 * @swagger
 * /api/v1/company/subDepartments/{id}:
 *   delete:
 *     summary: Delete a SubDepartment by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SubDepartment
 *     responses:
 *       204:
 *         description: SubDepartment successfully deleted
 *       404:
 *         description: SubDepartment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/subDepartments/:id', authController.protect, companyController.deleteSubDepartment);

/**
 * @swagger
 * /api/v1/company/designations:
 *   post:
 *     summary: Add a new designation
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Designation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Designation successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/designations',authController.protect, companyController.createDesignation);

/**
 * @swagger
 * /api/v1/company/designations/{id}:
 *   get:
 *     summary: Get a designation by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the designation
 *     responses:
 *       200:
 *         description: Successful response with the designation
 *       404:
 *         description: Designation not found
 *       500:
 *         description: Internal server error
 */
router.get('/designations/:id',authController.protect, companyController.getDesignation);

/**
 * @swagger
 * /api/v1/company/designations/{id}:
 *   put:
 *     summary: Update a designation by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the designation
 *     requestBody:
 *       description: New designation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated designation
 *       404:
 *         description: Designation not found
 *       500:
 *         description: Internal server error
 */
router.put('/designations/:id',authController.protect, companyController.updateDesignation);

/**
 * @swagger
 * /api/v1/company/designations-by-company:
 *   get:
 *     summary: Get all designations by company ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with designations
 *       500:
 *         description: Internal server error
 */
router.get('/designations-by-company',authController.protect, companyController.getAllDesignationsByCompany);

/**
 * @swagger
 * /api/v1/company/designations/{id}:
 *   delete:
 *     summary: Delete a designation by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the designation
 *     responses:
 *       204:
 *         description: Designation successfully deleted
 *       404:
 *         description: Designation not found
 *       500:
 *         description: Internal server error
 */
router.delete('/designations/:id',authController.protect, companyController.deleteDesignation);

/**
 * @swagger
 * /api/v1/company/bands:
 *   post:
 *     summary: Add a new band
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Band details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               band:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Band successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/bands',authController.protect, companyController.createBand);

/**
 * @swagger
 * /api/v1/company/bands/{id}:
 *   get:
 *     summary: Get a band by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *     responses:
 *       200:
 *         description: Successful response with the band
 *       404:
 *         description: Band not found
 *       500:
 *         description: Internal server error
 */
router.get('/bands/:id',authController.protect, companyController.getBand);

/**
 * @swagger
 * /api/v1/company/bands/{id}:
 *   put:
 *     summary: Update a band by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *     requestBody:
 *       description: New band details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               band:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated band
 *       404:
 *         description: Band not found
 *       500:
 *         description: Internal server error
 */
router.put('/bands/:id',authController.protect, companyController.updateBand);

/**
 * @swagger
 * /api/v1/company/bands-by-company:
 *   get:
 *     summary: Get all bands by companyId
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with bands
 *       500:
 *         description: Internal server error
 */
router.get('/bands-by-company',authController.protect, companyController.getAllBandsByCompanyId);

/**
 * @swagger
 * /api/v1/company/bands/{id}:
 *   delete:
 *     summary: Delete a band by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the band
 *     responses:
 *       204:
 *         description: Band successfully deleted
 *       404:
 *         description: Band not found
 *       500:
 *         description: Internal server error
 */
router.delete('/bands/:id',authController.protect, companyController.deleteBand);

/**
 * @swagger
 * /api/v1/company/signatories:
 *   post:
 *     summary: Add a new signatory
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Signatory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               designation:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Signatory successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/signatories', authController.protect, companyController.createSignatory);

/**
 * @swagger
 * /api/v1/company/signatories/{id}:
 *   get:
 *     summary: Get a signatory by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the signatory
 *     responses:
 *       200:
 *         description: Successful response with the signatory
 *       404:
 *         description: Signatory not found
 *       500:
 *         description: Internal server error
 */
router.get('/signatories/:id', authController.protect, companyController.getSignatory);

/**
 * @swagger
 * /api/v1/company/signatories/{id}:
 *   put:
 *     summary: Update a signatory by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the signatory
 *     requestBody:
 *       description: New signatory details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated signatory
 *       404:
 *         description: Signatory not found
 *       500:
 *         description: Internal server error
 */
router.put('/signatories/:id', authController.protect, companyController.updateSignatory);

/**
 * @swagger
 * /api/v1/company/signatories-by-company:
 *   get:
 *     summary: Get all signatories by companyId
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with signatories
 *       500:
 *         description: Internal server error
 */
router.get('/signatories-by-company', authController.protect, companyController.getAllSignatoriesByCompanyId);

/**
 * @swagger
 * /api/v1/company/signatories/{id}:
 *   delete:
 *     summary: Delete a signatory by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the signatory
 *     responses:
 *       204:
 *         description: Signatory successfully deleted
 *       404:
 *         description: Signatory not found
 *       500:
 *         description: Internal server error
 */
router.delete('/signatories/:id', authController.protect, companyController.deleteSignatory);

// Country Router
router.get('/companylist',authController.protect,companyController.getCompanyList);
//router.patch('/updateCompany',companyController.saveCoutry);

/**
 * @swagger
 * /api/v1/company:
 *   get:
 *     summary: Get company details by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get('/',authController.protect, companyController.getCompany);

/**
 * @swagger
 * /api/v1/company:
 *   put:
 *     summary: Update company details by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
  *     requestBody:
 *       description: Fields to update in the company
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *                 required: true
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: number
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       400:
 *         description: Invalid request or missing fields
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.put('/',authController.protect, companyController.updateCompany);

/**
 * @swagger
 * /api/v1/company/update-company-logo:
 *   put:
 *     summary: Update an Company Logo
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Update Company Logo details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyLogo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: {attachmentSize,extention,file} 
 *     responses:
 *       200:
 *         description: Successfully updated the ProfilePhoto
 *       404:
 *         description: No Profile Photo found with that ID
 *       500:
 *         description: Internal server error
 */
router.put('/update-company-logo',  authController.protect, companyController.updateCompanyLogo);


 /**
 * @swagger
 * /api/v1/company/tax-slabs:
 *   post:
 *     summary: Add a new tax slab
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Tax slab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IncomeTaxSlabs:
 *                 type: string
 *                 required: true
 *               minAmount:
 *                 type: number
 *                 required: true
 *               maxAmount:
 *                 type: number
 *                 required: true
 *               taxPercentage:
 *                 type: number
 *                 required: true
 *               cycle:
 *                 type: string
 *                 required: true
 *               regime:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Tax slab successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/tax-slabs',authController.protect, companyController.createTaxSlab);

/**
 * @swagger
 * /api/v1/company/tax-slabs-by-company:
 *   post:
 *     summary: Get a Tax Slab by compnny
 *     tags: [Company Management] 
 *     security: [{
 *         bearerAuth: []
 *     }]
 *     requestBody:
 *         content:
 *             application/json:
 *                 schema:
 *                     type: object
 *                     properties:
 *                         skip:
 *                             type: string
 *                         next:
 *                             type: string
 *     responses:
 *       200:
 *         description: Successful response with the GeneralSettings
 *       404:
 *         description: GeneralSettings not found
 *       500:
 *         description: Internal server error
 */
router.post('/tax-slabs-by-company',authController.protect, companyController.getTaxSlabsByCompany);

/**
 * @swagger
 * /api/v1/company/tax-slabs-by-cycle/{cycle}:
 *   get:
 *     summary: Get all tax slabs by year
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cycle
 *         required: true
 *         schema:
 *           type: string
 *         description: Year of the tax slabs
 *     responses:
 *       200:
 *         description: Successful response with tax slabs
 *       404:
 *         description: No tax slabs found for the cycle
 *       500:
 *         description: Internal server error
 */
router.get('/tax-slabs-by-cycle/:cycle',authController.protect, companyController.getTaxSlabsByCycle);

/**
 * @swagger
 * /api/v1/company/tax-slabs/{id}:
 *   put:
 *     summary: Update a tax slab by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tax slab
 *     requestBody:
 *       description: Updated tax slab details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IncomeTaxSlabs:
 *                 type: string
 *               minAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *               taxPercentage:
 *                 type: number
 *               cycle:
 *                 type: string
 *                 required: true
 *               regime:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Tax slab successfully updated
 *       404:
 *         description: Tax slab not found
 *       500:
 *         description: Internal server error
 */
router.put('/tax-slabs/:id',authController.protect, companyController.updateTaxSlab);

/**
 * @swagger
 * /api/v1/company/tax-slabs/{id}:
 *   get:
 *     summary: Get a tax slab by ID
 *     tags: [Company Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tax slab
 *     responses:
 *       200:
 *         description: Successful response with the tax slab
 *       404:
 *         description: Tax slab not found
 *       500:
 *         description: Internal server error
 */
router.get('/tax-slabs/:id',authController.protect, companyController.getTaxSlabById);

/**
 * @swagger
 * /api/v1/company/tax-slabs/{id}:
 *   delete:
 *     summary: Delete a tax slab by ID
 *     tags: [Company Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tax slab
 *     responses:
 *       204:
 *         description: Tax slab successfully deleted
 *       404:
 *         description: Tax slab not found
 *       500:
 *         description: Internal server error
 */
router.delete('/tax-slabs/:id',authController.protect, companyController.deleteTaxSlab);

module.exports = router;