const FeedbackField = require('../models/feedback/feedbackFieldSchema');
const Feedback = require('../models/feedback/feedbackFormSchema');
const catchAsync = require('../utils/catchAsync');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');
const feedbackQRCode = require('../models/feedback/feedbackQRCode');
const QRCode = require('qrcode');


// Feedback Field Controllers
exports.createFeedbackField = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated creating a feedback field. User ID: ${req.cookies.userId}, Company ID: ${req.body.company}`);
  try {
    const feedbackField = await FeedbackField.create({
      name: req.body.name,
      company: req.cookies.companyId, // Fallback to cookie if not provided
      description: req.body.description,
      dataType: req.body.dataType,
      isRequired: req.body.isRequired || false,
    });

    websocketHandler.logEvent(req, `User successfully created a feedback field. Field ID: ${feedbackField._id}, User ID: ${req.cookies.userId}`);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: feedbackField,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to create a feedback field. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getFeedbackFieldById = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated fetching a feedback field by ID. Field ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const feedbackField = await FeedbackField.findById(req.params.id);
    if (!feedbackField) {
      websocketHandler.logEvent(req, `User failed to fetch feedback field. Field ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Feedback field not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched feedback field. Field ID: ${feedbackField._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedbackField,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch feedback field by ID. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getFeedbackFieldsByCompany = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId || req.params.companyId; // Use URL parameter
  
  websocketHandler.logEvent(req, `User initiated fetching feedback fields for company. Company ID: ${companyId}, User ID: ${req.cookies.userId}`);
  try {
    const feedbackFields = await FeedbackField.find({ company: companyId });
    if (!feedbackFields || feedbackFields.length === 0) {
      websocketHandler.logEvent(req, `User failed to fetch feedback fields. No fields found for Company ID: ${companyId}`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'No feedback fields found for this company',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched feedback fields. Company ID: ${companyId}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedbackFields,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch feedback fields for company. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.updateFeedbackField = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated updating a feedback field. Field ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const feedbackField = await FeedbackField.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!feedbackField) {
      websocketHandler.logEvent(req, `User failed to update feedback field. Field ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Feedback field not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully updated feedback field. Field ID: ${feedbackField._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedbackField,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to update feedback field. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.deleteFeedbackField = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated deleting a feedback field. Field ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const feedbackField = await FeedbackField.findByIdAndDelete(req.params.id);
    if (!feedbackField) {
      websocketHandler.logEvent(req, `User failed to delete feedback field. Field ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Feedback field not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully deleted feedback field. Field ID: ${feedbackField._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedbackField,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to delete feedback field. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

// Feedback Submission Controllers
exports.submitFeedback = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated submitting feedback. Company ID: ${req.body.company || req.cookies.companyId}, User ID: ${req.cookies.userId}`);
  try {
    // Validate feedback values against feedback fields
    const feedbackFields = await FeedbackField.find({ _id: { $in: req.body.feedbackValues.map(fv => fv.field) } });
    const fieldMap = new Map(feedbackFields.map(f => [f._id.toString(), f]));

    for (const fv of req.body.feedbackValues) {
      const field = fieldMap.get(fv.field);
      if (!field) throw new Error(`Invalid feedback field ID: ${fv.field}`);
      if (field.isRequired && (fv.value === undefined || fv.value === null)) {
        throw new Error(`Value for required field '${field.name}' is missing`);
      }
      // Add more type validation if needed (e.g., check dataType matches value)
    }

    const feedback = await Feedback.create({
      company: req.body.company || req.cookies.companyId,
      storeId: req.body.storeId,
      tableId: req.body.tableId,
      provider: {
        email: req.body.provider?.email,
        phoneNumber: req.body.provider?.phoneNumber,
        name: req.body.provider?.name,
      },
      feedbackValues: req.body.feedbackValues,
    });

    websocketHandler.logEvent(req, `User successfully submitted feedback. Feedback ID: ${feedback._id}, User ID: ${req.cookies.userId}`);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: feedback,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to submit feedback. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getFeedbackById = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated fetching feedback by ID. Feedback ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const feedback = await Feedback.findById(req.params.id).populate('feedbackValues.field');
    if (!feedback) {
      websocketHandler.logEvent(req, `User failed to fetch feedback. Feedback ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Feedback not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched feedback. Feedback ID: ${feedback._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedback,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch feedback by ID. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getFeedbackByStore = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated fetching feedback for store. Store ID: ${req.params.storeId}, User ID: ${req.cookies.userId}`);
  try {
    const filters = { storeId: req.params.storeId };
    if (req.query.startDate && req.query.endDate) {
      filters.submittedAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const feedback = await Feedback.find(filters).populate('feedbackValues.field');
    if (!feedback || feedback.length === 0) {
      websocketHandler.logEvent(req, `User failed to fetch feedback. No feedback found for Store ID: ${req.params.storeId}`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'No feedback found for this store',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched feedback for store. Store ID: ${req.params.storeId}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedback,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch feedback for store. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getFeedbackByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated fetching feedback for company. Company ID: ${req.params.companyId}, User ID: ${req.cookies.userId}`);
  const companyId = req.cookies.companyId
  try {
    const filters = { company: companyId };
    if (req.query.startDate && req.query.endDate) {
      filters.submittedAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const feedback = await Feedback.find(filters).populate('feedbackValues.field');
    if (!feedback || feedback.length === 0) {
      websocketHandler.logEvent(req, `User failed to fetch feedback. No feedback found for Company ID: ${req.params.companyId}`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'No feedback found for this company',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched feedback for company. Company ID: ${req.params.companyId}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedback,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch feedback for company. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.deleteFeedback = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated deleting feedback. Feedback ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      websocketHandler.logEvent(req, `User failed to delete feedback. Feedback ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Feedback not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully deleted feedback. Feedback ID: ${feedback._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: feedback,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to delete feedback. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});


// Existing Feedback Field Controllers (unchanged)


// Barcode Controllers
exports.createBarcode = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated creating a barcode. Company ID: ${req.cookies.companyId}, User ID: ${req.cookies.userId}`);
  try {
    const {name,storeId, tableId, url } = req.body;
    const companyId = req.cookies.companyId;
    if (!storeId || !tableId || !url) {
      throw new Error('storeId, tableId, and url are required');
    }    
    const fullURL = `${process.env.WEBSITE_DOMAIN}${url}&companyId=${req.cookies.companyId}`
    const qrCodeDataUrl = await QRCode.toDataURL(fullURL); // Generate QR code as base64
    
    websocketHandler.logEvent(req, `qrCodeDataUrl: ${qrCodeDataUrl}`);

    const barcode = await feedbackQRCode.create({
      name,
      companyId,
      storeId,
      tableId,
      url:fullURL,
      qrCodeDataUrl
    });

    websocketHandler.logEvent(req, `User successfully created a barcode. Barcode ID: ${barcode._id}, User ID: ${req.cookies.userId}`);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: barcode,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to create a barcode. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getBarcodesByCompany = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  websocketHandler.logEvent(req, `User initiated fetching barcodes for company. Company ID: ${companyId}, User ID: ${req.cookies.userId}`);
  try {
    const barcodes = await feedbackQRCode.find({ company: companyId });
    if (!barcodes || barcodes.length === 0) {
      websocketHandler.logEvent(req, `User failed to fetch barcodes. No barcodes found for Company ID: ${companyId}`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'No barcodes found for this company',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched barcodes. Company ID: ${companyId}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: barcodes,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch barcodes for company. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.getBarcodeById = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated fetching a barcode by ID. Barcode ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const barcode = await feedbackQRCode.findById(req.params.id);
    if (!barcode) {
      websocketHandler.logEvent(req, `User failed to fetch barcode. Barcode ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Barcode not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully fetched barcode. Barcode ID: ${barcode._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: barcode,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to fetch barcode by ID. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.updateBarcode = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated updating a barcode. Barcode ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const { storeId, tableId, url } = req.body;
    const qrCodeDataUrl = url ? await QRCode.toDataURL(url) : undefined; // Regenerate QR code if URL changes

    const barcode = await feedbackQRCode.findByIdAndUpdate(
      req.params.id,
      { storeId, tableId, url, ...(qrCodeDataUrl && { qrCodeDataUrl }) },
      { new: true, runValidators: true }
    );

    if (!barcode) {
      websocketHandler.logEvent(req, `User failed to update barcode. Barcode ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Barcode not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully updated barcode. Barcode ID: ${barcode._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: barcode,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to update barcode. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});

exports.deleteBarcode = catchAsync(async (req, res, next) => {
  websocketHandler.logEvent(req, `User initiated deleting a barcode. Barcode ID: ${req.params.id}, User ID: ${req.cookies.userId}`);
  try {
    const barcode = await feedbackQRCode.findByIdAndDelete(req.params.id);
    if (!barcode) {
      websocketHandler.logEvent(req, `User failed to delete barcode. Barcode ID: ${req.params.id} not found`);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Barcode not found',
      });
    }

    websocketHandler.logEvent(req, `User successfully deleted barcode. Barcode ID: ${barcode._id}, User ID: ${req.cookies.userId}`);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: barcode,
    });
  } catch (err) {
    websocketHandler.logEvent(req, `User failed to delete barcode. Error: ${err.message}, Stack: ${err.stack}`);
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message,
    });
  }
});