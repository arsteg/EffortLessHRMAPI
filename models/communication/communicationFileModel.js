const mongoose = require('mongoose');

const communicationFileSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    index: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    maxlength: 255
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  previewUrl: String,
  // Storage info
  storageProvider: {
    type: String,
    enum: ['azure', 'aws', 'gcs', 'local'],
    default: 'azure'
  },
  storagePath: String,
  containerName: String,
  // Media metadata
  metadata: {
    // Image/Video dimensions
    width: Number,
    height: Number,
    // Audio/Video duration
    duration: Number,
    // Document info
    pages: Number,
    // Extracted text (for search)
    extractedText: String,
    // EXIF data
    exif: mongoose.Schema.Types.Mixed,
    // Video specific
    codec: String,
    bitrate: Number,
    frameRate: Number,
    // Audio specific
    channels: Number,
    sampleRate: Number
  },
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  // Security
  virusScanStatus: {
    type: String,
    enum: ['pending', 'scanning', 'clean', 'infected', 'error', 'skipped'],
    default: 'pending'
  },
  virusScanResult: String,
  virusScanAt: Date,
  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  accessExpiry: Date,
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadAt: Date,
  // File type category
  category: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
    required: true
  },
  // For temporary files (uploads in progress)
  isTemporary: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
communicationFileSchema.index({ conversationId: 1, createdAt: -1 });
communicationFileSchema.index({ uploaderId: 1, createdAt: -1 });
communicationFileSchema.index({ company: 1, category: 1 });
communicationFileSchema.index({ company: 1, mimeType: 1 });
communicationFileSchema.index({ isTemporary: 1, expiresAt: 1 });
communicationFileSchema.index({ virusScanStatus: 1, createdAt: 1 });
communicationFileSchema.index({ 'metadata.extractedText': 'text' });

// TTL index for temporary files
communicationFileSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { isTemporary: true } }
);

communicationFileSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.storagePath;
    delete ret.containerName;
    return ret;
  }
});

// Virtual for file extension
communicationFileSchema.virtual('extension').get(function() {
  const parts = this.originalName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

// Virtual for human-readable size
communicationFileSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware to determine category
communicationFileSchema.pre('save', function(next) {
  if (this.isModified('mimeType') || !this.category) {
    this.category = determineCategory(this.mimeType);
  }
  next();
});

function determineCategory(mimeType) {
  if (!mimeType) return 'other';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';

  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ];

  if (documentTypes.includes(mimeType)) return 'document';

  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ];

  if (archiveTypes.includes(mimeType)) return 'archive';

  return 'other';
}

// Static methods
communicationFileSchema.statics.findByConversation = function(conversationId, options = {}) {
  const query = {
    conversationId,
    isDeleted: false,
    isTemporary: false
  };

  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .populate('uploaderId', 'firstName lastName email profilePicture');
};

communicationFileSchema.statics.findByUploader = function(uploaderId, companyId, options = {}) {
  const query = {
    uploaderId,
    company: companyId,
    isDeleted: false,
    isTemporary: false
  };

  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

communicationFileSchema.statics.searchFiles = function(companyId, searchText, options = {}) {
  const query = {
    company: companyId,
    isDeleted: false,
    isTemporary: false,
    $or: [
      { originalName: { $regex: searchText, $options: 'i' } },
      { 'metadata.extractedText': { $regex: searchText, $options: 'i' } }
    ]
  };

  if (options.category) {
    query.category = options.category;
  }

  if (options.conversationId) {
    query.conversationId = options.conversationId;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('uploaderId', 'firstName lastName email');
};

communicationFileSchema.statics.getStorageStats = async function(companyId) {
  const stats = await this.aggregate([
    {
      $match: {
        company: mongoose.Types.ObjectId(companyId),
        isDeleted: false,
        isTemporary: false
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);

  const result = {
    total: { count: 0, size: 0 },
    byCategory: {}
  };

  stats.forEach(stat => {
    result.byCategory[stat._id] = {
      count: stat.count,
      size: stat.totalSize
    };
    result.total.count += stat.count;
    result.total.size += stat.totalSize;
  });

  return result;
};

communicationFileSchema.statics.cleanupTemporaryFiles = function() {
  return this.deleteMany({
    isTemporary: true,
    expiresAt: { $lt: new Date() }
  });
};

communicationFileSchema.statics.getPendingVirusScan = function(limit = 100) {
  return this.find({
    virusScanStatus: 'pending',
    isDeleted: false
  })
    .sort({ createdAt: 1 })
    .limit(limit);
};

// Instance methods
communicationFileSchema.methods.markAsDeleted = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this;
};

communicationFileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastDownloadAt = new Date();
  return this;
};

communicationFileSchema.methods.updateProcessingStatus = function(status, error = null) {
  this.processingStatus = status;
  if (error) {
    this.processingError = error;
  }
  return this;
};

communicationFileSchema.methods.updateVirusScanStatus = function(status, result = null) {
  this.virusScanStatus = status;
  this.virusScanResult = result;
  this.virusScanAt = new Date();
  return this;
};

communicationFileSchema.methods.setMetadata = function(metadata) {
  this.metadata = { ...this.metadata, ...metadata };
  return this;
};

const CommunicationFile = mongoose.model('CommunicationFile', communicationFileSchema);

module.exports = CommunicationFile;
