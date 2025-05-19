const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const UserPreference = require('../models/userPreferences/userPreferenceModel.js');
const PreferenceOption = require('../models/userPreferences/userPreferenceOptionModel.js');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const path = require('path');
const fs = require('fs').promises;

exports.GetAllUserPreferences = catchAsync(async (req, res, next) => {
  const prefFilePath = path.join(__dirname, '../config/user-preferences.json');

  try {
    const prefData = await fs.readFile(prefFilePath, 'utf8');
    const preferenceStructure = JSON.parse(prefData);

    const updatedStructure = preferenceStructure.map(pref => {
      if (pref.key && pref.key.endsWith('_explicit') && pref.metadata && pref.metadata.id) {
        const translationKey = `userPreferences.${pref.metadata.id}`;
        return {
          ...pref,
          metadata: {
            ...pref.metadata,
            label: req.t(`${translationKey}`) || pref.metadata.id,
            placeholder: req.t(`${translationKey}`) || pref.metadata.id
          }
        };
      }
      return pref;
    });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('userPreferences.getAllSuccess') || 'User preferences retrieved successfully',
      data: updatedStructure
    });
  } catch (err) {
    // Pass error to global error handler
    next(err);
  }
});

exports.createOrUpdatePreference = catchAsync(async (req, res, next) => {
    websocketHandler.sendLog(req, 'Creating or updating preference', constants.LOG_TYPES.TRACE);
  
    const { userId, preferenceKey, preferenceValue } = req.body;
  
    if (!userId || !preferenceKey || !preferenceValue) {
      websocketHandler.sendLog(req, 'Missing required fields', constants.LOG_TYPES.WARN);
      return next(new AppError('userId, preferenceKey, and preferenceValue are required', 400));
    }
  
    // Find an existing PreferenceOption with the given preferenceKey and preferenceValue
    let preferenceOption = await PreferenceOption.findOne({
      preferenceKey,
      preferenceValue
    });
  
    // If no PreferenceOption exists, create a new one
    if (!preferenceOption) {
      preferenceOption = await PreferenceOption.create({
        preferenceKey,
        preferenceValue,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      websocketHandler.sendLog(
        req,
        `Created new preference option: ${preferenceKey}=${preferenceValue}`,
        constants.LOG_TYPES.INFO
      );
    }
  
    // Find an existing UserPreference for the userId and preferenceKey
    const existingUserPreference = await UserPreference.findOne({
      userId,
      preferenceOptionId: {
        $in: (await PreferenceOption.find({ preferenceKey })).map(opt => opt._id)
      }
    });
  
    let userPreference;
  
    if (existingUserPreference) {
      // Update the existing UserPreference with the new preferenceOptionId
      existingUserPreference.preferenceOptionId = preferenceOption._id;
      existingUserPreference.updatedAt = new Date();
      await existingUserPreference.save();
      userPreference = existingUserPreference;
      websocketHandler.sendLog(
        req,
        `Updated preference for user ${userId}: ${preferenceKey}=${preferenceValue}`,
        constants.LOG_TYPES.INFO
      );
    } else {
      // Create a new UserPreference
      userPreference = await UserPreference.create({
        userId,
        preferenceOptionId: preferenceOption._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      websocketHandler.sendLog(
        req,
        `Created preference for user ${userId}: ${preferenceKey}=${preferenceValue}`,
        constants.LOG_TYPES.INFO
      );
    }
  
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: 'Preference created or updated successfully',
      data: { userPreference }
    });
  });

exports.getPreferenceByKey = catchAsync(async (req, res, next) => {
  const { preferenceKey } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Step 1: Find all preference options for the key
  const preferenceOptions = await PreferenceOption.find({ preferenceKey });

  if (!preferenceOptions.length) {
    return next(new AppError('No preferences found for this key', 404));
  }

  const preferenceOptionIds = preferenceOptions.map(opt => opt._id);

  // Step 2: Find user preferences for the given user and option IDs
  const userPreferences = await UserPreference.find({
    userId,
    preferenceOptionId: { $in: preferenceOptionIds }
  }).populate('preferenceOptionId');

  if (!userPreferences.length) {
    return next(new AppError('No preferences found for this user and key', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: 'Preferences retrieved successfully',
    data: { preferences: userPreferences }
  });
});

exports.getPreferencesByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const preferences = await UserPreference.find({ userId }).populate('preferenceOptionId');

  if (!preferences.length) {
    return next(new AppError('No preferences found for this user', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: 'User preferences retrieved successfully',
    data: { preferences }
  });
});

exports.deletePreferencesByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const result = await UserPreference.deleteMany({ userId });

  if (result.deletedCount === 0) {
    return next(new AppError('No preferences found for this user', 404));
  }

  websocketHandler.sendLog(
    req,
    `Deleted preferences for user ${userId}`,
    constants.LOG_TYPES.INFO
  );

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: 'User preferences deleted successfully'
  });
});

exports.deletePreferencesByKey = catchAsync(async (req, res, next) => {
  const { preferenceKey } = req.params;
  const { userId } = req.query; // or req.body based on how you're sending it

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Step 1: Get preference options by key
  const preferenceOptions = await PreferenceOption.find({ preferenceKey });

  if (!preferenceOptions.length) {
    return next(new AppError('No preferences found for this key', 404));
  }

  const preferenceOptionIds = preferenceOptions.map(opt => opt._id);

  // Step 2: Delete user preferences for this user and preference key
  const result = await UserPreference.deleteMany({
    userId,
    preferenceOptionId: { $in: preferenceOptionIds }
  });

  // Step 3: Optionally delete orphaned preference options (if no users reference them anymore)
  const remainingUsage = await UserPreference.find({
    preferenceOptionId: { $in: preferenceOptionIds }
  });

  if (!remainingUsage.length) {
    await PreferenceOption.deleteMany({ _id: { $in: preferenceOptionIds } });
  }

  websocketHandler.sendLog(
    req,
    `Deleted preferences for user ${userId} and key ${preferenceKey}`,
    constants.LOG_TYPES.INFO
  );

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: 'User preferences deleted successfully',
    deletedCount: result.deletedCount
  });
});
