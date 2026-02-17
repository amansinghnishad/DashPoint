const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  storageProvider: {
    type: String,
    enum: ['local', 'cloudinary'],
    default: 'cloudinary'
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  cloudinaryResourceType: {
    type: String,
    default: null
  },
  cloudinaryAssetId: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, isStarred: 1 });
fileSchema.index({ mimetype: 1 });

// Virtual for file type category
fileSchema.virtual('category').get(function () {
  if (this.mimetype.startsWith('image/')) return 'image';
  if (this.mimetype.startsWith('video/')) return 'video';
  if (this.mimetype.startsWith('audio/')) return 'audio';
  if (this.mimetype.includes('pdf')) return 'pdf';
  if (this.mimetype.includes('word') || this.mimetype.includes('document')) return 'document';
  if (this.mimetype.includes('sheet') || this.mimetype.includes('excel')) return 'spreadsheet';
  if (this.mimetype.includes('presentation') || this.mimetype.includes('powerpoint')) return 'presentation';
  if (this.mimetype.includes('zip') || this.mimetype.includes('rar') || this.mimetype.includes('tar')) return 'archive';
  return 'other';
});

// Method to format file size
fileSchema.methods.getFormattedSize = function () {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Method to increment download count
fileSchema.methods.incrementDownload = function () {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('File', fileSchema);
