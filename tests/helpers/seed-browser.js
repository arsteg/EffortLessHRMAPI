// Standalone seeder for manual/browser happy-path testing (NOT used by Jest).
// Creates one trial company + an Active admin user with KNOWN credentials and a
// project, in the DB named by CONFIG_PATH's DATABASE. Idempotent: re-running
// reuses the existing user. Run with:
//   CONFIG_PATH=./config.browser.env node tests/helpers/seed-browser.js
require('dotenv').config({ path: process.env.CONFIG_PATH || './config.browser.env' });
const mongoose = require('mongoose');

const Company = require('../../models/companyModel');
const Role = require('../../models/permissions/roleModel');
const User = require('../../models/permissions/userModel');
const Project = require('../../models/projectModel');

const LOGIN_EMAIL = 'demo.admin@browsertest.local';
const LOGIN_PASSWORD = 'TestPassword123!';

(async () => {
  await mongoose.connect(process.env.DATABASE);
  const now = new Date();

  let user = await User.findOne({ email: LOGIN_EMAIL });
  if (user) {
    console.log('SEED: user already exists ->', LOGIN_EMAIL, 'company', user.company.toString());
    console.log('SEED_EMAIL=' + LOGIN_EMAIL);
    console.log('SEED_PASSWORD=' + LOGIN_PASSWORD);
    await mongoose.disconnect();
    return;
  }

  const company = await Company.create({
    companyName: 'Browser Test Co',
    contactPerson: 'Demo Admin',
    email: 'contact@browsertest.local',
    createdOn: now,
    updatedOn: now,
    isTrial: true,
    trialPeriodDays: 30,
  });

  const role = await Role.create({
    name: 'Admin',
    company: company._id,
    createdOn: now,
    updatedOn: now,
  });

  user = await User.create({
    firstName: 'Demo',
    lastName: 'Admin',
    email: LOGIN_EMAIL,
    company: company._id,
    role: role._id,
    password: LOGIN_PASSWORD,
    status: 'Active',
    createdOn: now,
    updatedOn: now,
  });

  const project = await Project.create({
    projectName: 'Browser Test Project',
    company: company._id,
    createdBy: user._id,
    updatedBy: user._id,
    createdOn: now,
    updatedOn: now,
  });

  console.log('SEED: created company', company._id.toString(), 'user', user._id.toString(), 'project', project._id.toString());
  console.log('SEED_EMAIL=' + LOGIN_EMAIL);
  console.log('SEED_PASSWORD=' + LOGIN_PASSWORD);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('SEED_ERROR:', err);
  process.exit(1);
});
