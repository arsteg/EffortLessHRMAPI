/**
 * Storage Controller - AWS S3 Implementation
 *
 * This module provides file storage operations using AWS S3.
 * It replaces the previous Azure Blob Storage implementation.
 *
 * All exported functions maintain the same signatures as the previous implementation
 * to ensure backward compatibility with existing controllers.
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const constants = require('../constants');

// Helper function to dynamically import uuid ES Module
let uuidModule = null;
async function getUuidV1() {
  if (!uuidModule) {
    uuidModule = await import('uuid');
  }
  return uuidModule.v1;
}

// AWS S3 CONFIGURATION
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_S3_REGION = process.env.AWS_S3_REGION || 'ap-south-1';

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
  throw Error("AWS S3 configuration not found. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME environment variables.");
}

// Create S3 client
const s3Client = new S3Client({
  region: AWS_S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Base URL for S3 objects (used for constructing stored URLs)
const S3_BASE_URL = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/`;

/**
 * Helper function to determine content type from file extension.
 * @param {string} filePath - The file path or name
 * @returns {string} - MIME content type
 */
function getContentType(filePath) {
  const extension = filePath.toLowerCase().split('.').pop();
  const mimeTypes = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'rtf': 'application/rtf',
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    // Video
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'webm': 'video/webm',
    // Other
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Helper function to generate a presigned URL for an S3 object.
 * @param {string} objectKey - The S3 object key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>} - Presigned URL
 */
async function generatePresignedUrl(objectKey, expiresIn) {
  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: objectKey,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return presignedUrl;
}

/**
 * Uploads a file to S3 and returns a presigned URL.
 * This replaces createContainerInContainer from Azure Blob Storage.
 *
 * Used for: Profile images, Expense attachments, Leave attachments,
 * Tax declaration attachments, Time log documents
 *
 * @param {string} parentContainerName - The parent "folder" name (company ID)
 * @param {string} childContainerName - The child "folder" name (e.g., Profile, ExpenseAttachment)
 * @param {object} document - Object containing { file: base64string, filePath: string }
 * @returns {Promise<string>} - Presigned URL for the uploaded file (valid for 7 days)
 */
async function createContainerInContainer(parentContainerName, childContainerName, document) {
  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  // Create a unique object key matching the original Azure format
  const uuidv1 = await getUuidV1();
  const objectKey = `${parentContainerName}/${childContainerName}/${uuidv1()}${document.filePath}`;

  console.log("Uploading file to AWS S3...");

  // Convert the base64 file to a buffer
  const buffer = Buffer.from(document.file, 'base64');

  // Determine content type from file extension
  const contentType = getContentType(document.filePath);

  // Upload to S3
  const uploadCommand = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: contentType,
  });

  const uploadResponse = await s3Client.send(uploadCommand);
  console.log("File uploaded successfully to S3. ETag:", uploadResponse.ETag);

  // Generate a presigned URL with 7-day expiration (maximum for IAM credentials)
  // Note: In production, you may want to implement a URL refresh mechanism
  // or use CloudFront with signed URLs for longer expiration
  const presignedUrl = await generatePresignedUrl(objectKey, 604800); // 7 days

  return presignedUrl;
}

/**
 * Uploads a file to S3 and returns a presigned URL.
 * This replaces createContainerInContainerSAS from Azure (used for company logos with 100-year SAS).
 *
 * Used for: Company logos
 *
 * @param {string} parentContainerName - The parent "folder" name (company ID)
 * @param {string} childContainerName - The child "folder" name (e.g., Company)
 * @param {object} document - Object containing { file: base64string, filePath: string }
 * @returns {Promise<string>} - Presigned URL for the uploaded file
 */
async function createContainerInContainerSAS(parentContainerName, childContainerName, document) {
  // Same implementation as createContainerInContainer
  // In Azure, this used 100-year SAS tokens; S3 presigned URLs max out at 7 days
  // For truly long-lived access, consider using CloudFront or making objects public via bucket policy
  return createContainerInContainer(parentContainerName, childContainerName, document);
}

/**
 * Uploads a file to S3 as a private object (no public access).
 * This replaces createPrivateContainerInContainer from Azure.
 * Returns only the stored URL (S3 object URL), not a presigned URL.
 *
 * Used for: Task attachments, Comment attachments (TM-005 compliance)
 *
 * @param {string} parentContainerName - The parent "folder" name (company ID)
 * @param {string} childContainerName - The child "folder" name (e.g., TaskAttachment)
 * @param {object} document - Object containing { file: base64string, filePath: string }
 * @returns {Promise<string>} - The stored URL (NOT publicly accessible without presigned URL)
 */
async function createPrivateContainerInContainer(parentContainerName, childContainerName, document) {
  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  // Create a unique object key
  const uuidv1 = await getUuidV1();
  const objectKey = `${parentContainerName}/${childContainerName}/${uuidv1()}${document.filePath}`;

  console.log("Uploading private file to AWS S3...");

  // Convert the base64 file to a buffer
  const buffer = Buffer.from(document.file, 'base64');

  // Determine content type from file extension
  const contentType = getContentType(document.filePath);

  // Upload to S3 (private by default - all S3 objects are private unless explicitly made public)
  const uploadCommand = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(uploadCommand);
  console.log("Private file uploaded successfully to S3.");

  // Return the stored URL (not publicly accessible without presigned URL)
  // This matches the Azure behavior where the stored URL cannot be accessed
  // without a SAS token
  const storedUrl = S3_BASE_URL + objectKey;
  return storedUrl;
}

/**
 * Generates a short-lived presigned URL for a private attachment.
 * This replaces getTaskAttachmentReadUrl from Azure.
 * Call this only after verifying the requesting user is authorized to see the attachment.
 *
 * @param {string} storedUrl - The stored URL returned by createPrivateContainerInContainer
 * @param {number} expiryMinutes - Expiration time in minutes (default: 60)
 * @returns {Promise<string>} - Presigned URL for reading the attachment
 */
async function getTaskAttachmentReadUrl(storedUrl, expiryMinutes = 60) {
  if (!storedUrl) return storedUrl;

  // Extract the object key from the stored URL
  let objectKey = storedUrl;

  // Handle different URL formats
  if (storedUrl.startsWith(S3_BASE_URL)) {
    objectKey = storedUrl.slice(S3_BASE_URL.length);
  } else if (storedUrl.includes('.s3.') && storedUrl.includes('.amazonaws.com/')) {
    // Handle alternate S3 URL format: https://bucket.s3.region.amazonaws.com/key
    const match = storedUrl.match(/amazonaws\.com\/(.+)$/);
    if (match) {
      objectKey = match[1];
    }
  } else if (storedUrl.startsWith('https://s3.')) {
    // Handle path-style S3 URL: https://s3.region.amazonaws.com/bucket/key
    const match = storedUrl.match(/amazonaws\.com\/[^\/]+\/(.+)$/);
    if (match) {
      objectKey = match[1];
    }
  }

  // Remove any query parameters that might be present
  if (objectKey.includes('?')) {
    objectKey = objectKey.split('?')[0];
  }

  if (!objectKey) return storedUrl;

  // Generate presigned URL with specified expiry
  const expirySeconds = expiryMinutes * 60;
  const presignedUrl = await generatePresignedUrl(objectKey, expirySeconds);

  return presignedUrl;
}

/**
 * Deletes an object from S3.
 * This replaces deleteBlobFromContainer from Azure.
 *
 * @param {string} containerName - The container/folder name (kept for API compatibility, not used in S3)
 * @param {string} blobUrl - The full URL or presigned URL of the file to delete
 * @returns {Promise<boolean>} - True if deleted successfully, false otherwise
 */
async function deleteBlobFromContainer(containerName, blobUrl) {
  try {
    // Extract the object key from the URL
    let objectKey = blobUrl;

    // Handle different URL formats
    if (blobUrl.startsWith(S3_BASE_URL)) {
      objectKey = blobUrl.slice(S3_BASE_URL.length);
    } else if (blobUrl.includes('.s3.') && blobUrl.includes('.amazonaws.com/')) {
      // Handle presigned URLs or virtual-hosted style URLs
      const match = blobUrl.match(/amazonaws\.com\/(.+?)(\?|$)/);
      if (match) {
        objectKey = match[1];
      }
    } else if (blobUrl.startsWith('https://s3.')) {
      // Handle path-style S3 URL
      const match = blobUrl.match(/amazonaws\.com\/[^\/]+\/(.+?)(\?|$)/);
      if (match) {
        objectKey = match[1];
      }
    }

    // Remove query parameters (presigned URL params)
    if (objectKey.includes('?')) {
      objectKey = objectKey.split('?')[0];
    }

    // Decode URL-encoded characters
    objectKey = decodeURIComponent(objectKey);

    console.log(`Deleting object from S3: ${objectKey}`);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: objectKey,
    });

    await s3Client.send(deleteCommand);
    console.log(`Object deleted successfully: ${objectKey}`);
    return true;
  } catch (error) {
    console.error(`Error deleting object from S3: ${error.message}`);
    return false;
  }
}

module.exports = {
  createContainerInContainer,
  createContainerInContainerSAS,
  createPrivateContainerInContainer,
  getTaskAttachmentReadUrl,
  deleteBlobFromContainer,
};
