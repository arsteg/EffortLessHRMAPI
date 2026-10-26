// TM-006 (per-company taskName uniqueness) and TM-012 (atomic task numbering).
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');
const Task = require('../models/taskModel');
const TaskCounter = require('../models/taskCounterModel');

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE);
  // Make sure the unique {company, project} index actually exists before
  // the concurrency test fires a burst of writes against a brand-new
  // project — otherwise the race this test is specifically checking for
  // could be masked by the index simply not being ready yet.
  await TaskCounter.init();
});

afterAll(async () => {
  await dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await dropDatabase();
});

function createTaskRequest(tenant, overrides = {}) {
  return request(app)
    .post('/api/v1/task/newtask')
    .set('Authorization', `Bearer ${tenant.token}`)
    .set('Cookie', cookieHeader({ companyId: tenant.company._id.toString(), userId: tenant.user._id.toString() }))
    .send({
      taskName: 'Shared task name',
      title: 'Shared task name',
      description: 'desc',
      priority: 'High',
      project: tenant.project._id.toString(),
      status: 'ToDo',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      ...overrides,
    });
}

describe('TM-006: taskName uniqueness is per-company, not global', () => {
  test('two different companies can use the exact same task name', async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const resA = await createTaskRequest(tenantA);
    const resB = await createTaskRequest(tenantB);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
  });

  test('the same company cannot reuse a task name', async () => {
    const tenantA = await createTenant();
    const first = await createTaskRequest(tenantA);
    expect(first.status).toBe(200);

    const second = await createTaskRequest(tenantA);
    expect(second.status).not.toBe(200);
  });
});

describe('TM-012: task numbers are allocated atomically', () => {
  test('concurrent task creation in the same project never produces duplicate task numbers', async () => {
    const tenant = await createTenant();
    const concurrency = 8;

    const results = await Promise.all(
      Array.from({ length: concurrency }, (_, i) =>
        createTaskRequest(tenant, { taskName: `concurrent-task-${i}`, title: `concurrent-task-${i}` })
      )
    );

    results.forEach((res) => expect(res.status).toBe(200));

    const tasks = await Task.find({ company: tenant.company._id, project: tenant.project._id }).select('taskNumber');
    const taskNumbers = tasks.map((t) => t.taskNumber);
    const uniqueTaskNumbers = new Set(taskNumbers);

    expect(taskNumbers.length).toBe(concurrency);
    expect(uniqueTaskNumbers.size).toBe(concurrency);
  });

  test('numbering continues correctly for a project that already has tasks from before the counter existed', async () => {
    const tenant = await createTenant();
    // Simulate pre-existing tasks created under the old countDocuments()+1
    // scheme, with no TaskCounter document yet.
    const now = new Date();
    await Task.create({
      taskName: 'legacy-task-1', title: 'legacy-task-1', company: tenant.company._id,
      project: tenant.project._id, createdBy: tenant.user._id, updatedBy: tenant.user._id,
      createdOn: now, updatedOn: now, taskNumber: 1,
    });
    await Task.create({
      taskName: 'legacy-task-2', title: 'legacy-task-2', company: tenant.company._id,
      project: tenant.project._id, createdBy: tenant.user._id, updatedBy: tenant.user._id,
      createdOn: now, updatedOn: now, taskNumber: 2,
    });

    const res = await createTaskRequest(tenant, { taskName: 'new-task-after-legacy', title: 'new-task-after-legacy' });
    expect(res.status).toBe(200);
    expect(res.body.data.newTask.taskNumber).toBe(3);
  });
});
