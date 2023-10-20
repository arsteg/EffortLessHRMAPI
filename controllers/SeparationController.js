const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const SeparationType = require('../models/Separation/SeparationType'); // Import SeparationType model
const ExitInterviewQuestion = require('../models/Separation/ExitInterviewQuestion'); // Import SeparationType model
const ExitInterviewQuestionOptions = require('../models/Separation/ExitInterviewQuestionOptions'); // Import SeparationType model

exports.createSeparationType = catchAsync(async (req, res, next) => {
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
   // Add companyId to the request body
   req.body.company = companyId;

  const separationType = await SeparationType.create(req.body);
  res.status(201).json({
    status: 'success',
    data: separationType,
  });
});

exports.getSeparationType = catchAsync(async (req, res, next) => {
  const separationType = await SeparationType.findById(req.params.id);
  if (!separationType) {
    return next(new AppError('SeparationType not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: separationType,
  });
});

exports.updateSeparationType = catchAsync(async (req, res, next) => {
  const separationType = await SeparationType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!separationType) {
    return next(new AppError('SeparationType not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: separationType,
  });
});

exports.deleteSeparationType = catchAsync(async (req, res, next) => {
  const separationType = await SeparationType.findByIdAndDelete(req.params.id);
  if (!separationType) {
    return next(new AppError('SeparationType not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllSeparationTypes = catchAsync(async (req, res, next) => {
  console.log("hello");
  const separationTypes = await SeparationType.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: separationTypes,
  });
});

exports.createExitInterviewQuestion = catchAsync(async (req, res, next) => {
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
   // Add companyId to the request body
   req.body.company = companyId;

  const exitInterviewQuestion = await ExitInterviewQuestion.create(req.body);
  res.status(201).json({
    status: 'success',
    data: exitInterviewQuestion
  });
});

exports.getExitInterviewQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestion = await ExitInterviewQuestion.findById(req.params.id);
  if (!exitInterviewQuestion) {
    return next(new AppError('ExitInterviewQuestion not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestion
  });
});

exports.updateExitInterviewQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestion = await ExitInterviewQuestion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!exitInterviewQuestion) {
    return next(new AppError('ExitInterviewQuestion not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestion
  });
});

exports.deleteExitInterviewQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestion = await ExitInterviewQuestion.findByIdAndDelete(req.params.id);
  if (!exitInterviewQuestion) {
    return next(new AppError('ExitInterviewQuestion not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getExitInterviewQuestionsBySeparationType = catchAsync(async (req, res, next) => {
  const exitInterviewQuestions = await ExitInterviewQuestion.find().find({}).where('separationType').equals(req.params.separationTypeId);
  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestions
  });
});

exports.createExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.create(req.body);
  res.status(201).json({
    status: 'success',
    data: exitInterviewOptions,
  });
});

exports.getExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findById(req.params.id);
  if (!exitInterviewOptions) {
    return next(new AppError('ExitInterviewQuestionOptions not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: exitInterviewOptions,
  });
});

exports.updateExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!exitInterviewOptions) {
    return next(new AppError('ExitInterviewQuestionOptions not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: exitInterviewOptions,
  });
});

exports.deleteExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findByIdAndDelete(req.params.id);

  if (!exitInterviewOptions) {
    return next(new AppError('ExitInterviewQuestionOptions not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.find();
  res.status(200).json({
    status: 'success',
    data: exitInterviewOptions,
  });
});
