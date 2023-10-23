const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const SeparationType = require('../models/Separation/SeparationType'); // Import SeparationType model
const ExitInterviewQuestion = require('../models/Separation/ExitInterviewQuestion'); // Import SeparationType model
const ExitInterviewQuestionOptions = require('../models/Separation/ExitInterviewQuestionOptions'); // Import SeparationType model
const ExitInterviewQuestionAnswers = require('../models/Separation/ExitInterviewQuestionAnswers');
const SeparationTemplateSettings = require('../models/Separation/SeparationTemplateSettings');
const InitiateSeparationRequest = require('../models/Separation/InitiateSeparationRequest');
const SeparationRequest = require('../models/Separation/SeparationRequest'); // Import your SeparationRequest model


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


exports.createExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  const { user, question, answer } = req.body;
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.create({
    user,
    question,
    answer,
  });

  res.status(201).json({
    status: 'success',
    data: exitInterviewQuestionAnswer,
  });
});

exports.getExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestionAnswer,
  });
});

exports.updateExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  const { user, question, answer } = req.body;
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findByIdAndUpdate(
    req.params.id,
    { user, question, answer },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!exitInterviewQuestionAnswer) {
    return next(new AppError('Exit Interview Question Answer not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestionAnswer,
  });
});

exports.deleteExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findByIdAndDelete(req.params.id);
  if (!exitInterviewQuestionAnswer) {
    return next(new AppError('Exit Interview Question Answer not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllExitInterviewQuestionAnswersByQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('question').equals(req.params.questionId);
  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestionAnswers,
  });
});

exports.getAllExitInterviewQuestionAnswersByUser = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('user').equals(req.params.userId);
  res.status(200).json({
    status: 'success',
    data: exitInterviewQuestionAnswers,
  });
});

exports.createSeparationTemplateSetting = catchAsync(async (req, res, next) => {
     // Extract companyId from req.cookies
     const companyId = req.cookies.companyId;
     // Check if companyId exists in cookies
     if (!companyId) {
       return next(new AppError('Company ID not found in cookies', 400));
     }
     // Add companyId to the request body
     req.body.company = companyId;
  
  const separationTemplateSetting = await SeparationTemplateSettings.create(req.body);
  res.status(201).json({
    status: 'success',
    data: separationTemplateSetting,
  });
});

exports.getSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  const separationTemplateSetting = await SeparationTemplateSettings.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: separationTemplateSetting,
  });
});

exports.updateSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  const separationTemplateSetting = await SeparationTemplateSettings.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!separationTemplateSetting) {
    return next(new AppError('Separation Template Setting not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: separationTemplateSetting,
  });
});

exports.deleteSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  const separationTemplateSetting = await SeparationTemplateSettings.findByIdAndDelete(
    req.params.id
  );

  if (!separationTemplateSetting) {
    return next(new AppError('Separation Template Setting not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllSeparationTemplateSettings = catchAsync(async (req, res, next) => {
  const separationTemplateSettings = await SeparationTemplateSettings.find({}).where('company').equals(req.cookies.companyId);;
  res.status(200).json({
    status: 'success',
    data: separationTemplateSettings,
  });
});

exports.createInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.create(req.body);
  res.status(201).json({
    status: 'success',
    data: initiateSeparationRequest,
  });
});

exports.getInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.findById(req.params.id).populate('user');
  res.status(200).json({
    status: 'success',
    data: initiateSeparationRequest,
  });
});

exports.updateInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!initiateSeparationRequest) {
    return next(new AppError('InitiateSeparationRequest not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: initiateSeparationRequest,
  });
});

exports.deleteInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.findByIdAndDelete(req.params.id);

  if (!initiateSeparationRequest) {
    return next(new AppError('InitiateSeparationRequest not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllInitiateSeparationRequests = catchAsync(async (req, res, next) => {
  const initiateSeparationRequests = await InitiateSeparationRequest.find().populate('user');
  res.status(200).json({
    status: 'success',
    data: initiateSeparationRequests,
  });
});

exports.createSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.create(req.body);
  res.status(201).json({
    status: 'success',
    data: separationRequest
  });
});

exports.getSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: separationRequest
  });
});

exports.updateSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!separationRequest) {
    return next(new AppError('Separation Request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: separationRequest
  });
});

exports.deleteSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllSeparationRequests = catchAsync(async (req, res, next) => {
  const separationRequests = await SeparationRequest.find();
  res.status(200).json({
    status: 'success',
    data: separationRequests
  });
});

