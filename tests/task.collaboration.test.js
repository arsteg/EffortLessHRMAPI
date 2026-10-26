// TM-016 (comment threading) and TM-017 (in-app notifications on comments).
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');
const UserNotification = require('../models/eventNotification/userNotification');

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE);
});

afterAll(async () => {
  await dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await dropDatabase();
});

async function createTask(tenant) {
  const res = await request(app)
    .post('/api/v1/task/newtask')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send({
      taskName: 'Collab task', title: 'Collab task', description: 'desc', priority: 'High',
      project: tenant.project._id.toString(), status: 'ToDo',
      startDate: new Date().toISOString(), endDate: new Date().toISOString(),
      user: tenant.user._id.toString(),
    });
  return res.body.data.newTask;
}

function postComment(tenant, body) {
  return request(app)
    .post('/api/v1/task/comment')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send(body);
}

async function waitFor(assertion, { timeoutMs = 2000, intervalMs = 50 } = {}) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await assertion();
      return;
    } catch (err) {
      if (Date.now() - start > timeoutMs) throw err;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}

describe('TM-016: comments nest correctly under their parent', () => {
  test('a reply is returned nested under its parent, not as a flat sibling', async () => {
    const tenant = await createTenant();
    const task = await createTask(tenant);

    const rootRes = await postComment(tenant, {
      content: 'Root comment', author: tenant.user._id.toString(), task: task._id, commentedAt: new Date().toISOString(),
    });
    expect(rootRes.status).toBe(200);
    const rootId = rootRes.body.data._id;

    const replyRes = await postComment(tenant, {
      content: 'A reply', author: tenant.user._id.toString(), task: task._id,
      commentedAt: new Date().toISOString(), parent: rootId,
    });
    expect(replyRes.status).toBe(200);

    const listRes = await request(app)
      .get(`/api/v1/task/Comments/${task._id}`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }));

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1); // one root comment
    expect(listRes.body.data[0].replies.length).toBe(1);
    expect(listRes.body.data[0].replies[0].content).toBe('A reply');
  });
});

describe('TM-017: commenting raises an in-app notification', () => {
  test('the task assignee gets a UserNotification when someone comments', async () => {
    const tenant = await createTenant();
    const task = await createTask(tenant);

    const res = await postComment(tenant, {
      content: 'Please review', author: tenant.user._id.toString(), task: task._id, commentedAt: new Date().toISOString(),
    });
    expect(res.status).toBe(200);

    await waitFor(async () => {
      const notifications = await UserNotification.find({ user: tenant.user._id });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});
