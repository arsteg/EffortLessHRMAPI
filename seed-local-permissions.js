// LOCAL DEV ONLY: seeds the global Permission catalog and RolePermission
// mappings for a given company, mirroring authController.seedRolePermissions.
// The production database already has this data; a fresh local MongoDB does not.
// Usage: node seed-local-permissions.js <companyId>
require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Permission = require('./models/permissions/permissionModel');
const RolePermission = require('./models/permissions/rolePermissionModel');
const Role = require('./models/permissions/roleModel');
require('./models/companyModel');

async function main() {
  const companyId = process.argv[2];
  if (!companyId) {
    console.error('Usage: node seed-local-permissions.js <companyId>');
    process.exit(1);
  }
  const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
  await mongoose.connect(DB);

  const rolePermissionData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'config/rolePermissions.json'), 'utf-8')
  );

  const allNames = new Set();
  rolePermissionData.forEach(r => r.permissions.forEach(p => allNames.add(p)));

  for (const name of allNames) {
    await Permission.updateOne(
      { permissionName: name },
      { $setOnInsert: { permissionName: name, resource: 'navigation', action: 'view', permissionDetails: name } },
      { upsert: true }
    );
  }
  console.log(`Ensured ${allNames.size} permissions exist.`);

  const permissions = await Permission.find();
  const permissionMap = {};
  permissions.forEach(p => { permissionMap[p.permissionName] = p._id.toString(); });

  const roles = await Role.find({ company: companyId });
  const roleMap = {};
  roles.forEach(r => { roleMap[r.name] = r._id.toString(); });

  await RolePermission.deleteMany({ company: companyId });

  const records = [];
  for (const entry of rolePermissionData) {
    const roleId = roleMap[entry.roleName];
    if (!roleId) continue;
    for (const permName of entry.permissions) {
      const permissionId = permissionMap[permName];
      if (!permissionId) continue;
      records.push({
        roleId, permissionId, company: companyId,
        createdBy: null, updatedBy: null, createdOn: new Date(), updatedOn: new Date(),
      });
    }
  }
  if (records.length) {
    await RolePermission.insertMany(records);
  }
  console.log(`Inserted ${records.length} RolePermission records for company ${companyId}.`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
