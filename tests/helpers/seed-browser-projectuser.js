// Adds the demo user as a member of the Browser Test Project so the Create-Task
// modal's project-scoped Assignee dropdown is populated. NOT used by Jest.
// Uses the native driver to avoid the heavy Mongoose pre-find populate chains.
//   CONFIG_PATH=./config.browser.env node tests/helpers/seed-browser-projectuser.js
require('dotenv').config({ path: process.env.CONFIG_PATH || './config.browser.env' });
const mongoose = require('mongoose');

const LOGIN_EMAIL = 'demo.admin@browsertest.local';

(async () => {
  await mongoose.connect(process.env.DATABASE);
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ email: LOGIN_EMAIL });
  if (!user) throw new Error('Run seed-browser.js first');
  const project = await db.collection('projects').findOne({ company: user.company });
  if (!project) throw new Error('No project found for company');

  const existing = await db.collection('projectusers').findOne({ project: project._id, user: user._id });
  if (existing) {
    console.log('already a member of', project.projectName);
  } else {
    const now = new Date();
    await db.collection('projectusers').insertOne({
      project: project._id,
      user: user._id,
      company: user.company,
      status: 'Active',
      createdOn: now,
      updatedOn: now,
      createdBy: user._id,
      updatedBy: user._id,
    });
    console.log('ADDED', user.email, 'to project', project.projectName, '(' + project._id + ')');
  }
  await mongoose.disconnect();
})().catch((err) => { console.error('SEED_PU_ERROR:', err); process.exit(1); });
