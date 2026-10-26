// Test-only helpers for seeding two isolated tenants (companies) with a user,
// role, and project each, plus a signed JWT matching the real login flow
// (authController.signToken), so integration tests can exercise the real
// HTTP API without going through registration/subscription/payment setup.
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Company = require('../../models/companyModel');
const Role = require('../../models/permissions/roleModel');
const User = require('../../models/permissions/userModel');
const Project = require('../../models/projectModel');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

let counter = 0;
function unique(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
}

/**
 * Creates a fully isolated tenant: company (trial, so authController.protect's
 * subscription check passes), a role, a user, and a project owned by that user.
 * Returns everything a test needs to make authenticated requests as this user.
 */
async function createTenant({ roleName = 'Employee' } = {}) {
  const now = new Date();

  const company = await Company.create({
    companyName: unique('TestCo-'),
    contactPerson: 'Test Contact',
    email: `${unique('contact-')}@example.com`,
    createdOn: now,
    updatedOn: now,
    isTrial: true,
    trialPeriodDays: 30,
  });

  const role = await Role.create({
    name: roleName,
    company: company._id,
    createdOn: now,
    updatedOn: now,
  });

  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: `${unique('user-')}@example.com`,
    company: company._id,
    role: role._id,
    password: 'TestPassword123!',
    createdOn: now,
    updatedOn: now,
  });

  const project = await Project.create({
    projectName: unique('Project-'),
    company: company._id,
    createdBy: user._id,
    updatedBy: user._id,
    createdOn: now,
    updatedOn: now,
  });

  const token = signToken(user._id.toString());

  return { company, role, user, project, token };
}

/** Helper to build the (legacy, attacker-controlled) cookie header some older
 * endpoints still read from, so tests can prove/disprove tenant isolation. */
function cookieHeader({ companyId, userId, companyName = 'Forged' } = {}) {
  const parts = [];
  if (companyId) parts.push(`companyId=${companyId}`);
  if (userId) parts.push(`userId=${userId}`);
  if (companyName) parts.push(`companyName=${encodeURIComponent(companyName)}`);
  return parts.join('; ');
}

/** Clears all documents between tests WITHOUT dropping the database itself.
 * dropDatabase() also destroys collection indexes (e.g. TaskCounter's and
 * Task's unique compound indexes), which then have to rebuild in the
 * background before the next test's writes are actually race-safe — that
 * previously made the TM-012 concurrency test flaky depending on how fast
 * MongoDB rebuilt the index after a prior test's cleanup. Clearing
 * documents collection-by-collection preserves indexes across tests. */
async function dropDatabase() {
  if (mongoose.connection.readyState !== 1) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

module.exports = { createTenant, cookieHeader, dropDatabase, signToken, unique };
