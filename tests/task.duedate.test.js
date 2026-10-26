// TM-014: dueDate was defined on the schema but never actually written by
// addTask, and there was no server-computed "is this task overdue" signal.
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');

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

function createTask(tenant, overrides = {}) {
  return request(app)
    .post('/api/v1/task/newtask')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send({
      taskName: 'Due date task', title: 'Due date task', description: 'desc', priority: 'High',
      project: tenant.project._id.toString(), status: 'ToDo',
      startDate: new Date().toISOString(), endDate: new Date().toISOString(),
      ...overrides,
    });
}

describe('TM-014: due date is persisted and overdue is computed server-side', () => {
  test('dueDate set at creation time is actually saved', async () => {
    const tenant = await createTenant();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const res = await createTask(tenant, { dueDate });
    expect(res.status).toBe(200);
    expect(new Date(res.body.data.newTask.dueDate).toISOString()).toBe(dueDate);
  });

  test('a task past its due date and not Done/Closed is reported as overdue', async () => {
    const tenant = await createTenant();
    const pastDueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const createRes = await createTask(tenant, { dueDate: pastDueDate });
    const taskId = createRes.body.data.newTask._id;

    const getRes = await request(app)
      .get(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }));

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.task.isOverdue).toBe(true);
  });

  test('a Done task past its due date is NOT reported as overdue', async () => {
    const tenant = await createTenant();
    const pastDueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const createRes = await createTask(tenant, { dueDate: pastDueDate, status: 'Done' });
    const taskId = createRes.body.data.newTask._id;

    const getRes = await request(app)
      .get(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }));

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.task.isOverdue).toBe(false);
  });

  test('a task with a future due date is not overdue', async () => {
    const tenant = await createTenant();
    const futureDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const createRes = await createTask(tenant, { dueDate: futureDueDate });
    const taskId = createRes.body.data.newTask._id;

    const getRes = await request(app)
      .get(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }));

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.task.isOverdue).toBe(false);
  });
});
