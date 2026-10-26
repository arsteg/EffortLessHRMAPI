// TM-008 / TM-009: the API must enforce one canonical status/priority
// vocabulary so web and mobile can never silently drift apart again.
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');
const constants = require('../constants');

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

async function createTask(tenant, overrides = {}) {
  return request(app)
    .post('/api/v1/task/newtask')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send({
      taskName: overrides.taskName || 'A task',
      title: overrides.title || 'A task',
      description: 'Some description',
      priority: 'High',
      project: tenant.project._id.toString(),
      status: 'ToDo',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      ...overrides,
    });
}

describe('TM-008/009: canonical status/priority vocabulary', () => {
  test('all four canonical statuses are accepted', async () => {
    const tenant = await createTenant();
    for (const status of constants.Task_Statuses) {
      const res = await createTask(tenant, { taskName: `task-${status}`, status });
      expect(res.status).toBe(200);
      expect(res.body.data.newTask.status).toBe(status);
    }
  });

  test('all canonical priorities are accepted', async () => {
    const tenant = await createTenant();
    for (const priority of constants.Task_Priorities) {
      const res = await createTask(tenant, { taskName: `task-${priority}`, priority });
      expect(res.status).toBe(200);
      expect(res.body.data.newTask.priority).toBe(priority);
    }
  });

  test("mobile's old non-canonical status ('To Do' with a space) is rejected, not silently stored", async () => {
    const tenant = await createTenant();
    const res = await createTask(tenant, { status: 'To Do' });
    expect(res.status).not.toBe(200);
  });

  test("mobile's old priority scale value ('Critical') is rejected, not silently stored", async () => {
    const tenant = await createTenant();
    const res = await createTask(tenant, { priority: 'Critical' });
    expect(res.status).not.toBe(200);
  });
});
