// Integration tests for the Task Management security/correctness defects
// documented in task-management-audit/TASK_MANAGEMENT_AUDIT_REPORT.md
// (TM-001, TM-002, TM-003, TM-004, TM-007, TM-010, TM-015).
//
// These run against a real, disposable, dockerized MongoDB instance and the
// real Express app (in-process, via supertest) — no mocks for the task layer.
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { createTenant, cookieHeader, dropDatabase } = require('./helpers/seed');

const Task = require('../models/taskModel');
const TaskUser = require('../models/taskUserModel');
const Tag = require('../models/Task/tagModel');

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
  const res = await request(app)
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
  return res;
}

describe('TM-001 / TM-002: tenant isolation and object-level authorization', () => {
  test('a user cannot read another company\'s task by forging the companyId/userId cookie', async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const createRes = await createTask(tenantA);
    expect(createRes.status).toBe(200);
    const taskId = createRes.body.data.newTask._id;

    // Tenant B's real JWT, but with cookies forged to look like tenant A.
    const res = await request(app)
      .get(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${tenantB.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }));

    // Must NOT be able to read tenant A's task using tenant B's session.
    expect(res.status).not.toBe(200);
  });

  test('a user cannot delete another company\'s task', async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const createRes = await createTask(tenantA);
    const taskId = createRes.body.data.newTask._id;

    const res = await request(app)
      .delete(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${tenantB.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }));

    expect(res.status).not.toBe(204);

    const stillExists = await Task.findById(taskId);
    expect(stillExists).not.toBeNull();
  });

  test('a user cannot update another company\'s task', async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const createRes = await createTask(tenantA);
    const taskId = createRes.body.data.newTask._id;

    const res = await request(app)
      .put(`/api/v1/task/update/${taskId}`)
      .set('Authorization', `Bearer ${tenantB.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }))
      .send({ taskName: 'HACKED', project: tenantA.project._id.toString() });

    expect(res.status).not.toBe(201);
    expect(res.status).not.toBe(200);

    const unchanged = await Task.findById(taskId);
    expect(unchanged.taskName).not.toBe('HACKED');
  });
});

describe('TM-003: mass assignment on updateTask', () => {
  test('updating a task cannot change its company via an unexpected field', async () => {
    const tenantA = await createTenant();
    const otherCompanyId = new mongoose.Types.ObjectId();

    const createRes = await createTask(tenantA);
    const taskId = createRes.body.data.newTask._id;

    await request(app)
      .put(`/api/v1/task/update/${taskId}`)
      .set('Authorization', `Bearer ${tenantA.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }))
      .send({ description: 'updated description', project: tenantA.project._id.toString(), company: otherCompanyId.toString() });

    const task = await Task.findById(taskId);
    expect(task.company.toString()).toBe(tenantA.company._id.toString());
  });
});

describe('TM-004: destructive actions require ownership/role, not just a valid login', () => {
  test('a user from the same company who is neither creator nor assignee cannot delete the task', async () => {
    const tenantA = await createTenant();
    // Second user, SAME company, no relationship to the task.
    const bystander = await createTenant();
    bystander.company = tenantA.company; // placeholder, real same-company bystander created below instead.

    const User = require('../models/permissions/userModel');
    const Role = require('../models/permissions/roleModel');
    const now = new Date();
    const role = await Role.create({ name: 'Employee', company: tenantA.company._id, createdOn: now, updatedOn: now });
    const otherUser = await User.create({
      firstName: 'Other', lastName: 'Employee', email: `other${Date.now()}@example.com`,
      company: tenantA.company._id, role: role._id, password: 'x', createdOn: now, updatedOn: now,
    });
    const jwt = require('jsonwebtoken');
    const otherToken = jwt.sign({ id: otherUser._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    const createRes = await createTask(tenantA);
    const taskId = createRes.body.data.newTask._id;

    const res = await request(app)
      .delete(`/api/v1/task/${taskId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: otherUser._id.toString() }));

    expect(res.status).toBe(403);
  });
});

describe('TM-007: partial (status-only) update must not require project re-validation', () => {
  test('a status-only PUT succeeds and only changes status', async () => {
    const tenantA = await createTenant();
    const createRes = await createTask(tenantA);
    const taskId = createRes.body.data.newTask._id;

    const res = await request(app)
      .put(`/api/v1/task/update/${taskId}`)
      .set('Authorization', `Bearer ${tenantA.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }))
      .send({ status: 'Done' });

    expect(res.status).toBe(201);

    const task = await Task.findById(taskId);
    expect(task.status).toBe('Done');
    expect((task.project._id || task.project).toString()).toBe(tenantA.project._id.toString());
  });
});

describe('TM-010: getTaskListByProject must return tasks the user is assigned to', () => {
  test('returns the task after assignment', async () => {
    const tenantA = await createTenant();
    const createRes = await createTask(tenantA, { user: tenantA.user._id.toString() });
    const taskId = createRes.body.data.newTask._id;

    const res = await request(app)
      .post(`/api/v1/task/tasklistbyproject/${tenantA.project._id.toString()}`)
      .set('Authorization', `Bearer ${tenantA.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }))
      .send({ userId: tenantA.user._id.toString(), skip: 0, next: 10 });

    expect(res.status).toBe(200);
    const ids = res.body.data.taskList.map((t) => (t._id || t.id || '').toString());
    expect(ids).toContain(taskId.toString());
  });
});

describe('TM-015: tag rename must actually persist', () => {
  test('updateTag changes the title', async () => {
    const tenantA = await createTenant();
    const now = new Date();
    const tag = await Tag.create({
      title: 'Original title',
      company: tenantA.company._id,
      createdOn: now,
      updatedOn: now,
      createdBy: tenantA.user._id,
      updatedBy: tenantA.user._id,
    });

    const res = await request(app)
      .post('/api/v1/task/Tag/Update')
      .set('Authorization', `Bearer ${tenantA.token}`)
      .set('Cookie', cookieHeader({ companyId: tenantA.company._id.toString(), userId: tenantA.user._id.toString() }))
      .send({ id: tag._id.toString(), title: 'Renamed title' });

    expect(res.status).toBe(200);
    const updated = await Tag.findById(tag._id);
    expect(updated.title).toBe('Renamed title');
  });
});
