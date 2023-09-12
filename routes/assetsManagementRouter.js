const express = require('express');
const assetsManagementController = require(`../controllers/assetsManagementController`);
const assetsManagementRouter = express.Router();

// AssetType routes

/**
 * @swagger
 * /api/v1/assetsManagement/assetTypes: 
 *   post:
 *     summary: Add a new assetType
 *     tags: [Assets Management]
 *     requestBody:
 *       description: AssetType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: AssetType successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetTypes', assetsManagementController.addAssetType);

/**
 * @swagger
 * /api/v1/assetsManagement/assetTypes/{id}:
 *   get:
 *     summary: Get an assetType by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the assetType
 *     responses:
 *       200:
 *         description: Successful response with the assetType
 *       404:
 *         description: AssetType not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetTypes/:id', assetsManagementController.getAssetTypes);

/**
 * @swagger
 * /api/v1/assetsManagement/assetTypes/{id}:
 *   put:
 *     summary: Update an assetType by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the assetType
 *     requestBody:
 *       description: New assetType details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated assetType
 *       404:
 *         description: AssetType not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assetTypes/:id', assetsManagementController.updateAssetType);

/**
 * @swagger
 * /api/v1/assetsManagement/assetTypes/{id}:
 *   delete:
 *     summary: Delete an assetType by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the assetType
 *     responses:
 *       204:
 *         description: AssetType successfully deleted
 *       404:
 *         description: AssetType not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assetTypes/:id', assetsManagementController.deleteAssetType);

/**
 * @swagger
 * /api/v1/assetsManagement/allAssetTypes:
 *   get:
 *     summary: Get all assetTypes
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with assetTypes
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/allAssetTypes', assetsManagementController.getAllAssetTypes);

// AssetAttributeValue routes

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues: 
 *   post:
 *     summary: Add a new AssetAttributeValue
 *     tags: [Assets Management]
 *     requestBody:
 *       description: AssetAttributeValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId:
 *                 type: string
 *                 required: true
 *               attributeId:
 *                 type: string
 *                 required: true
 *               value:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: AssetAttributeValue successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetAttributeValues', assetsManagementController.addAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   get:
 *     summary: Get an AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       200:
 *         description: Successful response with the AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues/:id', assetsManagementController.getAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   put:
 *     summary: Update an AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     requestBody:
 *       description: New AssetAttributeValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId:
 *                 type: string
 *               attributeId:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assetAttributeValues/:id', assetsManagementController.updateAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   delete:
 *     summary: Delete an AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       204:
 *         description: AssetAttributeValue successfully deleted
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assetAttributeValues/:id', assetsManagementController.deleteAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues:
 *   get:
 *     summary: Get all AssetAttributeValues
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with AssetAttributeValues
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues', assetsManagementController.getAllAssetAttributeValues);

//assetAttributeValues

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues:
 *   post:
 *     summary: Add a AssetAttributeValue
 *     tags: [Assets Management]
 *     requestBody:
 *       description: Asset attribute value details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetAttributeValue'
 *     responses:
 *       201:
 *         description: AssetAttributeValue successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetAttributeValues', assetsManagementController.createAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   get:
 *     summary: Get a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       200:
 *         description: Successful response with the AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues/:id', assetsManagementController.getAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   put:
 *     summary: Update a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     requestBody:
 *       description: Updated AssetAttributeValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetAttributeValue'
 *     responses:
 *       200:
 *         description: Successful response with the updated AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assetAttributeValues/:id', assetsManagementController.updateAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   delete:
 *     summary: Delete a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       204:
 *         description: AssetAttributeValue successfully deleted
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assetAttributeValues/:id', assetsManagementController.deleteAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues:
 *   get:
 *     summary: Get all AssetAttributeValues
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with all AssetAttributeValues
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues', assetsManagementController.getAllAssetAttributeValues);

// AssetAttributeValue routes
/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues:
 *   post:
 *     summary: Add a AssetAttributeValue
 *     tags: [Assets Management]
 *     requestBody:
 *       description: AssetAttributeValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AssetAttributeValue'
 *     responses:
 *       201:
 *         description: AssetAttributeValue successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetAttributeValues', assetsManagementController.createAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   get:
 *     summary: Get a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       200:
 *         description: Successful response with the AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues/:id', assetsManagementController.getAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   put:
 *     summary: Update a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     requestBody:
 *       description: New AssetAttributeValue details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/AssetAttributeValue'
 *     responses:
 *       200:
 *         description: Successful response with the updated AssetAttributeValue
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assetAttributeValues/:id', assetsManagementController.updateAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues/{id}:
 *   delete:
 *     summary: Delete a AssetAttributeValue by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetAttributeValue
 *     responses:
 *       204:
 *         description: AssetAttributeValue successfully deleted
 *       404:
 *         description: AssetAttributeValue not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assetAttributeValues/:id', assetsManagementController.deleteAssetAttributeValue);

/**
 * @swagger
 * /api/v1/assetsManagement/assetAttributeValues:
 *   get:
 *     summary: Get all AssetAttributeValues
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with AssetAttributeValues
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetAttributeValues', assetsManagementController.getAllAssetAttributeValues);

/**
 * @swagger
 * /api/v1/assetsManagement/assetStatus:
 *   post:
 *     summary: Add a new AssetStatus
 *     tags: [Assets Management]
 *     requestBody:
 *       description: AssetStatus details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusName:
 *                 type: string
 *                 required: true
 *               company:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: AssetStatus successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetStatus', assetsManagementController.createAssetStatus);

/**
 * @swagger
 * /api/v1/assetsManagement/assetStatus/{id}:
 *   get:
 *     summary: Get an AssetStatus by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetStatus
 *     responses:
 *       200:
 *         description: Successful response with the AssetStatus
 *       404:
 *         description: AssetStatus not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetStatus/:id', assetsManagementController.getAssetStatus);

/**
 * @swagger
 * /api/v1/assetsManagement/assetStatus/{id}:
 *   put:
 *     summary: Update an AssetStatus by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetStatus
 *     requestBody:
 *       description: New AssetStatus details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusName:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated AssetStatus
 *       404:
 *         description: AssetStatus not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assetStatus/:id', assetsManagementController.updateAssetStatus);

/**
 * @swagger
 * /api/v1/assetsManagement/assetStatus/{id}:
 *   delete:
 *     summary: Delete an AssetStatus by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the AssetStatus
 *     responses:
 *       204:
 *         description: AssetStatus successfully deleted
 *       404:
 *         description: AssetStatus not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assetStatus/:id', assetsManagementController.deleteAssetStatus);

/**
 * @swagger
 * /api/v1/assetsManagement/assetStatus:
 *   get:
 *     summary: Get all AssetStatuses
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with AssetStatuses
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetStatus', assetsManagementController.getAllAssetStatuses);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttributes:
 *   post:
 *     summary: Add a new CustomAttribute
 *     tags: [Assets Management]
 *     requestBody:
 *       description: CustomAttribute details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributeName:
 *                 type: string
 *                 required: true
 *               assetType:
 *                 type: string
 *                 required: true
 *               company:
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
 *         description: CustomAttribute successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/customAttributes', assetsManagementController.createCustomAttribute);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttributes/{id}:
 *   get:
 *     summary: Get a CustomAttribute by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CustomAttribute
 *     responses:
 *       200:
 *         description: Successful response with the CustomAttribute
 *       404:
 *         description: CustomAttribute not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/customAttributes/:id', assetsManagementController.getCustomAttribute);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttributes/{id}:
 *   put:
 *     summary: Update a CustomAttribute by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CustomAttribute
 *     requestBody:
 *       description: New CustomAttribute details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributeName:
 *                 type: string
 *               assetType:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               dataType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated CustomAttribute
 *       404:
 *         description: CustomAttribute not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/customAttributes/:id', assetsManagementController.updateCustomAttribute);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttribute/{id}:
 *   delete:
 *     summary: Delete a CustomAttribute by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CustomAttribute
 *     responses:
 *       204:
 *         description: CustomAttribute successfully deleted
 *       404:
 *         description: CustomAttribute not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/customAttribute/:id', assetsManagementController.deleteCustomAttribute);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttributes/{assetTypeId}:
 *   delete:
 *     summary: Delete a CustomAttribute by asset Type
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: assetTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the CustomAttribute
 *     responses:
 *       204:
 *         description: CustomAttribute successfully deleted
 *       404:
 *         description: CustomAttribute not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/customAttributes/:assetTypeId', assetsManagementController.deleteCustomAttributeByAssetType);

/**
 * @swagger
 * /api/v1/assetsManagement/customAttributes:
 *   get:
 *     summary: Get all CustomAttributes
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with CustomAttributes
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/customAttributes', assetsManagementController.getAllCustomAttributes);

// Existing code...

// Route to add multiple CustomAttributes to an existing AssetType
/**
 * @swagger
 * /api/v1/assetsManagement/assetTypes/{id}/customAttributes:
 *   post:
 *     summary: Add multiple customAttributes to an existing assetType
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the assetType
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 attributeName:
 *                   type: string
 *                   description: Name of the attribute
 *                 assetType:
 *                   type: string
 *                   description: Type of the asset
 *                 description:
 *                   type: string
 *                   description: Description of the custom attribute
 *                 dataType:
 *                   type: string
 *                   description: Data type of the custom attribute
 *                 isRequired:
 *                   type: boolean
 *                   description: Indicator if the attribute is required
 *     responses:
 *       200:
 *         description: Successfully added customAttributes
 *       404:
 *         description: AssetType not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assetTypes/:id/customAttributes', assetsManagementController.addCustomAttributes);


/**
 * @swagger
 * /api/v1/assetsManagement/employeeAssets:
 *   post:
 *     summary: Add a new employeeAsset
 *     tags: [Assets Management]
 *     requestBody:
 *       description: employeeAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Employee:
 *                 type: string
 *                 required: true
 *               Asset:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: EmployeeAsset successfully created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/employeeAssets', assetsManagementController.createEmployeeAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/employeeAssets/{id}:
 *   get:
 *     summary: Get a employeeAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employeeAsset
 *     responses:
 *       200:
 *         description: Successful response with the employeeAsset
 *       404:
 *         description: EmployeeAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/employeeAssets/:id', assetsManagementController.getEmployeeAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/employeeAssets/{id}:
 *   put:
 *     summary: Update a employeeAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employeeAsset
 *     requestBody:
 *       description: New employeeAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Employee:
 *                 type: string
 *               Asset:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated employeeAsset
 *       404:
 *         description: EmployeeAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/employeeAssets/:id', assetsManagementController.updateEmployeeAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/employeeAssets/{employeeId}:/{assetId}:
 *   delete:
 *     summary: Delete a employeeAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the asset
 *     responses:
 *       204:
 *         description: EmployeeAsset successfully deleted
 *       404:
 *         description: EmployeeAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/employeeAssets/:employeeId/:assetId', assetsManagementController.deleteEmployeeAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/employeeAssets:
 *   get:
 *     summary: Get all employeeAssets
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with employeeAssets
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/employeeAssets', assetsManagementController.getAllEmployeeAssets);

// Vendor Routes
/**
 * @swagger
 * /api/v1/assetsManagement/vendors:
 *   post:
 *     summary: Add a new vendor
 *     tags: [Assets Management]
 *     requestBody:
 *       description: Vendor details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       201:
 *         description: Vendor successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/vendors', assetsManagementController.createVendor);

/**
 * @swagger
 * /api/v1/assetsManagement/vendors/{id}:
 *   get:
 *     summary: Get a vendor by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendor
 *     responses:
 *       200:
 *         description: Successful response with the vendor
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/vendors/:id', assetsManagementController.getVendor);

/**
 * @swagger
 * /api/v1/assetsManagement/vendors/{id}:
 *   put:
 *     summary: Update a vendor by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendor
 *     requestBody:
 *       description: New vendor details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       200:
 *         description: Successful response with the updated vendor
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/vendors/:id', assetsManagementController.updateVendor);

/**
 * @swagger
 * /api/v1/assetsManagement/vendors/{id}:
 *   delete:
 *     summary: Delete a vendor by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendor
 *     responses:
 *       204:
 *         description: Vendor successfully deleted
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/vendors/:id', assetsManagementController.deleteVendor);

/**
 * @swagger
 * /api/v1/assetsManagement/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with vendors
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/vendors', assetsManagementController.getAllVendors);

// routes/vendorAssetsPurchasedRoutes.js

/**
 * @swagger
 * /api/v1/assetsManagement/vendorAssets:
 *   post:
 *     summary: Add a new vendorAsset
 *     tags: [Assets Management]
 *     requestBody:
 *       description: VendorAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Asset:
 *                 type: string
 *                 required: true
 *               Vendor:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: VendorAsset successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/vendorAssets', assetsManagementController.addVendorAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/vendorAssets/{id}:
 *   get:
 *     summary: Get a vendorAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendorAsset
 *     responses:
 *       200:
 *         description: Successful response with the vendorAsset
 *       404:
 *         description: VendorAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/vendorAssets/:id', assetsManagementController.getVendorAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/vendorAssets/{id}:
 *   put:
 *     summary: Update a vendorAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendorAsset
 *     requestBody:
 *       description: New vendorAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Asset:
 *                 type: string
 *               Vendor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the updated vendorAsset
 *       404:
 *         description: VendorAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/vendorAssets/:id', assetsManagementController.updateVendorAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/vendorAssets/{id}:
 *   delete:
 *     summary: Delete a vendorAsset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vendorAsset
 *     responses:
 *       204:
 *         description: VendorAsset successfully deleted
 *       404:
 *         description: VendorAsset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/vendorAssets/:id', assetsManagementController.deleteVendorAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/vendorAssets:
 *   get:
 *     summary: Get all vendorAssets
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with vendorAssets
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/vendorAssets', assetsManagementController.getAllVendorAssets);

/**
 * @swagger
 * /api/v1/assetsManagement/assets:
 *   post:
 *     summary: Add a new asset
 *     tags: [Assets Management]
 *     requestBody:
 *       description: VendorAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetType:
 *                 type: string
 *                 required: true
 *               assetName:
 *                 type: string
 *                 required: true
 *               purchaseDate:
 *                 type: string
 *                 format: date 
 *               warrantyExpiry:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 required: true 
 *               image:
 *                 type: string
 *                 required: true 
 *     responses:
 *       201:
 *         description: Asset successfully added
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.post('/assets', assetsManagementController.addAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/assets/{id}:
 *   get:
 *     summary: Get an asset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the asset
 *     responses:
 *       200:
 *         description: Successful response with the asset
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assets/:id', assetsManagementController.getAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/assets/{id}:
 *   put:
 *     summary: Update an asset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the asset
 *     requestBody:
 *       description: VendorAsset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetType:
 *                 type: string
 *                 required: true
 *               assetName:
 *                 type: string
 *                 required: true
 *               purchaseDate:
 *                 type: string
 *                 format: date 
 *               warrantyExpiry:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 required: true 
 *               image:
 *                 type: string
 *                 required: true 
 *     responses:
 *       200:
 *         description: Successful response with the updated asset
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.put('/assets/:id', assetsManagementController.updateAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/assets/{id}:
 *   delete:
 *     summary: Delete an asset by ID
 *     tags: [Assets Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the asset
 *     responses:
 *       204:
 *         description: Asset successfully deleted
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.delete('/assets/:id', assetsManagementController.deleteAsset);

/**
 * @swagger
 * /api/v1/assetsManagement/assets:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets Management]
 *     responses:
 *       200:
 *         description: Successful response with assets
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assets', assetsManagementController.getAllAssets);

/**
 * @swagger
 * /api/v1/assetsManagement/assetsByType/{assetType}:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets Management]
*     parameters:
 *       - name: assetType
 *         in: path
 *         description: assetType ID
 *         required: true
 *         schema:
 *           type: string 
*     responses:
 *       200:
 *         description: Successful response with assets
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/assetsByType/:assetType', assetsManagementController.getAllAssetsByAssetTpe);

/**
 * @swagger
 * /api/v1/assetsManagement/unassignedAssets/{userId}:
 *   get:
 *     summary: Get unassigned assets for a specific user
 *     tags: [Assets Management]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to get unassigned assets for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with unassigned assets for the user
 *       400:
 *         description: Bad request (e.g. invalid user ID)
 *       500:
 *         description: Internal server error
 */
assetsManagementRouter.get('/unassignedAssets/:userId', assetsManagementController.getUnassignedAssetsForUser);

module.exports = assetsManagementRouter;

