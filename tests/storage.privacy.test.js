// Unit tests for TM-005 (private attachment storage). These exercise only
// the local, offline parts of storageController (SAS token generation is a
// local HMAC computation — it never calls Azure). We deliberately do NOT
// call createPrivateContainerInContainer/createContainerInContainer here,
// since those perform real network calls against the Azure Storage account
// configured in config.env, which this audit must not touch.
const StorageController = require('../controllers/storageController');
const fs = require('fs');
const path = require('path');

describe('TM-005: private attachment storage', () => {
  test('getTaskAttachmentReadUrl mints a SAS URL scoped to the right container/blob and does not return the bare stored address', () => {
    const storedUrl = `${process.env.CONTAINER_URL_BASE_URL}someCompanyId/TaskAttachment/abc123-report.pdf`;
    const signedUrl = StorageController.getTaskAttachmentReadUrl(storedUrl, 30);

    expect(signedUrl).not.toBe(storedUrl);
    expect(signedUrl.startsWith(storedUrl)).toBe(true);
    expect(signedUrl).toMatch(/[?&]sig=/);
    expect(signedUrl).toMatch(/[?&]se=/); // SAS expiry query param
  });

  test('task attachment uploads use the private storage helper, not the public one', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'taskController.js'), 'utf8');
    const publicCalls = src.match(/StorageController\.createContainerInContainer\(/g) || [];
    const privateCalls = src.match(/StorageController\.createPrivateContainerInContainer\(/g) || [];

    expect(publicCalls.length).toBe(0);
    expect(privateCalls.length).toBeGreaterThanOrEqual(3);
  });

  test('createPrivateContainerInContainer never grants anonymous container access', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'storageController.js'), 'utf8');
    const start = src.indexOf('async function createPrivateContainerInContainer');
    expect(start).toBeGreaterThan(-1);
    const nextFnStart = src.indexOf('\nasync function', start + 1);
    const body = src.slice(start, nextFnStart === -1 ? undefined : nextFnStart);
    // Match only an actual call, not the explanatory comment that mentions
    // the API name while explaining why it's deliberately not called.
    expect(body).not.toMatch(/\.setAccessPolicy\(/);
  });
});
