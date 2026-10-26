// Integration test for TM-020 (task-management-audit/TASK_MANAGEMENT_AUDIT_REPORT.md):
// email-template placeholder substitution must replace EVERY occurrence of a
// placeholder, not just the first. The audit could not verify this statically
// because it depends on actual EmailTemplate document content (data, not code);
// this test seeds a template that deliberately repeats {taskName} and {priority}
// and asserts both occurrences are filled in the body handed to the mailer.
//
// Runs against the real Express app (in-process via supertest) and the real,
// disposable, dockerized MongoDB; only the outbound mailer is mocked so we can
// inspect the rendered message without sending a real email.

// NOTE: jest.mock is NOT auto-hoisted here (jest.config.js sets transform:{},
// so babel-plugin-jest-hoist never runs). It therefore MUST be registered
// before app/controllers are required below — do not reorder these lines.
jest.mock('../utils/email', () => jest.fn().mockResolvedValue(undefined));

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const sendEmail = require('../utils/email');

const constants = require('../constants');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');

const EmailTemplate = require('../models/commons/emailTemplateModel');

const countOccurrences = (haystack, needle) => haystack.split(needle).length - 1;

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE);
});

afterAll(async () => {
  await dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await dropDatabase();
  sendEmail.mockClear();
});

async function createTaskAssignedToSelf(tenant) {
  return request(app)
    .post('/api/v1/task/newtask')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send({
      taskName: 'EmailProbeTask',
      title: 'EmailProbeTask',
      description: 'Some description',
      priority: 'High',
      project: tenant.project._id.toString(),
      status: 'ToDo',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      user: tenant.user._id.toString(),
    });
}

describe('TM-020: email template placeholders are replaced globally, not just the first occurrence', () => {
  test('a template that repeats {taskName} and {priority} has BOTH occurrences substituted', async () => {
    const tenant = await createTenant();

    // Template the update-notification path looks up (same company, same Name
    // constant the controller queries by). contentData deliberately repeats two
    // placeholders so the first-vs-all replace behavior is observable.
    await EmailTemplate.create({
      Name: constants.Email_template_constant.Update_Task_Notification,
      subject: 'Task Updated',
      templateType: 1,
      contentData:
        'Hello {firstName} {lastName}, the task "{taskName}" was updated. ' +
        'Reminder: "{taskName}" is now priority {priority} (priority again: {priority}). ' +
        'Project: {projectName}. Open it: {taskURL}',
      company: tenant.company._id,
      createdBy: tenant.user._id,
      updatedBy: tenant.user._id,
      createdOn: new Date(),
      updatedOn: new Date(),
      isDelete: false,
    });

    const createRes = await createTaskAssignedToSelf(tenant);
    expect(createRes.status).toBe(200);
    const taskId = createRes.body.data.newTask._id;

    // Ignore any mailer calls triggered by creation; we only assert on update.
    sendEmail.mockClear();

    // A status-only update still fires the update-notification email.
    const updateRes = await request(app)
      .put(`/api/v1/task/update/${taskId}`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
      .send({ status: 'Done' });

    expect(updateRes.status).toBe(201);

    // The update-notification email must have been dispatched.
    expect(sendEmail).toHaveBeenCalled();
    const { message } = sendEmail.mock.calls[sendEmail.mock.calls.length - 1][0];

    // No placeholder may survive — this is the exact regression the TM-020 fix
    // (.replace -> .replaceAll) addresses: a second occurrence used to be left
    // as literal "{taskName}"/"{priority}" text in the sent email.
    expect(message).not.toContain('{taskName}');
    expect(message).not.toContain('{priority}');

    // Both repeated placeholders are filled with their real values, both times.
    expect(countOccurrences(message, 'EmailProbeTask')).toBe(2);
    expect(countOccurrences(message, 'High')).toBe(2);

    // Sanity: the single-use placeholders resolved too.
    expect(message).toContain('Test'); // firstName
    expect(message).toContain(tenant.project.projectName); // {projectName}
  });
});
