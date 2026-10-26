const User = require('../models/permissions/userModel');
const catchAsync = require('../utils/catchAsync');

const { BlobServiceClient, StorageSharedKeyCredential,  generateBlobSASQueryParameters,  BlobSASPermissions,  SASProtocol } = require('@azure/storage-blob');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');

// Helper function to dynamically import uuid ES Module
let uuidModule = null;
async function getUuidV1() {
  if (!uuidModule) {
    uuidModule = await import('uuid');
  }
  return uuidModule.v1;
}

// AZURE STORAGE CONNECTION DETAILS
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

async function createContainerInContainer(parentContainerName, childContainerName, document) {
  // Get the reference to the parent container
  const parentContainerClient = blobServiceClient.getContainerClient(parentContainerName);

  // Check if the parent container exists
  const parentExists = await parentContainerClient.exists();
  if (!parentExists) {
    // Create parent container if it doesn't exist
    await parentContainerClient.create();
    await parentContainerClient.setAccessPolicy('container');
    console.log(`Parent container "${parentContainerName}" created successfully`);
  } else {
    console.log(`Parent container "${parentContainerName}" already exists`);
  }
  // NOTE: this function keeps its historical public-container behavior for
  // existing callers (leave/expense/timelog/profile documents) that were not
  // in scope for the task-management audit. Task/comment attachments use
  // createPrivateContainerInContainer + getTaskAttachmentReadUrl below
  // instead (TM-005), which never grants anonymous container access.

  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  // Create a unique blob name for the profile image
  const uuidv1 = await getUuidV1();
  const profileBlobName = childContainerName + "/"  + uuidv1() + document.filePath;
  const blockBlobClientProfile = parentContainerClient.getBlockBlobClient(profileBlobName);

  console.log("Uploading profile image to Azure storage...");

  // Convert the base64 image to a buffer for uploading
  const buffer = Buffer.from(document.file, 'base64');

  // Upload the image to Azure Blob Storage
  const uploadBlobResponse = await blockBlobClientProfile.upload(buffer, buffer.length);
  console.log("Profile image uploaded successfully. RequestId:", uploadBlobResponse.requestId);

  // Construct the URL for accessing the uploaded image
  const profileImageUrl = process.env.CONTAINER_URL_BASE_URL + parentContainerName+"/"+profileBlobName;
return profileImageUrl;
}

async function createContainerInContainerSAS(parentContainerName, childContainerName, document) {
  // Get the reference to the parent container
  const parentContainerClient = blobServiceClient.getContainerClient(parentContainerName);

  // Check if the parent container exists
  const parentExists = await parentContainerClient.exists();
  if (!parentExists) {
    // Create parent container if it doesn't exist
    await parentContainerClient.create();
    await parentContainerClient.setAccessPolicy('container');
    console.log(`Parent container "${parentContainerName}" created successfully`);
  } else {
    console.log(`Parent container "${parentContainerName}" already exists`);
  }

  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  // Create a unique blob name for the profile image
  const uuidv1 = await getUuidV1();
  const profileBlobName = childContainerName + "/"  + uuidv1() + document.filePath;
  const blockBlobClientProfile = parentContainerClient.getBlockBlobClient(profileBlobName);

  console.log("Uploading profile image to Azure storage...");

  // Convert the base64 image to a buffer for uploading
  const buffer = Buffer.from(document.file, 'base64');

  // Upload the image to Azure Blob Storage
  const uploadBlobResponse = await blockBlobClientProfile.upload(buffer, buffer.length);
  console.log("Profile image uploaded successfully. RequestId:", uploadBlobResponse.requestId);

  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;

  // Parse account name and key from connection string
  const accountName = connStr.match(/AccountName=([^;]+)/)[1];
  const accountKey = connStr.match(/AccountKey=([^;]+)/)[1];
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

    // ✅ Define SAS options
    const expiresOn = new Date();
    expiresOn.setFullYear(expiresOn.getFullYear() + 100);
    const sasOptions = {
      containerName: parentContainerName,
      blobName: profileBlobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: expiresOn,
      protocol: SASProtocol.Https
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    const profileImageUrl = `${blockBlobClientProfile.url}?${sasToken}`;

return profileImageUrl;
}

// --- Private attachment storage for Task Management (TM-005) --------------
// Task and comment attachments must not be readable without authentication.
// This uploads into a container that is left at its Azure default (private,
// no anonymous access) and returns only a stable, token-free "address" for
// the blob; getTaskAttachmentReadUrl() below mints a short-lived, read-only
// SAS URL on demand whenever the API actually serves the attachment to an
// authenticated, authorized caller, instead of baking a long-lived or
// permanent public link into the database.
async function createPrivateContainerInContainer(parentContainerName, childContainerName, document) {
  const parentContainerClient = blobServiceClient.getContainerClient(parentContainerName);

  const parentExists = await parentContainerClient.exists();
  if (!parentExists) {
    // Intentionally do NOT call setAccessPolicy here — Azure containers are
    // private by default, which is what we want for task/comment attachments.
    await parentContainerClient.create();
    console.log(`Parent container "${parentContainerName}" created successfully (private)`);
  }

  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  const uuidv1 = await getUuidV1();
  const blobName = childContainerName + "/" + uuidv1() + document.filePath;
  const blockBlobClient = parentContainerClient.getBlockBlobClient(blobName);

  const buffer = Buffer.from(document.file, 'base64');
  await blockBlobClient.upload(buffer, buffer.length);

  // Stored for reference only — not usable to fetch the file without a SAS
  // token, since the container grants no anonymous access.
  const storedUrl = process.env.CONTAINER_URL_BASE_URL + parentContainerName + "/" + blobName;
  return storedUrl;
}

/** Mints a short-lived, read-only SAS URL for a blob address previously
 * returned by createPrivateContainerInContainer. Call this only after
 * verifying the requesting user is authorized to see the attachment. */
function getTaskAttachmentReadUrl(storedUrl, expiryMinutes = 60) {
  if (!storedUrl) return storedUrl;

  const baseUrl = process.env.CONTAINER_URL_BASE_URL;
  let relativePath = storedUrl;
  if (baseUrl && storedUrl.startsWith(baseUrl)) {
    relativePath = storedUrl.slice(baseUrl.length);
  }
  const [containerName, ...blobNameParts] = relativePath.split('/');
  const blobName = blobNameParts.join('/');
  if (!containerName || !blobName) return storedUrl;

  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = connStr.match(/AccountName=([^;]+)/)[1];
  const accountKey = connStr.match(/AccountKey=([^;]+)/)[1];
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse('r'),
    // Small buffer for clock skew between this server and Azure.
    startsOn: new Date(Date.now() - 5 * 60 * 1000),
    expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
    protocol: SASProtocol.Https,
  };
  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return `${blockBlobClient.url}?${sasToken}`;
}

async function deleteBlobFromContainer(containerName, blobUrl) {
  try {
    // Step 1: Extract the relative blob path from the full URL
    const urlParts = blobUrl.split('/');
    const blobPath = urlParts.slice(4).join('/');  // Everything after the container name is the blob path

    // Step 2: Get a reference to the container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Step 3: Get the BlockBlobClient for the specific blob to delete
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Step 4: Delete the blob if it exists
    const deleteResponse = await blockBlobClient.deleteIfExists();

    // Step 5: Return a flag indicating success (true if deleted, false if not found)
    if (deleteResponse.errorCode) {
      console.log(`Failed to delete blob: ${blobPath}. Error code: ${deleteResponse.errorCode}`);
      return false; // Failed to delete
    } else {
      console.log(`Blob deleted successfully: ${blobPath}`);
      return true; // Success
    }
  } catch (error) {
    console.error(`Error deleting blob from container: ${error.message}`);
    return false; // Error occurred
  }
}

  
  module.exports = {
    createContainerInContainer,
    createContainerInContainerSAS,
    createPrivateContainerInContainer,
    getTaskAttachmentReadUrl,
    deleteBlobFromContainer
    // other methods...
};
  