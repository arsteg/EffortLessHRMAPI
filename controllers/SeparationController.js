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
const TerminationAppeal = require('../models/Separation/TerminationAppeal');
const mongoose = require('mongoose');
const  websocketHandler  = require('../utils/websocketHandler');
const { getFNFDateRange  } = require('../Services/userDates.service');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const sendEmail = require('../utils/email');
const userSubordinate = require('../models/userSubordinateModel');
const { SendUINotification } = require('../utils/uiNotificationSender');
exports.addResignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addResignation execution', constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
    return next(new AppError(req.t('separation.companyIdNotFound'), 400));
  }

  websocketHandler.sendLog(req, `Using company ID from cookies: ${companyId}`, constants.LOG_TYPES.DEBUG);
  

  // Validate resignation_status if provided in req.body
  if (req.body.resignation_status && !Object.values(constants.Resignation_Status).includes(req.body.resignation_status)) {
    return next(new AppError(req.t('separation.invalidResignationStatus'), 400));
  }
  // Check if user already has an active resignation
  const userId = req.body.user; // Assuming userId is passed in request body
  const existingResignation = await Resignation.findOne({
    user: userId,
    company: companyId,
    resignation_status: { 
      $in: [constants.Resignation_Status.Pending, constants.Resignation_Status.InProgress, constants.Resignation_Status.Approved] 
    }
  });

if (existingResignation) {
  websocketHandler.sendLog(req, `User already has an active resignation with ID: ${existingResignation._id}`, constants.LOG_TYPES.WARNING);
  return res.status(400).json({
    status: constants.APIResponseStatus.Error,
    message: req.t('separation.existingResignation')
  });
}
  const resignationData = {
    ...req.body,
    resignation_status: constants.Resignation_Status.Pending,
    company: companyId,
  };
  websocketHandler.sendLog(req, 'Prepared resignation data', constants.LOG_TYPES.TRACE);

  const resignation = await Resignation.create(resignationData);

  const user = await User.findById(userId);
  const userName = `${user?.firstName} ${user?.lastName}`;

  const managerTeamsIds = await userSubordinate.find({}).distinct("userId").where('subordinateUserId').equals(userId);      
  if(managerTeamsIds)
  { 
    for(var j = 0; j < managerTeamsIds.length; j++)
    {
      const manager = await User.findById(managerTeamsIds[j]._id);
      //send ui notification to manager
      SendUINotification(req.t('separation.ResignationNotificatioToManagerTitle'), req.t('separation.ResignationNotificatioToManagerMessage', { firstName: manager?.firstName, lastName: manager?.lastName, teamMember: userName }),
        constants.Event_Notification_Type_Status.separation, manager?._id?.toString(), companyId, req);
    }
  }

  websocketHandler.sendLog(req, `Created resignation with ID: ${resignation._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Get Resignation by User
exports.getResignationByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getResignationByUser for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying resignation for user ${req.params.userId} in company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const resignation = await Resignation.find({
    user: req.params.userId,
    company: req.cookies.companyId,
    resignation_status: { $ne: constants.Resignation_Status.Deleted }
  });
  if (!resignation) {
    websocketHandler.sendLog(req, `No resignation found for user ${req.params.userId}`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found resignation with ID: ${resignation._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Get Resignation by Company
exports.getResignationByStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getResignationByStatus for status ${req.params.status}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying resignations with status ${req.params.status} in company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const resignation = await Resignation.find({ resignation_status: req.params.status, company: req.cookies.companyId });

  websocketHandler.sendLog(req, `Found ${resignation.length} resignations with status ${req.params.status}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignation
  });
});

// Update Resignation only if status is "pending"
exports.getResignationByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getResignationByCompany for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
    return next(new AppError(req.t('separation.companyIdNotFound'), 400));
  }
  websocketHandler.sendLog(req, `Querying resignations for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const resignations = await Resignation.find({ company: companyId, resignation_status: { $ne: constants.Resignation_Status.Deleted } });

  websocketHandler.sendLog(req, `Found ${resignations.length} resignations`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: resignations
  });
});
// Change Resignation Status
exports.updateResignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateResignation for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Fetching resignation ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    websocketHandler.sendLog(req, `Resignation ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.resignationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Found resignation with status: ${resignation.resignation_status}`, constants.LOG_TYPES.DEBUG);

  if (resignation.resignation_status !== constants.Resignation_Status.Pending) {
    websocketHandler.sendLog(req, `Cannot update resignation ${req.params.id}: status is ${resignation.resignation_status}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('separation.resignationMustBePending'), 400));
  }
  websocketHandler.sendLog(req, `Updating resignation ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const updatedResignation = await Resignation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  websocketHandler.sendLog(req, `Resignation ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedResignation
  });
});
exports.changeResignationStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting changeResignationStatus for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const resignation_status = req.body.resignation_status;
  const validStatuses = [constants.Resignation_Status.Pending,constants.Resignation_Status.Approved, constants.Resignation_Status.InProgress, constants.Resignation_Status.Completed,constants.Resignation_Status.Deleted];
  if (!validStatuses.includes(resignation_status)) {
  websocketHandler.sendLog(req, `Invalid resignation status: ${resignation_status}`, constants.LOG_TYPES.ERROR);
  return next(new AppError(req.t('separation.invalidResignationStatus'), 400));
  }

  websocketHandler.sendLog(req, `Fetching resignation ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
  websocketHandler.sendLog(req, `Resignation ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
  return next(new AppError(req.t('separation.resignationNotFound'), 404));
  }
 
  resignation.resignation_status = req.body.resignation_status;
  await resignation.save();
  websocketHandler.sendLog(req, `Changed resignation status to ${req.body.resignation_status}`, constants.LOG_TYPES.INFO);
  const user = await User.findById(resignation.user);
  if (!user) {
    websocketHandler.sendLog(req, `User ${resignation.user} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.userNotFound'), 404));
  } 
  if (resignation.resignation_status === constants.Resignation_Status.Approved) {
    websocketHandler.sendLog(req, `Processing approved status for user ${resignation.user}`, constants.LOG_TYPES.TRACE); 
    user.status = constants.User_Status.Resigned; 
    await user.save();
    websocketHandler.sendLog(req, `Updated user ${user._id} status to Resigned`, constants.LOG_TYPES.INFO);
  }
  if (resignation.resignation_status === constants.Resignation_Status.Deleted || resignation.resignation_status === constants.Resignation_Status.Pending) {
    websocketHandler.sendLog(req, `Processing deleted status for user ${resignation.user}`, constants.LOG_TYPES.TRACE);  
    user.status = constants.User_Status.Active;
    await user.save();
    websocketHandler.sendLog(req, `Updated user ${user._id} status to Active`, constants.LOG_TYPES.INFO);
    }
  res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: resignation
  });
 });

 exports.getFNFDateRangeByUser = catchAsync(async (req, res, next) => {
  const userId  = req.params.userId;
  // 🔍 Check if userId is provided
  if (!userId) {
    websocketHandler.sendLog(req, '❌ FNF Date Range: User ID missing in request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('user.missingUserId'), 404));
  }

  websocketHandler.sendLog(req, `🔄 Fetching FNF date range for user: ${userId}`, constants.LOG_TYPES.INFO);

  // 🗓️ Get FNF date range
  const { startDate, endDate } = await getFNFDateRange(req,userId);

  websocketHandler.sendLog(
    req,
    `✅ FNF Date Range fetched for user ${userId}: Start - ${startDate.toDateString()}, End - ${endDate.toDateString()}`,
    constants.LOG_TYPES.INFO
  );

  res.status(200).json({
    status: 'success',
    data: { startDate, endDate }
  });
});

// Add a new termination record
exports.addTermination = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addTermination execution', constants.LOG_TYPES.TRACE);

  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
   return next(new AppError(req.t('separation.companyIdNotFound'), 400));
 }
  websocketHandler.sendLog(req, `Using company ID from cookies: ${company}`, constants.LOG_TYPES.DEBUG);

  
  websocketHandler.sendLog(req, `Creating termination for user ${req.body.user}`, constants.LOG_TYPES.TRACE);

  const termination = await Termination.create({
    ...req.body,
    company,
    termination_status: constants.Termination_status.Pending,
  });
  websocketHandler.sendLog(req, `Created termination with ID: ${termination._id}`, constants.LOG_TYPES.INFO);

  const emailTemplate = await EmailTemplate.findOne({})
    .where('Name')
    .equals(constants.Email_template_constant.Employee_Termination)
    .where('company')
    .equals(company);
  const user = await User.findById(termination.user);
  console.log('user', termination.user.toString());
  console.log('user', user._id.toString());

  if (emailTemplate) {
    websocketHandler.sendLog(req, `Preparing notification email for ${user.email}`, constants.LOG_TYPES.TRACE);
    const template = emailTemplate.contentData;
    const message = template
      .replace("{firstName}", user.firstName)
      .replace("{lastName}", user.lastName)
      .replace("{company}", req.cookies.companyName)
      .replace("{terminationDate}", termination.termination_date.toDateString())
      .replace("{terminationReason}", termination.termination_reason)
      .replace("{noticeGiven}", termination.notice_given ? 'Yes' : 'No')
      .replace("{PerformanceWarningIssued}", termination.performance_warnings)
      .replace("{exitInterview}", termination.exit_interview_date.toDateString());
    
      try {
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        message
      });
      websocketHandler.sendLog(req, `Notification email sent to ${user.email}`, constants.LOG_TYPES.INFO);
    } catch (err) {
      websocketHandler.sendLog(req, `Error sending email: ${err.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('user.emailError')

      , 500));
    }
  }

  SendUINotification(req.t('separation.addTerminationNotificationTitle'), req.t('separation.addTerminationNotificationMessage'),
  constants.Event_Notification_Type_Status.separation, user?._id?.toString(), req.cookies.companyId, req);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: termination
  });
});

exports.getTerminationByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTerminationByUser for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
 
  websocketHandler.sendLog(req, `Querying termination for user ${req.params.userId} in company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const termination = await Termination.find({ user: req.params.userId, company: req.cookies.companyId });
 
  if (!termination) {
  websocketHandler.sendLog(req, `No termination found for user ${req.params.userId}`, constants.LOG_TYPES.WARN);
  } else {
  websocketHandler.sendLog(req, `Found termination with ID: ${termination._id}`, constants.LOG_TYPES.INFO);
  }
 
  res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: termination
  });
 });

// Get termination by status (pending, completed, appealed)
exports.getTerminationByStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTerminationByStatus for status ${req.params.terminationStatus}`, constants.LOG_TYPES.TRACE);

  const terminationStatus = req.params.terminationStatus;
  websocketHandler.sendLog(req, `Querying terminations with status ${terminationStatus} in company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const terminations = await Termination.find({ termination_status: terminationStatus, company: req.cookies.companyId });
  websocketHandler.sendLog(req, `Found ${terminations.length} terminations with status ${terminationStatus}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: terminations
  });
});


// Get terminations by company (from cookies)
exports.getTerminationByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getTerminationByCompany for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
   return next(new AppError(req.t('separation.companyIdNotFound'), 400));
 }
  websocketHandler.sendLog(req, `Querying terminations for company ${company}`, constants.LOG_TYPES.TRACE);

  const terminations = await Termination.find({ 
    termination_status: { $ne: constants.Termination_status.Deleted },  // Exclude matching terminationStatus
    company: req.cookies.companyId                  // Ensure the company matches the cookie ID
     });
  
  websocketHandler.sendLog(req, `Found ${terminations.length} terminations`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: terminations
  });
});

// Update termination record (only if status is 'pending')

exports.updateTermination = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateTermination for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Fetching termination ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const termination = await Termination.findById(req.params.id);

  if (!termination || termination.termination_status !== constants.Termination_status.Pending) {
    websocketHandler.sendLog(req, `Termination ${req.params.id} not found or not pending`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.terminationNotFoundOrNotPending'), 400)
  );
  }
  websocketHandler.sendLog(req, `Found termination with status: ${termination.termination_status}`, constants.LOG_TYPES.DEBUG);

  websocketHandler.sendLog(req, `Updating termination ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const updatedTermination = await Termination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  websocketHandler.sendLog(req, `Termination ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  const user = await User.findById(termination.user);
  SendUINotification(req.t('separation.updateTerminationNotificationTitle'), req.t('separation.updateTerminationNotificationMessage'),
  constants.Event_Notification_Type_Status.separation, user?._id?.toString(), req.cookies.companyId, req);  

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedTermination
  });
});

exports.changeTerminationStatus = catchAsync(async (req, res, next) => {

  websocketHandler.sendLog(req, `Starting changeTerminationStatus for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const { termination_status } = req.body;
  const validStatuses = [constants.Termination_status.Appealed, constants.Termination_status.Completed,constants.Termination_status.Deleted];
  if (!validStatuses.includes(termination_status)) {
      websocketHandler.sendLog(req, `Invalid termination status: ${termination_status}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.invalidTerminationStatus'), 400));
    }

  websocketHandler.sendLog(req, `Fetching termination ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const termination = await Termination.findById(req.params.id);
  if (!termination) {
      websocketHandler.sendLog(req, `Termination ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.terminationRecordNotFound'), 404));
    }
    if (termination.termination_status !== constants.Termination_status.Pending && termination_status === constants.Termination_status.Deleted) {
      // If the status is not "Pending" and it is "Deleted", handle the error.
      websocketHandler.sendLog(req, `Termination ${req.params.id} Status is not pending to Delete`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.terminationRecordNotInPendingStatus'), 400));
  }
  
  termination.termination_status = termination_status;
  const updatedTermination = await termination.save();
  websocketHandler.sendLog(req, `Changed termination status to ${termination_status}`, constants.LOG_TYPES.INFO);

  const user = await User.findById(termination.user);
  if (!user) {
    websocketHandler.sendLog(req, `User ${termination.user} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.userNotFound'), 404));
  }

  if (termination.termination_status === constants.Termination_status.Completed) {
    websocketHandler.sendLog(req, `Processing completed status for user ${termination.user}`, constants.LOG_TYPES.TRACE);
    user.status = constants.User_Status.Terminated;
    await user.save();
    websocketHandler.sendLog(req, `Updated user ${user._id} status to Terminated`, constants.LOG_TYPES.INFO);
  }

  if (termination.termination_status === constants.Termination_status.Deleted) {
    websocketHandler.sendLog(req, `Processing deleted status for user ${termination.user}`, constants.LOG_TYPES.TRACE);  
    user.status = constants.User_Status.Active;
    await user.save();
    websocketHandler.sendLog(req, `Updated user ${user._id} status to Active`, constants.LOG_TYPES.INFO);
    }

  SendUINotification(req.t('separation.terminationStatusChangedNotificationTitle'), req.t('separation.terminationStatusChangedNotificationMessage', { status: termination_status }),
  constants.Event_Notification_Type_Status.separation, user?._id?.toString(), req.cookies.companyId, req);  

  res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: updatedTermination
  });
});

exports.submitTerminationAppeal = catchAsync(async (req, res, next) => {
  const { termination, user, appeal_reason } = req.body;

  websocketHandler.sendLog(req, `Attempting to submit termination appeal for termination ID ${termination}`, constants.LOG_TYPES.TRACE);

  const existingAppeal = await TerminationAppeal.findOne({ termination });
  if (existingAppeal) {
    websocketHandler.sendLog(req, `Appeal already exists for termination ID ${termination}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.appealAlreadySubmitted'), 400));
  }

  const appeal = await TerminationAppeal.create({ termination, user, appeal_reason });
  await Termination.findByIdAndUpdate(termination, { termination_status: constants.Termination_status.Appealed });

  websocketHandler.sendLog(req, `Appeal submitted and termination status updated to Appealed`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: appeal
  });
});


exports.updateTerminationAppeal = catchAsync(async (req, res, next) => {
  const { appeal_status, decision_notes, decided_by, appeal_reason } = req.body;

  websocketHandler.sendLog(req, `Starting appeal update for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const appeal = await TerminationAppeal.findById(req.params.id);
  if (!appeal) {
    websocketHandler.sendLog(req, `Appeal with ID ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.appealNotFound'), 404));
  }

  if (appeal_reason) {
    appeal.appeal_reason = appeal_reason;
    websocketHandler.sendLog(req, `Appeal reason updated`, constants.LOG_TYPES.TRACE);
  }

  if (appeal_status) {
    const validStatuses = [
      constants.Termination_Appealed_status.Approved,
      constants.Termination_Appealed_status.Rejected
    ];
  
    // ❌ Disallow changing from Approved/Rejected to any other status (e.g., Pending)
    const currentStatus = appeal.appeal_status;
    const isFinalStatus = validStatuses.includes(currentStatus);
    const isTryingToUndo = !validStatuses.includes(appeal_status) && isFinalStatus;
  
    if (isTryingToUndo) {
      websocketHandler.sendLog(req, `Cannot revert appeal status from ${currentStatus} to ${appeal_status}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.appealStatusCannotBeReverted'), 400));
    }
  
    if (!validStatuses.includes(appeal_status)) {
      websocketHandler.sendLog(req, `Invalid appeal status provided: ${appeal_status}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.invalidAppealStatus'), 400));
    }

    appeal.appeal_status = appeal_status;
    appeal.decision_notes = decision_notes || '';
    appeal.decided_by = decided_by;
    appeal.decided_on = new Date();

    websocketHandler.sendLog(req, `Appeal status set to ${appeal_status}`, constants.LOG_TYPES.INFO);

    const terminationStatus =
      appeal_status === constants.Termination_Appealed_status.Approved
        ? constants.Termination_status.Reinstated
        : constants.Termination_status.Completed;
    const termination = await Termination.findById(appeal.termination);

    if (termination) {
      termination.termination_status = terminationStatus;
      await termination.save();
    }
    const user = await User.findById(termination.user);
    if (!user) {
      websocketHandler.sendLog(req, `User ${termination.user} not found`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('separation.userNotFound'), 404));
    }
  
    if (terminationStatus === constants.Termination_status.Completed) {
      websocketHandler.sendLog(req, `Processing completed status for user ${termination.user}`, constants.LOG_TYPES.TRACE);
      user.status = constants.User_Status.Terminated;
      await user.save();
      websocketHandler.sendLog(req, `Updated user ${user._id} status to Terminated`, constants.LOG_TYPES.INFO);
    }
  
    websocketHandler.sendLog(req, `Termination status updated based on appeal outcome`, constants.LOG_TYPES.INFO);
  }

  await appeal.save();

  websocketHandler.sendLog(req, `Appeal update completed for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('separation.appealReviewSuccess'),
    data: appeal,
  });
});


exports.getTerminationAppealByTerminationId = catchAsync(async (req, res, next) => {
  const { terminationId } = req.params;

  websocketHandler.sendLog(req, `Fetching appeal for termination ID ${terminationId}`, constants.LOG_TYPES.TRACE);

  if (!mongoose.Types.ObjectId.isValid(terminationId)) {
    websocketHandler.sendLog(req, `Invalid termination ID format: ${terminationId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.invalidTerminationId'), 400));
  }

  const terminationExists = await Termination.findById(terminationId);
  if (!terminationExists) {
    websocketHandler.sendLog(req, `Termination ID ${terminationId} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.terminationNotFound'), 404));
  }

  const appeal = await TerminationAppeal.findOne({ termination: terminationId });
  if (!appeal) {
    websocketHandler.sendLog(req, `No appeal found for termination ID ${terminationId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.appealNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Appeal retrieved successfully for termination ID ${terminationId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: appeal
  });
});


exports.createSeparationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createSeparationType execution', constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.companyIdNotFound'), 400)
  );
  }
  websocketHandler.sendLog(req, `Using company ID: ${companyId}`, constants.LOG_TYPES.DEBUG);

  req.body.company = companyId;
  websocketHandler.sendLog(req, 'Added company ID to request body', constants.LOG_TYPES.TRACE);

  const separationType = await SeparationType.create(req.body);
  websocketHandler.sendLog(req, `Created separation type with ID: ${separationType._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: separationType,
  });
});

exports.getSeparationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getSeparationType for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying separation type ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationType = await SeparationType.findById(req.params.id);

  if (!separationType) {
    websocketHandler.sendLog(req, `Separation type ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found separation type with ID: ${separationType._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationType,
  });
});

exports.updateSeparationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateSeparationType for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating separation type ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationType = await SeparationType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!separationType) {
    websocketHandler.sendLog(req, `Separation type ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.separationTypeNotFound'), 404)

  );
  }

  websocketHandler.sendLog(req, `Separation type ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationType,
  });
});

exports.deleteSeparationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteSeparationType for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Checking dependencies for separation type ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestion = await ExitInterviewQuestion.find({}).where('separationType').equals(req.params.id);
  const initiateSeparationRequest = await InitiateSeparationRequest.find({}).where('separationType').equals(req.params.id);
  const separationRequest = await SeparationRequest.find({}).where('separationType').equals(req.params.id);

  if (exitInterviewQuestion.length > 0 || initiateSeparationRequest.length > 0 || separationRequest.length > 0) {
    websocketHandler.sendLog(req, `Cannot delete separation type ${req.params.id} due to dependencies`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('separation.separationTypeInUse'),
    });
  }

  websocketHandler.sendLog(req, `Deleting separation type ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationType = await SeparationType.findByIdAndDelete(req.params.id);
  if (!separationType) {
    websocketHandler.sendLog(req, `Separation type ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.separationTypeNotFound'), 404)
  );
  }

  websocketHandler.sendLog(req, `Deleted separation type ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllSeparationTypes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getAllSeparationTypes for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying separation types for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const separationTypes = await SeparationType.find({}).where('company').equals(req.cookies.companyId);

  websocketHandler.sendLog(req, `Found ${separationTypes.length} separation types`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationTypes,
  });
});

exports.createExitInterviewQuestion = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createExitInterviewQuestion execution', constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.companyIdNotFound'), 400)
  );
  }
  websocketHandler.sendLog(req, `Using company ID: ${companyId}`, constants.LOG_TYPES.DEBUG);

  req.body.company = companyId;
  websocketHandler.sendLog(req, 'Added company ID to request body', constants.LOG_TYPES.TRACE);

  const exitInterviewQuestion = await ExitInterviewQuestion.create(req.body);
  websocketHandler.sendLog(req, `Created exit interview question with ID: ${exitInterviewQuestion._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestion
  });
});

exports.getExitInterviewQuestion = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getExitInterviewQuestion for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);
 
  websocketHandler.sendLog(req, `Querying exit interview question ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestion = await ExitInterviewQuestion.findById(req.params.id);
 
  if (!exitInterviewQuestion) {
  websocketHandler.sendLog(req, `Exit interview question ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
  websocketHandler.sendLog(req, `Found exit interview question with ID: ${exitInterviewQuestion._id}`, constants.LOG_TYPES.INFO);
  }
 
  res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: exitInterviewQuestion
  });
 });

exports.updateExitInterviewQuestion = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateExitInterviewQuestion for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating exit interview question ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestion = await ExitInterviewQuestion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!exitInterviewQuestion) {
    websocketHandler.sendLog(req, `Exit interview question ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.exitInterviewQuestionNotFound'), 404)
);
  }
  websocketHandler.sendLog(req, `Exit interview question ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestion
  });
});

exports.deleteExitInterviewQuestion = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteExitInterviewQuestion for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Checking dependencies for exit interview question ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('question').equals(req.params.id);
  if (exitInterviewQuestionAnswers.length > 0) {
    websocketHandler.sendLog(req, `Cannot delete exit interview question ${req.params.id} due to ${exitInterviewQuestionAnswers.length} answers`, constants.LOG_TYPES.WARN);
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('separation.ExitInterviewQuestionAlreadyInUse'),
    });
  }

  websocketHandler.sendLog(req, `Fetching exit interview question ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestion = await ExitInterviewQuestion.findById(req.params.id);
  if (!exitInterviewQuestion) {
    websocketHandler.sendLog(req, `Exit interview question ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.exitInterviewQuestionNotFound'), 404)
  );
  }

  await exitInterviewQuestion.remove();
  websocketHandler.sendLog(req, `Deleted exit interview question ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getExitInterviewQuestionsBySeparationType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getExitInterviewQuestionsBySeparationType for separation type ${req.params.separationTypeId}`, constants.LOG_TYPES.TRACE);
 
  websocketHandler.sendLog(req, `Querying exit interview questions for separation type ${req.params.separationTypeId}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestions = await ExitInterviewQuestion.find({}).where('separationType').equals(req.params.separationTypeId);
 
  websocketHandler.sendLog(req, `Found ${exitInterviewQuestions.length} exit interview questions`, constants.LOG_TYPES.INFO);
 
  res.status(200).json({
  status: constants.APIResponseStatus.Success,
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
    return next(new AppError(req.t('separation.exitInterviewOptionsNotFound'), 404)
  );
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewOptions,
  });
});

exports.deleteExitInterviewOptions = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteExitInterviewOptions for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Deleting exit interview options ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewOptions = await ExitInterviewQuestionOptions.findByIdAndDelete(req.params.id);

  if (!exitInterviewOptions) {
    websocketHandler.sendLog(req, `Exit interview options ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.exitInterviewOptionsNotFound'), 404)
  );
  }

  websocketHandler.sendLog(req, `Deleted exit interview options ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllExitInterviewOptions = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllExitInterviewOptions execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, 'Querying all exit interview options', constants.LOG_TYPES.TRACE);
  const exitInterviewOptions = await ExitInterviewQuestionOptions.find();

  websocketHandler.sendLog(req, `Found ${exitInterviewOptions.length} exit interview options`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewOptions,
  });
});

exports.createExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createExitInterviewQuestionAnswer execution', constants.LOG_TYPES.TRACE);

  const { user, question, answer } = req.body;
  websocketHandler.sendLog(req, `Creating answer for user ${user} and question ${question}`, constants.LOG_TYPES.TRACE);

  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.create({
    user,
    question,
    answer,
  });

  websocketHandler.sendLog(req, `Created exit interview question answer with ID: ${exitInterviewQuestionAnswer._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});

exports.createExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createExitInterviewQuestionAnswer execution', constants.LOG_TYPES.TRACE);

  const { user, question, answer } = req.body;
  websocketHandler.sendLog(req, `Creating answer for user ${user} and question ${question}`, constants.LOG_TYPES.TRACE);

  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.create({
    user,
    question,
    answer,
  });

  websocketHandler.sendLog(req, `Created exit interview question answer with ID: ${exitInterviewQuestionAnswer._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});
exports.getExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getExitInterviewQuestionAnswer for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying exit interview question answer ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findById(req.params.id);

  if (!exitInterviewQuestionAnswer) {
    websocketHandler.sendLog(req, `Exit interview question answer ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found exit interview question answer with ID: ${exitInterviewQuestionAnswer._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});

exports.updateExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateExitInterviewQuestionAnswer for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const { user, question, answer } = req.body;
  websocketHandler.sendLog(req, `Updating exit interview question answer ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findByIdAndUpdate(
    req.params.id,
    { user, question, answer },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!exitInterviewQuestionAnswer) {
    websocketHandler.sendLog(req, `Exit interview question answer ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.exitInterviewAnswerNotFound'), 404)
);
  }

  websocketHandler.sendLog(req, `Exit interview question answer ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswer,
  });
});


exports.deleteExitInterviewQuestionAnswer = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteExitInterviewQuestionAnswer for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Deleting exit interview question answer ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestionAnswer = await ExitInterviewQuestionAnswers.findByIdAndDelete(req.params.id);

  if (!exitInterviewQuestionAnswer) {
    websocketHandler.sendLog(req, `Exit interview question answer ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.exitInterviewAnswerNotFound'), 404)

  );
  }

  websocketHandler.sendLog(req, `Deleted exit interview question answer ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});
exports.getAllExitInterviewQuestionAnswersByQuestion = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getAllExitInterviewQuestionAnswersByQuestion for question ${req.params.questionId}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying answers for question ${req.params.questionId}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('question').equals(req.params.questionId);

  websocketHandler.sendLog(req, `Found ${exitInterviewQuestionAnswers.length} answers for question ${req.params.questionId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswers,
  });
});
exports.getAllExitInterviewQuestionAnswersByUser = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getAllExitInterviewQuestionAnswersByUser for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying answers for user ${req.params.userId}`, constants.LOG_TYPES.TRACE);
  const exitInterviewQuestionAnswers = await ExitInterviewQuestionAnswers.find({}).where('user').equals(req.params.userId);

  websocketHandler.sendLog(req, `Found ${exitInterviewQuestionAnswers.length} answers for user ${req.params.userId}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: exitInterviewQuestionAnswers,
  });
});

exports.createSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createSeparationTemplateSetting execution', constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID not found in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.companyIdNotFound'), 400)
  );
  }
  websocketHandler.sendLog(req, `Using company ID: ${companyId}`, constants.LOG_TYPES.DEBUG);

  req.body.company = companyId;
  websocketHandler.sendLog(req, 'Added company ID to request body', constants.LOG_TYPES.TRACE);

  const separationTemplateSetting = await SeparationTemplateSettings.create(req.body);
  websocketHandler.sendLog(req, `Created separation template setting with ID: ${separationTemplateSetting._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: separationTemplateSetting,
  });
});

exports.getSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getSeparationTemplateSetting for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying separation template setting ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationTemplateSetting = await SeparationTemplateSettings.findById(req.params.id);

  if (!separationTemplateSetting) {
    websocketHandler.sendLog(req, `Separation template setting ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found separation template setting with ID: ${separationTemplateSetting._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationTemplateSetting,
  });
});

exports.updateSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateSeparationTemplateSetting for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating separation template setting ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationTemplateSetting = await SeparationTemplateSettings.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!separationTemplateSetting) {
    websocketHandler.sendLog(req, `Separation template setting ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.separationTemplateSettingNotFound'), 404)
  );
  }

  websocketHandler.sendLog(req, `Separation template setting ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationTemplateSetting,
  });
});

exports.deleteSeparationTemplateSetting = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteSeparationTemplateSetting for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Deleting separation template setting ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationTemplateSetting = await SeparationTemplateSettings.findByIdAndDelete(req.params.id);

  if (!separationTemplateSetting) {
    websocketHandler.sendLog(req, `Separation template setting ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.separationTemplateSettingNotFound'), 404)
  );
  }

  websocketHandler.sendLog(req, `Deleted separation template setting ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllSeparationTemplateSettings = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getAllSeparationTemplateSettings for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying separation template settings for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const separationTemplateSettings = await SeparationTemplateSettings.find({}).where('company').equals(req.cookies.companyId);

  websocketHandler.sendLog(req, `Found ${separationTemplateSettings.length} separation template settings`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationTemplateSettings,
  });
});
exports.createInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createInitiateSeparationRequest execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, 'Creating initiate separation request', constants.LOG_TYPES.TRACE);
  const initiateSeparationRequest = await InitiateSeparationRequest.create(req.body);

  websocketHandler.sendLog(req, `Created initiate separation request with ID: ${initiateSeparationRequest._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: initiateSeparationRequest,
  });
});
exports.getInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getInitiateSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying initiate separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const initiateSeparationRequest = await InitiateSeparationRequest.findById(req.params.id).populate('user');

  if (!initiateSeparationRequest) {
    websocketHandler.sendLog(req, `Initiate separation request ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found initiate separation request with ID: ${initiateSeparationRequest._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: initiateSeparationRequest,
  });
});

exports.updateInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateInitiateSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating initiate separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const initiateSeparationRequest = await InitiateSeparationRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!initiateSeparationRequest) {
    websocketHandler.sendLog(req, `Initiate separation request ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.initiateSeparationRequestNotFound'), 404)

  );
  }

  websocketHandler.sendLog(req, `Initiate separation request ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: initiateSeparationRequest,
  });
});

exports.deleteInitiateSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteInitiateSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Deleting initiate separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const initiateSeparationRequest = await InitiateSeparationRequest.findByIdAndDelete(req.params.id);

  if (!initiateSeparationRequest) {
    websocketHandler.sendLog(req, `Initiate separation request ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.initiateSeparationRequestNotFound'), 404)

  );
  }

  websocketHandler.sendLog(req, `Deleted initiate separation request ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllInitiateSeparationRequests = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllInitiateSeparationRequests execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, 'Querying all initiate separation requests', constants.LOG_TYPES.TRACE);
  const initiateSeparationRequests = await InitiateSeparationRequest.find().populate('user');

  websocketHandler.sendLog(req, `Found ${initiateSeparationRequests.length} initiate separation requests`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: initiateSeparationRequests,
  });
});

exports.createSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createSeparationRequest execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, 'Creating separation request', constants.LOG_TYPES.TRACE);
  const separationRequest = await SeparationRequest.create(req.body);

  websocketHandler.sendLog(req, `Created separation request with ID: ${separationRequest._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: separationRequest
  });
});

exports.getSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting getSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Querying separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationRequest = await SeparationRequest.findById(req.params.id);

  if (!separationRequest) {
    websocketHandler.sendLog(req, `Separation request ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Found separation request with ID: ${separationRequest._id}`, constants.LOG_TYPES.INFO);
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationRequest
  });
});

exports.updateSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting updateSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Updating separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationRequest = await SeparationRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!separationRequest) {
    websocketHandler.sendLog(req, `Separation request ${req.params.id} not found`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('separation.separationRequestNotFound'), 404)

  );
  }

  websocketHandler.sendLog(req, `Separation request ${req.params.id} updated successfully`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationRequest
  });
});

exports.deleteSeparationRequest = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Starting deleteSeparationRequest for ID ${req.params.id}`, constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, `Deleting separation request ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const separationRequest = await SeparationRequest.findByIdAndDelete(req.params.id);

  if (!separationRequest) {
    websocketHandler.sendLog(req, `Separation request ${req.params.id} not found`, constants.LOG_TYPES.WARN);
  } else {
    websocketHandler.sendLog(req, `Deleted separation request ${req.params.id}`, constants.LOG_TYPES.INFO);
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllSeparationRequests = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllSeparationRequests execution', constants.LOG_TYPES.TRACE);

  websocketHandler.sendLog(req, 'Querying all separation requests', constants.LOG_TYPES.TRACE);
  const separationRequests = await SeparationRequest.find();

  websocketHandler.sendLog(req, `Found ${separationRequests.length} separation requests`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: separationRequests
  });
});
