const productivity = require("../models/productivityModel");
const catchAsync = require("../utils/catchAsync");
const { v1: uuidv1 } = require("uuid");
const UserLocation = require("../models/Settings/userLocation");
const AppError = require("../utils/appError");
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

exports.addProductivity = catchAsync(async (req, res, next) => {
  const newProductivity = await productivity.create({
    icon: req.body.icon,
    key: req.body.key,
    name: req.body.name,
    isProductive: req.body.isProductive,
    company: req.cookies.companyId,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
  });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: newProductivity,
  });
});

exports.updateProductivity = catchAsync(async (req, res, next) => {
  const result = await productivity.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true, // Validate data
  });
  if (!result) {
    return next(new AppError(req.t('settings.productivityNotFound'), 404)
  );
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: {
      data: result,
    },
  });
});

exports.get = catchAsync(async (req, res, next) => {
  const result = await productivity.find({ id: req.params.id });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: result,
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const result = await productivity
    .find()
    .where("company")
    .equals(req.cookies.companyId);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: result,
  });
});

exports.deleteProductivity = catchAsync(async (req, res, next) => {
  const result = await productivity.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: result,
  });
});

exports.saveUserLocation = async (req, res) => {
  try {
      const {user,coordinates, address } = req.body;
      const companyId = req.cookies.companyId;
      if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ message: req.t('settings.invalidInputData')
          });
      }

      const result = await UserLocation.updateOne(
        { user: user, company: companyId }, // Filter criteria
        { 
            $set: { 
                location: { type: "Point", coordinates }, 
                address 
            } 
        },
        { upsert: true } // Insert if no record exists
    );

    if (result.modifiedCount > 0) {
        return res.status(200).json( {  
          status: constants.APIResponseStatus.Success,
          data: "", 
          message: req.t('settings.locationUpdatedSuccessfully') });
    } else if (result.upsertedCount > 0) {
        return res.status(201).json({ 
          status: constants.APIResponseStatus.Success,
          data: "", 
          message: req.t('settings.locationAddedSuccessfully') });
    } else {
        return res.status(200).json({ 
          status: constants.APIResponseStatus.Failure,
          data: "",
           message: req.t('settings.noChangesMade') });
    }
   
  } catch (error) {
      res.status(500).json({ status:constants.APIResponseStatus.Failure, message: req.t('settings.internalServerError')
        , error: error.message });
  }  
};

exports.getUserLocations = async (req, res) => {
  try {
      const { user, radius = 1000 } = req.query;
      let filter = {};

      if (user) filter.user = user;
      //filter.company = req.cookies.companyId;
      
      const locations = await UserLocation.find(filter);
      
      //res.status(200).json({ data: locations });
      
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: locations,
      });
  } catch (error) {
      res.status(500).json({ message: req.t('settings.internalServerError')

        , error: error.message });
  }
};

exports.getAllUserLocations = async (req, res) => {
  try {
    const { radius = 1000 } = req.query;
    const companyId = req.cookies.companyId; // Get company ID from cookies
    
    if (!companyId) {
      return res.status(400).json({ message: req.t('settings.companyIdRequired')

      });
    }

    // Filter by company
    const filter = { company: companyId };

    // Fetch all user locations for the specified company
    const locations = await UserLocation.find(filter);

    // Return the locations
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({ message: req.t('settings.internalServerError')

      , error: error.message });
  }
};

exports.deleteUserLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user location
    const deletedLocation = await UserLocation.findOneAndDelete({ user: userId });

    // If no location is found, return a 404 error
    if (!deletedLocation) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Error,
        message:req.t('settings.userLocationNotFound')

        ,
      });
    }

    // Return success response
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('settings.LocationDeletedSuccessfully'),
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('settings.internalServerError') ,
      error: error.message,
    });
  }
};
exports.updateUserLocation = async (req, res) => {
  try {
      const { userId } = req.params;
      const { coordinates, address } = req.body;
      const companyId = req.cookies.companyId;

      if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ message: req.t('settings.invalidInputData')

          });
      }

      const result = await UserLocation.updateOne(
          { user: userId, company: companyId }, // Filter criteria
          { 
              $set: { 
                  location: { type: "Point", coordinates }, 
                  address 
              } 
          },
          { upsert: true } // Insert if no record exists
      );

      if (result.modifiedCount > 0) {
          return res.status(200).json( {  
            status: constants.APIResponseStatus.Success,
            data: "", 
            message: req.t('settings.locationUpdatedSuccessfully') });
      } else if (result.upsertedCount > 0) {
          return res.status(201).json({ 
            status: constants.APIResponseStatus.Success,
            data: "", 
            message: req.t('settings.locationAddedSuccessfully') });
      } else {
          return res.status(200).json({ 
            status: constants.APIResponseStatus.Failure,
            data: "",
             message: req.t('settings.noChangesMade') });
      }
  } catch (error) {
      res.status(500).json({ message:req.t('settings.internalServerError')

        , error: error.message });
  }
};
