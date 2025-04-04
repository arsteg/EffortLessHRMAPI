const User = require('../models/permissions/userModel');
const catchAsync = require('../utils/catchAsync');

const { v1: uuidv1} = require('uuid');

const { BlobServiceClient } = require('@azure/storage-blob');
const constants = require('../constants');
const  websocketHandler  = require('../utils/websocketHandler');
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

  if (!document.filePath) {
    console.log(`File Path Not Exists`);
  }

  // Create a unique blob name for the profile image
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
    deleteBlobFromContainer
    // other methods...
};
  