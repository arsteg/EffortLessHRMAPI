const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  color: {
    type: String,
    default: '#99AAB5'
  },
  permissions: [{
    type: String,
    enum: [
      'ADMINISTRATOR',
      'MANAGE_WORKSPACE',
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'MANAGE_MEMBERS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CREATE_INVITE',
      'CHANGE_NICKNAME',
      'MANAGE_NICKNAMES',
      'VIEW_CHANNELS',
      'SEND_MESSAGES',
      'SEND_TTS_MESSAGES',
      'MANAGE_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'MENTION_EVERYONE',
      'USE_EXTERNAL_EMOJIS',
      'ADD_REACTIONS',
      'CONNECT',
      'SPEAK',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS',
      'USE_VAD',
      'PRIORITY_SPEAKER',
      'STREAM',
      'START_MEETINGS',
      'RECORD_MEETINGS'
    ]
  }],
  position: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isMentionable: {
    type: Boolean,
    default: false
  },
  isHoisted: {
    type: Boolean,
    default: false
  }
});

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  nickname: {
    type: String,
    maxlength: 32
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isDeafened: {
    type: Boolean,
    default: false
  },
  communicationDisabledUntil: Date
}, { _id: false });

const workspaceSettingsSchema = new mongoose.Schema({
  allowInvites: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  defaultNotification: {
    type: String,
    enum: ['all', 'mentions', 'none'],
    default: 'all'
  },
  explicitContentFilter: {
    type: String,
    enum: ['disabled', 'members_without_roles', 'all_members'],
    default: 'disabled'
  },
  defaultMessageNotifications: {
    type: String,
    enum: ['all', 'mentions'],
    default: 'all'
  },
  systemChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  rulesChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  welcomeMessage: String,
  features: [{
    type: String,
    enum: ['COMMUNITY', 'DISCOVERABLE', 'INVITE_SPLASH', 'NEWS', 'PARTNERED', 'VERIFIED', 'VANITY_URL']
  }]
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  avatar: String,
  banner: String,
  icon: String,
  splash: String, // Invite splash image
  type: {
    type: String,
    enum: ['department', 'project', 'team', 'custom'],
    default: 'custom'
  },
  members: [memberSchema],
  roles: [roleSchema],
  categories: [{
    name: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      default: 0
    },
    isCollapsed: {
      type: Boolean,
      default: false
    }
  }],
  defaultChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  settings: {
    type: workspaceSettingsSchema,
    default: () => ({})
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  vanityUrl: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  // Integration with existing EffortlessHRM entities
  linkedDepartmentId: {
    type: mongoose.Schema.Types.ObjectId
  },
  linkedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  linkedTeamId: {
    type: mongoose.Schema.Types.ObjectId
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  onlineMemberCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
workspaceSchema.index({ company: 1, name: 1 });
workspaceSchema.index({ company: 1, isPublic: 1 });
workspaceSchema.index({ inviteCode: 1 });
workspaceSchema.index({ vanityUrl: 1 });
workspaceSchema.index({ 'members.userId': 1 });
workspaceSchema.index({ linkedProjectId: 1 });
workspaceSchema.index({ linkedDepartmentId: 1 });
workspaceSchema.index({ ownerId: 1 });

// Pre-save middleware
workspaceSchema.pre('save', function(next) {
  // Update member count
  this.memberCount = this.members ? this.members.length : 0;

  // Generate invite code if not exists
  if (!this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }

  // Ensure there's a default @everyone role
  if (!this.roles.some(r => r.name === '@everyone')) {
    this.roles.push({
      name: '@everyone',
      color: '#99AAB5',
      permissions: ['VIEW_CHANNELS', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'CONNECT', 'SPEAK'],
      position: 0,
      isDefault: true
    });
  }

  next();
});

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

workspaceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Virtual for channels
workspaceSchema.virtual('channels', {
  ref: 'Channel',
  localField: '_id',
  foreignField: 'workspaceId'
});

// Static methods
workspaceSchema.statics.findByMember = function(userId, companyId, options = {}) {
  const query = {
    company: companyId,
    'members.userId': userId,
    isDeleted: false
  };

  if (!options.includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
    .sort({ name: 1 })
    .select(options.select || '-members');
};

workspaceSchema.statics.findByInviteCode = function(inviteCode) {
  return this.findOne({
    inviteCode,
    isDeleted: false,
    isArchived: false
  });
};

workspaceSchema.statics.findPublicWorkspaces = function(companyId, options = {}) {
  return this.find({
    company: companyId,
    isPublic: true,
    isDeleted: false,
    isArchived: false
  })
    .sort({ memberCount: -1 })
    .limit(options.limit || 20)
    .select('-members -roles');
};

// Instance methods
workspaceSchema.methods.addMember = function(userId, roleIds = []) {
  const exists = this.members.some(m => m.userId.toString() === userId.toString());

  if (!exists) {
    // Find the default role
    const defaultRole = this.roles.find(r => r.isDefault);
    const memberRoles = [...roleIds];

    if (defaultRole && !memberRoles.includes(defaultRole._id)) {
      memberRoles.push(defaultRole._id);
    }

    this.members.push({
      userId,
      roles: memberRoles,
      joinedAt: new Date()
    });

    this.memberCount = this.members.length;
  }

  return this;
};

workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
  this.memberCount = this.members.length;
  return this;
};

workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.userId.toString() === userId.toString());
};

workspaceSchema.methods.getMember = function(userId) {
  return this.members.find(m => m.userId.toString() === userId.toString());
};

workspaceSchema.methods.getMemberRoles = function(userId) {
  const member = this.getMember(userId);
  if (!member) return [];

  return this.roles.filter(r => member.roles.includes(r._id));
};

workspaceSchema.methods.getMemberPermissions = function(userId) {
  const memberRoles = this.getMemberRoles(userId);
  const permissions = new Set();

  memberRoles.forEach(role => {
    role.permissions.forEach(p => permissions.add(p));
  });

  // ADMINISTRATOR grants all permissions
  if (permissions.has('ADMINISTRATOR')) {
    return ['ADMINISTRATOR', 'ALL'];
  }

  return Array.from(permissions);
};

workspaceSchema.methods.hasPermission = function(userId, permission) {
  const permissions = this.getMemberPermissions(userId);
  return permissions.includes('ADMINISTRATOR') ||
         permissions.includes('ALL') ||
         permissions.includes(permission);
};

workspaceSchema.methods.updateMemberRoles = function(userId, roleIds) {
  const member = this.getMember(userId);
  if (member) {
    member.roles = roleIds;
  }
  return this;
};

workspaceSchema.methods.setMemberNickname = function(userId, nickname) {
  const member = this.getMember(userId);
  if (member) {
    member.nickname = nickname;
  }
  return this;
};

workspaceSchema.methods.addRole = function(roleData) {
  const maxPosition = Math.max(...this.roles.map(r => r.position), 0);
  this.roles.push({
    ...roleData,
    position: roleData.position || maxPosition + 1
  });
  return this.roles[this.roles.length - 1];
};

workspaceSchema.methods.removeRole = function(roleId) {
  const roleIdStr = roleId.toString();

  // Don't allow removing the default role
  const role = this.roles.id(roleId);
  if (role && role.isDefault) {
    throw new Error('Cannot remove the default role');
  }

  // Remove role from all members
  this.members.forEach(member => {
    member.roles = member.roles.filter(r => r.toString() !== roleIdStr);
  });

  // Remove the role
  this.roles = this.roles.filter(r => r._id.toString() !== roleIdStr);

  return this;
};

workspaceSchema.methods.regenerateInviteCode = function() {
  this.inviteCode = generateInviteCode();
  return this;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
