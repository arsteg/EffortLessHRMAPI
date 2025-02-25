const userPreferences = require("../models/userPreferences/userPreferenceModel.js");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/permissions/userModel.js");
const UserPreference = require("../models/userPreferences/userPreferenceModel.js");
const AppError = require("../utils/appError.js");
const express = require("express");
const { findById } = require("../models/item");
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const app = express()
const constants = require('../constants');
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
  
const PreferenceOptions = [{
  "_id": "64df5b339aba07a9e0a775c9",
  "category": "64d5ef2e62f196f103918984",
  "name": "TimeTracker",
  "key": "TimeTracker.EnableBeepSound",
  "label": "Enable Beep Sound",
  "description": "Check to enable the beep sound",
  "dataType": "boolean",
  "defaultValue": "false"  
},
{
  "_id": "64df5b339aba07a9e0a775c1",
  "category": "64d5ef2e62f196f103918984",
  "name": "TimeTracker",
  "key": "TimeTracker.EnableScreenshotPreview",
  "label": "Enable Screenshot Preview ",
  "description": "Check to enable the screenshot preview",
  "dataType": "boolean",
  "defaultValue": "false"  
},
{
  "_id": "64e2ff5839f88b2ba694d42b",
  "category": "64d5ef2e62f196f103918984",
  "name": "BlurScreenshots",
  "key": "TimeTracker.BlurScreenshots",
  "label": "BlurScreenshots",
  "description": "Check to blur the screenshots",
  "dataType": "boolean",
  "defaultValue": "false"  
},
{
  "_id": "64e30e1139f88b2ba694d5da",
  "category": "64d6076dda83fed598e35bc5",
  "name": "DefaultPageSize",
  "key": "TimeTracker.DefaultPageSize",
  "label": "Default Page Size",
  "description": "DefaultPageSize",
  "dataType": "number",
  "defaultValue": "10"  
}
// {
//   "_id": "64e725ebc03b85dd7d296433",
//   "category": "64d6076dda83fed598e35bc5",
//   "name": "Date",
//   "label": "Date",
//   "description": "Date",
//   "dataType": "date",
//   "defaultValue": ""  
// },
// {
//   "_id": "64e71cefc03b85dd7d29642c",
//   "category": "64d6076dda83fed598e35bc5",
//   "name": "List",
//   "label": "List",
//   "description": "List",
//   "dataType": "list",
//   "defaultValue": ""  
// },
// {
//   "_id": "64e82cbd827134927ddd461b",
//   "category": "64d6076dda83fed598e35bc5",
//   "name": "Time",
//   "label": "Time",
//   "description": "Time",
//   "dataType": "Time",
//   "defaultValue": ""  
// }
]
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
  
exports.getPreferenceOption = catchAsync(async (req, res, next) => {
    const preferenceOption = await PreferenceOptions.findById(req.params.id);
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
  
  const userId= req.cookies.userId;
  const categoryId= req.params.categoryId;

  // Find all preference options
  const allPreferenceOptions = PreferenceOptions;

  // Find user preferences matching the given user ID
  const userPreferences = await UserPreference.find({ user: userId });

  // Convert user preferences to a map for easy lookup
  const userPreferencesMap = {};
  const userPreferencesIdMap = {};
  userPreferences.forEach((pref) => {
    userPreferencesMap[pref.preference.toString()] = pref.preferenceValue;
    userPreferencesIdMap[pref.preference.toString()] = pref._id.toString();
  });

  // // Map the results to the desired format
  // const userPreferencesAllCat = allPreferenceOptions.map((option) => ({
  //   preference:option.id,
  //   category: option.category,
  //   name: option.name,
  //   key: option.key,
  //   label: option.label,
  //   description: option.description,
  //   dataType: option.dataType,
  //   preferenceValue: userPreferencesMap[option._id.toString()] || option.defaultValue, // Set to null if not found
  //   Id: userPreferencesIdMap[option._id.toString()] || null, // Set to null if not found
  // }));
  
  // Map the results to the desired format

  console.log("User Preferences Map:", userPreferencesMap);
console.log("User Preferences ID Map:", userPreferencesIdMap);

const userPreferencesAllCat = allPreferenceOptions.map((option) => {
  const optionId = option._id.toString(); // Convert ObjectId to string for consistent comparison
  console.log("Processing optionId:", optionId);  // Debugging log

  return {
      preference: option._id,
      category: option.category,
      name: option.name,
      key: option.key,
      label: option.label,
      description: option.description,
      dataType: option.dataType,
      preferenceValue: userPreferencesMap[optionId] || option.defaultValue, // Set to default if not found
      Id: userPreferencesIdMap[optionId] || null, // Set to null if not found
  };
});

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

exports.getUserPreferenceByKey = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const userId = req.cookies.userId;

  // Find the corresponding PreferenceOption based on the key
  const preferenceOption = PreferenceOptions.find(option => option.key === key);

  if (!preferenceOption) {
    res.status(200).json({
      status: 'failed',
      data: null
    });
  }

  // Find the UserPreference for the current user and the found preferenceOption
  const userPreference = await UserPreference.findOne({
    user: userId,
    preference: preferenceOption._id
  });

  if (!userPreference) {
    res.status(200).json({
      status: 'failed',
      data: null
    });
  }

  // Return the entire UserPreference record or just the preferenceValue
  res.status(200).json({
    status: 'success',
    data: userPreference.preferenceValue || userPreference
  });
});





