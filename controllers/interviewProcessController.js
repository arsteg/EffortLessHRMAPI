const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ErrorLog = require('../models/errorLogModel');
const ApplicationStatus = require(`../models/InterviewProcess/applicationStatus`);
const CandidateDataField = require(`../models/InterviewProcess/candidateDataField`);
const FeedbackFieldValue = require(`../models/InterviewProcess/feedbackFieldValue`);
const Candidate = require(`../models/InterviewProcess/candidate`);
const CandidateApplicationStatus = require(`../models/InterviewProcess/candidateApplicationStatus`);
const  CandidateDataFieldValue = require(`../models/InterviewProcess/candidateDataFieldValue`);
const CandidateInterviewDetails = require(`../models/InterviewProcess/candidateInterviewDetails`);
const FeedbackField = require(`../models/InterviewProcess/feedbackField`);
const Interviewer = require(`../models/InterviewProcess/interviewer`);
const  websocketHandler  = require('../utils/websocketHandler');
/**
 * Create a new application status
 */
exports.createApplicationStatus = catchAsync(async (req, res, next) => {
  
  const existingStatus = await ApplicationStatus.findOne({ name:req.body.name, company:req.cookies.companyId });
  if (existingStatus) {
    return next(new AppError(req.t('interviewProcess.applicationStatusExists'), 400));
  }
  
  const newStatus = await ApplicationStatus.create({ 
    name:req.body.name,
    company:req.cookies.companyId, 
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId 
  });  

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: newStatus
  });
});

/**
 * Get an application status by ID
 */
exports.getApplicationStatus = catchAsync(async (req, res, next) => {
  const status = await ApplicationStatus.findById(req.params.id);
  
  if (!status) {
    return next(new AppError(req.t('interviewProcess.applicationStatusNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    return next(new AppError(req.t('interviewProcess.applicationStatusNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: status
  });
});

/**
 * Delete an application status by ID
 */
exports.deleteApplicationStatus = catchAsync(async (req, res, next) => {
  const status = await ApplicationStatus.findByIdAndDelete(req.params.id);

  if (!status) {
    return next(new AppError(req.t('interviewProcess.applicationStatusNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

/**
 * Get all application statuses for a company
 */
exports.getAllApplicationStatusForCompany = catchAsync(async (req, res, next) => {
  const statuses = await ApplicationStatus.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    company: req.cookies.companyId, 
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId     
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: newCandidate
  });
});

/**
 * Get a candidate by ID
 */
exports.getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);

  if (!candidate) {
    return next(new AppError(req.t('interviewProcess.candidateNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    return next(new AppError(req.t('interviewProcess.candidateNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidate
  });
});

/**
 * Delete a candidate by ID
 */
exports.deleteCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);

  if (!candidate) {
    return next(new AppError(req.t('interviewProcess.candidateNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

/**
 * Get all candidates for a company
 */
exports.getAllCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find({ company: req.cookies.companyId});

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidates
  });
});

exports.getAllCandidatesWithData = async (req, res) => {
  const result = [];
  try {
    // Populate candidates with their associated data fields
    const candidates = await Candidate.find({ company: req.cookies.companyId });

    // Iterate through each candidate
    for (const candidate of candidates) {
      const dataFields = await CandidateDataField.find({ company: req.cookies.companyId });
      candidate.candidateDataFields = []; // Initialize array for this candidate's data fields

      // Iterate through each data field for the candidate
      for (const dataField of dataFields) {
        const fieldValue = await CandidateDataFieldValue.findOne({
          candidate: candidate._id,
          candidateDataField: dataField._id,
        });

        // Push the field values for this data field into the candidate's array
        candidate.candidateDataFields.push({
          _id: dataField._id,
          dataFieldValue: fieldValue,
          fieldName: dataField.fieldName,
          fieldValue: fieldValue ? fieldValue.fieldValue : '',
          fieldType: dataField.fieldType,
          isRequired:dataField.isRequired
        });        
      }
      // Push the candidate object with associated data fields to the result array
      result.push({
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        // ... (include other candidate properties as needed)
        candidateDataFields: candidate.candidateDataFields,
      });
    }

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: result,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.t('common.serverError') });
  }
};


//Candidate application API's

exports.createCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.create({
    candidate: req.body.candidate,
    status:req.body.status,
    company: req.cookies.companyId, 
    createdOn : new Date(),
    updatedOn : new Date(),
    createdBy: req.cookies.userId, 
    updatedBy: req.cookies.userId     
  });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: candidateApplicationStatus
  });
});

exports.getCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findById(req.params.id);
  if (!candidateApplicationStatus) {
    return next(new AppError(req.t('interviewProcess.candidateApplicationStatusNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateApplicationStatus
  });
});

exports.updateCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!candidateApplicationStatus) {
    return next(new AppError(req.t('interviewProcess.candidateApplicationStatusNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateApplicationStatus
  });
});

exports.deleteCandidateApplicationStatus = catchAsync(async (req, res, next) => {
  const candidateApplicationStatus = await CandidateApplicationStatus.findByIdAndDelete(req.params.id);
  
  if (!candidateApplicationStatus) {
    return next(new AppError(req.t('interviewProcess.candidateApplicationStatusNotFound'), 404));
  }
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllCandidateApplicationStatusForCompany = catchAsync(async (req, res, next) => {
  const candidateApplicationStatusList = await CandidateApplicationStatus.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId
  });
  

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataField,
  });
});

exports.getCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findById(req.params.id);
  if (!candidateDataField) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataField,
  });
});

exports.updateCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!candidateDataField) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataField,
  });
});

exports.deleteCandidateDataField = catchAsync(async (req, res, next) => {
  const candidateDataField = await CandidateDataField.findByIdAndDelete(req.params.id);

  if (!candidateDataField) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllCandidateDataFieldsByCompany = catchAsync(async (req, res, next) => {
  const candidateDataFields = await CandidateDataField.find({ company: req.cookies.companyId });

  if (candidateDataFields.length === 0) {
    return next(new AppError(req.t('interviewProcess.noCandidateDataFieldsForCompany'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataFields,
  });
});


exports.addCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.create({
    candidateDataField:req.body.candidateDataField,
    fieldValue:req.body.fieldValue,
    fieldType:req.body.fieldType,
    candidate:req.body.candidate,
    company: req.cookies.companyId,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId
  });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataFieldValue,
  });
});

exports.addCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const { candidateDataField, fieldValue, fieldType, candidate } = req.body;
  const company = req.cookies.companyId;
  const userId = req.cookies.userId;

  // Check if document already exists
  const existingRecord = await CandidateDataFieldValue.findOne({
    candidateDataField,
    candidate,
  });

  if (existingRecord) {
    // Update existing record
    existingRecord.fieldValue = fieldValue;
    existingRecord.updatedOn = new Date();
    existingRecord.updatedBy = userId;
    await existingRecord.save();
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('interviewProcess.recordUpdatedSuccessfully'),
      data: existingRecord,
    });
  } else {
    // Create new record
    const newRecord = await CandidateDataFieldValue.create({
      candidateDataField,
      fieldValue,
      fieldType,
      candidate,
      company,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: userId,
      updatedBy: userId,
    });
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('interviewProcess.recordCreatedSuccessfully'),
      data: newRecord,
    });
  }
});

exports.getCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findById(req.params.id);
  if (!candidateDataFieldValue) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldValueNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataFieldValue,
  });
});

exports.updateCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!candidateDataFieldValue) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldValueNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataFieldValue,
  });
});

exports.deleteCandidateDataFieldValue = catchAsync(async (req, res, next) => {
  const candidateDataFieldValue = await CandidateDataFieldValue.findByIdAndDelete(req.params.id);

  if (!candidateDataFieldValue) {
    return next(new AppError(req.t('interviewProcess.candidateDataFieldValueNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllCandidateDataFieldValuesByCompany = catchAsync(async (req, res, next) => {
  const candidateDataFieldValues = await CandidateDataFieldValue.find({ company: req.cookies.companyId });

  if (candidateDataFieldValues.length === 0) {
    return next(new AppError(req.t('interviewProcess.noCandidateDataFieldValuesForCompany'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateDataFieldValues,
  });
});


exports.addCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.create({
    candidate:req.body.candidate,
    interviewDateTime:req.body.interviewDateTime,
    scheduledBy:req.body.scheduledBy,
    zoomLink:req.body.zoomLink,
    interviewer:req.body.interviewer,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId
  });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: candidateInterviewDetails,
  });
});

exports.getCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.findById(req.params.id);
  if (!candidateInterviewDetails) {
    return next(new AppError(req.t('interviewProcess.candidateInterviewDetailsNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    return next(new AppError(req.t('interviewProcess.candidateInterviewDetailsNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateInterviewDetails,
  });
});

exports.deleteCandidateInterviewDetails = catchAsync(async (req, res, next) => {
  const candidateInterviewDetails = await CandidateInterviewDetails.findByIdAndDelete(
    req.params.id
  );

  if (!candidateInterviewDetails) {
    return next(new AppError(req.t('interviewProcess.candidateInterviewDetailsNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllCandidateInterviewDetailsByCompany = catchAsync(async (req, res, next) => {
  const projection = {
    _id: 1, // Include _id explicitly
    candidate: 1, // Include candidate details (projection can be nested here)
    interviewDateTime: 1,
    scheduledBy: 1,
    zoomLink: 1,
    interviewer: 1,
  };

  const candidateInterviewDetails = await CandidateInterviewDetails.find({
    company: req.cookies.companyId,
  }, projection)
  .populate('candidate', { // Specify projection for nested candidate details
    _id: 1,
    name: 1,
    email: 1,
    phoneNumber: 1,    
  })
  .populate('interviewer', { // Specify projection for nested interviewer details
    _id: 1,
    firstName: 1,
    lastName: 1,
    email: 1,
    jobTitle: 1, // Include jobTitle if needed
  })
  .populate('scheduledBy', { // Specify projection for nested scheduledBy details
    _id: 1,
    firstName: 1,
    lastName: 1,
    email: 1,
  });

  if (candidateInterviewDetails.length === 0) {
    return next(new AppError(req.t('interviewProcess.noCandidateInterviewDetailsForCompany'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: candidateInterviewDetails,
  });
});

exports.addFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.create({
    fieldName:req.body.fieldName,
    fieldType:req.body.fieldType,
    subType:req.body.subType,
    isRequired:req.body.isRequired,
    company: req.cookies.companyId,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId
  });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackField,
  });
});

exports.getFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findById(req.params.id);
  if (!feedbackField) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackField,
  });
});

exports.updateFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!feedbackField) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackField,
  });
});

exports.deleteFeedbackField = catchAsync(async (req, res, next) => {
  const feedbackField = await FeedbackField.findByIdAndDelete(req.params.id);

  if (!feedbackField) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllFeedbackFieldsByCompany = catchAsync(async (req, res, next) => {
  const feedbackFields = await FeedbackField.find({
    company: req.cookies.companyId,
  });

  if (feedbackFields.length === 0) {
    return next(new AppError(req.t('interviewProcess.noFeedbackFieldsForCompany'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackFields,
  });
});

exports.getAllCandidatesFeedbackData = async (req, res) => {  
  const result = [];
  try {
    // Populate candidates with their associated data fields
    const candidates = await Candidate.find({ company: req.cookies.companyId });

    // Iterate through each candidate
    for (const candidate of candidates) {
      const feedbackFields = await FeedbackField.find({ company: req.cookies.companyId });
      candidate.feedbackFields = [];

      // Iterate through each feedback field for the candidate
      for (const feedbackField of feedbackFields) {       
        const feedbackFieldValue = await FeedbackFieldValue.findOne({
          candidate: candidate._id,
          feedbackField: feedbackField._id,
        });

        // Push the feedback field values for this field into the candidate's array
        candidate.feedbackFields.push({
          _id: feedbackField._id || null, // Use fieldValue._id if exists, otherwise set to null          
          feedbackFieldValue:feedbackFieldValue,
          fieldName: feedbackField.fieldName,
          fieldValue: feedbackFieldValue?.fieldValue ? feedbackFieldValue?.fieldValue : '',
          fieldType: feedbackField.fieldType,
          isRequired: feedbackField.isRequired
        });
      }
      // Push the candidate object with associated feedback fields to the result array
      result.push({
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        feedbackFields: candidate.feedbackFields,
      });
        }

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addFeedbackFieldValue = catchAsync(async (req, res, next) => {  
  
  const {feedbackField, fieldValue, fieldType, candidate } = req.body;
  const company = req.cookies.companyId;
  const userId = req.cookies.userId;

  // Check if document already exists
  const existingRecord = await FeedbackFieldValue.findOne({
    feedbackField,
    candidate,
  });

  if (existingRecord) {
    // Update existing record
    existingRecord.fieldValue = fieldValue;
    existingRecord.updatedOn = new Date();
    existingRecord.updatedBy = userId;
    await existingRecord.save();
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('interviewProcess.RecordUpdatedSuccessfully'), 
      data: existingRecord,
    });
  } else {
    // Create new record
    const newRecord = await FeedbackFieldValue.create({      
      feedbackField: feedbackField,
      candidate:req.body.candidate,
      fieldValue: req.body.fieldValue,
      fieldType: req.body.fieldType,    
      company: req.cookies.companyId,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('interviewProcess.RecordAddedSuccessfully'),
      data: newRecord,
    });
  }
});

exports.getFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findById(req.params.id);
  if (!feedbackFieldValue) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldValueNotFound'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackFieldValue,
  });
});

exports.updateFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!feedbackFieldValue) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldValueNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackFieldValue,
  });
});

exports.deleteFeedbackFieldValue = catchAsync(async (req, res, next) => {
  const feedbackFieldValue = await FeedbackFieldValue.findByIdAndDelete(req.params.id);

  if (!feedbackFieldValue) {
    return next(new AppError(req.t('interviewProcess.feedbackFieldValueNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllFeedbackFieldValuesByCompany = catchAsync(async (req, res, next) => {
  const feedbackFieldValues = await FeedbackFieldValue.find({
    company: req.cookies.companyId,
  });

  if (feedbackFieldValues.length === 0) {
    return next(new AppError(req.t('interviewProcess.noFeedbackFieldValuesForCompany'), 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: feedbackFieldValues,
  });
});

exports.createInterviewer = catchAsync(async (req, res, next) => {
  const interviewer = await Interviewer.create({
      interviewer: req.body.interviewer,    
      company: req.cookies.companyId,
      createdOn: new Date(),
      updatedOn: new Date(),
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId
  });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: interviewer,
  });
});

exports.getAllInterviewers = catchAsync(async (req, res, next) => {
  const interviewers = await Interviewer.find().populate('interviewer', { // Specify projection for nested candidate details
    _id: 1,
    firstName: 1,
    lastName: 1,
    email: 1,    
  });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: interviewers,
  });
});

exports.updateInterviewer = catchAsync(async (req, res, next) => {
  const interviewer = await Interviewer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!interviewer) {
    return next(new AppError(req.t('interviewProcess.interviewerNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: interviewer,
  });
});

exports.deleteInterviewer = catchAsync(async (req, res, next) => {
  const interviewer  = req.params.id; // Extract the interviewer value from request params  
  const deletedCount = await Interviewer.deleteOne({ interviewer }); // Use deleteOne with a query for deletion 
  if (deletedCount.deletedCount === 0) {
    return next(new AppError(req.t('interviewProcess.interviewerNotFound'), 404));    
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});
