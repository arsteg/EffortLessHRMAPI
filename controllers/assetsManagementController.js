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

exports.addAssetType = catchAsync(async (req, res, next) => {
  const response = new AssetType({
    typeName: req.body.typeName,
    description: req.body.description,
    company: req.cookies.companyId,
  });

  response.save((err, savedAssetType) => {
    if (err) return console.error(err);
    console.log(savedAssetType);
  });
  res.status(201).json({
    status: "success",
    data: response,
  });
});

exports.getAssetTypes = catchAsync(async (req, res, next) => {
  const assetTypes = await AssetType.find({
    _id: req.params.id 
  });
  if (!assetTypes) {
    return next(new AppError("AssetType not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: assetTypes,
  });
});

exports.updateAssetType = catchAsync(async (req, res, next) => {
  const assetType = await AssetType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!assetType) {
    return next(new AppError("AssetType not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: assetType,
  });
});

exports.deleteAssetType = catchAsync(async (req, res, next) => {

  // Check if any Asset references the AssetType
  const assetExists = await Asset.findOne({
    assetType: req.params.id,
    company: req.cookies.companyId,
  });
  const customAttributeModel = await  CustomAttributeModel.findOne({
    assetType: req.params.id
  });
  if (assetExists.length > 0 || customAttributeModel.length > 0) {
    return res.status(400).json({
      status: 'failed',
      message: 'AssetType cannot be deleted as it is associated with existing assets',
    });
  }
   // If no assets reference the AssetType, delete all CustomAttributes related to that AssetType
  await CustomAttribute.deleteMany({
    assetType: req.params.id,
    company: req.cookies.companyId,
  });

  // Delete the AssetType

  const assetType = await AssetType.findOneAndDelete({
    _id: req.params.id,
    company: req.cookies.companyId,
  });

  if (!assetType) {
    return next(new AppError("AssetType not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllAssetTypes = catchAsync(async (req, res, next) => {
  const assetTypes = await AssetType.find({ company: req.cookies.companyId });
  const allAssetTypes = await Promise.all(
    assetTypes.map(async (asset) => {
      const assetObj = asset.toObject(); // Convert to plain JS object
      const customAttributes = await CustomAttribute.find({
        assetType: asset.id,
        company: req.cookies.companyId,
      });
      assetObj.customAttributes = customAttributes;
      return assetObj;
    })
  );  
  res.status(200).json({
    status: "success",
    data: allAssetTypes,
  });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status: "success",
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
    status: "success",
    data: assetAttributeValue,
  });
});
exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status: "success",
    data: assetAttributeValues,
  });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(200).json({
    status: "success",
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
    status: "success",
    data: assetAttributeValue,
  });
});

exports.deleteAssetAttributeValuesByAssetId = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.deleteMany({assetId:req.params.assetId});
  if (!assetAttributeValues) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: assetAttributeValues,
  });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status: "success",
    data: assetAttributeValues,
  });
});

exports.createAssetAttributeValue = catchAsync(async (req, res, next) => {  

  // Check if both assetId and attributeId exist
  if (req.body.assetId && req.body.attributeId) {    
    
    const recordExists = await AssetAttributeValue.find({assetId:req.body.assetId, attributeId:req.body.attributeId});    
    
    const { assetId, attributeId, value } = req.body;
    const filter = { assetId, attributeId };
    const update = { value };    

    if(recordExists && recordExists.length>0){
      // Update the existing record based on assetId and attributeId
      
      const assetAttributeValue = await AssetAttributeValue.findOneAndUpdate(
        filter,
        update,
        { new: true } // Update the existing record, don't create a new one
      );

      res.status(200).json({
        status: "success",
        data: assetAttributeValue,
      });

    }
    else{
      const assetAttributeValue = await AssetAttributeValue.findOneAndUpdate(
        filter,
        update,
        { new: true, upsert: true } // Create a new record if it doesn't exist
      );

      res.status(201).json({
        status: "success",
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
    status: "success",
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
    status: "success",
    data: assetAttributeValue,
  });
});

exports.deleteAssetAttributeValue = catchAsync(async (req, res, next) => {
 
  const assetAttributeValue = await AssetAttributeValue.findByIdAndDelete(
    req.params.id
  );
  if (!assetAttributeValue) {
    return next(new AppError("AssetAttributeValue not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status: "success",
    data: assetAttributeValues,
  });
});

exports.createAssetStatus = catchAsync(async (req, res, next) => {
  const assetStatus = await AssetStatus.create({
    statusName: req.body.statusName,
    company: req.cookies.companyId,
  });
  res.status(201).json({
    status: "success",
    data: assetStatus,
  });
});

exports.getAssetStatus = catchAsync(async (req, res, next) => {
  const assetStatus = await AssetStatus.findById(req.params.id);
  if (!assetStatus) {
    return next(new AppError("AssetStatus not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: assetStatus,
  });
});

exports.updateAssetStatus = catchAsync(async (req, res, next) => {
  const assetStatus = await AssetStatus.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assetStatus) {
    return next(new AppError("AssetStatus not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: assetStatus,
  });
});

exports.deleteAssetStatus = catchAsync(async (req, res, next) => {
  const assets = await  Asset.findOne({
    status: req.params.id
  });
  if (assets?.length > 0) {
    return res.status(400).json({
      status: 'failed',
      message: 'Asset Status cannot be deleted as it is associated with existing assets',
    });
  }
  const assetStatus = await AssetStatus.findByIdAndDelete(req.params.id);
  if (!assetStatus) {
    return next(new AppError("AssetStatus not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllAssetStatuses = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  // Fetch all AssetStatuses for the company
  const assetStatuses = await AssetStatus.find({ company: companyId });

   // Check if each AssetStatus is used in any Asset
   const assetStatusesWithDeletableFlag = await Promise.all(
    assetStatuses.map(async (status) => {
      const assetCount = await Asset.countDocuments({ status: status._id });
      return {
        ...status.toObject(), // Convert Mongoose document to plain object
        isDeletable: assetCount === 0, // true if no assets reference this status
      };
    })
  );
  res.status(200).json({
    status: 'success',
    data: assetStatusesWithDeletableFlag,
  });  
});

exports.createCustomAttribute = catchAsync(async (req, res, next) => {
  const customAttribute = await CustomAttribute.create(req.body);
  res.status(201).json({
    status: "success",
    data: customAttribute,
  });
});

exports.getCustomAttribute = catchAsync(async (req, res, next) => {
  const customAttribute = await CustomAttribute.findById(req.params.id);
  if (!customAttribute) {
    return next(new AppError("CustomAttribute not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: customAttribute,
  });
});

exports.updateCustomAttribute = catchAsync(async (req, res, next) => {
  const customAttribute = await CustomAttribute.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!customAttribute) {
    return next(new AppError("CustomAttribute not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: customAttribute,
  });
});

exports.deleteCustomAttribute = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await  AssetAttributeValue.findOne({
    attributeId: req.params.id
  });
  if (assetAttributeValue.length > 0) {
    return res.status(400).json({
      status: 'failed',
      message: 'Asset Attribute Value cannot be deleted as it is in use',
    });
  }
  const customAttribute = await CustomAttribute.findByIdAndDelete(
    req.params.id
  );

  if (!customAttribute) {
    return next(new AppError("CustomAttribute not found", 404));
  }

  res.status(204).json({
    status: "success",
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

    res.status(204).json({
      status: "success",
      data: customAttributes,
    });
  }
);

exports.getAllCustomAttributes = catchAsync(async (req, res, next) => {
  const customAttributes = await CustomAttribute.find();
  res.status(200).json({
    status: "success",
    data: customAttributes,
  });
});

exports.addCustomAttributes = catchAsync(async (req, res, next) => {
  const assetType = await AssetType.findById(req.params.id);
  if (!assetType) {
    return next(new AppError("AssetType not found", 404));
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

  res.status(200).json({
    status: "success",
    data: addedCustomAttributes,
  });
});

exports.getAssetCustomAttributes = catchAsync(async (req, res, next) => {
        
  // Assuming req.body is an array of CustomAttribute objects
  const customAttributes = await CustomAttribute.find({company:req.cookies.companyId,assetType:req.params.id});

  res.status(200).json({
    status: "success",
    data: customAttributes,
  });
});

exports.createEmployeeAsset = catchAsync(async (req, res, next) => {
  const employeeAsset = await EmployeeAssets.create(req.body);
  res.status(201).json({
    status: "success",
    data: employeeAsset,
  });
});

exports.getEmployeeAsset = catchAsync(async (req, res, next) => {
  const employeeAsset = await EmployeeAssets.find({
    employee: req.params.id,
  }).populate("Asset");
  if (!employeeAsset) {
    return next(new AppError("EmployeeAsset not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: employeeAsset,
  });
});

exports.updateEmployeeAsset = catchAsync(async (req, res, next) => {
  const employeeAsset = await EmployeeAssets.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employeeAsset) {
    return next(new AppError("EmployeeAsset not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: employeeAsset,
  });
});

exports.deleteEmployeeAsset = catchAsync(async (req, res, next) => {
  const employeeAsset = await EmployeeAssets.findOneAndDelete({
    Employee: req.params.employeeId,
    Asset: req.params.assetId,
  });
  if (!employeeAsset) {
    return next(new AppError("EmployeeAsset not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllEmployeeAssets = catchAsync(async (req, res, next) => {
  const employeeAssets = await EmployeeAssets.find();
  res.status(200).json({
    status: "success",
    data: employeeAssets,
  });
});

exports.createVendor = catchAsync(async (req, res, next) => {

  const { vendorId, vendorName, email, address, phone } = req.body;

  const vendor = await Vendor.create({
    vendorId,
    vendorName,
    email,
    address,
    phone,
    company: req.cookies.companyId,
  });
  res.status(201).json({
    status: "success",
    data: vendor,
  });
});

exports.getVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendor,
  });
});

exports.updateVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendor,
  });
});

exports.deleteVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllVendors = catchAsync(async (req, res, next) => {
  const vendors = await Vendor.find();
  res.status(200).json({
    status: "success",
    data: vendors,
  });
});

// controllers/assetsManagementController.js

exports.addVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.create(req.body);
  res.status(201).json({
    status: "success",
    data: vendorAsset,
  });
});

exports.getVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findById(req.params.id);
  if (!vendorAsset) {
    return next(new AppError("VendorAsset not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendorAsset,
  });
});

exports.updateVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!vendorAsset) {
    return next(new AppError("VendorAsset not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vendorAsset,
  });
});

exports.deleteVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findByIdAndDelete(
    req.params.id
  );
  if (!vendorAsset) {
    return next(new AppError("VendorAsset not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllVendorAssets = catchAsync(async (req, res, next) => {
  const vendorAssets = await VendorAssetsPurchased.find();
  res.status(200).json({
    status: "success",
    data: vendorAssets,
  });
});

exports.addAsset = catchAsync(async (req, res, next) => {
  req.body.company = req.cookies.companyId;
  const asset = await Asset.create(req.body);
  res.status(201).json({
    status: "success",
    data: asset,
  });
});

exports.getAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return next(new AppError("Asset not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: asset,
  });
});

exports.updateAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!asset) {
    return next(new AppError("Asset not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: asset,
  });
});

exports.deleteAsset = catchAsync(async (req, res, next) => {
  const employeeAsset = await EmployeeAssets.find({Asset: req.params.id});
  if (employeeAsset.length > 0 ) {
    return res.status(400).json({
      status: 'failed',
      message: 'Asset cannot be deleted as it is in use',
    });
  }
  if(!employeeAsset){
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) {
    return next(new AppError("Asset not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
}
  else{    
    res.status(409).json({
      status: "conflict",
      data: 'Selected Asset has the assigned status.',
    });
  }
});

exports.getAllAssets = catchAsync(async (req, res, next) => {
  const assets = await Asset.find();
  res.status(200).json({
    status: "success",
    data: assets,
  });
});

exports.getAllAssetsByAssetTpe = catchAsync(async (req, res, next) => {  
  
  const assetTypeId = mongoose.Types.ObjectId(req.params.assetType);  
  // Find assets of the specified assetType
  const assets = await Asset.find({ assetType:assetTypeId,company:req.cookies.companyId }).exec();

  // Iterate through each asset and fetch custom attributes with their values
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
  res.status(200).json({
    status: "success",
    data: assetsWithCustomAttributes,
  });
});

exports.getUnassignedAssetsForUser = catchAsync(async (req, res, next) => {
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

  res.status(200).json({
    status: "success",
    data: unassignedAssets,
  });
});
