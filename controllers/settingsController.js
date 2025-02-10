const productivity = require("../models/productivityModel");
const catchAsync = require("../utils/catchAsync");
const { v1: uuidv1 } = require("uuid");
const UserLocation = require("../models/Settings/userLocation");
const AppError = require("../utils/appError");

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
    status: "success",
    data: newProductivity,
  });
});

exports.updateProductivity = catchAsync(async (req, res, next) => {
  const result = await productivity.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true, // Validate data
  });
  if (!result) {
    return next(new AppError("No productivity found with that ID", 404));
  }
  res.status(201).json({
    status: "success",
    data: {
      data: result,
    },
  });
});

exports.get = catchAsync(async (req, res, next) => {
  const result = await productivity.find({ id: req.params.id });
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const result = await productivity
    .find()
    .where("company")
    .equals(req.cookies.companyId);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.deleteProductivity = catchAsync(async (req, res, next) => {
  const result = await productivity.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: result,
  });
});

exports.saveUserLocation = async (req, res) => {
  try {
      const {user,coordinates, address } = req.body;
      const companyId = req.cookies.companyId;
      if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ message: "Invalid input data" });
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
          status: "success",
          data: "", 
          message: "Location updated successfully" });
    } else if (result.upsertedCount > 0) {
        return res.status(201).json({ 
          status: "success",
          data: "", 
          message: "Location added successfully" });
    } else {
        return res.status(200).json({ 
          status: "failed",
          data: "",
           message: "No changes made" });
    }
   
  } catch (error) {
      res.status(500).json({ status:'failed', message: "Internal Server Error", error: error.message });
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
        status: "success",
        data: locations,
      });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.updateUserLocation = async (req, res) => {
  try {
      const { userId } = req.params;
      const { coordinates, address } = req.body;
      const companyId = req.cookies.companyId;

      if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ message: "Invalid input data" });
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
            status: "success",
            data: "", 
            message: "Location updated successfully" });
      } else if (result.upsertedCount > 0) {
          return res.status(201).json({ 
            status: "success",
            data: "", 
            message: "Location added successfully" });
      } else {
          return res.status(200).json({ 
            status: "failed",
            data: "",
             message: "No changes made" });
      }
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
