// Grants the browser-test role the menu permissions needed to reach the Task
// module UI (the AuthGuard gates routes on RolePermission records). NOT used by
// Jest. Run after seed-browser.js:
//   CONFIG_PATH=./config.browser.env node tests/helpers/seed-browser-permissions.js
require('dotenv').config({ path: process.env.CONFIG_PATH || './config.browser.env' });
const mongoose = require('mongoose');

const Role = require('../../models/permissions/roleModel');
const User = require('../../models/permissions/userModel');
const Permission = require('../../models/permissions/permissionModel');
const RolePermission = require('../../models/permissions/rolePermissionModel');
// RolePermission has a pre(/^find/) hook that populates company/roleId/permissionId,
// so those models must be registered on this connection too.
require('../../models/companyModel');

const LOGIN_EMAIL = 'demo.admin@browsertest.local';
// Menu names the Task-module routes gate on (app-routing.module.ts data.permission).
const MENU_PERMISSIONS = ['Tasks', 'Tags', 'Comments'];

(async () => {
  await mongoose.connect(process.env.DATABASE);

  const user = await User.findOne({ email: LOGIN_EMAIL });
  if (!user) throw new Error('Run seed-browser.js first — user not found');
  const role = await Role.findById(user.role);
  const companyId = user.company;

  for (const name of MENU_PERMISSIONS) {
    let perm = await Permission.findOne({ permissionName: name });
    if (!perm) {
      perm = await Permission.create({
        permissionName: name,
        permissionDetails: `${name} menu access (browser test seed)`,
        resource: name.toLowerCase(),
        action: 'read',
      });
    }
    const existing = await RolePermission.findOne({ roleId: role._id, permissionId: perm._id, company: companyId });
    if (!existing) {
      await RolePermission.create({
        roleId: role._id,
        permissionId: perm._id,
        company: companyId,
        createdBy: user._id,
        updatedBy: user._id,
      });
      console.log(`GRANTED ${name} -> role ${role.name}`);
    } else {
      console.log(`already granted ${name}`);
    }
  }

  console.log('ROLE_NAME=' + role.name);
  console.log('COMPANY_ID=' + companyId.toString());
  await mongoose.disconnect();
})().catch((err) => {
  console.error('SEED_PERM_ERROR:', err);
  process.exit(1);
});
