const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const SeparationType = require('../models/Separation/SeparationType'); // Import SeparationType model
const ExitInterviewQuestion = require('../models/Separation/ExitInterviewQuestion'); // Import SeparationType model
const ExitInterviewQuestionOptions = require('../models/Separation/ExitInterviewQuestionOptions'); // Import SeparationType model
const ExitInterviewQuestionAnswers = require('../models/Separation/ExitInterviewQuestionAnswers');
const SeparationTemplateSettings = require('../models/Separation/SeparationTemplateSettings');
const InitiateSeparationRequest = require('../models/Separation/InitiateSeparationRequest');
const SeparationRequest = require('../models/Separation/SeparationRequest'); // Import your SeparationRequest model
const User = require('../models/permissions/userModel');
const Resignation = require("../models/Separation/Resignation");
const constants = require('../constants');
const Termination = require('../models/Separation/Termination');

// Add a Resignation
exports.addResignation = catchAsync(async (req, res, next) => {
  console.log( req.cookies.companyId);
  const resignationData = {
    ...req.body,
    company:  req.cookies.companyId,  // Company ID from cookies
  };

  const resignation = await Resignation.create(resignationData);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Get Resignation by User
exports.getResignationByUser = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.findOne({ user: req.params.userId, company: req.cookies.companyId });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Get Resignation by Resignation Status
exports.getResignationByStatus = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.find({ resignation_status: req.params.status, company: req.cookies.companyId });
    res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Get Resignation by Company
exports.getResignationByCompany = catchAsync(async (req, res, next) => {
  const resignations = await Resignation.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignations
  });
});

// Update Resignation only if status is "pending"
exports.updateResignation = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    return next(new AppError('Resignation not found', 404));
  }

  if (resignation.resignation_status !== 'pending') {
    return next(new AppError('Resignation status must be pending to update', 400));
  }

  const updatedResignation = await Resignation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedResignation
  });
});

// Change Resignation Status
exports.changeResignationStatus = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    return next(new AppError('Resignation not found', 404));
  }
  resignation.resignation_status = req.body.resignation_status;
  await resignation.save();
  if (resignation.resignation_status === 'approved') {
    const user = await User.findById(resignation.user);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update the user's status to 'resigned' (or any status that fits your use case)
    user.status = constants.User_Status.Resigned;
    await user.save();
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Delete Resignation
exports.deleteResignation = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    return next(new AppError('Resignation not found', 404));
  }

  if (resignation.resignation_status !== 'pending') {
    return next(new AppError('Resignation status must be pending to delete', 400));
  }
  const resignationDelete = await Resignation.findByIdAndDelete(req.params.id);
  if (!resignationDelete) {
    return next(new AppError('Resignation record not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Add a new termination record
exports.addTermination = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;  // Fetch company from cookies
  const { user, termination_date, termination_reason, termination_status } = req.body;

  // Create new termination record
  const termination = await Termination.create({
    ...req.body,
    company: company,
    user: user,
    termination_status: termination_status || 'completed',  // default status
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: termination
  });
});

// Get termination by user ID
exports.getTerminationByUser = catchAsync(async (req, res, next) => {
  const termination = await Termination.findOne({ user: req.params.userId , company: req.cookies.companyId});

   res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: termination
  });
});

// Get termination by status (pending, completed, appealed)
exports.getTerminationByStatus = catchAsync(async (req, res, next) => {
  const terminationStatus = req.params.terminationStatus;

  const terminations = await Termination.find({ termination_status: terminationStatus , company: req.cookies.companyId});
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: terminations
  });
});

// Get terminations by company (from cookies)
exports.getTerminationByCompany = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId;

  const terminations = await Termination.find({ company: company });

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: terminations
  });
});

// Update termination record (only if status is 'pending')
exports.updateTermination = catchAsync(async (req, res, next) => {
  const termination = await Termination.findById(req.params.id);

  if (!termination || termination.termination_status !== 'pending') {
    return next(new AppError('Termination not found or not in pending status', 400));
  }

  const updatedTermination = await Termination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: updatedTermination
  });
});

 exports.changeTerminationStatus = catchAsync(async (req, res, next) => {
  // Extract new termination status from request body
  const { termination_status } = req.body;

  // List of valid termination statuses
  const validStatuses = ['pending', 'completed', 'appealed'];

  // Validate the provided status
  if (!validStatuses.includes(termination_status)) {
    return next(new AppError('Invalid termination status provided. Valid statuses are: pending, completed, appealed, resignation.', 400));
  }

  // Retrieve the termination record by ID
  const termination = await Termination.findById(req.params.id);

  // If no termination record is found, return 404 error
  if (!termination) {
    return next(new AppError('Termination record not found', 404));
  }

  // Update the termination status
  termination.termination_status = termination_status;

  // Save the updated termination document
  const updatedTermination = await termination.save();
  if ( termination.termination_status === 'completed') {
    const user = await User.findById(termination.user);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update the user's status to 'resigned' (or any status that fits your use case)
    user.status = constants.User_Status.Terminated;
    await user.save();
  }
  // Respond with the updated termination document
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedTermination
  });
});


// Delete termination record
exports.deleteTermination = catchAsync(async (req, res, next) => {
  const termination = await Termination.findByIdAndDelete(req.params.id);

  if (!termination) {
    return next(new AppError('Termination not found', 404));
  }

  res.status(204).json({
    status:constants.APIResponseStatus.Success,
    data: null
  });
});

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
    status:constants.APIResponseStatus.Success,
    data: separationType,
  });
});

exports.getSeparationType = catchAsync(async (req, res, next) => {
  const separationType = await SeparationType.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: separationType,
  });
});

exports.deleteSeparationType = catchAsync(async (req, res, next) => {
  const exitInterviewQuestion = await ExitInterviewQuestion.find({}).where('separationType').equals(req.params.id); 
  const initiateSeparationRequest = await InitiateSeparationRequest.find({}).where('separationType').equals(req.params.id);  
  const separationRequest = await SeparationRequest.find({}).where('separationType').equals(req.params.id);  
 
  if (exitInterviewQuestion.length > 0 || initiateSeparationRequest > 0 || separationRequest > 0) {
    return res.status(400).json({
      status:constants.APIResponseStatus.Failure,
      data: null,
      message: 'Separation Type is already in use. Please delete related records before deleting the Separation Type.',
    });
  }
  const separationType = await SeparationType.findByIdAndDelete(req.params.id);
  if (!separationType) {
    return next(new AppError('SeparationType not found', 404));
  }

  res.status(204).json({
    status:constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllSeparationTypes = catchAsync(async (req, res, next) => { 
  const separationTypes = await SeparationType.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestion
  });
});

exports.getExitInterviewQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestion = await ExitInterviewQuestion.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestion
  });
});

exports.deleteExitInterviewQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('question').equals(req.params.id);  
  if (exitInterviewQuestionAnswers.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: 'Exit Interview Question is already in use. Please delete related records before deleting the Exit Interview Question.',
    });
  }
  const exitInterviewQuestion = await ExitInterviewQuestion.findById(req.params.id);
  await exitInterviewQuestion.remove();
    if (!exitInterviewQuestion) {
    return next(new AppError('ExitInterviewQuestion not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getExitInterviewQuestionsBySeparationType = catchAsync(async (req, res, next) => {
  const exitInterviewQuestions = await ExitInterviewQuestion.find().find({}).where('separationType').equals(req.params.separationTypeId);
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestions
  });
});

exports.createExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewOptions,
  });
});

exports.getExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: exitInterviewOptions,
  });
});

exports.deleteExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findByIdAndDelete(req.params.id);

  if (!exitInterviewOptions) {
    return next(new AppError('ExitInterviewQuestionOptions not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllExitInterviewOptions = catchAsync(async (req, res, next) => {
  const exitInterviewOptions = await ExitInterviewQuestionOptions.find();
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});

exports.getExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});

exports.deleteExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findByIdAndDelete(req.params.id);
  if (!exitInterviewQuestionAnswer) {
    return next(new AppError('Exit Interview Question Answer not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllExitInterviewQuestionAnswersByQuestion = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('question').equals(req.params.questionId);
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswers,
  });
});

exports.getAllExitInterviewQuestionAnswersByUser = catchAsync(async (req, res, next) => {
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('user').equals(req.params.userId);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: separationTemplateSetting,
  });
});

exports.getSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  const separationTemplateSetting = await SeparationTemplateSettings.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllSeparationTemplateSettings = catchAsync(async (req, res, next) => {
  const separationTemplateSettings = await SeparationTemplateSettings.find({}).where('company').equals(req.cookies.companyId);;
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
    data: separationTemplateSettings,
  });
});

exports.createInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.create(req.body);
  res.status(201).json({
    status:constants.APIResponseStatus.Success,
    data: initiateSeparationRequest,
  });
});

exports.getInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.findById(req.params.id).populate('user');
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
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
    status:constants.APIResponseStatus.Success,
    data: initiateSeparationRequest,
  });
});

exports.deleteInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  const initiateSeparationRequest = await InitiateSeparationRequest.findByIdAndDelete(req.params.id);

  if (!initiateSeparationRequest) {
    return next(new AppError('InitiateSeparationRequest not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllInitiateSeparationRequests = catchAsync(async (req, res, next) => {
  const initiateSeparationRequests = await InitiateSeparationRequest.find().populate('user');
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: initiateSeparationRequests,
  });
});

exports.createSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.create(req.body);
  res.status(201).json({
    status:constants.APIResponseStatus.Success,
    data: separationRequest
  });
});

exports.getSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.findById(req.params.id);
  res.status(200).json({
    status:constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: separationRequest
  });
});

exports.deleteSeparationRequest = catchAsync(async (req, res, next) => {
  const separationRequest = await SeparationRequest.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllSeparationRequests = catchAsync(async (req, res, next) => {
  const separationRequests = await SeparationRequest.find();
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationRequests
  });
});

