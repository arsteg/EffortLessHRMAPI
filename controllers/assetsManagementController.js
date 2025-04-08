const AssetType = require("../models/AssetsManagement/assetTypeModel");
const AssetStatus = require("../models/AssetsManagement/assetStatusModel.js");
const AssetAttributeValue = require("../models/AssetsManagement/assetAttributeValueModel");
const Vendor = require("../models/AssetsManagement/vendorModel");
const VendorAssetsPurchased = require("../models/AssetsManagement/vendorAssetsPurchasedModel");
const CustomAttribute = require("../models/AssetsManagement/CustomAttributeModel");
const Asset = require("../models/AssetsManagement/assetModel");
const EmployeeAssets = require("../models/AssetsManagement/employeeAssetsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError.js');
const mongoose = require("mongoose");
const CustomAttributeModel = require("../models/AssetsManagement/CustomAttributeModel");
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

exports.addAssetType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting asset type creation');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { typeName, description, customAttributes} = req.body;
    const company = req.cookies.companyId;

    websocketHandler.sendLog(req, 'Creating new asset type');
    const assetType = new AssetType({
      typeName,
      description,
      company,
    });

    const savedAssetType = await assetType.save({ session });

    // Validate and create CustomAttributes
    if (customAttributes && Array.isArray(customAttributes)) {
      websocketHandler.sendLog(req, 'Creating custom attributes for asset type');
      const customAttributesData = customAttributes.map((attr) => ({
        attributeName: attr.attributeName,
        description: attr.description,
        dataType: attr.dataType,
        isRequired: attr.isRequired,
        company: company,
        assetType: savedAssetType._id,
      }));

      await CustomAttribute.insertMany(customAttributesData, { session });
    }

    websocketHandler.sendLog(req, 'Committing asset type transaction');
    await session.commitTransaction();
    session.endSession();

    websocketHandler.sendLog(req, 'Asset type creation successful');
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('assetsManagement.addAssetTypeSuccess', { typeName }),
      data: {
        assetType: savedAssetType,
        customAttributes,
      },
    });
  } catch (error) {
    websocketHandler.sendLog(req, 'Error occurred during asset type creation');
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    next(new AppError(req.t('assetsManagement.addAssetTypeFailure'), 400));
  }
});

exports.getAssetTypes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching asset type by ID');
  const assetTypes = await AssetType.find({
    _id: req.params.id 
  });
  if (!assetTypes) {
    websocketHandler.sendLog(req, 'Asset type not found');
    return next(new AppError("AssetType not found", 404));
  }
  websocketHandler.sendLog(req, 'Asset type retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAssetTypesSuccess', { recordId: req.params.id }),
    data: assetTypes,
  });
});

exports.updateAssetType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting asset type update');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { typeName, description, customAttributes } = req.body;

    websocketHandler.sendLog(req, 'Updating asset type');
    const assetType = await AssetType.findByIdAndUpdate(
      req.params.id,
      { typeName, description },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!assetType) {
      websocketHandler.sendLog(req, 'Asset type not found during update');
      await session.abortTransaction();
      session.endSession();
      return next(new AppError(req.t('common.notFound'), 404));
    }

    if (customAttributes && Array.isArray(customAttributes)) {
      websocketHandler.sendLog(req, 'Processing custom attributes for update');
      const existingAttributes = await CustomAttribute.find(
        { assetType: req.params.id },
        null,
        { session }
      );

      // Separate operations
      const toDelete = existingAttributes.filter(
        (attr) => !customAttributes.some((newAttr) => newAttr._id === String(attr._id))
      );
      const toUpdate = customAttributes.filter((newAttr) =>
        existingAttributes.some((attr) => String(attr._id) === newAttr._id)
      );
      const toCreate = customAttributes.filter(
        (newAttr) => !newAttr._id || !existingAttributes.some((attr) => String(attr._id) === newAttr._id)
      );

      // Delete removed attributes
      if (toDelete.length > 0) {
        websocketHandler.sendLog(req, 'Deleting removed custom attributes');
        const deleteIds = toDelete.map((attr) => attr._id);
        await CustomAttribute.deleteMany({ _id: { $in: deleteIds } }, { session });
      }

      // Update existing attributes
      for (const updateAttr of toUpdate) {
        websocketHandler.sendLog(req, 'Updating existing custom attribute');
        await CustomAttribute.findByIdAndUpdate(
          updateAttr._id,
          {
            attributeName: updateAttr.attributeName,
            description: updateAttr.description,
            dataType: updateAttr.dataType,
            isRequired: updateAttr.isRequired,
          },
          { session }
        );
      }

      // Add new attributes
      if (toCreate.length > 0) {
        websocketHandler.sendLog(req, 'Creating new custom attributes');
        const customAttributesData = toCreate.map((attr) => ({
          attributeName: attr.attributeName,
          description: attr.description,
          dataType: attr.dataType,
          isRequired: attr.isRequired,
          company: assetType.company,
          assetType: assetType._id,
        }));
        await CustomAttribute.insertMany(customAttributesData, { session });
      }
    }

    websocketHandler.sendLog(req, 'Committing asset type update transaction');
    await session.commitTransaction();
    session.endSession();

    websocketHandler.sendLog(req, 'Asset type update successful');
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('assetsManagement.updateAssetTypeSuccess', { recordId: req.params.id }),
      data: {
        assetType,
        customAttributes,
      },
    });
  } catch (error) {
    websocketHandler.sendLog(req, 'Error occurred during asset type update');
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    next(new AppError(req.t('assetsManagement.updateAssetTypeFailure'), 400));
  }
});


exports.deleteAssetType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting asset type deletion');
  const { id } = req.params;
  const companyId = req.cookies.companyId;

  websocketHandler.sendLog(req, 'Checking for asset references');
  const assetExists = await Asset.findOne({ assetType: id, company: companyId });

  if (assetExists) {
    websocketHandler.sendLog(req, 'Asset type deletion blocked due to existing assets');
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('assetsManagement.deleteAssetTypeBlocked'),
    });
  }

  websocketHandler.sendLog(req, 'Checking for custom attribute references');
  const customAttributeExists = await CustomAttribute.findOne({ assetType: id, company: companyId });

  websocketHandler.sendLog(req, 'Deleting asset type');
  const assetType = await AssetType.findOneAndDelete({ _id: id, company: companyId });

  if (!assetType) {
    websocketHandler.sendLog(req, 'Asset type not found during deletion');
    return next(new AppError(req.t('common.notFound'), 404));
  }

  websocketHandler.sendLog(req, 'Deleting related custom attributes');
  await CustomAttribute.deleteMany({ assetType: id, company: companyId });

  websocketHandler.sendLog(req, 'Asset type deletion successful');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteAssetTypeSuccess', { recordId: id }),
    data: null,
  });
});

exports.getAllAssetTypes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all asset types');
  const companyId = req.cookies.companyId;
  const skip = parseInt(req.query.skip) || 0;  // Default to 0 if 'skip' is not provided
  const take = parseInt(req.query.next); // Parse 'next' but don't assign a default here
  
  // Fetch the total count of AssetTypes for the company (without pagination)
  const totalRecords = await AssetType.countDocuments({ company: companyId });

  
  // Fetch AssetTypes based on the value of 'take'
  let assetTypesQuery = AssetType.find({ company: companyId }).skip(skip);
  if (take && take > 0) {
    assetTypesQuery = assetTypesQuery.limit(take); // Apply limit only if 'take' > 0
  }
  const assetTypes = await assetTypesQuery;

  websocketHandler.sendLog(req, 'Processing asset types with deletable flags');
  const assetTypesWithDeletableFlag = await Promise.all(
    assetTypes.map(async (assetType) => {
      const assetTypeObj = assetType.toObject(); // Convert Mongoose document to plain object

      // Check if the AssetType is used in any Asset
      const assetCount = await Asset.countDocuments({ assetType: assetType._id });
      assetTypeObj.isDeletable = assetCount === 0; // true if no assets reference this type

      // Fetch customAttributes for the AssetType
      const customAttributes = await CustomAttribute.find({
        assetType: assetType._id,
        company: companyId,
      });
      assetTypeObj.customAttributes = customAttributes;

      return assetTypeObj;
    })
  );

  websocketHandler.sendLog(req, 'All asset types retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllAssetTypesSuccess'),
    totalRecords,
    data: assetTypesWithDeletableFlag,
  });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching asset attribute value');
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    websocketHandler.sendLog(req, 'Asset attribute value not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset attribute value retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAssetAttributeValueSuccess', { recordId: req.params.id }),
    data: assetAttributeValue,
  });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating asset attribute value');
  const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assetAttributeValue) {
    websocketHandler.sendLog(req, 'Asset attribute value not found during update');
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  websocketHandler.sendLog(req, 'Asset attribute value updated successfully');
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: assetAttributeValue,
  });
});
exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all asset attribute values');
  const assetAttributeValues = await AssetAttributeValue.find();
  websocketHandler.sendLog(req, 'All asset attribute values retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: assetAttributeValues,
  });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: assetAttributeValue,
  });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: assetAttributeValue,
  });
});

exports.deleteAssetAttributeValuesByAssetId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Deleting asset attribute values by asset ID');
  const assetAttributeValues = await AssetAttributeValue.deleteMany({assetId: req.params.assetId});
  if (!assetAttributeValues) {
    websocketHandler.sendLog(req, 'No asset attribute values found for deletion');
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  websocketHandler.sendLog(req, 'Asset attribute values deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: assetAttributeValues,
  });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: assetAttributeValues,
  });
});

exports.createAssetAttributeValue = catchAsync(async (req, res, next) => {  
  websocketHandler.sendLog(req, 'Starting asset attribute value creation');
  
  if (req.body.assetId && req.body.attributeId) {    
    websocketHandler.sendLog(req, 'Checking existing asset attribute value');
    const recordExists = await AssetAttributeValue.find({assetId: req.body.assetId, attributeId: req.body.attributeId});    
    
    const { assetId, attributeId, value } = req.body;
    const filter = { assetId, attributeId };
    const update = { value };    

    if(recordExists && recordExists.length > 0){
      websocketHandler.sendLog(req, 'Updating existing asset attribute value');
      const assetAttributeValue = await AssetAttributeValue.findOneAndUpdate(
        filter,
        update,
        { new: true } // Update the existing record, don't create a new one
      );

      websocketHandler.sendLog(req, 'Asset attribute value updated successfully');
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        message: req.t('assetsManagement.updateAssetAttributeValueSuccess', { recordId: assetAttributeValue._id }),
        data: assetAttributeValue,
      });

    }
    else{
      websocketHandler.sendLog(req, 'Creating new asset attribute value');
      const assetAttributeValue = await AssetAttributeValue.findOneAndUpdate(
        filter,
        update,
        { new: true, upsert: true } // Create a new record if it doesn't exist
      );

      websocketHandler.sendLog(req, 'Asset attribute value created successfully');
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        message: req.t('assetsManagement.createAssetAttributeValueSuccess', { assetId }),
        data: assetAttributeValue,
      });
    }    
  } else {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: assetAttributeValue,
  });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: assetAttributeValue,
  });
});

exports.deleteAssetAttributeValue = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Deleting asset attribute value');
  const assetAttributeValue = await AssetAttributeValue.findByIdAndDelete(req.params.id);
  if (!assetAttributeValue) {
    websocketHandler.sendLog(req, 'Asset attribute value not found for deletion');
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  websocketHandler.sendLog(req, 'Asset attribute value deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: assetAttributeValues,
  });
});

exports.createAssetStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating new asset status');
  const assetStatus = await AssetStatus.create({
    statusName: req.body.statusName,
    company: req.cookies.companyId,
  });
  websocketHandler.sendLog(req, 'Asset status created successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.createAssetStatusSuccess', { statusName: req.body.statusName }),
    data: assetStatus,
  });
});

exports.getAssetStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching asset status');
  const assetStatus = await AssetStatus.findById(req.params.id);
  if (!assetStatus) {
    websocketHandler.sendLog(req, 'Asset status not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset status retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAssetStatusSuccess', { recordId: req.params.id }),
    data: assetStatus,
  });
});

exports.updateAssetStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating asset status');
  const assetStatus = await AssetStatus.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assetStatus) {
    websocketHandler.sendLog(req, 'Asset status not found during update');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset status updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateAssetStatusSuccess', { recordId: req.params.id }),
    data: assetStatus,
  });
});

exports.deleteAssetStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Checking asset status usage before deletion');
  const assets = await Asset.findOne({
    status: req.params.id
  });
  if (assets?.length > 0) {
    websocketHandler.sendLog(req, 'Asset status deletion blocked due to existing assets');
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('assetsManagement.deleteAssetStatusBlocked'),
    });
  }
  websocketHandler.sendLog(req, 'Deleting asset status');
  const assetStatus = await AssetStatus.findByIdAndDelete(req.params.id);
  if (!assetStatus) {
    websocketHandler.sendLog(req, 'Asset status not found for deletion');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset status deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteAssetStatusSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllAssetStatuses = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all asset statuses');
  const companyId = req.cookies.companyId;
  // Fetch all AssetStatuses for the company
  const assetStatuses = await AssetStatus.find({ company: companyId });

  websocketHandler.sendLog(req, 'Processing asset statuses with deletable flags');
  const assetStatusesWithDeletableFlag = await Promise.all(
    assetStatuses.map(async (status) => {
      const assetCount = await Asset.countDocuments({ status: status._id });
      return {
        ...status.toObject(), // Convert Mongoose document to plain object
        isDeletable: assetCount === 0, // true if no assets reference this status
      };
    })
  );
  websocketHandler.sendLog(req, 'All asset statuses retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllAssetStatusesSuccess'),
    data: assetStatusesWithDeletableFlag,
  });  
});

exports.createCustomAttribute = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating new custom attribute');
  const customAttribute = await CustomAttribute.create(req.body);
  websocketHandler.sendLog(req, 'Custom attribute created successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.createCustomAttributeSuccess', { attributeName: req.body.attributeName }),
    data: customAttribute,
  });
});

exports.getCustomAttribute = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching custom attribute');
  const customAttribute = await CustomAttribute.findById(req.params.id);
  if (!customAttribute) {
    websocketHandler.sendLog(req, 'Custom attribute not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Custom attribute retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getCustomAttributeSuccess', { recordId: req.params.id }),
    data: customAttribute,
  });
});

exports.updateCustomAttribute = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating custom attribute');
  const customAttribute = await CustomAttribute.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!customAttribute) {
    websocketHandler.sendLog(req, 'Custom attribute not found during update');
    return next(new AppError(req.t('common.notFound'), 404));
  }

  websocketHandler.sendLog(req, 'Custom attribute updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateCustomAttributeSuccess', { recordId: req.params.id }),
    data: customAttribute,
  });
});

exports.deleteCustomAttribute = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Checking custom attribute usage before deletion');
  const assetAttributeValue = await AssetAttributeValue.findOne({
    attributeId: req.params.id,
  });

  if (assetAttributeValue) {
    websocketHandler.sendLog(req, 'Custom attribute deletion blocked due to usage', constants.LOG_TYPES.WARNING);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('assetsManagement.attributeInUse'),
    });
}

  websocketHandler.sendLog(req, 'Deleting custom attribute');
  const customAttribute = await CustomAttribute.findByIdAndDelete(req.params.id);

  // If the custom attribute is not found, return a 404 error
  if (!customAttribute) {
    websocketHandler.sendLog(req, 'Custom attribute not found for deletion');
    return next(new AppError(req.t('common.notFound'), 404));
  }

  websocketHandler.sendLog(req, 'Custom attribute deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteCustomAttributeSuccess', { recordId: req.params.id }),
    data: null,
  });
});


exports.deleteCustomAttributeByAssetType = catchAsync(
  async (req, res, next) => {
    const customAttributes = await CustomAttribute.deleteMany({
      assetType: req.params.assetTypeId,
      company: req.cookies.companyId,
    });

    if (!customAttributes) {
      return next(new AppError("CustomAttribute not found", 404));
    }

  websocketHandler.sendLog(req, 'Custom attributes deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: customAttributes,
  });
});

exports.getAllCustomAttributes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all custom attributes');
  const customAttributes = await CustomAttribute.find();
  websocketHandler.sendLog(req, 'All custom attributes retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllCustomAttributesSuccess'),
    data: customAttributes,
  });
});

exports.addCustomAttributes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Adding multiple custom attributes');
  const assetType = await AssetType.findById(req.params.id);
  if (!assetType) {
    websocketHandler.sendLog(req, 'Asset type not found for adding custom attributes');
    return next(new AppError(req.t('common.notFound'), 404));
  }

  const arrayCostomAttributes = req.body;

  arrayCostomAttributes.forEach((element) => {
    element.company = req.cookies.companyId;
    element.assetType = req.params.id;
  });

  // Assuming req.body is an array of CustomAttribute objects
  const addedCustomAttributes = await CustomAttribute.insertMany(
    arrayCostomAttributes
  );

  websocketHandler.sendLog(req, 'Custom attributes added successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.addCustomAttributesSuccess', { assetTypeId: req.params.id }),
    data: addedCustomAttributes,
  });
});

exports.getAssetCustomAttributes = catchAsync(async (req, res, next) => {
        
  // Assuming req.body is an array of CustomAttribute objects
  const customAttributes = await CustomAttribute.find({company:req.cookies.companyId,assetType:req.params.id});

  websocketHandler.sendLog(req, 'Asset custom attributes retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAssetCustomAttributesSuccess', { assetTypeId: req.params.id }),
    data: customAttributes,
  });
});

exports.createEmployeeAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating new employee asset');
  const employeeAsset = await EmployeeAssets.create(req.body);
  websocketHandler.sendLog(req, 'Employee asset created successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.createEmployeeAssetSuccess'),
    data: employeeAsset,
  });
});

exports.getEmployeeAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching employee asset');
  const employeeAsset = await EmployeeAssets.find({
    employee: req.params.id,
  }).populate("Asset");
  if (!employeeAsset) {
    websocketHandler.sendLog(req, 'Employee asset not found');
    return next(new AppError("EmployeeAsset not found", 404));
  }
  websocketHandler.sendLog(req, 'Employee asset retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getEmployeeAssetSuccess', { employeeId: req.params.id }),
    data: employeeAsset,
  });
});

exports.updateEmployeeAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating employee asset');
  const employeeAsset = await EmployeeAssets.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employeeAsset) {
    websocketHandler.sendLog(req, 'Employee asset not found during update');
    return next(new AppError("EmployeeAsset not found", 404));
  }

  websocketHandler.sendLog(req, 'Employee asset updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateEmployeeAssetSuccess', { recordId: req.params.id }),
    data: employeeAsset,
  });
});

exports.deleteEmployeeAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Deleting employee asset');
  const employeeAsset = await EmployeeAssets.findOneAndDelete({
    Employee: req.params.employeeId,
    Asset: req.params.assetId,
  });
  if (!employeeAsset) {
    websocketHandler.sendLog(req, 'Employee asset not found for deletion');
    return next(new AppError(req.t('common.notFound'), 404));
  }

  websocketHandler.sendLog(req, 'Employee asset deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteEmployeeAssetSuccess', { employeeId: req.params.employeeId }),
    data: null,
  });
});

exports.getAllEmployeeAssets = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all employee assets');
  const employeeAssets = await EmployeeAssets.find();
  websocketHandler.sendLog(req, 'All employee assets retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllEmployeeAssetsSuccess'),
    data: employeeAssets,
  });
});

exports.createVendor = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Creating new vendor');
  const { vendorId, vendorName, email, address, phone } = req.body;

  const vendor = await Vendor.create({
    vendorId,
    vendorName,
    email,
    address,
    phone,
    company: req.cookies.companyId,
  });
  websocketHandler.sendLog(req, 'Vendor created successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.createVendorSuccess', { vendorName }),
    data: vendor,
  });
});

exports.getVendor = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching vendor');
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    websocketHandler.sendLog(req, 'Vendor not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getVendorSuccess', { recordId: req.params.id }),
    data: vendor,
  });
});

exports.updateVendor = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating vendor');
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vendor) {
    websocketHandler.sendLog(req, 'Vendor not found during update');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateVendorSuccess', { recordId: req.params.id }),
    data: vendor,
  });
});

exports.deleteVendor = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Deleting vendor');
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) {
    websocketHandler.sendLog(req, 'Vendor not found for deletion');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteVendorSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllVendors = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all vendors');
  const vendors = await Vendor.find();
  websocketHandler.sendLog(req, 'All vendors retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllVendorsSuccess'),
    data: vendors,
  });
});

// controllers/assetsManagementController.js

exports.addVendorAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Adding new vendor asset');
  const vendorAsset = await VendorAssetsPurchased.create(req.body);
  websocketHandler.sendLog(req, 'Vendor asset added successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.addVendorAssetSuccess'),
    data: vendorAsset,
  });
});

exports.getVendorAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching vendor asset');
  const vendorAsset = await VendorAssetsPurchased.findById(req.params.id);
  if (!vendorAsset) {
    websocketHandler.sendLog(req, 'Vendor asset not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor asset retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getVendorAssetSuccess', { recordId: req.params.id }),
    data: vendorAsset,
  });
});

exports.updateVendorAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating vendor asset');
  const vendorAsset = await VendorAssetsPurchased.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!vendorAsset) {
    websocketHandler.sendLog(req, 'Vendor asset not found during update');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor asset updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateVendorAssetSuccess', { recordId: req.params.id }),
    data: vendorAsset,
  });
});

exports.deleteVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findByIdAndDelete(
    req.params.id
  );
  if (!vendorAsset) {
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Vendor asset deleted successfully');
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.deleteVendorAssetSuccess', { recordId: req.params.id }),
    data: null,
  });
});

exports.getAllVendorAssets = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all vendor assets');
  const vendorAssets = await VendorAssetsPurchased.find();
  websocketHandler.sendLog(req, 'All vendor assets retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllVendorAssetsSuccess'),
    data: vendorAssets,
  });
});

exports.addAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Adding new asset');
  req.body.company = req.cookies.companyId;
  const asset = await Asset.create(req.body);
  websocketHandler.sendLog(req, 'Asset added successfully');
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.addAssetSuccess', { assetName: req.body.assetName }),
    data: asset,
  });
});

exports.getAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching asset');
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    websocketHandler.sendLog(req, 'Asset not found');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAssetSuccess', { recordId: req.params.id }),
    data: asset,
  });
});

exports.updateAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Updating asset');
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!asset) {
    websocketHandler.sendLog(req, 'Asset not found during update');
    return next(new AppError(req.t('common.notFound'), 404));
  }
  websocketHandler.sendLog(req, 'Asset updated successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.updateAssetSuccess', { recordId: req.params.id }),
    data: asset,
  });
});

exports.deleteAsset = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Checking asset usage before deletion');
  const employeeAsset = await EmployeeAssets.find({Asset: req.params.id});
  if (employeeAsset.length > 0 ) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('assetsManagement.deleteAssetBlocked'),
    });
  }
  if(!employeeAsset){
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) {
    return next(new AppError("Asset not found", 404));
  }
  res.status(204).json({
    status:constants.APIResponseStatus.Success,
 message: req.t('assetsManagement.deleteAssetSuccess', { recordId: req.params.id }),
    data: null,
  });
}
  else{    
    res.status(409).json({
      status: "conflict",
      message: req.t('assetsManagement.deleteAssetConflict'),
    });
  }
});

exports.getAllAssets = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all assets');
  const assets = await Asset.find();
  websocketHandler.sendLog(req, 'All assets retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllAssetsSuccess'),
    data: assets,
  });
});

exports.getAllAssetsByAssetTpe = catchAsync(async (req, res, next) => {  
  websocketHandler.sendLog(req, 'Fetching assets by asset type');
  const assetTypeId = mongoose.Types.ObjectId(req.params.assetType);  
  // Find assets of the specified assetType
  const assets = await Asset.find({ assetType:assetTypeId,company:req.cookies.companyId }).exec();

  websocketHandler.sendLog(req, 'Processing assets with custom attributes');
  const assetsWithCustomAttributes = await Promise.all(
    assets.map(async (asset) => {
      // Find custom attributes for the asset's assetType
      const customAttributes = await CustomAttribute.find({assetType:assetTypeId }).exec();

      // Initialize an array to store custom attributes with values
      const customAttributesWithValues = [];

      // Fetch values for each custom attribute
      for (const customAttribute of customAttributes) {
        // Find the corresponding AssetAttributeValue, if it exists
        const assetAttributeValue = await AssetAttributeValue.findOne({
          assetId: asset._id,
          attributeId: customAttribute._id,
        }).exec();

        // Add the custom attribute with its value (or null if not found)
        customAttributesWithValues.push({
          _id: customAttribute._id,
          attributeName: customAttribute.attributeName,
          assetType: customAttribute.assetType,
          company: customAttribute.company,
          description: customAttribute.description,
          dataType: customAttribute.dataType,
          isRequired: customAttribute.isRequired,
          value: assetAttributeValue ? assetAttributeValue.value : null,
        });
      }

      // Return the asset with custom attributes and values
      return {
        _id: asset._id,
        assetType: asset.assetType,
        company: asset.company,
        assetName: asset.assetName,
        purchaseDate: asset.purchaseDate,
        warrantyExpiry: asset.warrantyExpiry,
        status: asset.status,
        image: asset.image,
        assetTypeDetails: asset.assetTypeDetails,
        customAttributes: customAttributesWithValues,
      };
    })
  );
  websocketHandler.sendLog(req, 'Assets by asset type retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getAllAssetsByAssetTypeSuccess', { assetTypeId: req.params.assetType }),
    data: assetsWithCustomAttributes,
  });
});

exports.getUnassignedAssetsForUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching unassigned assets for user');
  const userId = req.params.userId;

  // Find assets assigned to the given user
  const assignedAssetsForUser = await EmployeeAssets.find({ Employee: userId });

  // Extract asset IDs from the result
  const assignedAssetIds = assignedAssetsForUser.map((item) => item.Asset);

  // Find all assets that are NOT in the list of assigned assets for the user
  const unassignedAssets = await Asset.find({
    _id: { $nin: assignedAssetIds },
    company: req.cookies.companyId,
  });

  websocketHandler.sendLog(req, 'Unassigned assets for user retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getUnassignedAssetsForUserSuccess', { userId }),
    data: unassignedAssets,
  });
});

exports.getUnassignedAssets = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Fetching all unassigned assets');
  const unassignedAssets = await Asset.find({
    _id: { $nin: (await EmployeeAssets.find().distinct('Asset')) },
    company: req.cookies.companyId,
  });

  websocketHandler.sendLog(req, 'All unassigned assets retrieved successfully');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('assetsManagement.getUnassignedAssetsSuccess'),
    data: unassignedAssets,
  });
});