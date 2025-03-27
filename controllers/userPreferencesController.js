const userPreferences = require("../models/userPreferences/userPreferenceModel.js");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/permissions/userModel.js");
const UserPreference = require("../models/userPreferences/userPreferenceModel.js");
const AppError = require("../utils/appError.js");
const express = require("express");
const { findById } = require("../models/item");
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const app = express();
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');
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
}];

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
}];

// controllers/preferenceCategoryController.js
exports.getPreferenceCategory = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getPreferenceCategory request', constants.LOG_TYPES.TRACE);
    const name = req.params.name;
    websocketHandler.sendLog(req, `Searching for preference category with name: ${name}`, constants.LOG_TYPES.DEBUG);
    
    const preferenceCategory = preferenceCategories.find(category => category.name === name);
    if (!preferenceCategory) {
        websocketHandler.sendLog(req, `Preference category '${name}' not found`, constants.LOG_TYPES.WARN);
        return next(new AppError('Preference category not found', 404));
    }
    
    websocketHandler.sendLog(req, `Successfully retrieved preference category: ${name}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: preferenceCategory
    });
});

exports.getAllPreferenceCategories = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getAllPreferenceCategories request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Returning ${preferenceCategories.length} preference categories`, constants.LOG_TYPES.INFO);
    
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: preferenceCategories
    });
});

exports.getPreferenceOption = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getPreferenceOption request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Searching for preference option with ID: ${req.params.id}`, constants.LOG_TYPES.DEBUG);
    
    const preferenceOption = PreferenceOptions.find(option => option._id === req.params.id);
    if (!preferenceOption) {
        websocketHandler.sendLog(req, `Preference option with ID ${req.params.id} not found`, constants.LOG_TYPES.WARN);
        return next(new AppError('Preference option not found', 404));
    }
    
    websocketHandler.sendLog(req, `Successfully retrieved preference option: ${preferenceOption.name}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: preferenceOption
    });
});

exports.getPreferenceOptionByCategory = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getPreferenceOptionByCategory request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Searching for preference options in category: ${req.params.categoryId}`, constants.LOG_TYPES.DEBUG);
    
    const preferenceOption = PreferenceOptions.filter(option => option.category === req.params.categoryId);
    if (!preferenceOption.length) {
        websocketHandler.sendLog(req, `No preference options found for category ${req.params.categoryId}`, constants.LOG_TYPES.WARN);
        return next(new AppError('Preference option not found', 404));
    }
    
    websocketHandler.sendLog(req, `Found ${preferenceOption.length} preference options for category ${req.params.categoryId}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: preferenceOption
    });
});

// controllers/userPreferencesController.js
exports.getAllPreferenceOptions = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getAllPreferenceOptions request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Returning ${PreferenceOptions.length} preference options`, constants.LOG_TYPES.INFO);
    
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: PreferenceOptions
    });
});

exports.createUserPreference = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting createUserPreference request', constants.LOG_TYPES.TRACE);
    const { user, preference } = req.body;
    let userPreference = {};
    
    websocketHandler.sendLog(req, `Processing preference creation for user: ${user}, preference: ${preference}`, constants.LOG_TYPES.DEBUG);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        websocketHandler.sendLog(req, `Checking if preference exists for user: ${user}`, constants.LOG_TYPES.DEBUG);
        let userPreferenceExists = await UserPreference.findOne({ user, preference });
        
        if (userPreferenceExists) {
            websocketHandler.sendLog(req, `Preference already exists for user ${user}`, constants.LOG_TYPES.WARN);
            return next(new AppError('given preference already exists', 400));
        }
        
        userPreference = new UserPreference(req.body);
        userPreference.set(req.body);
        await userPreference.save();
        websocketHandler.sendLog(req, `Created new user preference with ID: ${userPreference._id}`, constants.LOG_TYPES.INFO);
    } else {
        userPreference = await UserPreference.findById(req.params.id);
        if (!userPreference) {
            websocketHandler.sendLog(req, `No existing preference found, creating new one`, constants.LOG_TYPES.DEBUG);
            userPreference = new UserPreference(req.body);
        } else {
            websocketHandler.sendLog(req, `Updating existing preference with ID: ${req.params.id}`, constants.LOG_TYPES.DEBUG);
            userPreference.set(req.body);
        }
        await userPreference.save();
        websocketHandler.sendLog(req, `Successfully saved user preference with ID: ${userPreference._id}`, constants.LOG_TYPES.INFO);
    }

    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userPreference
    });
});

exports.getUserPreference = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getUserPreference request', constants.LOG_TYPES.TRACE);
    const userId = req.cookies.userId;
    const categoryId = req.params.categoryId;
    
    websocketHandler.sendLog(req, `Fetching preferences for user: ${userId}, category: ${categoryId}`, constants.LOG_TYPES.DEBUG);
    
    const allPreferenceOptions = PreferenceOptions;
    const userPreferences = await UserPreference.find({ user: userId });
    
    websocketHandler.sendLog(req, `Found ${userPreferences.length} preferences for user ${userId}`, constants.LOG_TYPES.INFO);
    
    const userPreferencesMap = {};
    const userPreferencesIdMap = {};
    userPreferences.forEach((pref) => {
        userPreferencesMap[pref.preference.toString()] = pref.preferenceValue;
        userPreferencesIdMap[pref.preference.toString()] = pref._id.toString();
    });

    const userPreferencesAllCat = allPreferenceOptions.map((option) => {
        const optionId = option._id.toString();
        return {
            preference: option._id,
            category: option.category,
            name: option.name,
            key: option.key,
            label: option.label,
            description: option.description,
            dataType: option.dataType,
            preferenceValue: userPreferencesMap[optionId] || option.defaultValue,
            Id: userPreferencesIdMap[optionId] || null
        };
    });

    const result = userPreferencesAllCat.filter((r) => r.category == categoryId);
    websocketHandler.sendLog(req, `Returning ${result.length} preferences for category ${categoryId}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: result
    });
});

exports.updateUserPreference = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting updateUserPreference request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Attempting to update preference with ID: ${req.params.id}`, constants.LOG_TYPES.DEBUG);
    
    const userPreference = await UserPreference.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!userPreference) {
        websocketHandler.sendLog(req, `User preference with ID ${req.params.id} not found`, constants.LOG_TYPES.WARN);
        return next(new AppError('User preference not found', 404));
    }

    websocketHandler.sendLog(req, `Successfully updated user preference with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userPreference
    });
});

exports.deleteUserPreference = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting deleteUserPreference request', constants.LOG_TYPES.TRACE);
    websocketHandler.sendLog(req, `Attempting to delete preference with ID: ${req.params.id}`, constants.LOG_TYPES.DEBUG);
    
    const userPreference = await UserPreference.findByIdAndDelete(req.params.id);
    
    if (!userPreference) {
        websocketHandler.sendLog(req, `User preference with ID ${req.params.id} not found`, constants.LOG_TYPES.WARN);
        return next(new AppError('User preference not found', 404));
    }
    
    websocketHandler.sendLog(req, `Successfully deleted user preference with ID: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
    });
});

exports.getAllUserPreferences = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getAllUserPreferences request', constants.LOG_TYPES.TRACE);
    const userPreferences = await UserPreference.find();
    
    websocketHandler.sendLog(req, `Returning ${userPreferences.length} user preferences`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userPreferences
    });
});

exports.getUserPreferenceByKey = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Starting getUserPreferenceByKey request', constants.LOG_TYPES.TRACE);
    const { key } = req.params;
    const userId = req.cookies.userId;
    
    websocketHandler.sendLog(req, `Searching preference for user ${userId} with key: ${key}`, constants.LOG_TYPES.DEBUG);
    
    const preferenceOption = PreferenceOptions.find(option => option.key === key);
    if (!preferenceOption) {
        websocketHandler.sendLog(req, `No preference option found for key: ${key}`, constants.LOG_TYPES.WARN);
        res.status(200).json({
            status: constants.APIResponseStatus.Failure,
            data: null
        });
        return;
    }

    const userPreference = await UserPreference.findOne({
        user: userId,
        preference: preferenceOption._id
    });

    if (!userPreference) {
        websocketHandler.sendLog(req, `No user preference found for user ${userId} and key ${key}`, constants.LOG_TYPES.INFO);
        res.status(200).json({
            status: constants.APIResponseStatus.Failure,
            data: null
        });
        return;
    }

    websocketHandler.sendLog(req, `Successfully retrieved preference value for key: ${key}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userPreference.preferenceValue || userPreference
    });
});