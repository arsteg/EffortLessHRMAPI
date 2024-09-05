const userPreferences = require("../models/userPreferences/userPreferenceModel.js");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/permissions/userModel.js");
const PreferenceOption = require("../models/userPreferences/preferenceOptionModel.js");
const UserPreference = require("../models/userPreferences/userPreferenceModel.js");
const AppError = require("../utils/appError.js");
const express = require("express");
const { findById } = require("../models/item");
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const app = express()
app.use(express.json);

const preferenceCategories = [{
  "_id": "64d5ef2e62f196f103918984",
  "name": "TimeTracker",
  "description": "Time Tracker"  
},
{
  "_id": "64d6076dda83fed598e35bc5",
  "name": "Dashboard",
  "description": "Dashboard"  
},
{
  "_id": "64e7133886c0652b1eda0e2b",
  "name": "Manage",
  "description": "Manage"  
}]
  
// controllers/preferenceCategoryController.js
exports.getPreferenceCategory = catchAsync(async (req, res, next) => {
    const preferenceCategory = preferenceCategories.find(category => category.name === name);;
    if (!preferenceCategory) {
      return next(new AppError('Preference category not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: preferenceCategory
    });
  });


exports.getAllPreferenceCategories = catchAsync(async (req, res, next) => {
    
    res.status(200).json({
      status: 'success',
      data: preferenceCategories
    });
  });

  // controllers/userPreferencesController.js
exports.createPreferenceOption = catchAsync(async (req, res, next) => {
    const preferenceOption = await PreferenceOption.create(req.body);
    res.status(201).json({
      status: 'success',
      data: preferenceOption
    });
  });

  
exports.getPreferenceOption = catchAsync(async (req, res, next) => {
    const preferenceOption = await PreferenceOption.findById(req.params.id);
    if (!preferenceOption) {
      return next(new AppError('Preference option not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: preferenceOption
    });
  });

  exports.getPreferenceOptionByCategory = catchAsync(async (req, res, next) => {
    
    const preferenceOption = await PreferenceOption.find({category:mongoose.Types.ObjectId(req.params.categoryId)});
    if (!preferenceOption) {
      return next(new AppError('Preference option not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: preferenceOption
    });
  });




  // controllers/userPreferencesController.js
exports.updatePreferenceOption = catchAsync(async (req, res, next) => {
    const preferenceOption = await PreferenceOption.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    if (!preferenceOption) {
      return next(new AppError('Preference option not found', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: preferenceOption
    });
  });

  // controllers/userPreferencesController.js
exports.deletePreferenceOption = catchAsync(async (req, res, next) => {
    const preferenceOption = await PreferenceOption.findByIdAndDelete(req.params.id);
    
    if (!preferenceOption) {
      return next(new AppError('Preference option not found', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  // controllers/userPreferencesController.js
exports.getAllPreferenceOptions = catchAsync(async (req, res, next) => {
    const preferenceOptions = await PreferenceOption.find();
    res.status(200).json({
      status: 'success',
      data: preferenceOptions
    });
  });

  // controllers/userPreferencesController.js
exports.createUserPreference = catchAsync(async (req, res, next) => {  
  const { user, preference } = req.body;  
  let userPreference={};
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
  {
    let userPreferenceExists = await UserPreference.findOne({ user, preference });
  if(userPreferenceExists){
    return next(new AppError('given preference already exists', 400));
  }  
    userPreference = new UserPreference(req.body);
    userPreference.set(req.body);
    await userPreference.save();
  }
  else{
    userPreference = await UserPreference.findById(req.params.id);
    if (!userPreference) {
      // If userPreference doesn't exist, create a new one
      userPreference = new UserPreference(req.body);
    } else {
      // If userPreference exists, update it with the new data
      userPreference.set(req.body);
    }
    await userPreference.save();
  }  

  res.status(200).json({
    status: 'success',
    data: userPreference
  });
});

// controllers/userPreferencesController.js
exports.getUserPreference = catchAsync(async (req, res, next) => {
  
  const userId= req.params.userId;
  const categoryId= req.params.categoryId;

  // Find all preference options
  const allPreferenceOptions = await PreferenceOption.find();

  // Find user preferences matching the given user ID
  const userPreferences = await UserPreference.find({ user: userId });

  // Convert user preferences to a map for easy lookup
  const userPreferencesMap = {};
  const userPreferencesIdMap = {};
  userPreferences.forEach((pref) => {
    userPreferencesMap[pref.preference.toString()] = pref.preferenceValue;
    userPreferencesIdMap[pref.preference.toString()] = pref._id.toString();
  });

  // Map the results to the desired format
  const userPreferencesAllCat = allPreferenceOptions.map((option) => ({
    preference:option.id,
    category: option.category,
    name: option.name,
    label: option.label,
    description: option.description,
    dataType: option.dataType,
    preferenceValue: userPreferencesMap[option._id.toString()] || option.defaultValue, // Set to null if not found
    Id: userPreferencesIdMap[option._id.toString()] || null, // Set to null if not found
  }));
  
  const result = userPreferencesAllCat.filter((r)=>r.category==categoryId);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// controllers/userPreferencesController.js
exports.updateUserPreference = catchAsync(async (req, res, next) => {
  const userPreference = await UserPreference.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!userPreference) {
    return next(new AppError('User preference not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: userPreference
  });
});

// controllers/userPreferencesController.js
exports.deleteUserPreference = catchAsync(async (req, res, next) => {
  const userPreference = await UserPreference.findByIdAndDelete(req.params.id);
  
  if (!userPreference) {
    return next(new AppError('User preference not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// controllers/userPreferencesController.js
exports.getAllUserPreferences = catchAsync(async (req, res, next) => {
  const userPreferences = await UserPreference.find();
  res.status(200).json({
    status: 'success',
    data: userPreferences
  });
});


