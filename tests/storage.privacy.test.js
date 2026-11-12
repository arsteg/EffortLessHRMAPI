// Unit tests for TM-005 (private attachment storage). These exercise only
// the local, offline parts of storageController (presigned URL generation is a
// local computation using AWS SDK). We deliberately do NOT call
// createPrivateContainerInContainer/createContainerInContainer here, since
// those perform real network calls against AWS S3.
const StorageController = require('../controllers/storageController');
const fs = require('fs');
const path = require('path');

describe('TM-005: private attachment storage (AWS S3)', () => {
  test('getTaskAttachmentReadUrl mints a presigned URL scoped to the right bucket/object and does not return the bare stored address', async () => {
    // Note: This test requires AWS credentials to be set in environment
    // The stored URL format for S3: https://bucket.s3.region.amazonaws.com/key
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'effortlesshrm-storage';
    const region = process.env.AWS_S3_REGION || 'ap-south-1';
    const storedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/someCompanyId/TaskAttachment/abc123-report.pdf`;

    const signedUrl = await StorageController.getTaskAttachmentReadUrl(storedUrl, 30);

    // The signed URL should be different from the stored URL (has query params)
    expect(signedUrl).not.toBe(storedUrl);
    // It should start with the same base path
    expect(signedUrl.startsWith(storedUrl.split('?')[0])).toBe(true);
    // S3 presigned URLs have these AWS signature parameters
    expect(signedUrl).toMatch(/X-Amz-Algorithm=/);
    expect(signedUrl).toMatch(/X-Amz-Credential=/);
    expect(signedUrl).toMatch(/X-Amz-Signature=/);
    expect(signedUrl).toMatch(/X-Amz-Expires=/);
  });

  test('task attachment uploads use the private storage helper, not the public one', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'taskController.js'), 'utf8');
    const publicCalls = src.match(/StorageController\.createContainerInContainer\(/g) || [];
    const privateCalls = src.match(/StorageController\.createPrivateContainerInContainer\(/g) || [];

    expect(publicCalls.length).toBe(0);
    expect(privateCalls.length).toBeGreaterThanOrEqual(3);
  });

  test('createPrivateContainerInContainer does not grant public access (S3 objects are private by default)', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'storageController.js'), 'utf8');
    const start = src.indexOf('async function createPrivateContainerInContainer');
    expect(start).toBeGreaterThan(-1);
    const nextFnStart = src.indexOf('\nasync function', start + 1);
    const body = src.slice(start, nextFnStart === -1 ? undefined : nextFnStart);

    // S3-specific: Ensure we don't use ACL: 'public-read' or any public ACL
    expect(body).not.toMatch(/ACL:\s*['"]public-read['"]/);
    expect(body).not.toMatch(/ACL:\s*['"]public-read-write['"]/);
    expect(body).not.toMatch(/ACL:\s*['"]authenticated-read['"]/);

    // Also verify no Azure-specific public access calls (legacy check)
    expect(body).not.toMatch(/\.setAccessPolicy\(/);
  });

  test('storageController uses AWS S3, not Azure Blob Storage', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'storageController.js'), 'utf8');

    // Should use AWS SDK
    expect(src).toMatch(/@aws-sdk\/client-s3/);
    expect(src).toMatch(/@aws-sdk\/s3-request-presigner/);
    expect(src).toMatch(/S3Client/);
    expect(src).toMatch(/PutObjectCommand/);
    expect(src).toMatch(/GetObjectCommand/);

    // Should reference AWS environment variables
    expect(src).toMatch(/AWS_ACCESS_KEY_ID/);
    expect(src).toMatch(/AWS_SECRET_ACCESS_KEY/);
    expect(src).toMatch(/AWS_S3_BUCKET_NAME/);

    // Should NOT use Azure SDK imports
    expect(src).not.toMatch(/@azure\/storage-blob/);
    expect(src).not.toMatch(/BlobServiceClient/);
    expect(src).not.toMatch(/AZURE_STORAGE_CONNECTION_STRING/);
  });
});
