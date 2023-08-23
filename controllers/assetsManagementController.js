const AssetType = require('../models/AssetsManagement/assetTypeModel');
const AssetStatus = require("../models/AssetsManagement/assetStatusModel.js");
const AssetAttributeValue = require('../models/AssetsManagement/assetAttributeValueModel');
const Vendor = require('../models/AssetsManagement/vendorModel');
const VendorAssetsPurchased = require("../models/AssetsManagement/vendorAssetsPurchasedModel");
const CustomAttribute = require("../models/AssetsManagement/CustomAttributeModel");
const Asset = require("../models/AssetsManagement/assetModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addAssetType = catchAsync(async (req, res, next) => {
    const assetType = await AssetType.create(req.body);
    res.status(201).json({
        status: 'success',
        data: assetType
    });
});

exports.getAssetType = catchAsync(async (req, res, next) => {
    const assetType = await AssetType.findById(req.params.id);
    if (!assetType) {
        return next(new AppError('AssetType not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetType
    });
});

exports.updateAssetType = catchAsync(async (req, res, next) => {
    const assetType = await AssetType.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!assetType) {
        return next(new AppError('AssetType not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetType
    });
});

exports.deleteAssetType = catchAsync(async (req, res, next) => {
    const assetType = await AssetType.findByIdAndDelete(req.params.id);
    if (!assetType) {
        return next(new AppError('AssetType not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllAssetTypes = catchAsync(async (req, res, next) => {
    const assetTypes = await AssetType.find();
    res.status(200).json({
        status: 'success',
        data: assetTypes
    });
});

exports.addAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.create(req.body);
    res.status(201).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.deleteAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findByIdAndDelete(req.params.id);
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
    const assetAttributeValues = await AssetAttributeValue.find();
    res.status(200).json({
        status: 'success',
        data: assetAttributeValues
    });
});

exports.createAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.create(req.body);
    res.status(201).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: assetAttributeValue
    });
});

exports.deleteAssetAttributeValue = catchAsync(async (req, res, next) => {
    const assetAttributeValue = await AssetAttributeValue.findByIdAndDelete(req.params.id);
    if (!assetAttributeValue) {
        return next(new AppError('AssetAttributeValue not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
    const assetAttributeValues = await AssetAttributeValue.find();
    res.status(200).json({
        status: 'success',
        data: assetAttributeValues
    });
});

exports.createAssetAttributeValue = catchAsync(async (req, res, next) => {  
  const assetAttributeValue = await AssetAttributeValue.create(req.body);
  res.status(201).json({
    status: 'success',
    data: assetAttributeValue
  });
});

exports.getAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findById(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError('AssetAttributeValue not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: assetAttributeValue
  });
});

exports.updateAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!assetAttributeValue) {
    return next(new AppError('AssetAttributeValue not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: assetAttributeValue
  });
});

exports.deleteAssetAttributeValue = catchAsync(async (req, res, next) => {
  const assetAttributeValue = await AssetAttributeValue.findByIdAndDelete(req.params.id);
  if (!assetAttributeValue) {
    return next(new AppError('AssetAttributeValue not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllAssetAttributeValues = catchAsync(async (req, res, next) => {
  const assetAttributeValues = await AssetAttributeValue.find();
  res.status(200).json({
    status: 'success',
    data: assetAttributeValues
  });
});


exports.createAssetStatus = catchAsync(async (req, res, next) => {  
  const assetStatus = await AssetStatus.create({statusName:req.body.statusName,company:req.cookies.companyId});
  res.status(201).json({
    status: 'success',
    data: assetStatus
  });
});

exports.getAssetStatus = catchAsync(async (req, res, next) => {
    const assetStatus = await AssetStatus.findById(req.params.id);
    if (!assetStatus) {
      return next(new AppError('AssetStatus not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: assetStatus
    });
});

exports.updateAssetStatus = catchAsync(async (req, res, next) => {
    const assetStatus = await AssetStatus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!assetStatus) {
      return next(new AppError('AssetStatus not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: assetStatus
    });
});

exports.deleteAssetStatus = catchAsync(async (req, res, next) => {
    const assetStatus = await AssetStatus.findByIdAndDelete(req.params.id);
    if (!assetStatus) {
      return next(new AppError('AssetStatus not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
});

exports.getAllAssetStatuses = catchAsync(async (req, res, next) => {
    const assetStatuses = await AssetStatus.find({company:req.cookies.companyId});
    res.status(200).json({
      status: 'success',
      data: assetStatuses
    });
});

exports.createCustomAttribute = catchAsync(async (req, res, next) => {
    const customAttribute = await CustomAttribute.create(req.body);
    res.status(201).json({
        status: 'success',
        data: customAttribute
    });
});

exports.getCustomAttribute = catchAsync(async (req, res, next) => {
    const customAttribute = await CustomAttribute.findById(req.params.id);
    if (!customAttribute) {
        return next(new AppError('CustomAttribute not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: customAttribute
    });
});

exports.updateCustomAttribute = catchAsync(async (req, res, next) => {
    const customAttribute = await CustomAttribute.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!customAttribute) {
        return next(new AppError('CustomAttribute not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: customAttribute
    });
});

exports.deleteCustomAttribute = catchAsync(async (req, res, next) => {
    const customAttribute = await CustomAttribute.findByIdAndDelete(req.params.id);

    if (!customAttribute) {
        return next(new AppError('CustomAttribute not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllCustomAttributes = catchAsync(async (req, res, next) => {
    const customAttributes = await CustomAttribute.find();
    res.status(200).json({
        status: 'success',
        data: customAttributes
    });
});

exports.createEmployeeAsset = catchAsync(async (req, res, next) => {
    const employeeAsset = await EmployeeAssets.create(req.body);
    res.status(201).json({
        status: 'success',
        data: employeeAsset
    });
});

exports.getEmployeeAsset = catchAsync(async (req, res, next) => {
    const employeeAsset = await EmployeeAssets.findById(req.params.id);
    if (!employeeAsset) {
        return next(new AppError('EmployeeAsset not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: employeeAsset
    });
});

exports.updateEmployeeAsset = catchAsync(async (req, res, next) => {
    const employeeAsset = await EmployeeAssets.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!employeeAsset) {
        return next(new AppError('EmployeeAsset not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: employeeAsset
    });
});

exports.deleteEmployeeAsset = catchAsync(async (req, res, next) => {
    const employeeAsset = await EmployeeAssets.findByIdAndDelete(req.params.id);

    if (!employeeAsset) {
        return next(new AppError('EmployeeAsset not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllEmployeeAssets = catchAsync(async (req, res, next) => {
    const employeeAssets = await EmployeeAssets.find();
    res.status(200).json({
        status: 'success',
        data: employeeAssets
    });
});



exports.createVendor = catchAsync(async (req, res, next) => {
   
  console.log(req.body);

  const {vendorId,vendorName, email,address,phone } = req.body;

  const vendor = await Vendor.create({
    vendorId,
    vendorName,
    email,
    address,
    phone,
    company:req.cookies.companyId
  });
    res.status(201).json({
        status: 'success',
        data: vendor
    });
});

exports.getVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
        return next(new AppError('Vendor not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: vendor
    });
});

exports.updateVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!vendor) {
        return next(new AppError('Vendor not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: vendor
    });
});

exports.deleteVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
        return next(new AppError('Vendor not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllVendors = catchAsync(async (req, res, next) => {
    const vendors = await Vendor.find();
    res.status(200).json({
        status: 'success',
        data: vendors
    });
});


// controllers/assetsManagementController.js

exports.addVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.create(req.body);
  res.status(201).json({
    status: 'success',
    data: vendorAsset
  });
});

exports.getVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findById(req.params.id);
  if (!vendorAsset) {
    return next(new AppError('VendorAsset not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: vendorAsset
  });
});

exports.updateVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!vendorAsset) {
    return next(new AppError('VendorAsset not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: vendorAsset
  });
});

exports.deleteVendorAsset = catchAsync(async (req, res, next) => {
  const vendorAsset = await VendorAssetsPurchased.findByIdAndDelete(req.params.id);
  if (!vendorAsset) {
    return next(new AppError('VendorAsset not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllVendorAssets = catchAsync(async (req, res, next) => {
  const vendorAssets = await VendorAssetsPurchased.find();
  res.status(200).json({
    status: 'success',
    data: vendorAssets
  });
});

exports.addAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.create(req.body);
  res.status(201).json({
    status: 'success',
    data: asset
  });
});

exports.getAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: asset
  });
});

exports.updateAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: asset
  });
});

exports.deleteAsset = catchAsync(async (req, res, next) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllAssets = catchAsync(async (req, res, next) => {
  const assets = await Asset.find();
  res.status(200).json({
    status: 'success',
    data: assets
  });
});
