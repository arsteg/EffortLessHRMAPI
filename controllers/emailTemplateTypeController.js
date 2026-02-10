const EmailTemplateType = require('../models/commons/emailTemplateTypeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

// Add new email template type
exports.addEmailTemplateType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addEmailTemplateType', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Adding email template type for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;

  // Validate company ID
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.companyIdMissing'), 400));
  }

  // Validate required fields
  if (!req.body.emailTemplateTypeId) {
    websocketHandler.sendLog(req, 'Email template type ID is required', constants.LOG_TYPES.ERROR);
    return next(new AppError('Email template type ID is required', 400));
  }

  // Check if emailTemplateTypeId already exists
  const existingTypeById = await EmailTemplateType.findOne({
    emailTemplateTypeId: req.body.emailTemplateTypeId
  });

  if (existingTypeById) {
    websocketHandler.sendLog(req, `Email template type ID already exists: ${req.body.emailTemplateTypeId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError('Email template type ID already exists', 400));
  }

  // Check if name already exists for this company
  const existingType = await EmailTemplateType.findOne({
    name: req.body.name,
    company: companyId
  });

  if (existingType) {
    websocketHandler.sendLog(req, `Email template type name already exists: ${req.body.name}`, constants.LOG_TYPES.ERROR);
    return next(new AppError('Email template type name already exists', 400));
  }

  const newEmailTemplateType = {
    emailTemplateTypeId: req.body.emailTemplateTypeId,
    name: req.body.name,
    company: companyId,
    createdOn: new Date(),
    updatedOn: new Date(),
    createdBy: req.cookies.userId,
    updatedBy: req.cookies.userId,
    isDelete: false
  };

  const result = await EmailTemplateType.create(newEmailTemplateType);
  websocketHandler.sendLog(req, `Email template type saved: ${result._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: result
  });
});

// Update email template type
exports.updateEmailTemplateType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateEmailTemplateType', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating email template type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const id = req.params.id;
  const companyId = req.cookies.companyId;

  // Check if name already exists for this company (excluding current record)
  if (req.body.name) {
    const existingType = await EmailTemplateType.findOne({
      name: req.body.name,
      company: companyId,
      _id: { $ne: id }
    });

    if (existingType) {
      websocketHandler.sendLog(req, `Email template type name already exists: ${req.body.name}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.emailTemplateTypeNameExists'), 400));
    }
  }

  const updatedType = {
    ...req.body,
    updatedOn: new Date(),
    updatedBy: req.cookies.userId
  };

  // Remove fields that shouldn't be updated
  delete updatedType.emailTemplateTypeId;
  delete updatedType.company;
  delete updatedType.createdOn;
  delete updatedType.createdBy;

  EmailTemplateType.findByIdAndUpdate(id, updatedType, { new: true })
    .then((updatedType) => {
      websocketHandler.sendLog(req, `Email template type updated: ${updatedType._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json(updatedType);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error updating email template type: ${error.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.serverError')));
    });
});

// Delete email template type
exports.deleteEmailTemplateType = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteEmailTemplateType', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting email template type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const id = req.params.id;
  const emailTemplateType = await EmailTemplateType.findOne({ _id: req.params.id });

  if (!emailTemplateType) {
    websocketHandler.sendLog(req, `Email template type not found: ${id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.emailTemplateTypeNotFound'), 404));
  }

  // Check if it's a system-defined type (isDelete: true means system-protected)
  if (emailTemplateType.isDelete) {
    websocketHandler.sendLog(req, `Cannot delete system-defined template type: ${id}`, constants.LOG_TYPES.ERROR);
    res.status(200).json({
      status: 'Not Authorized',
      data: req.t('common.systemTemplateTypeDeleteNotAllowed')
    });
  } else {
    // Check if this template type is being used by any email templates
    const EmailTemplate = require('../models/commons/emailTemplateModel');
    const templatesUsingType = await EmailTemplate.findOne({
      templateType: emailTemplateType.emailTemplateTypeId,
      company: req.cookies.companyId
    });

    if (templatesUsingType) {
      websocketHandler.sendLog(req, `Cannot delete template type in use: ${id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.emailTemplateTypeInUse'), 400));
    }

    EmailTemplateType.findByIdAndRemove(id)
      .then(() => {
        websocketHandler.sendLog(req, `Email template type deleted: ${id}`, constants.LOG_TYPES.INFO);
        res.sendStatus(204);
      })
      .catch((error) => {
        websocketHandler.sendLog(req, `Error deleting email template type: ${error.message}`, constants.LOG_TYPES.ERROR);
        return next(new AppError(req.t('common.serverError')));
      });
  }
});

// Get email template type by ID
exports.getEmailTemplateTypeById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getEmailTemplateTypeById', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching email template type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const emailTemplateType = await EmailTemplateType.findById(req.params.id);

    if (!emailTemplateType) {
      websocketHandler.sendLog(req, `Email template type not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({ error: req.t('common.emailTemplateTypeNotFound') });
    }

    websocketHandler.sendLog(req, `Email template type retrieved: ${emailTemplateType._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json(emailTemplateType);
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching email template type: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ error: req.t('common.serverError') });
  }
});

// Get all email template types for the company
exports.getAllEmailTemplateTypes = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllEmailTemplateTypes', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching email template types for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  try {
    const emailTemplateTypes = await EmailTemplateType.find({ company: req.cookies.companyId }).sort('emailTemplateTypeId');
    websocketHandler.sendLog(req, `Retrieved ${emailTemplateTypes.length} email template types`, constants.LOG_TYPES.INFO);
    res.status(200).json(emailTemplateTypes);
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching email template types: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({ error: req.t('common.serverError') });
  }
});

// Change email template type status
exports.changeEmailTemplateTypeStatus = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting changeEmailTemplateTypeStatus', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Changing status of email template type with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const id = req.params.id;
  const updatedType = req.body;
  updatedType.updatedOn = new Date();
  updatedType.updatedBy = req.cookies.userId;

  EmailTemplateType.findByIdAndUpdate(id, updatedType, { new: true })
    .then((updatedType) => {
      websocketHandler.sendLog(req, `Email template type status updated: ${updatedType._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json(updatedType);
    })
    .catch((error) => {
      websocketHandler.sendLog(req, `Error updating email template type status: ${error.message}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('common.serverError')));
    });
});
