const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const moment = require('moment'); 
const { ObjectId } = require('mongoose').Types;
const CompanyPolicyDocument = require(`../models/documents/companyPolicyDocument`);
const CompanyPolicyDocumentAppliesTo = require(`../models/documents/companyPolicyDocumentAppliesTo`);
const CompanyPolicyDocumentUser = require(`../models/documents/companyPolicyDocumentUser`);
const DocumentAppliedTo = require(`../models/documents/documentAppliedTo`);
const DocumentCategory =  require(`../models/documents/documentCategory`);
const DocumentUsers = require(`../models/documents/documentUsers`);
const Template = require(`../models/documents/template`);
const UserDocuments = require(`../models/documents/userDocuments`);
const Document = require(`../models/documents/document`);
//CompanyPolicyDocument

exports.createCompanyPolicyDocument = catchAsync(async (req, res, next) => {  
  req.body.company = req.cookies.companyId;
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


exports.createCompanyPolicyDocumentAppliesTo = catchAsync(async (req, res, next) => {
  const newEntry = await CompanyPolicyDocumentAppliesTo.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newEntry
  });
});

exports.getCompanyPolicyDocumentAppliesTo = catchAsync(async (req, res, next) => {
  const entry = await CompanyPolicyDocumentAppliesTo.findById(req.params.id);
  if (!entry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: entry
  });
});

exports.updateCompanyPolicyDocumentAppliesTo = catchAsync(async (req, res, next) => {
  const updatedEntry = await CompanyPolicyDocumentAppliesTo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedEntry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedEntry
  });
});

exports.deleteCompanyPolicyDocumentAppliesTo = catchAsync(async (req, res, next) => {
  const entry = await CompanyPolicyDocumentAppliesTo.findByIdAndDelete(req.params.id);
  if (!entry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllCompanyPolicyDocumentAppliesTo = catchAsync(async (req, res, next) => {
  const entries = await CompanyPolicyDocumentAppliesTo.find();
  res.status(200).json({
    status: 'success',
    data: entries
  });
});

exports.createCompanyPolicyDocumentUser = catchAsync(async (req, res, next) => {
  const newEntry = await CompanyPolicyDocumentUser.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newEntry
  });
});

exports.getCompanyPolicyDocumentUser = catchAsync(async (req, res, next) => {
  const entry = await CompanyPolicyDocumentUser.findById(req.params.id).populate('user').populate('companyPolicyDocument');
  if (!entry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: entry
  });
});

exports.updateCompanyPolicyDocumentUser = catchAsync(async (req, res, next) => {
  const updatedEntry = await CompanyPolicyDocumentUser.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedEntry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedEntry
  });
});

exports.deleteCompanyPolicyDocumentUser = catchAsync(async (req, res, next) => {
  const entry = await CompanyPolicyDocumentUser.findByIdAndDelete(req.params.id);
  if (!entry) {
    return next(new AppError('No entry found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllCompanyPolicyDocumentUser = catchAsync(async (req, res, next) => {
  const entries = await CompanyPolicyDocumentUser.find().populate('user').populate('companyPolicyDocument');
  res.status(200).json({
    status: 'success',
    data: entries
  });
});

exports.createDocument = catchAsync(async (req, res, next) => {  
  const document = await Document.create(req.body);
  res.status(201).json({
    status: 'success',
    data: document
  });
});

exports.getDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: document
  });
});

exports.updateDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: document
  });
});

exports.deleteDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllDocuments = catchAsync(async (req, res, next) => {
  const documents = await Document.find();
  res.status(200).json({
    status: 'success',
    data: documents
  });
});

exports.createDocumentAppliedTo = catchAsync(async (req, res, next) => {
  const docApplied = await DocumentAppliedTo.create(req.body);
  res.status(201).json({
      status: 'success',
      data: docApplied
  });
});

exports.getDocumentAppliedTo = catchAsync(async (req, res, next) => {
  const docApplied = await DocumentAppliedTo.findById(req.params.id);
  if (!docApplied) {
      return next(new AppError('No DocumentAppliedTo found with that ID', 404));
  }
  res.status(200).json({
      status: 'success',
      data: docApplied
  });
});

exports.updateDocumentAppliedTo = catchAsync(async (req, res, next) => {
  const updatedDocApplied = await DocumentAppliedTo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });

  if (!updatedDocApplied) {
      return next(new AppError('No DocumentAppliedTo found with that ID', 404));
  }

  res.status(200).json({
      status: 'success',
      data: updatedDocApplied
  });
});

exports.deleteDocumentAppliedTo = catchAsync(async (req, res, next) => {
  const docApplied = await DocumentAppliedTo.findByIdAndDelete(req.params.id);
  if (!docApplied) {
      return next(new AppError('No DocumentAppliedTo found with that ID', 404));
  }

  res.status(204).json({
      status: 'success',
      data: null
  });
});

exports.getAllDocumentAppliedTo = catchAsync(async (req, res, next) => {
  const docAppliedList = await DocumentAppliedTo.find();
  res.status(200).json({
      status: 'success',
      data: docAppliedList
  });
});

exports.addDocumentCategory = catchAsync(async (req, res, next) => {
  const documentCategory = await DocumentCategory.create(req.body);
  res.status(201).json({
      status: 'success',
      data: documentCategory
  });
});

exports.getDocumentCategory = catchAsync(async (req, res, next) => {
  const documentCategory = await DocumentCategory.findById(req.params.id);
  if (!documentCategory) {
      return next(new AppError('Document category not found', 404));
  }
  res.status(200).json({
      status: 'success',
      data: documentCategory
  });
});

exports.updateDocumentCategory = catchAsync(async (req, res, next) => {
  const documentCategory = await DocumentCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });

  if (!documentCategory) {
      return next(new AppError('Document category not found', 404));
  }

  res.status(200).json({
      status: 'success',
      data: documentCategory
  });
});

exports.deleteDocumentCategory = catchAsync(async (req, res, next) => {
  const documentCategory = await DocumentCategory.findByIdAndDelete(req.params.id);
  
  if (!documentCategory) {
      return next(new AppError('Document category not found', 404));
  }

  res.status(204).json({
      status: 'success',
      data: null
  });
});

exports.getAllDocumentCategories = catchAsync(async (req, res, next) => {
  const documentCategories = await DocumentCategory.find();
  res.status(200).json({
      status: 'success',
      data: documentCategories
  });
});

exports.createDocumentUser = catchAsync(async (req, res, next) => {
  const documentUser = await DocumentUsers.create(req.body);
  res.status(201).json({
    status: 'success',
    data: documentUser
  });
});

exports.getDocumentUser = catchAsync(async (req, res, next) => {
  const documentUser = await DocumentUsers.findById(req.params.id);
  if (!documentUser) {
    return next(new AppError('DocumentUsers not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: documentUser
  });
});

exports.updateDocumentUser = catchAsync(async (req, res, next) => {
  const documentUser = await DocumentUsers.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!documentUser) {
    return next(new AppError('DocumentUsers not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: documentUser
  });
});

exports.deleteDocumentUser = catchAsync(async (req, res, next) => {
  const documentUser = await DocumentUsers.findByIdAndDelete(req.params.id);
  if (!documentUser) {
    return next(new AppError('DocumentUsers not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllDocumentUsers = catchAsync(async (req, res, next) => {
  const documentUsers = await DocumentUsers.find();
  res.status(200).json({
    status: 'success',
    data: documentUsers
  });
});

exports.addTemplate = catchAsync(async (req, res, next) => {
  req.body.company = req.cookies.companyId;
  console.log(req.body);
  const template = await Template.create(req.body);
  res.status(201).json({
      status: 'success',
      data: template
  });
});

exports.getTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.findById(req.params.id);
  if (!template) {
      return next(new AppError('No Template found with that ID', 404));
  }
  res.status(200).json({
      status: 'success',
      data: template
  });
});

exports.updateTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  if (!template) {
      return next(new AppError('No Template found with that ID', 404));
  }
  res.status(200).json({
      status: 'success',
      data: template
  });
});

exports.deleteTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.findByIdAndDelete(req.params.id);
  if (!template) {
      return next(new AppError('No Template found with that ID', 404));
  }
  res.status(204).json({
      status: 'success',
      data: null
  });
});

exports.getAllTemplates = catchAsync(async (req, res, next) => {
  const allTemplates = await Template.find({company : req.cookies.companyId});
  res.status(200).json({
      status: 'success',
      data: allTemplates
  });
});

exports.addUserDocument = catchAsync(async (req, res, next) => {
  const userDocument = await UserDocuments.create(req.body);
  res.status(201).json({
      status: 'success',
      data: userDocument
  });
});

exports.getUserDocument = catchAsync(async (req, res, next) => {
  const userDocument = await UserDocuments.findById(req.params.id);
  if (!userDocument) {
      return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
      status: 'success',
      data: userDocument
  });
});

exports.updateUserDocument = catchAsync(async (req, res, next) => {
  const userDocument = await UserDocuments.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });

  if (!userDocument) {
      return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
      status: 'success',
      data: userDocument
  });
});

exports.deleteUserDocument = catchAsync(async (req, res, next) => {
  const userDocument = await UserDocuments.findByIdAndDelete(req.params.id);

  if (!userDocument) {
      return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
      status: 'success',
      data: null
  });
});

exports.getAllUserDocuments = catchAsync(async (req, res, next) => {
  const userDocuments = await UserDocuments.find();
  res.status(200).json({
      status: 'success',
      data: userDocuments
  });
});