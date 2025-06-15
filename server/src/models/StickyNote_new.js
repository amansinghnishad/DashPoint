const mongoose = require('mongoose');

const stickyNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'],
    default: '#ffeb3b' // Yellow
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    z: {
      type: Number,
      default: 0
    }
  },
  size: {
    width: {
      type: Number,
      default: 200,
      min: [100, 'Width must be at least 100px']
    },
    height: {
      type: Number,
      default: 200,
      min: [100, 'Height must be at least 100px']
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
  },
  pinned: {
    type: Boolean,
    default: false
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: null
    },
    notified: {
      type: Boolean,
      default: false
    }
  },
  formatting: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    fontWeight: {
      type: String,
      enum: ['normal', 'bold'],
      default: 'normal'
    },
    textAlign: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
stickyNoteSchema.index({ userId: 1, createdAt: -1 });
stickyNoteSchema.index({ userId: 1, archived: 1 });
stickyNoteSchema.index({ userId: 1, tags: 1 });
stickyNoteSchema.index({ userId: 1, pinned: 1 });
stickyNoteSchema.index({ 'reminder.date': 1, 'reminder.enabled': 1 });

// Text index for search
stickyNoteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Pre-save middleware
stickyNoteSchema.pre('save', function (next) {
  if (this.isModified('archived') && this.archived) {
    this.archivedAt = new Date();
  } else if (this.isModified('archived') && !this.archived) {
    this.archivedAt = null;
  }
  next();
});

// Virtual for character count
stickyNoteSchema.virtual('characterCount').get(function () {
  return this.content.length;
});

// Method to toggle archive status
stickyNoteSchema.methods.toggleArchive = function () {
  this.archived = !this.archived;
  this.archivedAt = this.archived ? new Date() : null;
  return this.save();
};

// Method to add tag
stickyNoteSchema.methods.addTag = function (tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
stickyNoteSchema.methods.removeTag = function (tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to find by tags
stickyNoteSchema.statics.findByTags = function (userId, tags) {
  return this.find({
    userId,
    tags: { $in: tags },
    archived: false
  });
};

// Static method to search
stickyNoteSchema.statics.search = function (userId, query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    archived = false,
    tags = null,
    color = null
  } = options;

  let searchFilter = {
    userId,
    archived,
    $text: { $search: query }
  };

  if (tags && tags.length > 0) {
    searchFilter.tags = { $in: tags };
  }

  if (color) {
    searchFilter.color = color;
  }

  return this.find(searchFilter)
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('StickyNote', stickyNoteSchema);
