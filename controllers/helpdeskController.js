const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError.js");
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');
const HelpdeskTicket = require('../models/helpdeskModel');
const sendEmail = require('../utils/email');
const User = require('../models/permissions/userModel');
const { BlobServiceClient } = require('@azure/storage-blob');
const crypto = require("crypto");

exports.createHelpdesk = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, "Creating helpdesk ticket", constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, "Missing company ID in cookies", constants.LOG_TYPES.WARN);
    return next(new AppError(req.t("user.companyIdRequired"), 400));
  }

  const description = req.body.description || "";
  const filesBase64 = Array.isArray(req.body.files) ? req.body.files : [];
  const videoBase64 = req.body.video || null;
  let fileUrls = [];
  let videoUrl = null;

  try {
    // Upload files (images, PDFs, documents, text)
    for (const base64File of filesBase64) {
      if (typeof base64File !== "string" || !base64File.startsWith("data:")) {
        throw new Error("Invalid file format: Must be a base64 string.");
      }
      const fileUrl = await uploadBase64ToBlob(base64File, "file", companyId, req.cookies.userId);
      console.log(`Uploaded file: ${fileUrl}`);
      fileUrls.push(fileUrl);
    }

    // Upload video
    if (videoBase64) {
      if (typeof videoBase64 !== "string" || !videoBase64.startsWith("data:video/")) {
        throw new Error("Invalid video format: Must be a base64 video string.");
      }
      videoUrl = await uploadBase64ToBlob(videoBase64, "video", companyId, req.cookies.userId);
      console.log(`Uploaded video: ${videoUrl}`);
    }
  } catch (uploadError) {
    console.error("Upload error details:", uploadError);
    websocketHandler.sendLog(req, `File upload failed: ${uploadError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to upload files to storage: ${uploadError.message}`, 500));
  }

  try {
    const newTicket = await HelpdeskTicket.create({
      description,
      company: companyId,
      files: fileUrls.join(","),
      video: videoUrl,
      status: "Open",
      createdBy: req.cookies.userId,
      updatedBy: req.cookies.userId,
    });

    websocketHandler.sendLog(req, "Helpdesk ticket created successfully", constants.LOG_TYPES.INFO);

    const newUser = await User.findById(req.cookies.userId);
    if (!newUser) {
      console.log("User not found for email notification:", req.cookies.userId);
      websocketHandler.sendLog(req, "User not found for email notification", constants.LOG_TYPES.WARN);
      return next(new AppError("User not found", 404));
    }
    console.log("User found for email notification:", req.cookies.userId);
    // Generate ticket URL (adjust based on your application's URL structure)
    const ticketUrl = `${process.env.WEBSITE_DOMAIN}/#/helpdesk/tickets/${newTicket._id}`;

    const userMessage = `<p>Hello ${newUser.firstName} ${newUser.lastName},</p>
      <p>Your helpdesk ticket has been successfully created in the Effortless HRM management system.</p>
      <p>Ticket URL: <a href="${ticketUrl}">${ticketUrl}</a></p>
      <p>Description: ${description}</p>
      <p>Thank you,</p>
      <p>${req.cookies.companyName}</p>`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: "Your Helpdesk Ticket Has Been Created",
        message: userMessage,
      });
      websocketHandler.sendLog(req, "User email notification sent successfully", constants.LOG_TYPES.INFO);
    } catch (emailError) {
      console.error("User email sending error:", emailError);
      websocketHandler.sendLog(req, `Failed to send user email: ${emailError.message}`, constants.LOG_TYPES.ERROR);
    }

    // Email to helpdesk team for resolution
    const helpdeskEmails = process.env.HELPDESKEMAIL ? process.env.HELPDESKEMAIL.split(',') : [];
    if (helpdeskEmails.length > 0) {
      const helpdeskMessage = `<p>Hello Helpdesk Team,</p>
        <p>A new helpdesk ticket has been created in the Effortless HRM management system and requires your attention.</p>
        <p>Ticket URL: <a href="${ticketUrl}">${ticketUrl}</a></p>
        <p>Description: ${description}</p> 
        <p>Created By: ${newUser.firstName} ${newUser.lastName} (${newUser.email})</p>
        <p>Please review and resolve the ticket at your earliest convenience.</p>
        <p>Thank you,</p>
        <p>${req.cookies.companyName}</p>`;

      try {
        await sendEmail({
          email: helpdeskEmails,
          subject: "New Helpdesk Ticket Awaiting Resolution",
          message: helpdeskMessage,
        });
        websocketHandler.sendLog(req, "Helpdesk email notification sent successfully", constants.LOG_TYPES.INFO);
      } catch (emailError) {
        console.error("Helpdesk email sending error:", emailError);
        websocketHandler.sendLog(req, `Failed to send helpdesk email: ${emailError.message}`, constants.LOG_TYPES.ERROR);
        // Continue even if helpdesk email fails
      }
    } else {
      websocketHandler.sendLog(req, "No helpdesk emails configured", constants.LOG_TYPES.WARN);
    }
    
    const allUserTickets = await HelpdeskTicket.find({
      company: companyId,
      createdBy: req.cookies.userId
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      message: "Helpdesk ticket created successfully.",
      data: allUserTickets,
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Helpdesk ticket creation failed: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to create helpdesk ticket in database: ${dbError.message}`, 500));
  }
});

exports.getAllHelpdeskByCompanyId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, "Fetching all helpdesk tickets", constants.LOG_TYPES.TRACE);

  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, "Missing company ID in cookies", constants.LOG_TYPES.WARN);
    return next(new AppError(req.t("user.companyIdRequired"), 400));
  }

  try {
    const tickets = await HelpdeskTicket.find({ company: companyId });

    websocketHandler.sendLog(req, "Fetched helpdesk tickets successfully", constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: tickets,
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Failed to fetch helpdesk tickets: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to fetch helpdesk tickets: ${dbError.message}`, 500));
  }
});

exports.getAllHelpdeskByUserId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, "Fetching all helpdesk tickets", constants.LOG_TYPES.TRACE);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const companyId = req.cookies.companyId;
  if (!companyId) {
    websocketHandler.sendLog(req, "Missing company ID in cookies", constants.LOG_TYPES.WARN);
    return next(new AppError(req.t("user.companyIdRequired"), 400));
  }

  const userId = req.cookies.userId;
  if (!userId) {
    websocketHandler.sendLog(req, "Missing user ID in cookies", constants.LOG_TYPES.WARN);
    return next(new AppError(req.t("user.userIdRequired"), 400));
  }

  try {

    // Fetch user details using userId
    const user = await User.findById(userId).select('email');
    if (!user) {
      websocketHandler.sendLog(req, "User not found", constants.LOG_TYPES.WARN);
      return next(new AppError(req.t("user.notFound"), 404));
    }

    // Check if user is a helpdesk admin based on environment variable
    const helpdeskEmails = process.env.HELPDESKEMAIL ? process.env.HELPDESKEMAIL.split(',') : [];
    const isHelpdeskAdmin = helpdeskEmails.includes(user.email);

    // Define query based on user role
    const query = isHelpdeskAdmin ? { } : { company: companyId, createdBy: userId };

       // Get the total count of documents matching the query
    const totalCount = await HelpdeskTicket.countDocuments(query);
    
    const tickets = await HelpdeskTicket.find(query).skip(parseInt(skip))
      .limit(parseInt(limit));

    websocketHandler.sendLog(req, "Fetched helpdesk tickets successfully", constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: tickets,
      total: totalCount
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Failed to fetch helpdesk tickets: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to fetch helpdesk tickets: ${dbError.message}`, 500));
  }
});

exports.getHelpdeskById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Fetching helpdesk ticket by ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const ticket = await HelpdeskTicket.findOne({ _id: req.params.id });

    if (!ticket) {
      websocketHandler.sendLog(req, "Helpdesk ticket not found", constants.LOG_TYPES.WARN);
      return next(new AppError("Helpdesk ticket not found", 404));
    }

    websocketHandler.sendLog(req, "Fetched helpdesk ticket successfully", constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: ticket,
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Failed to fetch helpdesk ticket: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to fetch helpdesk ticket: ${dbError.message}`, 500));
  }
});

exports.updateHelpdeskById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating helpdesk ticket ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const { status, remark } = req.body;
  console.log("Status:", status);
  console.log("Remark:", remark);
  try {
    const ticket = await HelpdeskTicket.findOneAndUpdate(
      { _id: req.params.id },
      {
        status,
        remarks: remark,
        updatedBy: req.cookies.userId,
        updatedOn: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      websocketHandler.sendLog(req, "Helpdesk ticket not found for update", constants.LOG_TYPES.WARN);
      return next(new AppError("Helpdesk ticket not found", 404));
    }

    websocketHandler.sendLog(req, "Helpdesk ticket updated successfully", constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: "Helpdesk ticket updated.",
      data: ticket,
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Failed to update helpdesk ticket: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to update helpdesk ticket: ${dbError.message}`, 500));
  }
});

exports.deleteHelpdeskById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Deleting helpdesk ticket ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  console.log("Req user id:", req.user?._id);
  console.log("Req user :", req.user);
  console.log("cookies ser id :", req.cookies.userId);
  try {
    const result = await HelpdeskTicket.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      websocketHandler.sendLog(req, "Helpdesk ticket not found for deletion", constants.LOG_TYPES.WARN);
      return next(new AppError("Helpdesk ticket not found", 404));
    }

    websocketHandler.sendLog(req, "Helpdesk ticket deleted successfully", constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: "Helpdesk ticket deleted.",
    });
  } catch (dbError) {
    console.error("Database error details:", dbError);
    websocketHandler.sendLog(req, `Failed to delete helpdesk ticket: ${dbError.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(`Failed to delete helpdesk ticket: ${dbError.message}`, 500));
  }
});

async function uploadBase64ToBlob(file, fileType, companyId, userId) {
  if (!file || typeof file !== "string") {
    throw new Error("Invalid input: File must be a base64 string.");
  }
  if (!companyId || !userId) {
    throw new Error("Company ID and User ID are required.");
  }
  if (!["file", "video"].includes(fileType)) {
    throw new Error("File type must be 'file' or 'video'.");
  }

  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage Connection string not found");
  }

  let blobServiceClient;
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  } catch (error) {
    console.error("Failed to initialize BlobServiceClient:", error.message);
    throw new Error(`Failed to initialize Azure client: ${error.message}`);
  }

  const containerName = "helpdesk";
  const containerClient = blobServiceClient.getContainerClient(containerName);
  try {
    await containerClient.createIfNotExists({ access: "container" });
    console.log(`Container '${containerName}' ready`);
  } catch (error) {
    console.error("Failed to create container:", error.message);
    throw new Error(`Failed to create container: ${error.message}`);
  }

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  console.log(`Generated unique suffix: ${uniqueSuffix}`);

  let fileBuffer;
  let contentType;
  let extension;

  const matches = file.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    console.error("Invalid base64 format:", file.substring(0, 50));
    throw new Error("Invalid base64 string format.");
  }

  contentType = matches[1];
  const base64Data = matches[2];

  const validFileTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

  if (fileType === "file" && !validFileTypes.includes(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`);
  }
  if (fileType === "video" && !validVideoTypes.includes(contentType)) {
    throw new Error(`Unsupported video type: ${contentType}`);
  }

  try {
    fileBuffer = Buffer.from(base64Data, "base64");
    console.log(`Converted base64 to buffer, size: ${fileBuffer.length} bytes`);
  } catch (error) {
    console.error("Base64 decoding failed:", error.message);
    throw new Error("Failed to decode base64 string.");
  }

  const extensionMap = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogg",
  };
  extension = extensionMap[contentType] || "bin";
  console.log(`Determined extension: ${extension}`);

  const blobName = `${companyId}/${userId}/${fileType}/${uniqueSuffix}.${extension}`;
  console.log(`Blob name: ${blobName}`);

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  try {
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    console.log(`Uploaded ${fileType} to: ${blockBlobClient.url}`);
    return blockBlobClient.url;
  } catch (error) {
    console.error(`Failed to upload ${fileType}:`, error.message);
    throw new Error(`Failed to upload ${fileType}: ${error.message}`);
  }
}
