const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ErrorLog = require('../models/errorLogModel');
const ApplicationStatus = require(`../models/InterviewProcess/applicationStatus`);
const CandidateDataField = require(`../models/InterviewProcess/candidateDataField`);
/**
 * Create a new application status
 */
exports.createApplicationStatus = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const company=req.cookies.companyId;

  const existingStatus = await ApplicationStatus.findOne({ name, company });
  if (existingStatus) {
    return next(new AppError('Application status already exists for this company', 400));
  }
  
  const newStatus = await ApplicationStatus.create({ name, company, 
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId 
  });  

  res.status(201).json({
    status: 'success',
    data: newStatus
  });
});

/**
 * Get an application status by ID
 */
exports.getApplicationStatus = catchAsync(async (req, res, next) => {
  const status = await ApplicationStatus.findById(req.params.id);
  
  if (!status) {
    return next(new AppError('Application status not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: status
  });
});

/**
 * Update an application status by ID
 */
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const status = await ApplicationStatus.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true,
    runValidators: true
  });

  if (!status) {
    return next(new AppError('Application status not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: status
  });
});

/**
 * Delete an application status by ID
 */
exports.deleteApplicationStatus = catchAsync(async (req, res, next) => {
  const status = await ApplicationStatus.findByIdAndDelete(req.params.id);

  if (!status) {
    return next(new AppError('Application status not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get all application statuses for a company
 */
exports.getAllApplicationStatusForCompany = catchAsync(async (req, res, next) => {
  const statuses = await ApplicationStatus.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
    data: statuses
  });
});

//Candidate API's

/**
 * Add a new candidate
 */
exports.addCandidate = catchAsync(async (req, res, next) => {
  const { name, email, phoneNumber} = req.body;

  const newCandidate = await Candidate.create({
    name,
    email,
    phoneNumber,
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId     
  });

  res.status(201).json({
    status: 'success',
    data: newCandidate
  });
});

/**
 * Get a candidate by ID
 */
exports.getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);

  if (!candidate) {
    return next(new AppError('Candidate not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidate
  });
});

/**
 * Update a candidate by ID
 */
exports.updateCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!candidate) {
    return next(new AppError('Candidate not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidate
  });
});

/**
 * Delete a candidate by ID
 */
exports.deleteCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);

  if (!candidate) {
    return next(new AppError('Candidate not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get all candidates for a company
 */
exports.getAllCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find({ company: req.user.company });

  res.status(200).json({
    status: 'success',
    data: candidates
  });
});

//Candidate application API's

exports.createCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.create(req.body);
  res.status(201).json({
    status: 'success',
    data: candidateApplicationStatus
  });
});

exports.getCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findById(req.params.id);
  if (!candidateApplicationStatus) {
    return next(new AppError('Candidate Application Status not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: candidateApplicationStatus
  });
});

exports.updateCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!candidateApplicationStatus) {
    return next(new AppError('Candidate Application Status not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateApplicationStatus
  });
});

exports.deleteCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findByIdAndDelete(req.params.id);
  
  if (!candidateApplicationStatus) {
    return next(new AppError('Candidate Application Status not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllCandidateApplicationStatusForCompany = catchAsync(async (req, res, next) => {
  const candidateApplicationStatusList = await CandidateApplicationStatus.find({ company: req.params.companyId });
  res.status(200).json({
    status: 'success',
    data: candidateApplicationStatusList
  });
});


exports.addCandidateDataField = catchAsync(async (req, res, next) => {  

  const candidateDataField = await CandidateDataField.create({
    fieldName:req.body.fieldName,
    fieldType:req.body.fieldType,
    subType:req.body.subType,    
    isRequired:req.body.isRequired,
    company: req.cookies.companyId,    
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId     
  });
  

  res.status(201).json({
    status: 'success',
    data: candidateDataField,
  });
});

exports.getCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findById(req.params.id);
  if (!candidateDataField) {
    return next(new AppError('CandidateDataField not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: candidateDataField,
  });
});

exports.updateCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!candidateDataField) {
    return next(new AppError('CandidateDataField not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateDataField,
  });
});

exports.deleteCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findByIdAndDelete(req.params.id);

  if (!candidateDataField) {
    return next(new AppError('CandidateDataField not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllCandidateDataFieldsByCompany = catchAsync(async (req, res, next) => {
  const candidateDataFields = await CandidateDataField.find({ company: req.cookies.companyId });

  if (candidateDataFields.length === 0) {
    return next(new AppError('No CandidateDataFields found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateDataFields,
  });
});


exports.addCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.create(req.body);
  res.status(201).json({
    status: 'success',
    data: candidateDataFieldValue,
  });
});

exports.getCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findById(req.params.id);
  if (!candidateDataFieldValue) {
    return next(new AppError('CandidateDataFieldValue not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: candidateDataFieldValue,
  });
});

exports.updateCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!candidateDataFieldValue) {
    return next(new AppError('CandidateDataFieldValue not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateDataFieldValue,
  });
});

exports.deleteCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findByIdAndDelete(req.params.id);

  if (!candidateDataFieldValue) {
    return next(new AppError('CandidateDataFieldValue not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllCandidateDataFieldValuesByCompany = catchAsync(async (req, res, next) => {
  const candidateDataFieldValues = await CandidateDataFieldValue.find({ company: req.params.companyId });

  if (candidateDataFieldValues.length === 0) {
    return next(new AppError('No CandidateDataFieldValues found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateDataFieldValues,
  });
});


exports.addCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.create(req.body);
  res.status(201).json({
    status: 'success',
    data: candidateInterviewDetails,
  });
});

exports.getCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.findById(req.params.id);
  if (!candidateInterviewDetails) {
    return next(new AppError('CandidateInterviewDetails not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: candidateInterviewDetails,
  });
});

exports.updateCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!candidateInterviewDetails) {
    return next(new AppError('CandidateInterviewDetails not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateInterviewDetails,
  });
});

exports.deleteCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.findByIdAndDelete(
    req.params.id
  );

  if (!candidateInterviewDetails) {
    return next(new AppError('CandidateInterviewDetails not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllCandidateInterviewDetailsByCompany = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.find({
    company: req.params.companyId,
  });

  if (candidateInterviewDetails.length === 0) {
    return next(new AppError('No CandidateInterviewDetails found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: candidateInterviewDetails,
  });
});


exports.addFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.create(req.body);
  res.status(201).json({
    status: 'success',
    data: feedbackField,
  });
});

exports.getFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findById(req.params.id);
  if (!feedbackField) {
    return next(new AppError('FeedbackField not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: feedbackField,
  });
});

exports.updateFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!feedbackField) {
    return next(new AppError('FeedbackField not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: feedbackField,
  });
});

exports.deleteFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findByIdAndDelete(req.params.id);

  if (!feedbackField) {
    return next(new AppError('FeedbackField not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllFeedbackFieldsByCompany = catchAsync(async (req, res, next) => {
  const feedbackFields = await FeedbackField.find({
    company: req.params.companyId,
  });

  if (feedbackFields.length === 0) {
    return next(new AppError('No FeedbackFields found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: feedbackFields,
  });
});

exports.addFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.create(req.body);
  res.status(201).json({
    status: 'success',
    data: feedbackFieldValue,
  });
});

exports.getFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findById(req.params.id);
  if (!feedbackFieldValue) {
    return next(new AppError('FeedbackFieldValue not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: feedbackFieldValue,
  });
});

exports.updateFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!feedbackFieldValue) {
    return next(new AppError('FeedbackFieldValue not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: feedbackFieldValue,
  });
});

exports.deleteFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findByIdAndDelete(req.params.id);

  if (!feedbackFieldValue) {
    return next(new AppError('FeedbackFieldValue not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllFeedbackFieldValuesByCompany = catchAsync(async (req, res, next) => {
  const feedbackFieldValues = await FeedbackFieldValue.find({
    company: req.params.companyId,
  });

  if (feedbackFieldValues.length === 0) {
    return next(new AppError('No FeedbackFieldValues found for the company', 404));
  }

  res.status(200).json({
    status: 'success',
    data: feedbackFieldValues,
  });
});
