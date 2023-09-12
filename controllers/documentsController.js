const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const moment = require('moment'); 
const { ObjectId } = require('mongoose').Types;

//CompanyPolicyDocument

exports.createCompanyPolicyDocument = catchAsync(async (req, res, next) => {
    const companyPolicyDocument = await CompanyPolicyDocument.create(req.body);
    res.status(201).json({
      status: 'success',
      data: companyPolicyDocument
    });
});

exports.getCompanyPolicyDocument = catchAsync(async (req, res, next) => {
    const companyPolicyDocument = await CompanyPolicyDocument.findById(req.params.id);
    if (!companyPolicyDocument) {
      return next(new AppError('Company Policy Document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: companyPolicyDocument
    });
});

exports.updateCompanyPolicyDocument = catchAsync(async (req, res, next) => {
    const companyPolicyDocument = await CompanyPolicyDocument.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!companyPolicyDocument) {
      return next(new AppError('Company Policy Document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: companyPolicyDocument
    });
});

exports.deleteCompanyPolicyDocument = catchAsync(async (req, res, next) => {
    const companyPolicyDocument = await CompanyPolicyDocument.findByIdAndDelete(req.params.id);
    
    if (!companyPolicyDocument) {
      return next(new AppError('Company Policy Document not found', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
});

exports.getAllCompanyPolicyDocuments = catchAsync(async (req, res, next) => {
    const companyPolicyDocuments = await CompanyPolicyDocument.find();
    res.status(200).json({
      status: 'success',
      data: companyPolicyDocuments
    });
});
